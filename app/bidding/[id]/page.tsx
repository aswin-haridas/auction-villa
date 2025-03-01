"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { playfair } from "@/app/font/fonts";
import { anton } from "@/app/font/fonts"; // Added missing import
import Header from "@/app/components/header";
import BidHistory from "@/app/components/bidHistory";

// Interfaces
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
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [highestBidder, setHighestBidder] = useState<string>("");
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const biddingValues = [100, 500, 1000, 5000];
  const [currentUser, setCurrentUser] = useState(
    "User" + Math.floor(Math.random() * 1000)
  );

  // Generate fake auction data
  useEffect(() => {
    const fetchAuctionData = () => {
      // Simulating API response delay
      setTimeout(() => {
        // Fake auction data
        const fakeAuction: AuctionData = {
          id: id || "auction-123",
          name: "Vintage ",
          price: 1000,
          endTime: Date.now() + 86400000, // 24 hours from now
          owner: "LuxuryCollector42",
          currentBid: 2500,
          highestBid: 2500,
          highestBidder: "ElegantBidder89",
          buyOutPrice: 10000,
          image: [
            "https://iili.io/32GVWwG.jpg",
            "https://iili.io/32GVXtf.jpg",
            "https://iili.io/32GVM9n.jpg",
            "https://iili.io/32GVVus.jpg",
            "https://iili.io/32GVwMl.jpg",
          ],
          category: "Luxury Watches",
        };

        // Fake bid history
        const fakeBids: Bid[] = [
          {
            bid_id: "bid-001",
            user_id: "ClassicCollector23",
            amount: 1200,
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
            auction_id: id || "auction-123",
          },
          {
            bid_id: "bid-002",
            user_id: "WatchEnthusiast77",
            amount: 1800,
            timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
            auction_id: id || "auction-123",
          },
          {
            bid_id: "bid-003",
            user_id: "ElegantBidder89",
            amount: 2500,
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            auction_id: id || "auction-123",
          },
          {
            bid_id: "bid-004",
            user_id: "LuxuryCollector42",
            amount: 2500,
            timestamp: new Date().toISOString(),
            auction_id: id || "auction-123",
          },
          {
            bid_id: "bid-005",
            user_id: "ElegantBidder89",
            amount: 5000,
            timestamp: new Date().toISOString(),
            auction_id: id || "auction-123",
          },
        ];

        setAuction(fakeAuction);
        setBids(fakeBids);
        setHighestBid(fakeAuction.highestBid);
        setHighestBidder(fakeAuction.highestBidder);
        setCurrentBid(fakeAuction.currentBid);
        setLoading(false);
      }, 1000);
    };

    fetchAuctionData();
  }, [id]);

  // Handle placing a bid
  const handlePlaceBid = () => {
    setLoading(true);
    setError(null);

    // Get bid amount (either from input or selected value)
    const amount = selectedValue || Number(bidAmount);

    // Validate bid amount
    if (!amount || amount <= currentBid) {
      setError("Bid must be higher than current bid");
      setLoading(false);
      return;
    }

    // Simulate API request delay
    setTimeout(() => {
      // Create new bid
      const newBid: Bid = {
        bid_id: `bid-${Date.now()}`,
        user_id: currentUser,
        amount: amount,
        timestamp: new Date().toISOString(),
        auction_id: id || "auction-123",
      };

      // Update state
      setBids([newBid, ...bids]);
      setCurrentBid(amount);
      setHighestBid(amount);
      setHighestBidder(currentUser);

      // Reset form
      setBidAmount("");
      setSelectedValue(null);
      setLoading(false);
    }, 800);
  };

  // Handle buy out
  const handleBuyOut = () => {
    if (loading) return;

    setLoading(true);

    // Simulate API request delay
    setTimeout(() => {
      // Create buy out bid
      const buyOutBid: Bid = {
        bid_id: `bid-buyout-${Date.now()}`,
        user_id: currentUser,
        amount: auction?.buyOutPrice || 0,
        timestamp: new Date().toISOString(),
        auction_id: id || "auction-123",
      };

      // Update state
      setBids([buyOutBid, ...bids]);
      setCurrentBid(auction?.buyOutPrice || 0);
      setHighestBid(auction?.buyOutPrice || 0);
      setHighestBidder(currentUser);

      // Show success message
      setError("Congratulations! You've successfully bought this item!");
      setLoading(false);
    }, 800);
  };

  // Handle leaving the auction
  const handleLeave = () => {
    // Normally would redirect to another page
    alert("Leaving auction page");
  };

  if (!auction) {
    return (
      <div className="p-4 flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading auction data...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="px-12 min-h-screen">
        <p className={`${anton.className} text-[#878787] text-3xl pt-8 mb-4`}>
          Bidding
        </p>
        <div className="flex flex-col">
          <div className="flex justify-between">
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
              <Image
                src={auction.image[currentImage]}
                alt={`Current Image`}
                width={500}
                height={500}
                priority
                className="object-cover h-[76vh]"
              />
            </div>
            <div className="w-6/12 flex flex-col text-white">
              <h1
                className={`text-5xl text-[#FEF9E1] mb-6 ${playfair.className} font-bold`}
              >
                {auction.name}
              </h1>
              <div className="flex mb-4">
                <div className="w-1/2">
                  <p className="text-[#878787] text-lg mb-2">
                    Owner:{" "}
                    <span className="font-semibold">{auction.owner}</span>
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

              {/* Bidding Controls */}
              <div>
                <div className="flex space-x-4">
                  {biddingValues.map((value) => (
                    <div
                      key={value}
                      onClick={() => setSelectedValue(value)}
                      className={`flex flex-col text-center cursor-pointer justify-center text-base border-2 w-1/4 h-10 rounded-sm ${
                        selectedValue !== value
                          ? "border-red-800"
                          : "bg-white text-black"
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
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter bid amount"
                    className="text-black p-2 w-40"
                  />
                  <button
                    onClick={!loading ? handlePlaceBid : undefined}
                    className={`relative flex flex-col text-center justify-center border-2 border-red-800 font-bold w-60 h-10 ${
                      loading
                        ? "bg-transparent cursor-not-allowed"
                        : "bg-red-800 cursor-pointer"
                    }`}
                  >
                    {loading ? "Loading..." : "Place Bid"}
                  </button>
                  <button
                    onClick={handleBuyOut}
                    className="cursor-pointer group relative flex flex-col text-center justify-center font-bold border-2 border-red-800 w-60 h-10 text-cyan-300"
                  >
                    Buy Out: {auction.buyOutPrice}u
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

              <BidHistory bids={bids} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
