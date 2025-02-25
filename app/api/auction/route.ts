import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { name, price, endTime, buyOutPrice, category, images } = req.body;

    const { data, error } = await supabase
      .from("Auction")
      .insert([{ name, price, endTime, buyOutPrice, category, image: images }]);

    if (error) {
      throw new Error(`Error creating auction: ${error.message}`);
    }

    return res.status(200).json({ message: "Auction created successfully" });
  } catch (error: any) {
    console.error("Error in create auction API route:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default handler;
