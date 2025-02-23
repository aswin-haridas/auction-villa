"use client";
import Link from "next/link";
import Card from "../components/card";
import { anton } from "../font/fonts";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/app/utils/client";
import React from "react";
import Header from "../components/header";

interface AuctionItem {
  id: number;
  image: string[];
  name: string;
  price: number;
}

function Auction() {
  const [items, setItems] = useState<AuctionItem[]>([]);

  const fetchAuctions = useCallback(async () => {
    const { data, error } = await supabase.from("Auction").select("*");

    if (error) {
      console.error("Error fetching auctions:", error);
    } else {
      setItems(data as AuctionItem[]);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const auctionList = useMemo(() => {
    return items.map((item) => (
      <Link key={item.id} href={`/bidding/${item.id}`}>
        <Card image={item.image[0]} name={item.name} price={item.price} />
      </Link>
    ));
  }, [items]);

  return (
    <>
      <Header />
      <div className="p-4 flex flex-col items-center justify-center">
        <p className={`${anton.className} text-gray-300 text-3xl p-6`}>
          Live auctions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
          {auctionList}
        </div>
      </div>
    </>
  );
}

export default Auction;
