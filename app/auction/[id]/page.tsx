"use client";
import AuctionImages from "@/app/components/auctionImages";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { useAuctionStore } from "@/app/store/auctionStore";

export default function AuctionPage() {
  const params = useParams();
  const router = useRouter();
  const auctionId = params.id as string;

  // Local state for user info
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(432463);

  // Get state from Zustand store
  const {
    auction,
    bids,
    isLoading,
    bidAmount,
    selectedValue,
    loading,
    fetchAuction,
    setBidAmount,
    setSelectedValue,
    placeBid,
  } = useAuctionStore();

  // Values for bid buttons
  const biddingValues = [100, 500, 1000, 5000, 10000];

  // Colors for different users in the bid history
  const userColors = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3"];

  // Calculate highest bid and bidder
  const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
  const highestBid =
    sortedBids.length > 0 ? sortedBids[0].amount : auction?.price || 0;
  const highestBidder =
    sortedBids.length > 0 ? sortedBids[0].username : "No bidders yet";

  useEffect(() => {
    // Get user info from localStorage
    setCurrentUser(sessionStorage.getItem("user_id"));
    setUsername(sessionStorage.getItem("username"));

    console.log(auctionId, username, currentUser);

    // Fetch auction data using Zustand action
    if (auctionId) {
      fetchAuction(auctionId);
    }
  }, [auctionId, fetchAuction]);

  // Handle bid placement
  const handlePlaceBid = () => {
    if (!currentUser || !username) {
      alert("Please log in to place a bid");
      return;
    }

    const bidValue = bidAmount ? parseInt(bidAmount) : selectedValue;
    if (!bidValue || isNaN(bidValue)) {
      alert("Please enter a valid bid amount");
      return;
    }

    // Check if current user is already the highest bidder
    if (sortedBids.length > 0 && sortedBids[0].username === username) {
      alert("You are already the highest bidder!");
      return;
    }

    if (bidValue <= highestBid) {
      alert("Your bid must be higher than the current highest bid");
      return;
    }

    if (bidValue > walletBalance) {
      alert("Insufficient wallet balance");
      return;
    }

    // Place bid using Zustand action
    placeBid(auctionId, currentUser, username);
  };

  // Handle leave auction
  const handleLeave = () => {
    router.push("/");
  };

  // Handle buyout
  const handleBuyOut = () => {
    if (!currentUser) {
      alert("Please log in to buy out");
      return;
    }

    if (auction && auction.buyout_price > walletBalance) {
      alert("Insufficient wallet balance for buyout");
      return;
    }

    alert("Buyout successful!");
    // Implement buyout logic here
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="p-4 flex items-center justify-center h-screen">
        <div className="text-white text-xl">
          Auction not found!{" "}
          <Link className="text-red-700 hover:underline" href={"/"}>
            go to the auction list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-12 min-h-screen mt-8">
        <div className="flex flex-col">
          <div className="flex justify-between h-[85vh]">
            <div className="w-1/2 ">
              <AuctionImages images={auction.image} />
            </div>
            <div className="w-1/2 pl-8">
              <div className="flex flex-col text-white">
                <div className="flex justify-between items-center mb-2">
                  <h1 className="text-5xl text-[#FEF9E1] font-bold">
                    {auction.name}
                  </h1>
                </div>
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
                        {new Date(auction.end_time).toLocaleString()}
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
                    <p>
                      <span className="text-[#878787] text-lg">
                        Wallet bal:{" "}
                      </span>
                      <span className="text-green-700 text-lg">
                        {walletBalance}u
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mb-8">
                  <h2 className="text-[#ba3737] text-xl font-semibold mb-2">
                    Current Bid
                  </h2>
                  <h1 className="text-5xl font-bold">{highestBid}u</h1>
                </div>
              </div>
              <div className="w-full">
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {biddingValues.map((value) => (
                    <div
                      key={value}
                      onClick={() => setSelectedValue(value)}
                      className={`flex flex-col text-center cursor-pointer justify-center text-base border-2 flex-1 min-w-[60px] h-10 rounded-sm ${
                        selectedValue !== value
                          ? "border-red-800"
                          : "bg-white text-black"
                      }`}
                    >
                      {value}u
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4 mt-6">
                  <input
                    type="number"
                    value={bidAmount}
                    onFocus={() => setSelectedValue(null)}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter bid amount"
                    className="text-white bg-[#171717] p-2 w-full sm:w-auto flex-grow"
                  />
                  <button
                    onClick={handlePlaceBid}
                    disabled={loading || !currentUser}
                    className={`relative flex flex-col text-center justify-center border-2 border-red-800 font-bold w-full sm:w-auto flex-grow h-10 ${
                      loading || !currentUser
                        ? "bg-transparent cursor-not-allowed"
                        : "bg-red-800 cursor-pointer"
                    }`}
                  >
                    {loading ? "Please Wait.." : "Place Bid"}
                  </button>
                  <button
                    onClick={handleBuyOut}
                    disabled={loading || !currentUser}
                    className={`cursor-pointer group relative flex flex-col text-center justify-center font-bold border-2 border-red-800 w-full sm:w-auto flex-grow h-10 text-cyan-400 ${
                      !currentUser && "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Buy Out: {auction.buyout_price}u
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(45deg,#ffffff33_25%,transparent_25%,transparent_50%,#ffffff33_50%,#ffffff33_75%,transparent_75%,transparent_100%)] bg-[length:40px_40px]"></div>
                  </button>
                  <button
                    onClick={handleLeave}
                    className="cursor-pointer flex justify-center items-center font-bold border-2 border-red-800 w-full sm:w-14 h-10 text-gray-500 hover:text-gray-400"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col justify-start items-start mt-8">
                <div className="w-full h-48 overflow-auto">
                  {sortedBids.length === 0 ? (
                    <p className="text-gray-400">No bids yet</p>
                  ) : (
                    sortedBids.map((bid, index) => (
                      <div
                        key={bid.bid_id || `bid-${index}-${bid.timestamp}`}
                        className="mb-3"
                      >
                        <span
                          style={{
                            color: userColors[index % userColors.length],
                          }}
                          className="font-bold"
                        >
                          {bid.username}
                        </span>
                        <span className="text-white"> bid </span>
                        <span className="text-yellow-400 font-bold">
                          {bid.amount}u
                        </span>
                        <span className="text-gray-400 text-sm ml-2">
                          {new Date(bid.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
