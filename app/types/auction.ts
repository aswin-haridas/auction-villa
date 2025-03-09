// types/auction.ts
export interface Auction {
  id: string;
  name: string;
  image: string[];];
  price: number;
  buyout_price: number;number;
  status: string;
  highest_bid: number | null;
  highest_bidder: string | null;g | null;
  category: string;;
  end_time: string;
  owner: string;
}

export interface Bid {
  bid_id: string;
  auction_id: string;ng;
  user_id: string;;
  amount: number;
  timestamp: string;
  username: string;
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
