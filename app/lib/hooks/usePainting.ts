import { useState, useEffect } from "react";
import { supabase } from "@/app/services/client";
import { useMemory } from "@/app/store/store";

import { Painting } from "../types/painting";

export function usePainting(paintingId: string | null) {
  const [painting, setPainting] = useState<Painting | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { username } = useMemory();

  useEffect(() => {
    const fetchPainting = async () => {
      if (!paintingId || !username) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("Painting")
          .select(
            "painting_id, name, images, acquire_date, category, owner, status, at_work, acquire_price, working_time, is_for_trade, is_for_rent, is_rented, rented_by, rental_end_date, rental_price"
          )
          .eq("painting_id", paintingId)
          .eq("owner", user?.id)
          .single();

        if (error) throw error;
        setPainting(data);
      } catch (error) {
        console.error("Error fetching painting:", error);
        setPainting(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPainting();
  }, [paintingId, username]);

  return { painting, isLoading };
}

function usePaintings() {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const { username } = useMemory();

  useEffect(() => {
    const fetchPaintings = async () => {
      if (!username) return;

      const { data, error } = await supabase
        .from("Painting")
        .select(
          "painting_id, name, images, acquire_date, category, owner, status,at_work, acquire_price, working_time, is_for_trade, is_for_rent, is_rented, rented_by, rental_end_date, rental_price"
        )
        .eq("owner", username)
        .order("acquire_date", { ascending: false });

      if (error) throw new Error(`Failed to get paintings: ${error.message}`);

      setPaintings(data);
    };

    if (username) {
      fetchPaintings();
    }
  }, [username]);

  return paintings;
}

export default usePaintings;
