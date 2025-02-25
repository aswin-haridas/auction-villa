import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {  auctions, error: fetchError } = await supabase
      .from("Auction")
      .select("*")
      .filter("status", "eq", "active")
      .filter("endTime", "<", new Date());

    if (fetchError) {
      console.error("Error fetching auctions:", fetchError);
      return res.status(500).json({ error: "Failed to fetch auctions" });
    }

    if (auctions && auctions.length > 0) {
      const updatePromises = auctions.map(async (auction) => {
        const {  bids, error: bidError } = await supabase
          .from("Bid")
          .select("user_id, amount")
          .eq("auction_id", auction.id)
          .order("amount", { ascending: false })
          .limit(1)
          .single();

        const winnerUserId = bidError || !bids ? null : bids.user_id;

        const { error: updateError } = await supabase
          .from("Auction")
          .update({ status: "ended", ended_by: "timeout", winner_user_id: winnerUserId })
          .eq("id", auction.id);

        if (updateError) {
          console.error(`Error updating auction ${auction.id}:`, updateError);
        }
      });

      await Promise.all(updatePromises);
    }

    return res.status(200).json({ message: "Auction end check completed" });
  } catch (error: any) {
    console.error("Error in auction end check cron job:", error);
    return res.status(500).json({ error: "Failed to check auction ends" });
  }
};

export default handler;
