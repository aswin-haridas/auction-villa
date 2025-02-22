import { supabase } from "../utils/client";
import { checkUsernameExists } from "../utils/session";

/**
 * Places a bid on an auction item.
 * @param selectedValue - The amount to bid.
 * @param itemId - The ID of the auction item.
 * @returns The newly placed bid data or an error if the operation fails.
 */
const placeBid = async (selectedValue: number, itemId: string) => {
  const username = checkUsernameExists();
  const highestBid = await fetchHighestBidData(itemId);

  const newBid = highestBid?.data ? selectedValue + highestBid.data.amount : selectedValue;

  const { data, error } = await supabase
    .from("Bid")
    .insert([{ item_id: itemId, amount: newBid, username }])
    .select();

  if (error) {
    throw new Error(`Failed to place bid: ${error.message}`);
  }

  return data;
};

/**
 * Fetches auction data based on the given auction ID.
 * @param id - The auction ID.
 * @returns The auction data or an error if the operation fails.
 */
async function fetchAuctionData(id: string) {
  const { data, error } = await supabase
    .from("Auction")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

/**
 * Subscribes to auction updates.
 * @param id - The auction ID.
 * @param callback - A function to handle update payloads.
 * @returns The auction subscription channel.
 */
function subscribeToAuctionUpdates(id: string, callback: (payload: any) => void) {
  return supabase
    .channel("Auction")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "auctions", filter: `id=eq.${id}` },
      callback
    )
    .subscribe();
}

/**
 * Fetches the highest bid for a given auction item.
 * @param id - The auction item ID.
 * @returns The highest bid data or an error if the operation fails.
 */
async function fetchHighestBidData(id: string) {
  const { data, error } = await supabase
    .from("Bid")
    .select("amount")
    .eq("item_id", id)
    .order("amount", { ascending: false })
    .limit(1)
    .single();

  return { data, error };
}

/**
 * Fetches the highest bidder's username for a given auction item.
 * @param id - The auction item ID.
 * @returns The highest bidder's username or an error if the operation fails.
 */
async function fetchHighestBidder(id: string) {
  const { data, error } = await supabase
    .from("Bid")
    .select("username")
    .eq("item_id", id)
    .order("amount", { ascending: false })
    .limit(1)
    .single();

  return { data, error };
}

/**
 * Subscribes to bid updates for a given auction item.
 * @param id - The auction item ID.
 * @param callback - A function to handle bid update payloads.
 * @returns The bid subscription channel.
 */
function subscribeToBidUpdates(id: string, callback: (payload: any) => void) {
  return supabase
    .channel("Bid")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "bids", filter: `item_id=eq.${id}` },
      callback
    )
    .subscribe();
}

/**
 * Buys out an auction item at the buyout price.
 * @param buyOutPrice - The price to buy the item immediately.
 * @param itemId - The auction item ID.
 * @returns A success or failure message.
 */
export const buyOutItem = async (buyOutPrice: number, itemId: string) => {
  if (!itemId) return;

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    const userId = user?.id;

    const { error: updateError } = await supabase
      .from("auctions")
      .update({
        owner: userId,
        highestBidder: userId,
        highestBid: buyOutPrice,
        currentBid: buyOutPrice,
        endTime: Date.now(),
      })
      .eq("id", itemId);

    if (updateError) throw updateError;

    return { success: true, message: "You bought this item!" };
  } catch (error) {
    console.error("Error during buyout:", error);
    return { success: false, message: "Error during buyout" };
  }
};

/**
 * Handles user leaving an auction.
 * If the highest bidder leaves, the auction resets.
 * Otherwise, the remaining user wins.
 * @param itemId - The auction item ID.
 * @returns A success or failure message.
 */
export const leaveAuction = async (itemId: string) => {
  if (!itemId) return;

  try {
    const { data: auction, error: fetchError } = await supabase
      .from("Auction")
      .select("highestBidder")
      .eq("id", itemId)
      .single();

    if (fetchError) throw fetchError;

    if (!auction.highestBidder) {
      await supabase
        .from("Auction")
        .update({ highestBid: 0, highestBidder: null })
        .eq("id", itemId);

      return { success: true, message: "Auction reset due to both users leaving." };
    }

    await supabase
      .from("Auction")
      .update({ owner: auction.highestBidder, endTime: Date.now() })
      .eq("id", itemId);

    return { success: true, message: "Other user left, you won the auction!" };
  } catch (error) {
    console.error("Error during leave:", error);
    return { success: false, message: "Error during leave" };
  }
};

// Exporting functions for external use
export {
  placeBid,
  fetchAuctionData,
  subscribeToAuctionUpdates,
  fetchHighestBidData,
  subscribeToBidUpdates,
  fetchHighestBidder,
};
