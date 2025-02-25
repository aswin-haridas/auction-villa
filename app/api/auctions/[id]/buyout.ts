import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const auctionId = req.query.id as string;
  const { user_id } = req.body;

  try {
    // 1. Validate auction status and user participation
    const {  auctionData, error: auctionError } = await supabase
      .from("Auction")
      .select("*")
      .eq("id", auctionId)
      .single();

    if (auctionError) {
      throw new Error(`Error fetching auction  ${auctionError.message}`);
    }

    if (!auctionData || auctionData.status !== "active") {
      return res.status(400).json({ error: "Auction is not active" });
    }

    //Check if user has placed a bid (replace with your actual logic)
    const {  bidData, error: bidError } = await supabase
      .from("Bid")
      .select("*")
      .eq("auction_id", auctionId)
      .eq("user_id", user_id)
      .single();

    if (bidError) {
      throw new Error(`Error checking user participation: ${bidError.message}`);
    }

    if (!bidData) {
      return res.status(400).json({ error: "User is not a participant" });
    }


    // 2. Insert buyout record
    const buyoutId = uuidv4();
    const { error: buyoutError } = await supabase
      .from("Buyouts")
      .insert([{ buyout_id: buyoutId, auction_id: auctionId, user_id, timestamp: new Date() }]);

    if (buyoutError) {
      throw new Error(`Error inserting buyout record: ${buyoutError.message}`);
    }

    // 3. Update auction status
    const { error: updateError } = await supabase
      .from("Auction")
      .update({ status: "ended", winner_user_id: user_id, ended_by: "buyout" })
      .eq("id", auctionId);

    if (updateError) {
      throw new Error(`Error updating auction status: ${updateError.message}`);
    }

    return res.status(200).json({ message: "Buyout successful" });
  } catch (error: any) {
    console.error("Error in buyout API route:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default handler;
