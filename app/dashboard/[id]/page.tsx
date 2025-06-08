"use client";
import { useParams } from "next/navigation";
import React from "react";
import { supabase } from "@/app/services/client";

export default function Dashboard() {
  const { id } = useParams();

  const getPainting = async (paintingId: string) => {
    const { data, error } = await supabase
      .from("Painting")
      .select("*")
      .eq("painting_id", paintingId)
      .single();

    if (error) {
      console.error("Error fetching painting:", error);
      return null;
    }
    return data;
  };

  console.log(getPainting(id as string));

  return <div>{}</div>;
}
