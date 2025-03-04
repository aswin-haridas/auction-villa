"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { playfair } from "@/app/font/fonts";
import Header from "@/app/components/header";
import BidHistory from "@/app/components/bidhistory";
import { supabase } from "@/app/services/client";
import { getUserId, getUsername, goToLogin } from "@/app/services/session";
import {
  getHighestBidder,
  getHighestBid,
  saveBid,
  getBids,
} from "@/app/services/auction";

// Types and Interfaces
interface AuctionData {
  id: string;
  name: string;
  price: number;
  end_time: string;
  owner: string | null;
  currentBid: number | null;
  highest_bid: number | null;
  highest_bidder: string | null;
  buyout_price: number;
  image: string[];
  category: string;
  status: string;
}

interface Bid {
  bid_id: string;
  user_id: string;
  amount: number;
  timestamp: string;
  auction_id: string;
}

// Constants
const biddingValues = [100, 500, 1000, 5000];

// Main Component
export default function Bidding() {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [highestBidder, setHighestBidder] = useState<string>("");
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);

  // User Effects
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = getUserId();
        if (!user) {
          goToLogin();
          return;
        }
        setCurrentUser(user);
        const name = await getUsername();
        setUsername(name);
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };
    fetchUser();
  }, []);

  // Auction Data Effects
  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        setLoading(true);
        const auctionData = await fetchAuctionDetails();
        if (!auctionData) throw new Error("Auction not found");
        
        const mappedAuction = mapAuctionData(auctionData);
        setAuction(mappedAuction);
        await updateAuctionState(mappedAuction);
      } catch (err) {
        handleFetchError(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAuctionData();
  }, [id]);

  // Helper Functions
  const fetchAuctionDetails = async () => {
    const { data, error } = await supabase
      .from("Auction")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(`Error fetching auction: ${error.message}`);
    return data;
  };

  const mapAuctionData = (data: any): AuctionData => ({
    id: data.id,
    name: data.name,
    price: data.price,
    end_time: data.end_time,
    owner: data.owner || "Unknown",
    currentBid: data.highest_bid || data.price,
    highest_bid: data.highest_bid || data.price,
    highest_bidder: data.highest_bidder || "None yet",
    buyout_price: data.buyout_price,
    image: data.image || [],
    category: data.category,
    status: data.status,
  });

  const updateAuctionState = async (mappedAuction: AuctionData) => {
    setHighestBid(mappedAuction.highest_bid || 0);
    setHighestBidder(mappedAuction.highest_bidder || "");
    setCurrentBid(mappedAuction.currentBid || 0);

    const [highestBidderData, highestBidData, bidsData] = await Promise.all([
      getHighestBidder(id),
      getHighestBid(id),
      getBids(id),
    ]);

    if (highestBidderData) {
      setHighestBid(highestBidderData.amount);
      setHighestBidder(highestBidderData.user_id);
    }
    if (highestBidData) {
      setHighestBid(highestBidData.amount);
      setCurrentBid(highestBidData.amount);
    }
    setBids(bidsData || []);
  };

  const handleFetchError = (err: unknown) => {
    console.error("Fetch error:", err);
    setError(
      err instanceof Error ? err.message : "Failed to load auction data"
    );
  };

  // Bid Handlers
  const handlePlaceBid = async () => {
    setLoading(true);
    setError(null);

    const amount = selectedValue || Number(bidAmount);
    if (!amount || amount <= currentBid) {
      setError("Bid must be higher than current bid");
      setLoading(false);
      return;
    }

    try {
      await updateAuctionBid(amount);
      const newBid = await saveNewBid(amount);
      updateBidState(amount, newBid);
    } catch (err) {
      handleBidError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateAuctionBid = async (amount: number) => {
    const { error } = await supabase
      .from("Auction")
      .update({ highest_bid: amount, highest_bidder: username })
      .eq("id", id);
    if (error) throw new Error(`Error placing bid: ${error.message}`);
  };

  const saveNewBid = async (amount: number): Promise<Bid> => {
    const newBid: Bid = {
      bid_id: `bid-${Date.now()}`,
      user_id: currentUser || "",
      amount,
      timestamp: new Date().toISOString(),
      auction_id: id || "",
    };
    const savedBid = await saveBid(newBid);
    if (!savedBid) throw new Error("Failed to save bid");
    return newBid;
  };

  const updateBidState = (amount: number, newBid: Bid) => {
    setCurrentBid(amount);
    setHighestBid(amount);
    setHighestBidder(username || "");
    setBidAmount("");
    setSelectedValue(null);
    setBids((prev) => [...prev, newBid]);
  };

  const handleBidError = (err: unknown) => {
    console.error("Bid error:", err);
    setError(err instanceof Error ? err.message : "Failed to place bid");
  };

  const handleBuyOut = async () => {
    if (loading || !auction) return;
    setLoading(true);

    try {
      await processBuyOut();
      updateBuyOutState();
      setError("Congratulations! You've successfully bought this item!");
    } catch (err) {
      handleBuyOutError(err);
    } finally {
      setLoading(false);
    }
  };

  const processBuyOut = async () => {
    const { error } = await supabase
      .from("Auction")
      .update({
        highest_bid: auction!.buyout_price,
        highest_bidder: currentUser,
        status: "completed",
      })
      .eq("id", id);
    if (error) throw new Error(`Error processing buyout: ${error.message}`);
  };

  const updateBuyOutState = () => {
    setCurrentBid(auction!.buyout_price);
    setHighestBid(auction!.buyout_price);
    setHighestBidder(currentUser || "");
  };

  const handleBuyOutError = (err: unknown) => {
    console.error("Buyout error:", err);
    setError(err instanceof Error ? err.message : "Failed to process buyout");
  };

  const handleLeave = () => alert("Leaving auction page");

  // Render Functions
  const renderLoading = () => (
    <div className="p-4 flex items-center justify-center h-screen">
      <div className="text-white text-xl">Loading auction data...</div>
    </div>
  );

  const renderNotFound = () => (
    <div className="p-4 flex items-center justify-center h-screen">
      <div className="text-white text-xl">Auction not found</div>
    </div>
  );

  const renderAuctionImages = () => (
    <div className="flex">
      <div className="flex flex-col pr-2 space-y-2">
        {auction!.image.map((img, i) => (
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
      <Image
        src={auction!.image[currentImage] || "/placeholder.jpg"}
        alt={`Current Image`}
        width={500}
        height={500}
        priority
        className="object-cover h-[76vh]"
      />
    </div>
  );

  const renderAuctionDetails = () => (
    <div className="w-6/12 flex flex-col text-white pl-8">
      <h1
        className={`text-5xl text-[#FEF9E1] mb-6 ${playfair.className} font-bold`}
      >
        {auction!.name}
      </h1>
      <div className="flex mb-4">
        <div className="w-1/2">
          <p className="text-[#878787] text-lg mb-2">
            Owner: <span className="font-semibold">{auction!.owner}</span>
          </p>
          <p className="text-[#878787] text-lg mb-2">
            Category: <span>{auction!.category}</span>
          </p>
          <p className="text-[#878787] text-lg mb-2">
            Ends in:{" "}
            <span className="font-semibold">
              {new Date(auction!.end_time).toLocaleString()}
            </span>
          </p>
        </div>
        <div className="w-1/2">
          <p className="text-[#878787] text-lg mb-2">
            Starting Price:{" "}
            <span className="text-green-800 font-semibold">
              {auction!.price}u
            </span>
          </p>
          <p className="text-[#878787] text-lg">
            Highest Bidder:{" "}
            <span className="font-semibold text-[#FEF9E1]">
              {highestBidder || "None yet"}
            </span>
          </p>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-[#ba3737] text-xl font-semibold mb-2">
          Current Bid
        </h2>
        <h1 className="text-5xl font-bold">{currentBid}u</h1>
      </div>
      {renderBiddingControls()}
      <BidHistory bids={bids} />
    </div>
  );

  const renderBiddingControls = () => (
    <div>
      <div className="flex space-x-4">
        {biddingValues.map((value) => (
          <div
            key={value}
            onClick={() => setSelectedValue(value)}
            className={`flex flex-col text-center cursor-pointer justify-center text-base border-2 w-1/4 h-10 rounded-sm ${
              selectedValue !== value ? "border-red-800" : "bg-white text-black"
            }`}
          >
            {value}u
          </div>
        ))}
      </div>
      <div className="flex space-x-4 mt-6">
        <input
          type="number"
          value={bidAmount}
          onFocus={() => setSelectedValue(null)}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder="Enter bid amount"
          className="text-white bg-[#171717] p-2 w-72"
        />
        <button
          onClick={!loading ? handlePlaceBid : undefined}
          className={`relative flex flex-col text-center justify-center border-2 border-red-800 font-bold w-60 h-10 ${
            loading ? "bg-transparent cursor-not-allowed" : "bg-red-800 cursor-pointer"
          }`}
        >
          {loading ? "Loading..." : "Place Bid"}
        </button>
        <button
          onClick={handleBuyOut}
          className="cursor-pointer group relative flex flex-col text-center justify-center font-bold border-2 border-red-800 w-60 h-10 text-cyan-300"
        >
          Buy Out: {auction!.buyout_price}u
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(45deg,#ffffff33_25%,transparent_25%,transparent_50%,#ffffff33_50%,#ffffff33_75%,transparent_75%,transparent_100%)] bg-[length:40px_40px]"></div>
        </button>
        <button
          onClick={handleLeave}
          className="cursor-pointer flex flex-col justify-center items-center font-bold border-2 border-red-800 w-14 h-10 text-gray-500 hover:text-gray-400"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );

  // Main Render
  if (loading) return renderLoading();
  if (!auction) return renderNotFound();

  return (
    <>
      <Header />
      <div className="px-12 min-h-screen mt-8">
        <div className="flex flex-col">
          <div className="flex justify-between">
            {renderAuctionImages()}
            {renderAuctionDetails()}
          </div>
        </div>
      </div>
    </>
  );
}