import React from "react";
import { playfair } from "@/app/font/fonts";
import { PaintingBadges } from "./PaintingBadges";

interface PaintingHeaderProps {
  name: string;
  image: string;
  category: string;
  acquireDate: string;
  likeCount: number;
  viewCount: number;
  status?: string;
  price?: number;
} 

export function PaintingHeader({
  name,
  category,
  acquireDate,
  likeCount,
  viewCount,
  status,
  price,
}: PaintingHeaderProps) {
  // Format the status badge display
  const renderStatusBadge = () => {
    if (!status || status === "available") return null;

    const badgeClasses = "px-3 py-1 rounded-full text-sm font-medium ml-3";

    switch (status) {
      case "at_work":
        return (
          <span className={`${badgeClasses} bg-blue-500 text-white`}>
            At Work
          </span>
        );
      case "for_sale":
        return (
          <span className={`${badgeClasses} bg-green-500 text-white`}>
            For Sale - ${price}
          </span>
        );
      case "for_trade":
        return (
          <span className={`${badgeClasses} bg-purple-500 text-white`}>
            For Trade
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center mb-8 border-b border-[#878787] pb-8">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <h1 className={`text-4xl text-[#FEF9E1] ${playfair.className}`}>
            {name}
            {renderStatusBadge()}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3 mb-4 justify-between">
          <PaintingBadges
            category={category}
            acquireDate={acquireDate}
            likeCount={likeCount}
            viewCount={viewCount}
          />
        </div>

        {/* Stats display */}
        <div className="flex gap-6 text-[#878787] mt-4">
          <div>
            <span className="font-bold text-white">
              {likeCount.toLocaleString()}
            </span>{" "}
            likes
          </div>
          <div>
            <span className="font-bold text-white">
              {viewCount.toLocaleString()}
            </span>{" "}
            views
          </div>
        </div>
      </div>
    </div>
  );
}
