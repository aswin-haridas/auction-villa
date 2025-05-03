import { Heart, Eye } from "lucide-react";
import { anton } from "@/app/font/fonts";
import React from "react";

interface PaintingBadgesProps {
  category: string;
  acquireDate: string;
  likeCount: number;
  viewCount: number;
}

export function PaintingBadges({
  category,
  acquireDate,
  likeCount,
  viewCount,
}: PaintingBadgesProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {/* Category Badge */}
      <div className="px-3 py-1 bg-[#171717] border border-[#ba3737] rounded-full">
        <span className={`text-[#ffffff] text-sm`}>{category}</span>
      </div>

      {/* Acquire Date Badge */}
      <div className="px-3 py-1 bg-[#171717] border border-[#878787] rounded-full">
        <span className={`text-[#878787] text-sm`}>
          Acquired: {new Date(acquireDate).toLocaleDateString()}
        </span>
      </div>

      {/* Likes Badge */}
      <div className="px-3 py-1 bg-[#171717] border border-[#878787] rounded-full flex items-center">
        <Heart className="w-3 h-3 text-[#ba3737] mr-1" />
        <span className={`text-[#ffffff] text-sm ${anton.className}`}>
          {likeCount.toLocaleString()}
        </span>
      </div>

      {/* Views Badge */}
      <div className="px-3 py-1 bg-[#171717] border border-[#878787] rounded-full flex items-center">
        <Eye className="w-3 h-3 text-[#4287f5] mr-1" />
        <span className={`text-[#ffffff] text-sm ${anton.className}`}>
          {viewCount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
