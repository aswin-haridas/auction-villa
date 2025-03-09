"use client";
import Link from "next/link";
import Card from "./components/AtomCard";
import { anton } from "./font/fonts";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/app/services/client";
import React from "react";

interface Paintings {
  id: number;
  image: string[];
  name: string;
  price: number;
  category: string;
}

function Auction() {
  const [paintings, setPaintings] = useState<Paintings[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Move sessionStorage access into useEffect
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("user_id");
    setUserId(storedUserId);

    if (!storedUserId) {
      window.location.href = "/auth";
    }
  }, []);

  const fetchPaintings = useCallback(async () => {
    if (!userId) return; // Avoid fetching until userId is available

    const { data, error } = await supabase
      .from("Painting")
      .select("*")
      .eq("owner", userId);

    if (error) {
      console.error("Error fetching paintings:", error);
    } else {
      setPaintings(data as Paintings[]);
    }
  }, [userId]); // Add userId as a dependency

  useEffect(() => {
    fetchPaintings();
  }, [fetchPaintings]);

  const paintingList = useMemo(() => {
    return paintings.map((painting) => (
      <Link key={painting.id} href={`/bidding/${painting.id}`}>
        <Card
          image={painting.image && painting.image[0] ? painting.image[0] : ""}
          name={painting.name}
          category={painting.category}
        />
      </Link>
    ));
  }, [paintings]);

  return (
    <>
      <div className="px-12">
        <p className={`${anton.className} text-[#878787] text-3xl pt-8`}>
          Your Holdings
        </p>
        <div className="grid grid-cols-5 pt-8">{paintingList}</div>
      </div>
    </>
  );
}

export default Auction;