"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUsername } from "@/app/utils/session";
import { createAuction } from "@/app/utils/auction";

export default function CreateAuction() {
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
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="image">Image:</label>
        <input type="file" id="image" onChange={handleImageUpload} multiple />
      </div>
      <div>
        <label htmlFor="price">Price:</label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="endTime">End Time:</label>
        <input
          type="time"
          id="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="buyoutPrice">Buy-out Price:</label>
        <input
          type="number"
          id="buyoutPrice"
          value={buyoutPrice}
          onChange={(e) => setBuyoutPrice(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="startTime">Start Time:</label>
        <input
          type="time"
          id="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="category">Category:</label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit">Create Auction</button>
    </form>
  );
}
