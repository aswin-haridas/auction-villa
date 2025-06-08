// types/auction.ts
export interface Auction {
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
  winner: string | null;
}

export interface Bid {
  bid_id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  timestamp: string;
  username: string;
}
