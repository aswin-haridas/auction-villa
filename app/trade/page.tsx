"use client";
import React, { useState } from "react";
import Header from "../components/header";
import { supabase } from "../utils/client";
import { getUsername } from "../utils/session";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
interface AuctionData {
  name: string;
  description: string;
  price: number;
  buyout_price: number;
  end_time: string;
  owner: string;
  image: string[];
  start_time: string;
  status: string;
}

const Trade: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [buyOutPrice, setBuyOutPrice] = useState<number>(0);
  const [endTime, setEndTime] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const username = getUsername();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username) {
      return alert("Please log in to create an auction.");
    }
    if (images.length === 0) {
      return alert("Please upload at least one image.");
    }

    try {
      const imageUrls: string[] = await Promise.all(
        images.slice(0, 5).map(async (image) => {
          const uniqueName = `${uuidv4().slice(0, 8)}`;
          const { data, error } = await supabase.storage
            .from("auction-images")
            .upload(uniqueName, image, { cacheControl: "3600", upsert: false });

          if (error) throw new Error("Failed to upload image");
          return supabase.storage.from("auction-images").getPublicUrl(data.path)
            .data.publicUrl;
        })
      );

      const auctionData: AuctionData = {
        name,
        description: "", // Added description as required
        price,
        buyout_price: buyOutPrice,
        end_time: new Date(endTime).toISOString(),
        owner: username,
        image: imageUrls,
        start_time: new Date().toISOString(),
        status: "active",
      };

      const { error } = await supabase.from("Auction").insert([auctionData]);
      if (error) throw error;
      router.push("/");
    } catch (err) {
      console.error("Error creating auction:", err);
      alert("Failed to create auction.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedImages = Array.from(e.target.files).slice(0, 5);
    setImages(selectedImages);
  };

  return (
    <>
      <Header />
      
    </>
  );
};
export default Trade;
