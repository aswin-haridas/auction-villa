"use client";
import AuctionImages from "@/app/components/auctionImages";
import AuctionDetails from "@/app/components/auctionDetails";
import BiddingControls from "@/app/components/Controls";
import BidHistory from "@/app/components/Logs";
import Header from "@/app/components/Header";
import { Auction, Bid } from "@/app/types/auction";
import { useEffect, useState, useCallback, memo } from "react";
import { useParams } from "next/navigation";
import { fetchAuction, fetchBids } from "@/app/services/auction";

// Memoized components to prevent unnecessary re-renders
const MemoizedAuctionImages = memo(AuctionImages);
const MemoizedAuctionDetails = memo(AuctionDetails);
const MemoizedBiddingControls = memo(BiddingControls);
const MemoizedBidHistory = memo(BidHistory);

export default function Bidding() {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const params = useParams();
  const auctionId = params.id;

  // Fetch auction data using a memoized callback
  const getAuctionData = useCallback(async () => {
    if (typeof auctionId !== "string") {
      setError("Invalid auction ID");
      setIsLoading(false);
      return;
    }

    try {
      const [auctionData, bidsData] = await Promise.all([
        fetchAuction(auctionId),
        fetchBids(auctionId),
      ]);

      if (auctionData) setAuction(auctionData);
      if (bidsData) setBids(bidsData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [auctionId]);

  // Poll for updates
  useEffect(() => {
    getAuctionData();

    // Set up polling for real-time updates
    const pollInterval = setInterval(() => {
      if (typeof auctionId === "string") {
        fetchBids(auctionId)
          .then((newBids) => {
            if (newBids && JSON.stringify(newBids) !== JSON.stringify(bids)) {
              setBids(newBids);
            }
          })
          .catch((err) => console.error("Polling error:", err));
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [auctionId, getAuctionData, bids]);

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex items-center justify-center h-screen">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="p-4 flex items-center justify-center h-screen">
        <div className="text-white text-xl">Auction not found</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="px-12 min-h-screen mt-8">
        <div className="flex flex-col">
          <div className="flex justify-between h-[85vh]">
            <div className="w-1/2">
              <MemoizedAuctionImages images={auction.image} />
            </div>
            <div className="w-1/2 pl-8">
              <MemoizedAuctionDetails
                auction={auction}
                bids={bids}
                currentUser={currentUser}
                username={username}
                setAuction={setAuction}
                setBids={setBids}
                setError={setError}
              />
              <MemoizedBiddingControls
                auction={auction}
                currentUser={currentUser}
                username={username}
                setAuction={setAuction}
                setBids={setBids}
              />
              <MemoizedBidHistory bids={bids} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
