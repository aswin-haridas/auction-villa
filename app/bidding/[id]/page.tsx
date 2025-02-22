"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BiddingControls from "@/app/components/biddingControls";
import { supabase } from "@/app/utils/client";
import {
  fetchAuctionData,
  fetchHighestBidData,
  fetchHighestBidder,
  subscribeToAuctionUpdates,
  subscribeToBidUpdates,
} from "@/app/middlewares/biddingMiddleware";
import Header from "@/app/components/header";

interface AuctionData {
  id: string;
  name: string;
  price: number;
  endTime: number;
  owner: string;
  currentBid: number;
  highestBid: number;
  highestBidder: string;
  buyOutPrice: number;
  image: string[];
}

interface Bid {
  bid_id: string;
  user_id: string;
  amount: number;
  timestamp: string;
  auction_id: string;
}

export default function Bidding() {
  const { id } = useParams<{ id: string }>();
  
  // States declared at the top for consistent hook order.
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [highestBidder, setHighestBidder] = useState<string>("");
  const [currentBid, setCurrentBid] = useState<number>(0);

  // Fetch auction data and subscribe to auction updates.
  useEffect(() => {
    async function fetchAndSetAuction() {
      const { data, error } = await fetchAuctionData(id);
      if (!error) setAuction(data);
      setLoading(false);
    }
    fetchAndSetAuction();

    const auctionChannel = subscribeToAuctionUpdates(id, (payload) => {
      setAuction(payload.new as AuctionData);
    });

    return () => {
      supabase.removeChannel(auctionChannel);
    };
  }, [id]);

  // Fetch the highest bid and subscribe to bid updates.
  useEffect(() => {
    async function fetchAndSetHighestBid() {
      const { data, error } = await fetchHighestBidData(id);
      if (!error && data) {
        setHighestBid(data.amount);
        setCurrentBid(data.amount);
      }
    }
    fetchAndSetHighestBid();

    const bidChannel = subscribeToBidUpdates(id, (payload) => {
      // Use functional update to ensure we always have the latest highest bid.
      setHighestBid((prev) => (payload.new.amount > prev ? payload.new.amount : prev));
    });

    return () => {
      supabase.removeChannel(bidChannel);
    };
  }, [id]);

  // Fetch the highest bidder whenever the highest bid changes.
  useEffect(() => {
    async function fetchAndSetHighestBidder() {
      const { data, error } = await fetchHighestBidder(id);
      if (!error && data) {
        setHighestBidder(data.username);
      }
    }
    fetchAndSetHighestBidder();
  }, [id, highestBid]);

  // Fetch bid history and subscribe to new bid inserts.
  useEffect(() => {
    async function fetchBids() {
      const { data, error } = await supabase
        .from("Bid")
        .select("*")
        .eq("auction_id", id)
        .order("timestamp", { ascending: false });
      if (error) {
        console.error("Error fetching bids:", error);
        return;
      }
      if (data) {
        setBids(data);
      }
    }
    fetchBids();

    const channel = supabase
      .channel(`Bid-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Bid",
          filter: `auction_id=eq.${id}`,
        },
        (payload) => {
          setBids((prev) => [payload.new as Bid, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!auction) return <div className="p-4">No auction data found.</div>;

  const userColors: string[] = ["#d062fc", "#8efc62"];

  return (
    <>
      <Header />
      <div className="p-4 border border-red-800 flex h-screen">
        {/* Left Pane: Thumbnails and Main Image */}
        <div className="w-1/2 pr-2 flex">
          <div className="flex flex-col">
            {auction.image.map((img, i) => (
              <Image
                key={i}
                alt={`Thumbnail ${i + 1}`}
                onClick={() => setCurrentImage(i)}
                src={img}
                width={100}
                height={100}
                className={`border h-28 flex cursor-pointer ${
                  currentImage === i ? "border-offwhite" : "opacity-50"
                }`}
                style={{ objectFit: "cover" }}
              />
            ))}
          </div>
          <div className="relative">
            <Image
              src={auction.image[currentImage]}
              alt={auction.name}
              width={450}
              height={500}
              priority
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Right Pane: Auction Details and Bidding */}
        <div className="w-1/2 pl-2 space-y-4">
          <h1 className="text-3xl font-semibold">{auction.name}</h1>
          <p className="text-green-500">
            Starting Price: <span className="font-semibold">{auction.price}u</span>
          </p>
          <p>
            End Time:{" "}
            <span className="font-semibold">
              {new Date(auction.endTime).toLocaleString()}
            </span>
          </p>
          <p>
            Owner: <span className="font-semibold">{auction.owner.toUpperCase()}</span>
          </p>
          <div>
            <h2 className="text-red-800 underline underline-offset-2 text-lg font-semibold">
              Current Bid
            </h2>
            <h1 className="text-4xl font-bold">{currentBid}u</h1>
          </div>
          <p>
            Highest Bid: <span className="font-semibold">{highestBid}u</span>
          </p>
          <p>
            Highest Bidder: <span className="font-semibold">{highestBidder}</span>
          </p>
          <BiddingControls buyOutPrice={auction.buyOutPrice} itemId={auction.id} />
          <div className="mt-5 pt-6 max-h-[300px] overflow-auto">
            {bids.length === 0 ? (
              <p className="text-gray-400">No bids yet</p>
            ) : (
              bids.map((bid, index) => (
                <div key={bid.bid_id} className="mb-3">
                  <span style={{ color: userColors[index % userColors.length] }} className="font-bold">
                    {bid.user_id || "Anonymous"}
                  </span>
                  <span className="text-white"> bid </span>
                  <span className="text-yellow-400 font-bold">{bid.amount}u</span>
                  <span className="text-gray-400 text-sm ml-2">
                    {new Date(bid.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
