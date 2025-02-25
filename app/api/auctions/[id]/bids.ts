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
  const { user_id, amount } = req.body;

  try {
    // 1. Input Validation
    const bidAmount = parseInt(amount as string, 10);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      return res.status(400).json({ error: "Invalid bid amount" });
    }

    // 2. Fetch auction data
    const {  auctionData, error: auctionError } = await supabase
      .from("Auction")
      .select("*")
      .eq("id", auctionId)
      .single();

    if (auctionError) {
      console.error("Error fetching auction:", auctionError);
      return res.status(500).json({ error: "Failed to fetch auction data" });
    }

    if (!auctionData || auctionData.status !== "active") {
      return res.status(400).json({ error: "Auction is not active" });
    }

    // 3. Check if bid exceeds current highest bid
    if (bidAmount <= auctionData.highest_bid) {
      return res.status(400).json({ error: "Bid amount must exceed current highest bid" });
    }

    // 4. Insert new bid (using a transaction for atomicity)
    const bidId = uuidv4();
    const { error: bidError } = await supabase.rpc('insert_bid', {
      bid_id: bidId,
      auction_id: auctionId,
      user_id: user_id,
      amount: bidAmount,
      timestamp: new Date(),
    });

    if (bidError) {
      console.error("Error inserting bid:", bidError);
      return res.status(500).json({ error: "Failed to place bid" });
    }

    return res.status(200).json({ message: "Bid placed successfully" });
  } catch (error: any) {
    console.error("Error in place bid API route:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default handler;
