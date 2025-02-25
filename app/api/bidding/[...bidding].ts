import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { bidding, itemId, amount, buyOutPrice } = query;

  try {
    switch (method) {
      case "POST":
        if (bidding === "placeBid") {
          const { error } = await supabase
            .from("Bid")
            .insert([{ amount: parseInt(amount as string, 10), auction_id: itemId as string, user_id: "anonymous" }]); // Using "anonymous" as user_id
          if (error) throw error;
          return res.status(200).json({ message: "Bid placed successfully" });
        } else if (bidding === "buyOut") {
          const { error } = await supabase
            .from("Auction")
            .update({ status: "bought_out", currentBid: parseInt(buyOutPrice as string, 10) })
            .eq("id", itemId);
          if (error) throw error;
          return res.status(200).json({ message: "Auction bought out successfully" });
        } else if (bidding === "leaveAuction") {
          // Leaving the auction without authentication is not meaningful.  Consider removing this functionality.
          return res.status(200).json({ message: "Auction left." });
        }
        break;
      case "GET":
        // Handle data fetching (auction data, highest bid, etc.)
        // ...
        break;
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("Error in bidding API route:", error);
    res.status(500).json({ error: error.message });
  }
};

export default handler;
