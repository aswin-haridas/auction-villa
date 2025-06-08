import { useState, useEffect, useCallback } from "react";
import { getPaintingsOfUser } from "../services/painting";

interface Painting {
  painting_id: number;
  image: string[];
  name: string;
  price: number;
  category: string;
  owner: string;
}

export function usePaintings(userId: string | null) {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPaintings = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = await getPaintingsOfUser(userId);
      setPaintings(data as unknown as Painting[]);
      setError(null);
    } catch (err) {
      console.error("Error fetching paintings:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch paintings"),
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPaintings();
  }, [fetchPaintings]);

  return { paintings, loading, error, refetch: fetchPaintings };
}
