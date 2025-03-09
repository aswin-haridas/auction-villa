"use client";
import { anton } from "../font/fonts";
import { useEffect, useReducer, ChangeEvent, FormEvent } from "react";
import { ArrowRightIcon, Trash2 } from "lucide-react";
import { supabase } from "../services/client";
import { useRouter } from "next/navigation";

interface AuctionData {
  id?: string;
  name: string;
  price: number;
  owner: string;
  buyout_price: number;
  category: string;
  end_time: string;
  status?: string;
  highest_bid?: number;
  highest_bidder?: string;
}

// Define state and actions for reducer
interface FormState {
  formData: {
    name: string;
    price: number | undefined;
    buyout_price: number | undefined;
    category: string;
    end_time: string;
  };
  files: File[];
  imageList: string[];
  previewUrls: string[];
  submissionStatus: "idle" | "uploading" | "submitting" | "success" | "error";
  error: string | null;
  currentUser: string | null;
}

type FormAction =
  | { type: "UPDATE_FIELD"; field: string; value: any }
  | { type: "SET_FILES"; files: File[] }
  | { type: "ADD_PREVIEW_URLS"; urls: string[] }
  | { type: "REMOVE_PREVIEW"; index: number }
  | { type: "REMOVE_IMAGE"; index: number }
  | { type: "SET_STATUS"; status: FormState["submissionStatus"] }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_CURRENT_USER"; user: string }
  | { type: "RESET_FORM" };

const initialState: FormState = {
  formData: {
    name: "",
    price: undefined,
    buyout_price: undefined,
    category: "",
    end_time: "",
  },
  files: [],
  imageList: [],
  previewUrls: [],
  submissionStatus: "idle",
  error: null,
  currentUser: null,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]:
            action.field === "price" || action.field === "buyout_price"
              ? Number(action.value)
              : action.value,
        },
      };
    case "SET_FILES":
      return { ...state, files: action.files };
    case "ADD_PREVIEW_URLS":
      return { ...state, previewUrls: [...state.previewUrls, ...action.urls] };
    case "REMOVE_PREVIEW":
      // Revoke the URL to prevent memory leak
      URL.revokeObjectURL(state.previewUrls[action.index]);
      return {
        ...state,
        previewUrls: state.previewUrls.filter((_, i) => i !== action.index),
        files:
          action.index < state.files.length
            ? state.files.filter((_, i) => i !== action.index)
            : state.files,
      };
    case "REMOVE_IMAGE":
      return {
        ...state,
        imageList: state.imageList.filter((_, i) => i !== action.index),
      };
    case "SET_STATUS":
      return { ...state, submissionStatus: action.status };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.user };
    case "RESET_FORM":
      return initialState;
    default:
      return state;
  }
}

