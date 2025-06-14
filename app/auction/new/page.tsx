"use client";
import React, { ChangeEvent, useState, useEffect } from "react";
import { anton } from "../../lib/font/fonts";
import { ArrowRightIcon, Trash2 } from "lucide-react";
import { supabase } from "../../services/client";
import { useRouter } from "next/navigation";

export default function CreateAuctionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    buyout_price: "",
    category: "",
    end_time: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    const username = sessionStorage.getItem("username");
    if (!userId || !username) {
      router.push("/auth");
    } else {
      setCurrentUser(username);
    }
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [router, previewUrls]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length + previewUrls.length > 5) {
      setError("You can upload a maximum of 5 images");
      return;
    }
    const newUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setFiles([...files, ...selectedFiles]);
    setPreviewUrls([...previewUrls, ...newUrls]);
    setError(null);
  };

  const removePreview = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const validateForm = () => {
    const { name, price, buyout_price, category, end_time } = formData;
    if (!name?.trim()) return "Name is required";
    if (!price) return "Starting price is required";
    if (!buyout_price) return "Buyout price is required";
    if (Number(buyout_price) <= Number(price))
      return "Buyout price must be higher than starting price";
    if (!category) return "Category is required";
    if (!end_time) return "End time is required";
    if (new Date(end_time) <= new Date())
      return "End time must be in the future";
    if (files.length === 0) return "Please upload at least one image";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const validationError = validateForm();
      if (validationError) throw new Error(validationError);

      let imageUrls: string[] = [];
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
          const { error } = await supabase.storage
            .from("auction-images")
            .upload(`public/${fileName}`, file);
          if (error) throw new Error(`Failed to upload ${file.name}`);
          const { data } = supabase.storage
            .from("auction-images")
            .getPublicUrl(`public/${fileName}`);
          return data.publicUrl;
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      const { error: insertError } = await supabase.from("Auction").insert([
        {
          ...formData,
          price: Number(formData.price),
          buyout_price: Number(formData.buyout_price),
          image: imageUrls,
          status: "active",
          highest_bid: null,
          highest_bidder: null,
          owner: currentUser,
        },
      ]);
      if (insertError) throw new Error(`Failed to save auction`);

      setIsSuccess(true);
      setTimeout(() => router.push("/auction"), 1000);
    } catch (err) {
      setIsError(true);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsPending(false);
    }
  };

  const getButtonText = () => {
    if (isPending) return "Creating Auction...";
    if (isSuccess) return "Success!";
    if (isError) return "Error - Try Again";
    return "Create Auction";
  };

  return (
    <div className="px-12">
      <p className={`${anton.className} text-[#878787] text-3xl pt-8`}>
        Create auction
      </p>
      <div className="flex h-[75vh] mt-8">
        <form className="space-y-4 text-white w-4/12" onSubmit={handleSubmit}>
          <InputField
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Name"
          />
          <InputField
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Starting Price"
            min="1"
          />
          <InputField
            type="number"
            name="buyout_price"
            value={formData.buyout_price}
            onChange={handleInputChange}
            placeholder="Buyout Price"
            min={Number(formData.price) + 1}
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
          />
          <InputField
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleInputChange}
            placeholder="End Time"
            min={new Date().toISOString().slice(0, 16)}
          />
          <div className="border border-dashed border-[#878787] p-4 rounded">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="w-full cursor-pointer mb-2"
              accept="image/*"
              disabled={isPending || previewUrls.length >= 5}
            />
            <p className="text-[#878787] text-sm mt-2">
              Upload up to 5 images ({previewUrls.length}/5)
            </p>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className={`border text-white hover:text-black hover:bg-white p-8 w-full flex items-center justify-center disabled:opacity-50 ${
              isSuccess ? "bg-green-500" : isError ? "bg-red-500" : ""
            }`}
          >
            {getButtonText()} {!isPending && !isSuccess && <ArrowRightIcon />}
          </button>
        </form>
        <div className="w-7/12 pl-8 pr-16">
          {previewUrls.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {previewUrls.map((url, index) => (
                <ImagePreview
                  key={`preview-${index}`}
                  image={url}
                  onRemove={() => removePreview(index)}
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
    </div>
  );
}

const InputField = ({
  type,
  name,
  value,
  onChange,
  placeholder,
  min,
}: {
  type: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  min?: string | number;
}) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full p-3 bg-[#171717] border border-[#878787] rounded focus:border-white focus:outline-none transition-colors placeholder-[#878787]"
    required
    min={min}
  />
);

const SelectField = ({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full p-3 bg-[#171717] border border-[#878787] rounded focus:border-white focus:outline-none transition-colors placeholder-[#878787]"
    required
  >
    {options.map((option) => (
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

const ImagePreview = ({
  image,
  onRemove,
}: {
  image: string;
  onRemove: () => void;
}) => (
  <div className="relative group">
    <img src={image} alt="uploaded" className="w-full h-40 object-cover" />
    <button
      onClick={onRemove}
      className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      type="button"
    >
      <Trash2 size={24} />
    </button>
  </div>
);
