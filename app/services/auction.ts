import { supabase } from "./client";

export const setAuctionStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from("Auctions")
    .update({ status })
    .match({ id });

  if (error) {
    console.log("Error updating auction status", error);
    return null;
  }

  return data;
};
