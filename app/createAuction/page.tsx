"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAuction() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [endTime, setEndTime] = useState(new Date());
  const [buyOutPrice, setBuyOutPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, price, endTime, buyOutPrice, category, images }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create auction");
      }

      setSuccessMessage("Auction created successfully!");
      router.push("/"); // Redirect to home page after successful creation
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {successMessage && <div style={{ color: "green" }}>{successMessage}</div>}
      <label>
        Name:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <br />
      <label>
        Starting Price:
        <input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value, 10))} />
      </label>
      <br />
      <label>
        End Time:
        <input type="datetime-local" value={endTime.toISOString().slice(0, 16)} onChange={(e) => setEndTime(new Date(e.target.value))} />
      </label>
      <br />
      <label>
        Buy Out Price:
        <input type="number" value={buyOutPrice} onChange={(e) => setBuyOutPrice(parseInt(e.target.value, 10))} />
      </label>
      <br />
      <label>
        Category:
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
      </label>
      <br />
      <label>
        Images (comma-separated URLs):
        <input type="text" value={images.join(",")} onChange={(e) => setImages(e.target.value.split(",").map((s) => s.trim()))} />
      </label>
      <br />
      <button type="submit">Create Auction</button>
    </form>
  );
}
