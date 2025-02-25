import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";
import { decode } from "jsonwebtoken";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  // ... other user properties
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, cookies } = req;
  const { bidding, itemId, amount, buyOutPrice } = query;

  try {
    const session = await getSession(cookies);
    if (!session?.user && method !== "GET") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    switch (method) {
      case "POST":
        if (bidding === "placeBid") {
          const { error } = await supabase
            .from("Bid")
            .insert([{ amount: parseInt(amount as string, 10), auction_id: itemId as string, user_id: session.user.id }]);
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
          const { error } = await supabase
            .from("Bid")
            .delete()
            .eq("auction_id", itemId)
            .eq("user_id", session.user.id);
          if (error) throw error;
          return res.status(200).json({ message: "You have left the auction." });
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

const getSession = async (cookies: any): Promise<{ user: User } | null> => {
  const token = cookies["sb:token"];
  if (!token) return null;
  try {
    const decoded = decode(token) as User;
    return { user: decoded };
  } catch (error) {
    console.error("Error decoding session token:", error);
    return null;
  }
};

export default handler;
