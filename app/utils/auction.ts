import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const createAuction = async (auctionData: any) => {
  const { data, error } = await supabase
    .from("Auction")
    .insert([auctionData]);

  if (error) {
    throw error;
  }
  return data;
};

// ... rest of your auction.ts file ...
