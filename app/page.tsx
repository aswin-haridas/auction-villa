"use client";
import Link from "next/link";
import Card from "./components/card";
import { anton } from "./font/fonts";
import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/client";

const supabase = createClient();

interface AuctionItem {
  id: number;
  image: string;
  name: string;
  price: number;
}

export default function Home() {
  const [items, setItems] = useState<AuctionItem[]>([]);

  useEffect(() => {

    const fetchAuctions = async () => {
      const { data, error } = await supabase.from("auctions").select("*");

      if (error) {
        console.error("Error fetching auctions:", error);
      } else {
        setItems(data as AuctionItem[]);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      <p className={`${anton.className} text-gray-300 text-3xl p-6`}>Live auctions</p>
      <hr className="border border-[#A7A7A7] w-4/5 my-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {items.map((item) => (
          <Link key={item.id} href={`/bidding/${item.id}`}>
            <Card image={item.image[0]} name={item.name} price={item.price} />
          </Link>
        ))}
      </div>
    </div>
  );
}
