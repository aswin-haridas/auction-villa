"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BiddingControls from "@/app/components/biddingControls";
import BidHistory from "@/app/components/bidHistory";
import { supabase } from "@/app/utils/client";
import {
  fetchAuctionData,
  fetchHighestBidData,
  fetchHighestBidder,
  subscribeToAuctionUpdates,
  subscribeToBidUpdates,
} from "@/app/middlewares/biddingMiddleware";
import Header from "@/app/components/header";
import { playfair } from "@/app/font/fonts";

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
  category: string;
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
      setHighestBid((prev) =>
        payload.new.amount > prev ? payload.new.amount : prev
      );
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

  if (loading)
    return (
      <div className="flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        Loading...
      </div>
    );
  if (!auction) return <div className="p-4">No auction data found.</div>;

  return (
    <>
      <Header />
      <div className="pt-8 px-12 flex justify-between">
        <div className="flex">
          <div className="flex flex-col pr-2 space-y-2">
            {auction.image.map((img, i) => (
              <Image
                key={i}
                alt={`Thumbnail ${i + 1}`}
                onClick={() => setCurrentImage(i)}
                src={img}
                width={100}
                height={100}
                className={`h-28 flex cursor-pointer ${
                  currentImage !== i && "opacity-50 grayscale"
                }`}
                style={{ objectFit: "cover" }}
              />
            ))}
          </div>
          <div className="relative">
            <Image
              src={auction.image[currentImage]}
              alt={auction.name}
              width={500}
              height={500}
              priority
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        <div className="w-6/12 flex flex-col text-white">
          <h1
            className={`text-5xl text-[#FEF9E1] mb-6 ${playfair.className} font-bold`}
          >
            {auction.name}
          </h1>
          <div className="flex mb-8">
            <div className="w-1/2">
              <p className="text-[#878787] text-lg mb-2">
                Owner: <span className="font-semibold">{auction.owner}</span>
              </p>
              <p className="text-[#878787] text-lg mb-2">
                Category: <span>{auction.category}</span>
              </p>

              <p className="text-[#878787] text-lg mb-2">
                Ends in:{" "}
                <span className="font-semibold">
                  {new Date(auction.endTime).toLocaleString()}
                </span>
              </p>
            </div>
            <div className="w-1/2">
              <p className="text-[#878787] text-lg mb-2">
                Starting Price:{" "}
                <span className="text-green-800 font-semibold">
                  {auction.price}u
                </span>
              </p>
              <p className="text-[#878787] text-lg">
                Highest Bidder:{" "}
                <span className="font-semibold text-[#FEF9E1]">
                  {highestBidder}
                </span>
              </p>
            </div>
          </div>
          <div className=" mb-6">
            <h2 className="text-[#ba3737] text-xl font-semibold mb-2">
              Current Bid
            </h2>
            <h1 className="text-5xl font-bold">{currentBid}u</h1>
          </div>
          <BiddingControls
            buyOutPrice={auction.buyOutPrice}
            itemId={auction.id}
          />
          <BidHistory bids={bids} />
        </div>
      </div>
    </>
  );
}
