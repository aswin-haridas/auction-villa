import { supabase } from "../services/client";

interface Painting {
  painting_id: string;
  name: string;
  image: string[];
  acquire_date: string;
  category: string;
  status?: string;
  at_work?: boolean;
  working_time?: number;
  owner: string;

  // New fields for trade and rent
  is_for_trade?: boolean;
  is_for_rent?: boolean;
  is_rented?: boolean;
  rented_by?: string | null;
  rental_end_date?: string | null; // ISO date string
  rental_price?: number | null;
  price?: number; // Ensure this existing field (used in setPaintingForSale) is kept
}

// Define the full select string for convenience
const FULL_PAINTING_SELECT =
  "painting_id, name, image, acquire_date, category, status, at_work, working_time, owner, is_for_trade, is_for_rent, is_rented, rented_by, rental_end_date, rental_price, price";

export async function getPaintings(userId: string): Promise<Painting[]> {
  const { data, error } = await supabase
    .from("Painting")
    .select(FULL_PAINTING_SELECT)
    .eq("owner", userId);

  if (error) throw new Error(`Failed to get paintings: ${error.message}`);
  return data as Painting[];
}

export async function getPainting(paintingId: string): Promise<Painting> {
  const { data, error } = await supabase
    .from("Painting")
    .select(FULL_PAINTING_SELECT)
    .eq("painting_id", paintingId)
    .single();

  if (error) throw new Error(`Failed to get painting: ${error.message}`);
  return data as Painting;
}

export const getPaintingStatus = async (
  paintingId: string
): Promise<string> => {
  const { data, error } = await supabase
    .from("Painting")
    .select("status")
    .eq("painting_id", paintingId)
    .single();

  if (error) throw new Error(`Failed to get painting status: ${error.message}`);
  return data.status;
};

export const sendPaintingToWork = async (
  paintingId: string,
  userId: string,
  workingTime: number
): Promise<void> => {
  const { error } = await supabase
    .from("Painting")
    .update({ status: "in_work", at_work: true , working_time: workingTime })
    .eq("painting_id", paintingId)
    .eq("owner", userId);

  if (error)
    throw new Error(`Failed to send painting to work: ${error.message}`);
};

export const setPaintingForSale = async (
  paintingId: string,
  userId: string,
  price: number
): Promise<void> => {
  const { error } = await supabase
    .from("Painting")
    .update({ status: "for_sale", price })
    .eq("painting_id", paintingId)
    .eq("owner", userId);

  if (error)
    throw new Error(`Failed to set painting for sale: ${error.message}`);
};

// Modified tradePainting function
export const tradePainting = async (
  paintingId: string,
  currentOwnerId: string,
  newOwnerId: string
): Promise<Painting> => {
  const { data, error } = await supabase
    .from("Painting")
    .update({ owner: newOwnerId, is_for_trade: false, status: "available" })
    .eq("painting_id", paintingId)
    .eq("owner", currentOwnerId) // Ensure current user is the owner
    .select(FULL_PAINTING_SELECT) 
    .single();

  if (error) throw new Error(`Failed to trade painting: ${error.message}`);
  return data as Painting;
};

// New function to list a painting for trade
export const listPaintingForTrade = async (
  paintingId: string,
  userId: string
): Promise<Painting> => {
  const { data, error } = await supabase
    .from("Painting")
    .update({ is_for_trade: true, status: "for_trade" })
    .eq("painting_id", paintingId)
    .eq("owner", userId)
    .select(FULL_PAINTING_SELECT)
    .single();

  if (error) throw new Error(`Failed to list painting for trade: ${error.message}`);
  return data as Painting;
};

// New function to unlist a painting from trade
export const unlistPaintingFromTrade = async (
  paintingId: string,
  userId: string
): Promise<Painting> => {
  const { data, error } = await supabase
    .from("Painting")
    .update({ is_for_trade: false, status: "available" })
    .eq("painting_id", paintingId)
    .eq("owner", userId)
    .select(FULL_PAINTING_SELECT)
    .single();

  if (error) throw new Error(`Failed to unlist painting from trade: ${error.message}`);
  return data as Painting;
};

// New function to list a painting for rent
export const listPaintingForRent = async (
  paintingId: string,
  userId: string,
  rentalPrice: number
): Promise<Painting> => {
  const { data, error } = await supabase
    .from("Painting")
    .update({ is_for_rent: true, rental_price: rentalPrice, status: "for_rent" })
    .eq("painting_id", paintingId)
    .eq("owner", userId)
    .select(FULL_PAINTING_SELECT)
    .single();

  if (error) throw new Error(`Failed to list painting for rent: ${error.message}`);
  return data as Painting;
};

// New function to unlist a painting from rent
export const unlistPaintingFromRent = async (
  paintingId: string,
  userId: string
): Promise<Painting> => {
  const { data, error } = await supabase
    .from("Painting")
    .update({ is_for_rent: false, rental_price: null, status: "available" })
    .eq("painting_id", paintingId)
    .eq("owner", userId)
    .select(FULL_PAINTING_SELECT)
    .single();

  if (error) throw new Error(`Failed to unlist painting from rent: ${error.message}`);
  return data as Painting;
};

// New function to rent a painting
export const rentPainting = async (
  paintingId: string,
  renterId: string,
  rentalEndDate: string,
  ownerId: string // To ensure the painting is still owned by the lister
): Promise<Painting> => {
  const { data, error } = await supabase
    .from("Painting")
    .update({
      is_rented: true,
      rented_by: renterId,
      rental_end_date: rentalEndDate,
      is_for_rent: false, 
      status: "rented",
    })
    .eq("painting_id", paintingId)
    .eq("owner", ownerId) // Ensure the ownerId matches who listed it.
    .select(FULL_PAINTING_SELECT)
    .single();

  if (error) throw new Error(`Failed to rent painting: ${error.message}`);
  return data as Painting;
};

// New function to return a rented painting
export const returnRentedPainting = async (
  paintingId: string,
  userId: string // This could be owner or renter, depending on logic
): Promise<Painting> => {
  // For now, assumes owner (or an admin role) confirms return.
  // Or, if renter initiates, ensure painting is actually rented by them.
  // Current logic: allows update if painting_id matches, consider adding .eq("owner", userId) or .eq("rented_by", userId)
  const { data, error } = await supabase
    .from("Painting")
    .update({
      is_rented: false,
      rented_by: null,
      rental_end_date: null,
      status: "available",
    })
    .eq("painting_id", paintingId)
    // Add .eq("owner", userId) if only owner can mark as returned
    // Or more complex logic if renter can also mark as returned e.g. .or(`owner.eq.${userId},rented_by.eq.${userId}`)
    .select(FULL_PAINTING_SELECT)
    .single();

  if (error) throw new Error(`Failed to return rented painting: ${error.message}`);
  return data as Painting;
};
