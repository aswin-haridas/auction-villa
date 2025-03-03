"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../services/client";

const Testing = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [file, setFile] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const { data, error } = await supabase.storage
        .from("auction-images")
        .upload(`public/${file.name}`, file);

      if (error) {
        console.error("Error uploading file:", error);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("auction-images")
        .getPublicUrl(`auction/${file.name}`);

      setImageUrl(publicUrlData.publicUrl);

      const { error: insertError } = await supabase
        .from("Auction")
        .insert([{ image: publicUrlData.publicUrl }]);

      if (insertError) {
        console.error("Error inserting record:", insertError);
      }

      fetchImages();
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setUploading(false);
    }
  };

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("Testing")
        .select("image_url");

      if (error) {
        console.error("Error fetching images:", error);
        return;
      }

      if (data) {
        setImageList(data.map((item) => item.image_url));
      }
    } catch (error) {
      console.error("Unexpected error fetching images:", error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileSelect}
          className="mb-2"
          accept="image/*"
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Image Gallery:</h3>
        {imageList.length === 0 ? (
          <p>No images uploaded yet.</p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {imageList.map((url, index) => (
              <li key={index} className="border p-2 rounded">
                {url}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Testing;
