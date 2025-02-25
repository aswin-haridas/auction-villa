import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";
import { decode } from "jsonwebtoken";
// ... other imports

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const { bidding } = req.query;

  try {
    switch (method) {
      case "POST":
        // Handle bid placement
        if (bidding === "placeBid") {
          // Extract bid details from req.body
          // ...
          const session = await getSession(req); // Get session from request
          if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
          }
          // ... place bid using supabase ...
          return res.status(200).json({ message: "Bid placed successfully" });
        }
        // Handle other bidding actions (buyOut, leaveAuction) similarly
        break;
      case "GET":
        // Handle data fetching (auction data, highest bid, etc.)
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

const getSession = async (req: NextApiRequest): Promise<{ user: User } | null> => {
  const token = req.cookies["sb:token"]; // Access cookie from request
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
