"use client";
import React, { useState } from "react";
import Header from "../components/header";
import { supabase } from "../utils/client";
import { getUsername } from "../utils/session";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

const Trade: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [buyOutPrice, setBuyOutPrice] = useState<number>(0);
  const [endTime, setEndTime] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const username = getUsername();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username) {
      alert("Please log in to create an auction.");
      return;
    }

    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    // Upload images to Supabase storage
    const imageUrls = await Promise.all(
      images.slice(0, 5).map(async (image) => {
        const uniqueName = `${uuidv4().slice(0, 8)}`; // Short UUID + file extension

        const { data, error } = await supabase.storage
          .from("auction-images")
          .upload(uniqueName, image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Error uploading image:", error);
          throw new Error("Failed to upload image");
        }

        return supabase.storage.from("auction-images").getPublicUrl(data.path)
          .data.publicUrl;
      })
    );
    // Create auction item in Supabase
    const { data, error } = await supabase.from("Auction").insert([
      {
        name,
        description,
        price,
        buyOutPrice,
        endTime: new Date(endTime).getTime(),
        owner: username,
        image: imageUrls,
      },
    ]);

    if (error) {
      console.error("Error creating auction:", error);
      alert("Failed to create auction.");
      return;
    }

    router.push("/");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedImages = Array.from(e.target.files);

    if (selectedImages.length > 5) {
      alert("You can upload up to 5 images only.");
      return;
    }

    setImages(selectedImages);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Create New Auction</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Auction Name:
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Auction Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Auction Description:
            </label>
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Auction Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Starting Price:
            </label>
            <input
              type="number"
              id="price"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Starting Price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label
              htmlFor="buyOutPrice"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Buy Out Price:
            </label>
            <input
              type="number"
              id="buyOutPrice"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Buy Out Price"
              value={buyOutPrice}
              onChange={(e) => setBuyOutPrice(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label
              htmlFor="endTime"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Auction End Time:
            </label>
            <input
              type="datetime-local"
              id="endTime"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="picture"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Pictures:
            </label>
            <input
              type="file"
              id="picture"
              multiple
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              onChange={handleImageChange}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create Auction
          </button>
        </form>
      </div>
    </div>
  );
};

export default Trade;
