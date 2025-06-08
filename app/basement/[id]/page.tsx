"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPainting } from "@/app/services/painting";
import { ImageModal } from "./ImageModal";
import { PaintingHeader } from "./PaintingHeader";
import { PaintingGallery } from "./PaintingGallery";
import { anton } from "@/app/font/fonts";

interface Painting {
  painting_id: string;
  name: string;
  image: string[];
  acquire_date: string;
  category: string;
  owner: string;
  status?: string;
  at_work?: boolean;
  price?: number;
  working_time?: number;
  is_for_trade?: boolean;
  is_for_rent?: boolean;
  is_rented?: boolean;
  rented_by?: string | null;
  rental_end_date?: string | null;
  rental_price?: number | null;
}

export default function PaintingPage() {
  const params = useParams();
  const paintingId = params.id as string;

  const [painting, setPainting] = useState<Painting | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedGridImage, setSelectedGridImage] = useState<string | null>(
    null
  );

  const likeCount = Math.floor(Math.random() * 5000) + 1000;

  const openGridImage = (img: string) => {
    setSelectedGridImage(img);
  };

  const closeGridImage = () => {
    setSelectedGridImage(null);
  };

  useEffect(() => {
    const fetchPainting = async () => {
      try {
        const paintingData = await getPainting(paintingId);
        setPainting(paintingData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching painting:", error);
        setIsLoading(false);
      }
    };

    if (paintingId) {
      fetchPainting();
    }
  }, [paintingId]);

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-screen bg-[#171717]">
        <div className="text-[#ffffff] text-xl">Loading...</div>
      </div>
    );
  }

  if (!painting) {
    return (
      <div className="p-4 flex items-center justify-center h-screen bg-[#171717]">
        <div className="text-[#ffffff] text-xl">
          Painting not found!{" "}
          <Link className="text-[#ba3737] hover:underline" href="/">
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-12">
      <p className={`${anton.className} text-[#878787] text-3xl pt-8 pb-8`}>
        Profile
      </p>
      {/* Profile header */}
      <PaintingHeader
        name={painting.name}
        image={painting.image[0] || "/placeholder.jpg"}
        category={painting.category}
        acquireDate={painting.acquire_date}
        likeCount={likeCount}
      />

      {/* Gallery grid */}
      <PaintingGallery
        images={painting.image}
        paintingName={painting.name}
        onImageClick={openGridImage}
      />

      {/* Fullscreen modal for grid images */}
      <ImageModal
        isOpen={!!selectedGridImage}
        onClose={closeGridImage}
        src={selectedGridImage || ""}
        alt={`${painting.name} - Full view`}
      />

      <section id="dashboard">
        <p className={`${anton.className} text-[#878787] text-3xl pt-8 pb-8`}>
          Dashboard
        </p>
        <div className="mb-8">
          <p className="text-[#ffffff]">Dashboard content goes here...</p>
        </div>
      </section>
    </div>
  );
}
