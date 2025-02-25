"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUsername, useValidateSession } from "@/app/utils/session";
import { createAuction } from "@/app/utils/auction";

export default function CreateAuction() {
  useValidateSession(); // Validate session on component mount

  const [name, setName] = useState("");
  const [image, setImage] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [endTime, setEndTime] = useState("");
  const [buyoutPrice, setBuyoutPrice] = useState("");
  const [startTime, setStartTime] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const username = getUsername();
      if (!username) {
        throw new Error("You must be logged in to create an auction.");
      }

      await createAuction({
        name,
        image,
        price: parseFloat(price),
        endTime,
        buyoutPrice: buyoutPrice ? parseFloat(buyoutPrice) : null,
        startTime,
        category,
        highestBidder: username, // Assuming highest bidder is the creator initially
      });
      router.push("/auction");
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleImageUpload = (newImage: string[]) => {
    setImage(newImage);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... rest of the form remains the same ... */}
    </form>
  );
}
