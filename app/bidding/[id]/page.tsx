"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BiddingControls from "@/app/components/biddingControls";
import { anton } from "@/app/font/fonts";
import BiddingLog from "@/app/components/biddinglog";
import { createClient } from "@/utils/supabase/client";

export default function Bidding() {
  const params = useParams();
  const id = params.id as string;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [auctionData, setAuctionData] = useState<any>(null);

  useEffect(() => {
    async function fetchAuctionData() {
      const supabase = createClient();
      const {data:auctions} = await supabase.from("auctions").select("*").eq("id", id);
      if(auctions && auctions.length > 0) {
        setAuctionData(auctions[0]);
      }
    }
    fetchAuctionData();
  },[id])


  if (!id) {
    return <div className="p-4">Loading...</div>;
  }

  if (!auctionData) {
    return <div className="p-4">loading auction data...</div>;
  }

  return (
    <div>
      <h1 className={`${anton.className} font-anton text-3xl m-2`}>Auction</h1>
      <div className="p-4 border border-red-800 flex flex-col md:flex-row w-full h-full">
        <div className="flex-1 w-full md:w-96 relative">
          <Image
            src={auctionData.image[currentImageIndex]}
            alt={auctionData.name}
            width={500}
            height={700}
            priority
            style={{ objectFit: "cover" }}
          />
          <div className="flex flex-wrap gap-2">
            {auctionData.image.map((image: string, index: number) => (
              <div
                onClick={() => setCurrentImageIndex(index)}
                key={index}
                className={`border border-dotted my-2 border-red-800 hover:bg-white hover:text-black w-8 h-8 flex items-center justify-center cursor-pointer ${
                  currentImageIndex === index ? 'bg-white text-black' : ''
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-4 mt-4 md:mt-0 md:ml-4">
          <h1 className="text-4xl">{auctionData.name}</h1>
          <h1 className="text-green-500">Starting Price: {auctionData.price}u</h1>
          <h1>End Time: {auctionData.endTime}</h1>
          <h1>Owner: {auctionData.owner.toUpperCase()}</h1>
          <h1 className="text-red-800 underline underline-offset-2">
            Current Bid
          </h1>
          <h1 className="text-4xl">{auctionData.currentBid}u</h1>
          <h1>Highest Bid: {auctionData.highestBid}u</h1>
          <h1>Highest Bidder: {auctionData.highestBidder}</h1>
          <h1>Buy Out Price: {auctionData.buyOutPrice}u</h1>
          <BiddingControls buyOutPrice={auctionData.buyOutPrice} />
          <BiddingLog/>
        </div>
      </div>
    </div>
  );
}