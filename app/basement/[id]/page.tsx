"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPainting } from "@/app/services/painting";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface Painting {
  painting_id: string;
  name: string;
  image: string[];
  acquire_date: string;
  category: string;
  owner: string;
}

export default function PaintingPage() {
  const params = useParams();
  const router = useRouter();
  const paintingId = params.id as string;

  const [painting, setPainting] = useState<Painting | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentImage, setCurrentImage] = useState<number>(0);

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
      <div className="p-4 flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!painting) {
    return (
      <div className="p-4 flex items-center justify-center h-screen">
        <div className="text-white text-xl">
          Painting not found!{" "}
          <Link className="text-red-700 hover:underline" href="/">
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-row h-[80vh] m-12">
      <div className="w-1/2  flex flex-col">
        <h1 className="text-6xl text-[#FEF9E1] font-bold mb-6">
          {painting.name}
        </h1>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <p className="text-[#878787] text-lg">
            Category: <span className="text-white">{painting.category}</span>
          </p>
          <p className="text-[#878787] text-lg">
            Acquired on:{" "}
            <span className="text-white font-semibold">
              {new Date(painting.acquire_date).toLocaleDateString()}
            </span>
          </p>
        </div>
        <div className="mt-2">
          <h2 className="text-[#ba3737] text-xl font-semibold mb-2">
            Painting Details
          </h2>
          <p className="text-white text-lg">
            This is one of your valuable paintings in your collection. You
            acquired this masterpiece on{" "}
            {new Date(painting.acquire_date).toLocaleDateString()}.
          </p>
        </div>
        <div className="mt-6">
          <Link
            href="/basement"
            className="text-[#ba3737] hover:underline flex items-center"
          >
            ← Back to Collection
          </Link>
        </div>
      </div>
      <div className=" w-1/2 flex justify-end">
        {painting.image && painting.image.length > 0 ? (
          <div className=" w-4/6 relative">
            <div className="absolute top-2 right-2 flex space-x-2 z-10">
              <button 
                onClick={() => setCurrentImage(prev => (prev > 0 ? prev - 1 : painting.image.length - 1))}
                className="bg-black/50 p-1 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronLeftIcon className="text-white h-5 w-5" />
              </button>
              <button 
                onClick={() => setCurrentImage(prev => (prev < painting.image.length - 1 ? prev + 1 : 0))}
                className="bg-black/50 p-1 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronRightIcon className="text-white h-5 w-5" />
              </button>
            </div>
            <Image
              src={painting.image[currentImage] || "/placeholder.jpg"}
              alt={`Current Image of ${painting.name}`}
              fill
              priority
              className="object-cover rounded-xl"
            />
          </div>
        ) : (
          <div className="text-white">No images available</div>
        )}
      </div>
    </section>
  );
}
