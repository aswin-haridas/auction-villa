"use client";
import Link from "next/link";
import Card from "../components/AtomCard";
import { anton } from "../font/fonts";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useRouter } from "next/navigation";
import { getAuctions } from "../services/auction";

interface AuctionItem {
  id: string;
  image: string[];
  name: string;
  price: number;
  category: string;
}

function Auction() {
  const router = useRouter();
  const [items, setItems] = useState<AuctionItem[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    if (!sessionStorage.getItem("username")) {
      router.push("/auth");
      return;
    }

    // Fetch auctions
    getAuctions().then((data) => setItems(data));
  }, [router]);

  return (
    <>
      <div className="px-12">
        <p className={`${anton.className} text-[#878787] text-3xl pt-8`}>
          Live auctions
        </p>
        <div className="grid grid-cols-5 pt-8">
          {items.map((item) => (
            <Link key={item.id} href={`/auction/${item.id}`}>
              <Card
                image={item.image[0]}
                name={item.name}
                category={item.category}
              />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default Auction;
