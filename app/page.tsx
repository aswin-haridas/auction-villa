"use client";
import Link from "next/link";
import Card from "./components/AtomCard";
import { anton } from "./font/fonts";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/app/services/client";
import React from "react";
import Header from "./components/Header";

interface Paintings {
  painting_id: string;
  image: string[];
  name: string;
  price: number;
  category: string;
}

function Auction() {
  const [paintings, setPaintings] = useState<Paintings[]>([]);
  const userId = sessionStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) {
      window.location.href = "/auth";
    }
  }, [userId]);

  const fetchPaintings = useCallback(async () => {
    const { data, error } = await supabase
      .from("Painting")
      .select("*")
      .eq("owner", userId);

    if (error) {
      console.error("Error fetching paintings:", error);
    } else {
      setPaintings(data as Paintings[]);
    }
  }, []);

  useEffect(() => {
    fetchPaintings();
  }, [fetchPaintings]);

  const paintingList = useMemo(() => {
    return paintings.map((painting) => (
      <Link key={painting.painting_id} href={`/basement/${painting.painting_id}`}>
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
