"use client";
import { useState } from "react";
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
