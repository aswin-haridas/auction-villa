import React, { useState } from "react";
import Image from "next/image";

interface AuctionImagesProps {
  images: string[];
}

export default function AuctionImages({ images }: AuctionImagesProps) {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className="flex h-full w-[85%]">
      <div className="flex flex-col pr-2 space-y-2 max-h-[80vh] overflow-y-auto">
        {images.map((img, i) => (
          <Image
            key={i}
            alt={`Thumbnail ${i + 1}`}
            onClick={() => setCurrentImage(i)}
            src={img}
            width={100}
            height={100}
            className={` grow cursor-pointer ${
              currentImage !== i && "opacity-50 grayscale"
            }`}
            style={{ objectFit: "cover" }}
          />
        ))}
      </div>
      <div className="flex-grow h-[80vh] relative">
        <Image
          src={images[currentImage]}
          alt={`Current Image`}
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
