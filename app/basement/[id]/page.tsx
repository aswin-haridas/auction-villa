"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPainting } from "@/app/services/painting";

// Import our extracted components
import { ImageModal } from "./ImageModal";
import { PaintingHeader } from "./PaintingHeader";
import { PaintingGallery } from "./PaintingGallery";
import { anton } from "@/app/font/fonts";
import { Dashboard } from "./dashboard/dashboard";
import { PaintingBadges } from "./PaintingBadges";

interface Painting {
  painting_id: string;
  name: string;
  image: string[];
  acquire_date: string;
  category: string;
  owner: string; // Ensure this is not optional
  status?: string;
  at_work?: boolean;
  working_time?: number;
  price?: number; // From existing setPaintingForSale

  // New fields for trade and rent
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
  const [activeSection, setActiveSection] = useState<"gallery" | "dashboard">(
    "gallery"
  );

  // Fake stats for social media-like UI
  const likeCount = Math.floor(Math.random() * 5000) + 1000;
  const viewCount = Math.floor(Math.random() * 15000) + likeCount;

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

  // Function to refresh painting data after status changes
  const refreshPainting = async () => {
    try {
      const paintingData = await getPainting(paintingId);
      setPainting(paintingData);
    } catch (error) {
      console.error("Error refreshing painting data:", error);
    }
  };

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
    <div className="px-4 md:px-12 pb-16 max-w-7xl mx-auto">
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
        viewCount={viewCount}
        status={painting.status}
        price={painting.price}
      />

      {/* Navigation tabs */}
      <div className="flex border-b border-gray-800 mt-8">
        <button
          className={`px-6 py-2 mr-4 text-lg font-medium ${
            activeSection === "gallery"
              ? "text-white border-b-2 border-[#ba3737]"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveSection("gallery")}
        >
          Gallery
        </button>
        <button
          className={`px-6 py-2 text-lg font-medium ${
            activeSection === "dashboard"
              ? "text-white border-b-2 border-[#ba3737]"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveSection("dashboard")}
        >
          Dashboard
        </button>
      </div>

      {/* Content sections */}
      <div
        className={`mt-6 ${activeSection === "gallery" ? "block" : "hidden"}`}
      >
        <PaintingGallery
          images={painting.image}
          paintingName={painting.name}
          onImageClick={openGridImage}
        />
      </div>

      <div
        className={`mt-6 ${activeSection === "dashboard" ? "block" : "hidden"}`}
      >
        <Dashboard paintingId={paintingId} />
      </div>

      {/* Fullscreen modal for grid images */}
      <ImageModal
        isOpen={!!selectedGridImage}
        onClose={closeGridImage}
        src={selectedGridImage || ""}
        alt={`${painting.name} - Full view`}
      />
    </div>
  );
}