// Changed the component to be a proper Next.js page component without props
export default function CreateAuctionPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(formReducer, initialState);
  const {
    formData,
    files,
    imageList,
    previewUrls,
    submissionStatus,
    error,
    currentUser,
  } = state;

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    if (!userId) {
      router.push("/auth");
      return;
    }

    const username = sessionStorage.getItem("username");
    if (username) {
      dispatch({ type: "SET_CURRENT_USER", user: username });
    } else {
      router.push("/auth");
    }

    // Clean up object URLs when component unmounts
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length + imageList.length > 5) {
      dispatch({
        type: "SET_ERROR",
        error: "You can upload a maximum of 5 images",
      });
      return;
    }

    // Generate preview URLs for the selected files
    const newPreviewUrls = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    dispatch({ type: "SET_FILES", files: selectedFiles });
    dispatch({ type: "ADD_PREVIEW_URLS", urls: newPreviewUrls });
    dispatch({ type: "SET_ERROR", error: null });
  };

  const removePreview = (indexToRemove: number) => {
    dispatch({ type: "REMOVE_PREVIEW", index: indexToRemove });

    // If it's an already uploaded image
    if (indexToRemove >= files.length) {
      const adjustedIndex = indexToRemove - files.length;
      dispatch({ type: "REMOVE_IMAGE", index: adjustedIndex });
    }
  };

  const validateForm = (): boolean => {
    const { name, price, buyout_price, category, end_time } = formData;

    if (!name?.trim()) {
      dispatch({ type: "SET_ERROR", error: "Name is required" });
      return false;
    }

    if (!price) {
      dispatch({ type: "SET_ERROR", error: "Starting price is required" });
      return false;
    }

    if (!buyout_price) {
      dispatch({ type: "SET_ERROR", error: "Buyout price is required" });
      return false;
    }

    if (buyout_price <= price) {
      dispatch({
        type: "SET_ERROR",
        error: "Buyout price must be higher than starting price",
      });
      return false;
    }

    if (!category) {
      dispatch({ type: "SET_ERROR", error: "Category is required" });
      return false;
    }

    if (!end_time) {
      dispatch({ type: "SET_ERROR", error: "End time is required" });
      return false;
    }

    const endDateTime = new Date(end_time);
    if (endDateTime <= new Date()) {
      dispatch({ type: "SET_ERROR", error: "End time must be in the future" });
      return false;
    }

    if (files.length === 0 && imageList.length === 0) {
      dispatch({
        type: "SET_ERROR",
        error: "Please upload at least one image",
      });
      return false;
    }

    return true;
  };

  const handleMasterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_ERROR", error: null });

    if (!validateForm()) {
      return;
    }

    try {
      // Upload images if there are new files
      let uploadedImageUrls = [...imageList];
      if (files.length > 0) {
        dispatch({ type: "SET_STATUS", status: "uploading" });

        const uploadPromises = files.map(async (file) => {
          const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
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

        try {
          const newUrls = await Promise.all(uploadPromises);
          uploadedImageUrls = [...imageList, ...newUrls];
        } catch (uploadError) {
          throw new Error(
            `Error uploading images: ${
              uploadError instanceof Error
                ? uploadError.message
                : String(uploadError)
            }`
          );
        }
      }

      // Store form data with image URLs
      dispatch({ type: "SET_STATUS", status: "submitting" });
      const { name, price, buyout_price, category, end_time } = formData;

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
          owner: currentUser,
        },
      ]);

      if (insertError)
        throw new Error(`Failed to save auction: ${insertError.message}`);

      dispatch({ type: "SET_STATUS", status: "success" });
      setTimeout(() => {
        router.push("/auction");
      }, 1000);
    } catch (err) {
      console.error("Error:", err);
      dispatch({ type: "SET_STATUS", status: "error" });
      dispatch({
        type: "SET_ERROR",
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    }
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
            min="1"
          />
          <InputField
            type="number"
            name="buyout_price"
            value={formData.buyout_price ?? ""}
            onChange={handleInputChange}
            placeholder="Buyout Price"
            required
            min={formData.price ? formData.price + 1 : "1"}
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
            min={new Date().toISOString().slice(0, 16)}
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
                submissionStatus === "uploading" ||
                submissionStatus === "submitting" ||
                imageList.length + files.length >= 5
              }
            />
            <p className="text-[#878787] text-sm mt-2">
              Upload up to 5 images ({imageList.length + files.length}/5)
            </p>
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
          {previewUrls.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {previewUrls.map((previewUrl, index) => (
                <ImagePreview
                  key={`preview-${index}`}
                  image={previewUrl}
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
    </>
  );
}

// Reusable InputField Component
const InputField = ({
  type,
  name,
  value,
  onChange,
  placeholder,
  required,
  min,
}: {
  type: string;
  name: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required: boolean;
  min?: string | number;
}) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full p-3 bg-[#171717] border border-[#878787] rounded focus:border-white focus:outline-none transition-colors placeholder-[#878787]"
    required={required}
    min={min}
  />
);

// Reusable SelectField Component
const SelectField = ({
  name,
  value,
  onChange,
  options,
  required,
}: {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  required: boolean;
}) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full p-3 bg-[#171717] border border-[#878787] rounded focus:border-white focus:outline-none transition-colors placeholder-[#878787]"
    required={required}
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
      aria-label="Remove image"
      type="button"
    >
      <Trash2 size={24} />
    </button>
  </div>
);
