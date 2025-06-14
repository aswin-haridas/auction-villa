import { useState, useEffect } from "react";
import { supabase } from "@/app/services/client";

import { Painting } from "../types/painting";
import { User } from "../types/user";

export function usePainting(paintingId: string | null) {
  const [painting, setPainting] = useState<Painting | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Use localStorage only in client-side
    const userData =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    setUser(userData ? JSON.parse(userData) : null);
  }, []);

  useEffect(() => {
    const fetchPainting = async () => {
      if (!paintingId || !user) {
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
  }, [paintingId, user]);

  return { painting, isLoading };
}

function usePaintings() {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Use localStorage only in client-side
    const userData =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    setUser(userData ? JSON.parse(userData) : null);
  }, []);

  useEffect(() => {
    const fetchPaintings = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("Painting")
        .select(
          "painting_id, name, images, acquire_date, category, owner, status,at_work, acquire_price, working_time, is_for_trade, is_for_rent, is_rented, rented_by, rental_end_date, rental_price"
        )
        .eq("owner", user?.id)
        .order("acquire_date", { ascending: false });

      if (error) throw new Error(`Failed to get paintings: ${error.message}`);

      setPaintings(data);
    };

    if (user) {
      fetchPaintings();
    }
  }, [user]);

  return paintings;
}

export default usePaintings;
