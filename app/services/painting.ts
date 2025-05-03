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
}

export async function getPaintings(userId: string): Promise<Painting[]> {
  const { data, error } = await supabase
    .from("Painting")
    .select("painting_id, name, image, acquire_date, category, status, at_work")
    .eq("owner", userId);

  if (error) throw new Error(`Failed to get paintings: ${error.message}`);
  return data as Painting[];
}

export async function getPainting(paintingId: string): Promise<Painting> {
  const { data, error } = await supabase
    .from("Painting")
    .select("painting_id, name, image, acquire_date, category, status, at_work")
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

export const tradePainting = async (
  paintingId: string,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from("Painting")
    .update({ status: "traded" })
    .eq("painting_id", paintingId)
    .eq("owner", userId);

  if (error) throw new Error(`Failed to trade painting: ${error.message}`);
};
