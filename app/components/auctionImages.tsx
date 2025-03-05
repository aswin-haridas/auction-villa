import React, { useState } from "react";
import Image from "next/image";

interface AuctionImagesProps {
  images: string[];
}

export default function AuctionImages({ images }: AuctionImagesProps) {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className="flex">
      <div className="flex flex-col pr-2 space-y-2">
        {images.map((img, i) => (
          <Image
            key={i}
            alt={`Thumbnail ${i + 1}`}
            onClick={() => setCurrentImage(i)}
            src={img}
            width={100}
            height={100}
            className={`h-28 flex cursor-pointer ${
              currentImage !== i && "opacity-50 grayscale"
            }`}
            style={{ objectFit: "cover" }}
          />
        ))}
      </div>
      <Image
        src={images[currentImage]}
        alt={`Current Image`}
        width={500}
        height={500}
        priority
        className="object-cover h-[76vh]"
      />
    </div>
  );
}
