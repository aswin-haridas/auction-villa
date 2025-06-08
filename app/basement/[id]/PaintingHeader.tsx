import React from "react";
import { playfair } from "@/app/font/fonts";
import { PaintingBadges } from "./PaintingBadges";
import { ChevronRight } from "lucide-react";

interface PaintingHeaderProps {
  name: string;
  image: string;
  category: string;
  acquireDate: string;
  likeCount: number;
}

export function PaintingHeader({
  name,
  category,
  acquireDate,
  likeCount,
}: PaintingHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center mb-8 border-b border-[#878787] pb-8">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <h1 className={`text-4xl text-[#FEF9E1] ${playfair.className}`}>
            {name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3 mb-4 justify-between">
          <PaintingBadges
            category={category}
            acquireDate={acquireDate}
            likeCount={likeCount}
          />
          <div className="px-3 py-1 border border-[#878787] hover:bg-white hover:text-black flex items-center">
            Go to Dashboard <ChevronRight />
          </div>
        </div>
      </div>
    </div>
  );
}
