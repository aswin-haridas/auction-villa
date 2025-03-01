"use client";
import Header from "../components/header";
import { anton } from "../font/fonts";
import { useState, ChangeEvent, FormEvent } from "react";
import { ArrowRightIcon, Trash2 } from "lucide-react";
import { supabase } from "../services/client";

interface TradeProps {
  id?: string;
  name: string;
  price: number;
  buyout_price: number;
  category: string;
  end_time: string;
  // image: string[];
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
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { name, price, buyout_price, category, end_time } = formData;

    if (!name || !price || !buyout_price || !category || !end_time) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one image");
      setIsSubmitting(false);
      return;
    }

    try {
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          const response = await fetch(image);
          const blob = await response.blob();
          const { data, error } = await supabase.storage
            .from("auction-images")
            .upload(`${Date.now()}`, blob);

          if (error) throw error;
          return data.path;
        })
      );

      const { error } = await supabase.from("Auction").insert([
        {
          name,
          price,
          buyout_price,
          category,
          end_time,
          image: uploadedImages,
          status: "active",
          highest_bid: null,
          highest_bidder: null,
        },
      ]);

      if (error) throw error;

      window.location.href = "/auction";
    } catch (err) {
      console.error("Error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files).map((file) =>
        URL.createObjectURL(file)
      );
      setImages((prev) => [...prev, ...fileArray].slice(0, 5)); // Limit to 5 images
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
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
        <form className="space-y-4 text-white w-4/12" onSubmit={handleSubmit}>
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
              onChange={handleImageUpload}
              className="w-full cursor-pointer"
              accept="image/*"
              disabled={images.length >= 5}
            />
            <p className="text-[#878787] text-sm mt-2">Upload up to 5 images</p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="border text-white hover:text-black hover:bg-white p-8 w-full flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Auction"}{" "}
            <ArrowRightIcon size={24} />
          </button>
        </form>

        <div className="w-7/12 pl-8 pr-16">
          {images.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
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
