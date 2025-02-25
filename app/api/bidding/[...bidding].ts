import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { bidding, itemId, amount } = query;

  try {
    switch (method) {
      case "POST":
        if (bidding === "placeBid") {
          // Input validation: Check if amount is a number and greater than 0
          const bidAmount = parseInt(amount as string, 10);
          if (isNaN(bidAmount) || bidAmount <= 0) {
            return res.status(400).json({ error: "Invalid bid amount" });
          }

          const { error } = await supabase
            .from("Bid")
            .insert([{ amount: bidAmount, auction_id: itemId as string, user_id: "anonymous" }]);

          if (error) {
            // More specific error handling based on error code would be beneficial here.
            throw new Error(`Error placing bid: ${error.message}`);
          }

          return res.status(200).json({ message: "Bid placed successfully" });
        }
        // ... other POST methods (buyOut, leaveAuction) ...
        break;
      case "GET":
        // ... GET methods ...
        break;
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("Error in bidding API route:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default handler;
