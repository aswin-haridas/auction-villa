import { supabase } from "./client";
import { Auction } from "@/app/types/auction";

export async function createAuction(
  name: string,
  image: string[],
  price: number,
  buyoutPrice: number,
  category: string,
  endTime: string, // ISO string for timestamp
  owner: string
): Promise<string> {
  const { data, error } = await supabase
    .from("Auction")
    .insert({
      name,
      image,
      price,
      buyout_price: buyoutPrice,
      status: "active",
      highest_bid: null,
      highest_bidder: null,
      category,
      end_time: endTime,
      owner,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create auction: ${error.message}`);
  return data.id;
}

export async function getAuctions(): Promise<Auction[]> {
  const { data, error } = await supabase.from("Auction").select("*");

  if (error) throw new Error(`Failed to get auctions: ${error.message}`);
  return data as Auction[];
}

export async function getAuction(auctionId: string): Promise<Auction> {
  const { data, error } = await supabase
    .from("Auction")
    .select("*")
    .eq("id", auctionId)
    .single();

  if (error) throw new Error(`Failed to get auction: ${error.message}`);
  return data as Auction;
}

export function subscribeToAuction(
  auctionId: string,
  callback: (auction: Auction) => void
) {
  // First, get initial auction data
  getAuction(auctionId).then(callback).catch(console.error);

  // Then subscribe to changes
  const subscription = supabase
    .channel(`auction-details-${auctionId}`)
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to all events (insert, update, delete)
        schema: "public",
        table: "Auction",
        filter: `id=eq.${auctionId}`,
      },
      (payload) => {
        // Use the payload directly instead of fetching again
        if (payload.eventType === "DELETE") {
          console.log("Auction was deleted");
          return;
        }

        // For INSERT and UPDATE events, the new record is in payload.new
        const updatedAuction = payload.new as Auction;
        callback(updatedAuction);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

export async function checkAuctionActive(auctionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("Auction")
    .select("status, end_time")
    .eq("id", auctionId)
    .single();

  if (error)
    throw new Error(`Failed to check auction status: ${error.message}`);
  return data.status === "active" && new Date() < new Date(data.end_time);
}
