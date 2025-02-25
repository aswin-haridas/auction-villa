"use client";
import { useState } from "react";
<<<<<<< HEAD
import { supabase } from "@/app/services/client";
import Header from "@/app/components/header";
import { playfair } from "@/app/font/fonts";

export default function CreateAuction() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [buyOutPrice, setBuyOutPrice] = useState("");
  const [category, setCategory] = useState("");
  const [endTime, setEndTime] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState("active");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from("Auction").insert([
      {
        name,
        price: parseFloat(price),
        buyout_price: parseFloat(buyOutPrice),
        category,
        end_time: new Date(endTime).toISOString(),
        image: images,
        status,
      },
    ]);
    if (error) {
      console.error("Error creating auction:", error);
    } else {
      console.log("Auction created:", data);
    }
  };

  return (
    <>
      <Header />
      <div className="pt-8 px-12">
        <h1
          className={`text-5xl text-[#FEF9E1] mb-6 ${playfair.className} font-bold`}
        >
          Create Auction
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4 text-white">
          <div>
            <label className="block text-[#878787] mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-[#171717] border border-[#878787] rounded"
              required
            />
          </div>
          <div>
            <label className="block text-[#878787] mb-2">Starting Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 bg-[#171717] border border-[#878787] rounded"
              required
            />
          </div>
          <div>
            <label className="block text-[#878787] mb-2">Buyout Price</label>
            <input
              type="number"
              value={buyOutPrice}
              onChange={(e) => setBuyOutPrice(e.target.value)}
              className="w-full p-2 bg-[#171717] border border-[#878787] rounded"
              required
            />
          </div>
          <div>
            <label className="block text-[#878787] mb-2">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 bg-[#171717] border border-[#878787] rounded"
              required
            />
          </div>
          <div>
            <label className="block text-[#878787] mb-2">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 bg-[#171717] border border-[#878787] rounded"
              required
            />
          </div>
          <div>
            <label className="block text-[#878787] mb-2">
              Images (comma separated URLs)
            </label>
            <input
              type="text"
              value={images.join(",")}
              onChange={(e) => setImages(e.target.value.split(","))}
              className="w-full p-2 bg-[#171717] border border-[#878787] rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-[#ba3737] text-white p-2 rounded mt-4"
          >
            Create Auction
          </button>
        </form>
      </div>
    </>
  );
}
=======
import { supabase } from "../utils/client"; // Updated import path

const ImageUploadForm = () => {
  const [file, setFile] = useState<File | null>(null); // Added type for file
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Added type for error

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Added type for event
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const { data, error } = await supabase.storage
      .from("auction-images")
      .upload(`auction-id/${file.name}`, file);

    if (error) {
      setError(error.message);
    } else {
      alert("File uploaded successfully!");
    }

    setUploading(false);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ImageUploadForm;
>>>>>>> 54ab8cb8151d5335a26fe8e26def35ab78a97777
