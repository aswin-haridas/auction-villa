import Image from "next/image";

interface AuctionImagesProps {
  images: string[];
  currentImage: number;
  setCurrentImage: (index: number) => void;
}

export default function AuctionImages({
  images,
  currentImage,
  setCurrentImage,
}: AuctionImagesProps) {
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
      <div className="relative">
        <Image
          src={images[currentImage]}
          alt={`Current Image`}
          width={500}
          height={500}
          priority
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
