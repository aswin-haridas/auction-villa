import { supabase } from "./client";

interface Painting {
  painting_id: string;
  name: string;
  image: string[];
  acquire_date: string;
  category: string;
  owner: string;
}

export async function getPaintings(userId: string): Promise<Painting[]> {
  const { data, error } = await supabase
    .from("Painting")
    .select("*")
    .eq("owner", userId);

  if (error) throw new Error(`Failed to get paintings: ${error.message}`);
  return data as Painting[];
}
