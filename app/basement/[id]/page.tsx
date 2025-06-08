"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPainting, Painting } from "@/app/lib/types/painting";
import { ImageModal } from "./ImageModal";
import { PaintingHeader } from "./PaintingHeader";
import { PaintingGallery } from "./PaintingGallery";
import { anton } from "@/app/font/fonts";
import Loading from "@/app/components/Loading";

export default function PaintingPage() {
  const params = useParams();
  const paintingId = params.id as string;

  const [painting, setPainting] = useState<Painting | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedGridImage, setSelectedGridImage] = useState<string | null>(
    null
  );

  const likeCount = 2;

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
    return <Loading />;
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
      <p className={`${anton.className} text-[#878787] text-3xl pt-8`}>
        Profile
      </p>
      {/* Profile header */}
      <PaintingHeader
        name={painting.name}
        image={painting.images[0] || "/placeholder.jpg"}
        category={painting.category}
        acquireDate={painting.acquire_date}
        likeCount={likeCount}
        id={painting.painting_id}
      />

      {/* Gallery grid */}
      <PaintingGallery
        images={painting.images}
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
    </div>
  );
}
