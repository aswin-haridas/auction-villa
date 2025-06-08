"use client";
import React, { useEffect, useState } from "react";
import AuctionImages from "@/app/components/auctionImages";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Auction, Bid } from "@/app/lib/types/auction";
import {
  checkAuctionActive,
  endAuction,
  getAuction,
  subscribeToAuction,
} from "@/app/services/auction";
import {
  getBids,
  placeBid as placeBidService,
  subscribeToBids,
} from "@/app/services/bids";
import { getWalletBalance } from "@/app/services/bank";

export default function AuctionPage() {
  const params = useParams();
  const router = useRouter();
  const auctionId = params.id as string;

  // Local state for auction data
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAuctionActive, setIsAuctionActive] = useState<boolean>(true);

  // Bidding state
  const [bidAmount, setBidAmount] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  // User state
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Values for bid increments instead of absolute values
  const biddingIncrements = [100, 500, 1000, 5000, 10000];

  // Colors for different users in the bid history
  const userColors = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3"];

  // Calculate highest bid and bidder
  const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
  const highestBid =
    sortedBids.length > 0 ? sortedBids[0].amount : auction?.price || 0;
  const highestBidder =
    sortedBids.length > 0 ? sortedBids[0].username : "No bidders yet";

  // Fetch auction data
  const fetchAuction = async (id: string) => {
    try {
      const auctionData = await getAuction(id);
      setAuction(auctionData);

      const bidsData = await getBids(id);
      setBids(bidsData);

      const active = await checkAuctionActive(id);
      setIsAuctionActive(active);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching auction:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get user info from sessionStorage
    setCurrentUser(sessionStorage.getItem("user_id"));
    setUsername(sessionStorage.getItem("username"));

    // Fetch wallet balance
    const fetchWalletBalance = async () => {
      try {
        const balance = await getWalletBalance();
        setWalletBalance(balance);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    fetchWalletBalance();

    // Fetch auction data
    if (auctionId) {
      fetchAuction(auctionId);
    }

    // Set up subscriptions
    let auctionUnsubscribe: () => void;
    let bidsUnsubscribe: () => void;

    if (auctionId) {
      auctionUnsubscribe = subscribeToAuction(auctionId, (updatedAuction) => {
        setAuction(updatedAuction);
      });

      bidsUnsubscribe = subscribeToBids(auctionId, (updatedBids) => {
        setBids(updatedBids);
      });
    }

    // Clean up subscriptions when component unmounts
    return () => {
      if (auctionUnsubscribe) auctionUnsubscribe();
      if (bidsUnsubscribe) bidsUnsubscribe();
    };
  }, [auctionId]);

  // Handle bid placement
  const handlePlaceBid = async () => {
    if (!currentUser || !username) {
      alert("Please log in to place a bid");
      return;
    }

    if (!isAuctionActive) {
      alert("This auction is no longer active");
      return;
    }

    // Calculate the total bid amount (increment + current highest bid)
    const bidIncrement = bidAmount ? parseInt(bidAmount) : selectedValue;
    if (!bidIncrement || isNaN(bidIncrement)) {
      alert("Please enter a valid bid increment");
      return;
    }

    const totalBidAmount = highestBid + bidIncrement;

    // Check if current user is already the highest bidder
    if (sortedBids.length > 0 && sortedBids[0].username === username) {
      alert("You are already the highest bidder!");
      return;
    }

    if (totalBidAmount > walletBalance) {
      alert("Insufficient wallet balance");
      return;
    }

    setLoading(true);

    try {
      await placeBidService(currentUser, auctionId, totalBidAmount);
      // Clear bid input after successful bid
      setBidAmount("");
      setSelectedValue(null);
    } catch (error) {
      console.error("Error placing bid:", error);
      alert(
        `Failed to place bid: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle leave auction
  const handleLeave = async () => {
    // End auction when leaving
    if (isAuctionActive && auctionId) {
      try {
        // Pass winner info if there is a highest bidder
        if (sortedBids.length > 0) {
          const highestBid = sortedBids[0];
          await endAuction(auctionId, highestBid.user_id, highestBid.username);
        } else {
          await endAuction(auctionId);
        }
      } catch (error) {
        console.error("Error ending auction:", error);
      }
    }
    router.push("/");
  };

  // Handle buyout
  const handleBuyOut = async () => {
    if (!currentUser) {
      alert("Please log in to buy out");
      return;
    }

    if (!isAuctionActive) {
      alert("This auction is no longer active");
      return;
    }

    if (auction && auction.buyout_price > walletBalance) {
      alert("Insufficient wallet balance for buyout");
      return;
    }

    // Implement buyout by placing a bid at the buyout price
    if (auction) {
      setLoading(true);
      try {
        await placeBidService(currentUser, auctionId, auction.buyout_price);
        // Explicitly end the auction after buyout and set current user as winner
        if (currentUser && username) {
          await endAuction(auctionId, currentUser, username);
        } else {
          await endAuction(auctionId);
        }
        alert("Buyout successful!");
      } catch (error) {
        console.error("Error during buyout:", error);
        alert(
          `Buyout failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    }
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

  // Show a message if auction is not active
  if (!isAuctionActive) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-screen">
        <div className="text-white text-xl mb-4">This auction has ended!</div>
        {auction.highest_bidder === currentUser && (
          <div className="text-green-500 text-xl mb-4">
            Congratulations! You won this auction!
          </div>
        )}
        <Link className="text-red-700 hover:underline" href={"/"}>
          Go to the auction list
        </Link>
      </div>
    );
  }

  return (
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
                    <span className="text-[#878787] text-lg">Wallet bal: </span>
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
                {biddingIncrements.map((increment) => (
                  <div
                    key={increment}
                    onClick={() => setSelectedValue(increment)}
                    className={`flex flex-col text-center cursor-pointer justify-center text-base border-2 flex-1 min-w-[60px] h-10 rounded-sm ${
                      selectedValue !== increment
                        ? "border-red-800"
                        : "bg-white text-black"
                    }`}
                  >
                    +{increment}u
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-6">
                <input
                  type="number"
                  value={bidAmount}
                  onFocus={() => setSelectedValue(null)}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter bid increment"
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
                  {loading
                    ? "Please Wait.."
                    : `Bid ${
                        selectedValue || bidAmount
                          ? highestBid +
                            (parseInt(bidAmount) || selectedValue || 0) +
                            "u"
                          : ""
                      }`}
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
  );
}
