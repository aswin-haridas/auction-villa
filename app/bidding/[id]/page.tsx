"use client";
import AuctionImages from "@/app/components/auctionImages";
import AuctionDetails from "@/app/components/auctionDetails";
import BiddingControls from "@/app/components/biddingControls";
import BidHistory from "@/app/components/bidHistory";
import Header from "@/app/components/header";
import { Auction, Bid, User } from "@/app/types/auction";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchAuction, fetchBids } from "@/app/services/auction";

export default function Bidding() {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const auctionId = params.id;

  useEffect(() => {
    const getAuction = async () => {
      if (typeof auctionId === "string") {
        try {
          const auction = await fetchAuction(auctionId);
          const bidsData = await fetchBids(auctionId);
          if (auction) {
            setAuction(auction);
          }
          if (bidsData) {
            setBids(bidsData);
          }
        } catch (error: any) {
          setError(error.message);
        }
      } else {
        setError("Invalid auction ID");
      }
    };
    getAuction();

  }, [auctionId]);

  if (!auction) {
    return (
      <div className="p-4 flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="px-12 min-h-screen  mt-8 ">
        <div className="flex flex-col">
          <div className="flex justify-between h-[85vh] ">
            <div className="w-1/2  ">
              <AuctionImages images={auction.image} />
            </div>
            <div className="w-1/2 pl-8 ">
              <AuctionDetails
                auction={auction}
                bids={bids}
                currentUser={currentUser}
                username={username}
                setAuction={setAuction}
                setBids={setBids}
                setError={setError}
              />
              <BiddingControls
                auction={auction}
                currentUser={currentUser}
                username={username}
                setAuction={setAuction}
                setBids={setBids}
              />
              <BidHistory bids={bids} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
