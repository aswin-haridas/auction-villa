"use client";
import Header from "../components/header";
import { anton } from "../font/fonts";
import { useState, ChangeEvent, useEffect } from "react";
import { ArrowRightIcon, Trash2 } from "lucide-react";
import { supabase } from "../services/client";
import { getUserId, goToLogin } from "../services/session";

interface TradeProps {
  id?: string;
  name: string;
  price: number;
  buyout_price: number;
  category: string;
  end_time: string;
  status?: string;
  highest_bid?: number;
  highest_bidder?: string;
}

const Trade: React.FC<TradeProps> = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: undefined as number | undefined,
    buyout_price: undefined as number | undefined,
    category: "",
    end_time: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [imageList, setImageList] = useState<string[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "uploading" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      setCurrentUser(userId);
    } else {
      goToLogin();
    }
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "buyout_price" ? Number(value) : value,
    }));
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length + imageList.length > 5) {
      setError("You can upload a maximum of 5 images");
      return;
    }
    setFiles(selectedFiles);
  };

  const handleMasterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form fields
    const { name, price, buyout_price, category, end_time } = formData;
    if (!name || !price || !buyout_price || !category || !end_time) {
      setError("Please fill in all fields");
      return;
    }

    // If no files selected and no images uploaded
    if (files.length === 0 && imageList.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    try {
      // Upload images if there are new files
      let uploadedImageUrls = [...imageList];
      if (files.length > 0) {
        setSubmissionStatus("uploading");

        const uploadPromises = files.map(async (file) => {
          const fileName = `${Date.now()}_${file.name}`;
          const { data, error } = await supabase.storage
            .from("auction-images")
            .upload(`public/${fileName}`, file);

          if (error)
            throw new Error(`Failed to upload ${file.name}: ${error.message}`);

          const { data: publicUrlData } = supabase.storage
            .from("auction-images")
            .getPublicUrl(`public/${fileName}`);

          return publicUrlData.publicUrl;
        });

        uploadedImageUrls = [
          ...imageList,
          ...(await Promise.all(uploadPromises)),
        ];
      }

      // Store form data with image URLs
      setSubmissionStatus("submitting");
      const { error: insertError } = await supabase.from("Auction").insert([
        {
          name,
          price,
          buyout_price,
          category,
          end_time,
          image: uploadedImageUrls,
          status: "active",
          highest_bid: null,
          highest_bidder: null,
          owner: currentUser, // Add owner field
        },
      ]);

      if (insertError)
        throw new Error(`Failed to save auction: ${insertError.message}`);

      setSubmissionStatus("success");
      setTimeout(() => {
        window.location.href = "/auction";
      }, 1000);
    } catch (err) {
      console.error("Error:", err);
      setSubmissionStatus("error");
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase.from("Auction").select("image");

      if (error) {
        console.error("Error fetching images:", error);
        return;
      }

      if (data) {
        const allImages = data.flatMap((item) => item.image);
        setImageList(allImages);
      }
    } catch (error) {
      console.error("Unexpected error fetching images:", error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const removeImage = (indexToRemove: number) => {
    setImageList((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const getButtonText = () => {
    switch (submissionStatus) {
      case "uploading":
        return "Uploading Images...";
      case "submitting":
        return "Creating Auction...";
      case "success":
        return "Success!";
      case "error":
        return "Error - Try Again";
      default:
        return "Create Auction";
    }
  };

  return (
    <>
      <Header />
      <div className="px-12">
        <p className={`${anton.className} text-[#878787] text-3xl pt-8`}>
          Create auction
        </p>
      </div>
      <div className="flex h-[75vh] px-12 mt-8">
        {/* Form Section */}
        <form
          className="space-y-4 text-white w-4/12"
          onSubmit={handleMasterSubmit}
        >
          <InputField
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Name"
            required
          />
          <InputField
            type="number"
            name="price"
            value={formData.price ?? ""}
            onChange={handleInputChange}
            placeholder="Starting Price"
            required
          />
          <InputField
            type="number"
            name="buyout_price"
            value={formData.buyout_price ?? ""}
            onChange={handleInputChange}
            placeholder="Buyout Price"
            required
          />
          <SelectField
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            options={[
              { value: "", label: "Select a category", disabled: true },
              { value: "premium", label: "Premium" },
              { value: "standard", label: "Standard" },
            ]}
            required
          />
          <InputField
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleInputChange}
            placeholder="End Time"
            required
          />
          <div className="border border-dashed border-[#878787] p-4 rounded">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="w-full cursor-pointer mb-2"
              accept="image/*"
              disabled={
                submissionStatus === "uploading" || imageList.length >= 5
              }
            />
            <p className="text-[#878787] text-sm mt-2">Upload up to 5 images</p>
          </div>
          <button
            type="submit"
            disabled={
              submissionStatus === "uploading" ||
              submissionStatus === "submitting"
            }
            className={`border text-white hover:text-black hover:bg-white p-8 w-full flex items-center justify-center disabled:opacity-50 ${
              submissionStatus === "success"
                ? "bg-green-500"
                : submissionStatus === "error"
                ? "bg-red-500"
                : ""
            }`}
          >
            {getButtonText()}{" "}
            {submissionStatus === "idle" && <ArrowRightIcon size={24} />}
          </button>
        </form>

        <div className="w-7/12 pl-8 pr-16">
          {imageList.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {imageList.map((image, index) => (
                <ImagePreview
                  key={index}
                  image={image}
                  onRemove={() => removeImage(index)}
                />
              ))}
            </div>
          ) : (
            <div className="border border-[#878787] border-dashed rounded p-8 flex items-center justify-center h-64">
              <p className="text-[#878787]">No images uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 ml-12 mt-4">{error}</p>}
    </>
  );
};

// Reusable InputField Component
const InputField = ({
  type,
  name,
  value,
  onChange,
  placeholder,
  required,
}: any) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full p-3 bg-[#171717] border border-[#878787] rounded focus:border-white focus:outline-none transition-colors placeholder-[#878787]"
    required={required}
  />
);

// Reusable SelectField Component
const SelectField = ({ name, value, onChange, options, required }: any) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full p-3 bg-[#171717] border border-[#878787] rounded focus:border-white focus:outline-none transition-colors placeholder-[#878787]"
    required={required}
  >
    {options.map((option: any) => (
      <option
        key={option.value}
        value={option.value}
        disabled={option.disabled}
      >
        {option.label}
      </option>
    ))}
  </select>
);

const ImagePreview = ({ image, onRemove }: any) => (
  <div className="relative group">
    <img src={image} alt="uploaded" className="w-full h-40 object-cover" />
    <button
      onClick={onRemove}
      className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Remove image"
    >
      <Trash2 size={24} />
    </button>
  </div>
);

export default Trade;
