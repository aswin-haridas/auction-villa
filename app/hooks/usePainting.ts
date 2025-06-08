import { supabase } from "@/app/services/client";

interface Painting {
  painting_id: number;
  image: string[];
  name: string;
  price: number;
  category: string;
  owner: string;
}
export function usePaintings() {
  async function getPaintingsOfUser(userId: string): Promise<Painting[]> {
    const { data, error } = await supabase
      .from("Painting")
      .select(
        "painting_id, name, image, acquire_date, category, owner, status,at_work, price, working_time, is_for_trade, is_for_rent, is_rented, rented_by, rental_end_date, rental_price"
      )
      .eq("owner", userId);

    if (error) throw new Error(`Failed to get paintings: ${error.message}`);
    return data as Painting[];
  }

  return { getPaintingsOfUser };
}
