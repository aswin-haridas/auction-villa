"use client";
import AuctionImages from "@/app/components/auctionImages";
import AuctionDetails from "@/app/components/auctionDetails";
import BiddingControls from "@/app/components/Controls";
import BidHistory from "@/app/components/Logs";
import Header from "@/app/components/Header";
import { Auction, Bid } from "@/app/types/auction";
import { useEffect, useState, useCallback, memo } from "react";
import { useParams } from "next/navigation";
import {
  fetchAuction,
  fetchBids,
  subscribeToAuction,
  subscribeToBids,
} from "@/app/services/auction";
import Link from "next/link";

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

  // Set up real-time subscriptions
  useEffect(() => {
    getAuctionData();

    // Only set up subscriptions if we have a valid auction ID
    if (typeof auctionId !== "string") return;

    // Set up real-time subscriptions
    const unsubscribeAuction = subscribeToAuction(
      auctionId,
      (updatedAuction) => {
        setAuction(updatedAuction);
      }
    );

    const unsubscribeBids = subscribeToBids(auctionId, (updatedBids) => {
      setBids(updatedBids);
    });

    // Clean up subscriptions when component unmounts
    return () => {
      unsubscribeAuction();
      unsubscribeBids();
    };
  }, [auctionId, getAuctionData]);

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
        <div className="text-white text-xl">Auction not found! <Link className="text-red-700 hover:underline" href={"/"}>go to the auction list</Link></div>
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
