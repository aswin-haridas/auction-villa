// types/auction.ts
export interface Auction {
  id: string;
  name: string;
  price: number;
  end_time: string;
  owner: string;
  highest_bid: number | null;
  highest_bidder: string | null;
  buyout_price: number | null;
  image: string[];
  category: string;
  status: string;
}

export interface Bid {
  bid_id: string;
  user_id: string;
  amount: number;
  timestamp: string;
  auction_id: string;
  username: string; // Ensure it's always a string
}

// Props for AuctionDetails component
export interface AuctionDetailsProps {
  auction: Auction;
  bids: Bid[];
  currentUser: string | null;
  username: string | null;
  setAuction: React.Dispatch<React.SetStateAction<Auction | null>>;
  setBids: React.Dispatch<React.SetStateAction<Bid[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

// Props for AuctionImages component
export interface AuctionImagesProps {
  images: string[];
}

// Props for BidHistory component
export interface BidHistoryProps {
  bids: Bid[]; // Uses the same Bid interface, where username is optional
}

// Props for BiddingControls component
export interface BiddingControlsProps {
  auction: Auction;
  currentUser: string | null;
  username: string | null;
  setAuction: React.Dispatch<React.SetStateAction<Auction | null>>;
  setBids: React.Dispatch<React.SetStateAction<Bid[]>>;
}

export interface User {
  user_id: string;
  username: string;
}
