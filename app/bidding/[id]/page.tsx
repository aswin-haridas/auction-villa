"use client";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import BiddingControls from "@/app/components/biddingControls";
import BiddingLog from "@/app/components/biddinglog";
import { supabase } from "@/app/utils/client";
import {
  fetchAuctionData,
  fetchHighestBidData,
  fetchHighestBidder,
  formatTimeRemaining,
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

export default function Bidding() {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [highestBidder, setHighestBidder] = useState<string>('');
  const [currentBid, setCurrentBid] = useState<number>(0);

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

  useEffect(() => {
    if (!auction) return;
    const interval = setInterval(
      () => setTimeRemaining(auction.endTime - Date.now()),
      1000
    );
    return () => clearInterval(interval);
  }, [auction]);

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
      if (payload.new.amount > highestBid) {
        setHighestBid(payload.new.amount);
      }
    });

    return () => {
      supabase.removeChannel(bidChannel);
    };
  }, [id, highestBid]);

  useEffect(() => {
    async function fetchAndSetHighestBidder() {
      const { data, error } = await fetchHighestBidder(id);
      if (!error && data) {
        setHighestBidder(data.username);
      }
    }
    fetchAndSetHighestBidder();
  }, [id, highestBid]);

  const formattedTime = useMemo(
    () => formatTimeRemaining(timeRemaining),
    [timeRemaining]
  );

  if (loading) return <div className="p-4">Loading...</div>;
  if (!auction) return <div className="p-4">No auction data found.</div>;

  return (
    <>
    <Header />
    <div className="p-4 border border-red-800 flex flex-col md:flex-row h-screen">
      <div className="flex-1 w-full md:w-96 relative">
        <Image
          src={auction.image[currentImage]}
          alt={auction.name}
          width={450}
          height={500}
          priority
          style={{ objectFit: "cover" }}
        />
        <div className="flex gap-2 mt-2">
          {auction.image.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`border w-8 h-8 flex items-center justify-center cursor-pointer ${currentImage === i ? "bg-white text-black" : ""}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-4 mt-4 md:mt-0 md:ml-4">
        <h1 className="text-3xl">{auction.name}</h1>
        <p className="text-green-500">Starting Price: {auction.price}u</p>
        <p>End Time: {formattedTime}</p>
        <p>Owner: {auction.owner.toUpperCase()}</p>
        <h1 className="text-red-800 underline underline-offset-2">
          Current Bid
        </h1>
        <h1 className="text-4xl">{currentBid}u</h1>
        <p>Highest Bid: {highestBid}u</p>
        <p>Highest Bidder: {highestBidder}</p>
        <BiddingControls
          buyOutPrice={auction.buyOutPrice}
          itemId={auction.id}
        />
        <BiddingLog itemId={auction.id} />
      </div>
    </div></>
  );
}