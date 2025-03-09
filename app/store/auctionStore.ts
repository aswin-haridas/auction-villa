import { create } from "zustand";
import { Auction, Bid } from "@/app/types/auction";
import { getAuction } from "@/app/services/auction";
import { getBids } from "@/app/services/bids";

interface AuctionState {
  auction: Auction | null;
  bids: Bid[];
  isLoading: boolean;
  bidAmount: string;
  selectedValue: number | null;
  loading: boolean;

  // Actions
  fetchAuction: (auctionId: string) => Promise<void>;
  setBidAmount: (amount: string) => void;
  setSelectedValue: (value: number | null) => void;
  placeBid: (
    auctionId: string,
    userId: string,
    username: string
  ) => Promise<void>;
  resetBidInputs: () => void;
}

export const useAuctionStore = create<AuctionState>((set, get) => ({
  auction: null,
  bids: [],
  isLoading: true,
  bidAmount: "",
  selectedValue: null,
  loading: false,

  fetchAuction: async (auctionId: string) => {
    set({ isLoading: true });
    try {
      const fetchedAuction = await getAuction(auctionId);
      const fetchedBids = await getBids(auctionId);

      set({
        auction: fetchedAuction,
        bids: fetchedBids,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching auction data:", error);
      set({ isLoading: false });
    }
  },

  setBidAmount: (amount: string) => set({ bidAmount: amount }),

  setSelectedValue: (value: number | null) => set({ selectedValue: value }),

  placeBid: async (auctionId: string, userId: string, username: string) => {
    const { bidAmount, selectedValue } = get();
    const bidValue = bidAmount ? parseInt(bidAmount) : selectedValue;

    if (!bidValue || isNaN(bidValue)) {
      alert("Please enter a valid bid amount");
      return;
    }

    set({ loading: true });
    try {
      // Here you would make an API call to place the bid
      // This is a mockup - replace with your actual API call
      const newBid: Bid = {
        bid_id: Date.now().toString(),
        auction_id: auctionId,
        user_id: userId,
        username: username,
        amount: bidValue,
        timestamp: new Date().toISOString(),
      };

      // Assuming we got a successful response
      // Add the new bid to the bids list
      set((state) => ({
        bids: [newBid, ...state.bids],
        loading: false,
      }));

      // Reset bid inputs
      get().resetBidInputs();
    } catch (error) {
      console.error("Error placing bid:", error);
      set({ loading: false });
    }
  },

  resetBidInputs: () => set({ bidAmount: "", selectedValue: null }),
}));
