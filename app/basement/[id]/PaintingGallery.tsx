import Image from "next/image";

interface PaintingGalleryProps {
  images: string[];
  paintingName: string;
  onImageClick: (img: string) => void;
}

export function PaintingGallery({
  images,
  paintingName,
  onImageClick,
}: PaintingGalleryProps) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 gap-1 mb-8">
        {images &&
          images.map((img, index) => (
            <div
              key={`grid-${index}`}
              className="aspect-square relative bg-[#171717]"
              onClick={() => onImageClick(img)}
            >
              <Image
                src={img}
                alt={`${paintingName} - Image ${index + 1}`}
                fill
                className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
              />
            </div>
          ))}
      </div>
    </div>
  );
}
