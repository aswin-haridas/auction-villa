import { create } from "zustand";
import { Auction, Bid } from "@/app/types/auction";
import { getAuction, checkAuctionActive } from "@/app/services/auction";
import { getBids, placeBid as placeBidApi } from "@/app/services/bids";

interface AuctionState {
  auction: Auction | null;
  bids: Bid[];
  isLoading: boolean;
  bidAmount: string;
  selectedValue: number | null;
  loading: boolean;
  isAuctionActive: boolean; // Add this to track auction status

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
  checkAuctionStatus: (auctionId: string) => Promise<void>; // Add this method
}

export const useAuctionStore = create<AuctionState>((set, get) => ({
  auction: null,
  bids: [],
  isLoading: true,
  bidAmount: "",
  selectedValue: null,
  loading: false,
  isAuctionActive: true,

  fetchAuction: async (auctionId: string) => {
    set({ isLoading: true });
    try {
      const [fetchedAuction, fetchedBids, isActive] = await Promise.all([
        getAuction(auctionId),
        getBids(auctionId),
        checkAuctionActive(auctionId),
      ]);

      set({
        auction: fetchedAuction,
        bids: fetchedBids,
        isLoading: false,
        isAuctionActive: isActive,
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
      // Call the actual API function to place the bid
      await placeBidApi(userId, auctionId, bidValue);

      // After successful API call, fetch both the latest bids and updated auction
      const [updatedBids, updatedAuction] = await Promise.all([
        getBids(auctionId),
        getAuction(auctionId),
      ]);

      set({
        bids: updatedBids,
        auction: updatedAuction,
        loading: false,
      });

      // Reset bid inputs
      get().resetBidInputs();
    } catch (error) {
      console.error("Error placing bid:", error);
      alert(error instanceof Error ? error.message : "Failed to place bid");
      set({ loading: false });
    }
  },

  resetBidInputs: () => set({ bidAmount: "", selectedValue: null }),

  checkAuctionStatus: async (auctionId: string) => {
    try {
      const isActive = await checkAuctionActive(auctionId);
      set({ isAuctionActive: isActive });
    } catch (error) {
      console.error("Error checking auction status:", error);
    }
  },
}));
