import { supabase } from "./client";

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
    .from('Auction')
    .insert({
      name,
      image,
      price,
      buyout_price: buyoutPrice,
      status: 'active',
      highest_bid: null,
      highest_bidder: null,
      category,
      end_time: endTime,
      owner,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create auction: ${error.message}`);
  return data.id;
}

interface Auction {
  id: string;
  name: string;
  image: string[];
  price: number;
  buyout_price: number;
  status: string;
  highest_bid: number | null;
  highest_bidder: string | null;
  category: string;
  end_time: string;
  owner: string;
}

export async function getAuctions(): Promise<Auction[]> {
  const { data, error } = await supabase
    .from('Auction')
    .select('*')

  if (error) throw new Error(`Failed to get auctions: ${error.message}`);
  return data as Auction[];
}

export async function getAuction(auctionId: string): Promise<Auction> {
  const { data, error } = await supabase
    .from('Auction')
    .select('*')
    .eq('id', auctionId)
    .single();

  if (error) throw new Error(`Failed to get auction: ${error.message}`);
  return data as Auction;
}

export async function checkAuctionActive(auctionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('Auction')
    .select('status, end_time')
    .eq('id', auctionId)
    .single();

  if (error) throw new Error(`Failed to check auction status: ${error.message}`);
  return data.status === 'active' && new Date() < new Date(data.end_time);
}