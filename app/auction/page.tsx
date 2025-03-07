"use client";
import Link from "next/link";
import Card from "../components/AtomCard";
import { anton } from "../font/fonts";
import { useEffect, useState } from "react";
import { supabase } from "@/app/services/client";
import React from "react";
import Header from "../components/Header";
import { getUserId } from "../services/session";

interface AuctionItem {
  id: number;
  image: string[];
  name: string;
  price: number;
  category: string;
}

function Auction() {
  const user_id = getUserId();
  const [items, setItems] = useState<AuctionItem[]>([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      const { data, error } = await supabase.from("Auction").select("*");
      if (error) {
        console.error("Error fetching auctions:", error);
      } else {
        setItems(data as AuctionItem[]);
        console.log(data);
      }
    };
    fetchAuctions();
  }, []);

  const auctionList = items.map((item) => (
    <Link key={item.id} href={`/bidding/${item.id}`}>
      <Card image={item.image[0]} name={item.name} category={item.category} />
    </Link>
  ));

  return (
    <>
      <Header />
      <div className="px-12">
        <p className={`${anton.className} text-[#878787] text-3xl pt-8`}>
          Live auctions
        </p>
        <div className="grid grid-cols-5 pt-8">{auctionList}</div>
      </div>
    </>
  );
}

export default Auction;
