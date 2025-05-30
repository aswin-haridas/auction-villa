import { anton } from "@/app/font/fonts";
import { useState, useEffect } from "react";
import { useDashboardStore } from "@/app/store/dashboardStore"; // Import dashboard store
import {
  getPainting, // Changed from getPaintingStatus
  sendPaintingToWork,
  setPaintingForSale,
  // tradePainting, // Old tradePainting, replaced by listPaintingForTrade
  listPaintingForTrade,
  unlistPaintingFromTrade,
  listPaintingForRent,
  unlistPaintingFromRent,
} from "@/app/services/painting";
import type { Painting } from "@/app/services/painting"; // Import Painting type

// Placeholder for current user ID
const currentUserId = "user-placeholder-id";

const ToggleSwitch = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        className="sr-only peer"
        disabled={disabled}
      />
      <div
        className={`w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${
          disabled ? "cursor-not-allowed opacity-50" : "peer-checked:bg-blue-600"
        }`}
      ></div>
      <span
        className={`ml-3 text-sm font-medium ${
          disabled ? "text-gray-500" : "text-white"
        }`}
      >
        {checked ? "At Work" : "Not Working"}
      </span>
    </label>
  );
};

export const Dashboard = ({ paintingId }: { paintingId: string }) => {
  const [paintingData, setPaintingData] = useState<Painting | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false); // For specific actions
  const { isWorking, toggleIsWorking, incomeEarned, roomsVisited } = useDashboardStore();
  const [message, setMessage] = useState<string>("");
  const [rentalPriceInput, setRentalPriceInput] = useState<number>(0);
  const [sellPriceInput, setSellPriceInput] = useState<number>(0);


  useEffect(() => {
    const fetchPaintingData = async () => {
      setLoading(true);
      setMessage("");
      try {
        const data = await getPainting(paintingId);
        setPaintingData(data);
        setSellPriceInput(data.price || 0);
        setRentalPriceInput(data.rental_price || 0);
        // Synchronize dashboard store's isWorking with fetched paintingData.at_work
        if (data.at_work !== isWorking) {
          toggleIsWorking();
        }
      } catch (error) {
        console.error("Failed to fetch painting data:", error);
        setMessage("Failed to load painting details.");
      } finally {
        setLoading(false);
      }
    };
    if (paintingId) {
      fetchPaintingData();
    }
  }, [paintingId]);

  const handleApiAction = async (
    action: () => Promise<Painting | void>, // Action can return Painting or void
    successMsg: string
  ) => {
    setActionLoading(true);
    setMessage("");
    try {
      const result = await action();
      if (result) { // If action returns updated painting data
        setPaintingData(result as Painting);
        // Update inputs if relevant fields are in result
        if ((result as Painting).price !== undefined) setSellPriceInput((result as Painting).price || 0);
        if ((result as Painting).rental_price !== undefined) setRentalPriceInput((result as Painting).rental_price || 0);

      }
      setMessage(successMsg);
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      setMessage(error.message || `Failed to ${successMsg.toLowerCase().replace("painting ", "")}`);
    } finally {
      setActionLoading(false);
    }
  };

  const isOwner = paintingData?.owner === currentUserId;
  const canPerformActions = isOwner && !paintingData?.at_work && !paintingData?.is_rented;
  const canUnlistActions = isOwner && !paintingData?.at_work;


  const handleWorkToggle = async (checked: boolean) => {
    if (!paintingData) return;
    if (!paintingData) return;

    // The API call is for the desired state `checked`
    // The store will be updated after successful API call
    await handleApiAction(
      async () => {
        await sendPaintingToWork(paintingId, currentUserId, checked ? 60 : 0); // Assuming 60 min default work time
        // Update store after successful API call
        // Note: `checked` is the desired state passed to the function
        // If current `isWorking` is different from `checked`, then toggle.
        // This handles the case where the API call reflects the change.
        if (isWorking !== checked) {
            toggleIsWorking();
        }
        // Still update local paintingData for other fields like 'status' if not covered by store/API response
        // If sendPaintingToWork returned the full object, this manual update for status might be redundant
        setPaintingData(prev => prev ? ({...prev, status: checked ? "in_work" : "available", at_work: checked }) : null);
      },
      `Painting is now ${checked ? "at work" : "not working"}`
    );
  };

  const handleSell = async () => {
    if (!paintingData) return;
    if (!sellPriceInput || sellPriceInput <= 0) {
      setMessage("Please enter a valid price to sell.");
      return;
    }
    // setPaintingForSale is void, so we update status manually
    await handleApiAction(async () => {
      await setPaintingForSale(paintingId, currentUserId, sellPriceInput);
      setPaintingData(prev => prev ? ({...prev, price: sellPriceInput, status: "for_sale"}) : null);
    }, `Painting listed for sale at $${sellPriceInput}`);
  };

  const handleListForTrade = async () => {
    if (!paintingData) return;
    await handleApiAction(
      () => listPaintingForTrade(paintingId, currentUserId),
      "Painting listed for trade."
    );
  };

  const handleUnlistFromTrade = async () => {
    if (!paintingData) return;
    await handleApiAction(
      () => unlistPaintingFromTrade(paintingId, currentUserId),
      "Painting unlisted from trade."
    );
  };

  const handleListForRent = async () => {
    if (!paintingData) return;
    if (!rentalPriceInput || rentalPriceInput <= 0) {
      setMessage("Please enter a valid rental price.");
      return;
    }
    await handleApiAction(
      () => listPaintingForRent(paintingId, currentUserId, rentalPriceInput),
      `Painting listed for rent at $${rentalPriceInput}/day.`
    );
  };

  const handleUnlistFromRent = async () => {
    if (!paintingData) return;
    await handleApiAction(
      () => unlistPaintingFromRent(paintingId, currentUserId),
      "Painting unlisted from rent."
    );
  };


  const renderStatusBadge = () => {
    if (!paintingData) return null;

    const status = paintingData.status || "available";
    let config = { bg: "bg-gray-500", text: "Available" };

    switch (status) {
      case "in_work": // Assuming 'at_work' corresponds to 'in_work' status from backend
      case "at_work": // Keep client side 'at_work' if used
        config = { bg: "bg-blue-500", text: "At Work" };
        break;
      case "for_sale":
        config = {
          bg: "bg-green-500",
          text: `For Sale - $${paintingData.price || sellPriceInput}`,
        };
        break;
      case "for_trade":
        config = { bg: "bg-purple-500", text: "For Trade" };
        break;
      case "for_rent":
        config = {
          bg: "bg-yellow-600",
          text: `For Rent - $${paintingData.rental_price || rentalPriceInput}/day`,
        };
        break;
      case "rented":
        config = { bg: "bg-orange-500", text: "Rented" };
        break;
    }

    const badgeClasses = "px-3 py-1 rounded-full text-sm font-medium";
    return (
      <span className={`${badgeClasses} ${config.bg} text-white`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-white">Loading dashboard...</div>
    );
  }

  if (!paintingData) {
    return (
      <div className="text-center py-10 text-red-400">
        Failed to load painting data. {message}
      </div>
    );
  }
  
  // At work message
  const atWorkMessage = "Painting must be recalled from work to manage marketplace options.";
  const rentedMessage = "This painting is currently rented. Manage rental options or wait for return.";
  const notOwnerMessage = "You are not the owner of this painting.";

  return (
    <div className="flex flex-col">
      <p className={`${anton.className} text-[#878787] text-3xl pt-8 pb-4`}>
        Dashboard {renderStatusBadge()}
      </p>

      {message && (
        <div
          className={`p-3 rounded-lg mb-4 ${
            message.toLowerCase().includes("failed") || message.toLowerCase().includes("error")
              ? "bg-red-500/30 text-red-300"
              : "bg-green-500/30 text-green-300"
          }`}
        >
          {message}
        </div>
      )}
      
      {!isOwner && <p className="text-yellow-400 bg-yellow-900/30 p-3 rounded-md mb-4">{notOwnerMessage}</p>}

      <div>
        {/* Stats Section - Assuming these fields exist on Painting object or are calculated elsewhere */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-[#171717] p-4 rounded-lg text-white">
            <p className="text-sm text-[#878787] mb-1">Money Made</p>
            <p className="text-lg font-bold">
              ${(paintingData.price || 0).toFixed(2)} {/* Placeholder - needs actual field */}
            </p>
          </div>
          <div className="bg-[#171717] p-4 rounded-lg text-white">
            <p className="text-sm text-[#878787] mb-1">Category</p>
            <p className="text-lg font-bold">{paintingData.category}</p>
          </div>
          <div className="bg-[#171717] p-4 rounded-lg text-white">
            <p className="text-sm text-[#878787] mb-1">Acquire Date</p>
            <p className="text-lg font-bold">{new Date(paintingData.acquire_date).toLocaleDateString()}</p>
          </div>
          {/* New Stats from Dashboard Store */}
          <div className="bg-[#171717] p-4 rounded-lg text-white">
            <p className="text-sm text-[#878787] mb-1">Income Earned (Store)</p>
            <p className="text-lg font-bold">${incomeEarned.toFixed(2)}</p>
          </div>
          <div className="bg-[#171717] p-4 rounded-lg text-white">
            <p className="text-sm text-[#878787] mb-1">Rooms Visited (Store)</p>
            <p className="text-lg font-bold">{roomsVisited}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Send to Work Section */}
        <div className="flex-1 bg-[#171717] p-6 rounded-lg shadow-md">
          <h3 className={`${anton.className} text-[#878787] text-xl mb-4`}>
            Send to Work
          </h3>
          <p className="text-[#878787] text-sm mb-4">
            Put your painting to work. It will be displayed in public galleries.
          </p>
          <div className="flex items-center justify-between">
            <ToggleSwitch
              checked={isWorking} // Use isWorking from the store
              onChange={handleWorkToggle} // handleWorkToggle will now update the store
              disabled={actionLoading || !isOwner || paintingData.is_rented}
            />
            {actionLoading && <span className="text-[#878787]">Processing...</span>}
          </div>
           {paintingData.is_rented && isOwner && <p className="text-yellow-500 text-sm mt-2">Cannot send to work while rented.</p>}
        </div>

        {/* Marketplace Section */}
        <div className="flex-1 bg-[#171717] p-6 rounded-lg shadow-md">
          <h3 className={`${anton.className} text-[#878787] text-xl mb-4`}>
            Marketplace
          </h3>

          {/* Sell Section */}
          <div className="mb-6">
            <label className="block text-[#878787] text-sm mb-2">
              Set Sell Price (USD)
            </label>
            <input
              type="number"
              value={sellPriceInput}
              onChange={(e) => setSellPriceInput(Number(e.target.value))}
              className="bg-[#222] border border-[#333] text-white rounded px-3 py-2 w-full disabled:opacity-50"
              placeholder="Enter price"
              min="0"
              disabled={actionLoading || !canPerformActions}
            />
            <button
              onClick={handleSell}
              disabled={actionLoading || !canPerformActions || sellPriceInput <=0}
              className={`mt-2 w-full px-4 py-2 rounded-lg ${
                (!canPerformActions || sellPriceInput <=0)
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
            >
              {paintingData.status === "for_sale" ? "Update Listing" : "List for Sale"}
            </button>
          </div>

          {/* Trade Section */}
          <div className="mb-6">
            <h4 className="text-[#a7a7a7] text-lg mb-2">Trade</h4>
            {paintingData.is_for_trade ? (
              <button
                onClick={handleUnlistFromTrade}
                disabled={actionLoading || !canUnlistActions}
                className={`w-full px-4 py-2 rounded-lg ${
                  !canUnlistActions
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                } text-white`}
              >
                Unlist from Trade
              </button>
            ) : (
              <button
                onClick={handleListForTrade}
                disabled={actionLoading || !canPerformActions}
                className={`w-full px-4 py-2 rounded-lg ${
                  !canPerformActions
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                } text-white`}
              >
                List for Trade
              </button>
            )}
          </div>

          {/* Rent Section */}
          <div>
            <h4 className="text-[#a7a7a7] text-lg mb-2">Rent</h4>
            {paintingData.is_rented ? (
              <div className="text-sm text-orange-400 bg-orange-900/30 p-3 rounded-md">
                <p>Currently Rented.</p>
                {paintingData.rented_by && <p>Rented by: {paintingData.rented_by}</p>}
                {paintingData.rental_end_date && (
                  <p>Rental ends: {new Date(paintingData.rental_end_date).toLocaleDateString()}</p>
                )}
                 {isOwner && ( /* Future: Button to manage rental, e.g., confirm return */
                    <button 
                        onClick={handleUnlistFromRent} // Or a different function like handleConfirmReturn
                        disabled={actionLoading || !isOwner} // Add more specific disabling if needed
                        className="mt-2 w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700"
                    >
                        Mark as Returned (Unlist) 
                    </button>
                 )}
              </div>
            ) : paintingData.is_for_rent ? (
              <>
                <p className="text-sm text-[#878787] mb-1">
                  Currently listed for rent at ${paintingData.rental_price}/day.
                </p>
                <button
                  onClick={handleUnlistFromRent}
                  disabled={actionLoading || !canUnlistActions}
                  className={`w-full px-4 py-2 rounded-lg ${
                    !canUnlistActions
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white`}
                >
                  Unlist from Rent
                </button>
              </>
            ) : (
              <>
                <input
                  type="number"
                  value={rentalPriceInput}
                  onChange={(e) => setRentalPriceInput(Number(e.target.value))}
                  className="bg-[#222] border border-[#333] text-white rounded px-3 py-2 w-full mb-2 disabled:opacity-50"
                  placeholder="Enter rental price per day"
                  min="0"
                  disabled={actionLoading || !canPerformActions}
                />
                <button
                  onClick={handleListForRent}
                  disabled={actionLoading || !canPerformActions || rentalPriceInput <= 0}
                  className={`w-full px-4 py-2 rounded-lg ${
                    (!canPerformActions || rentalPriceInput <= 0)
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  } text-white`}
                >
                  List for Rent
                </button>
              </>
            )}
          </div>
          
          {/* General restriction messages */}
          {isOwner && paintingData.at_work && <p className="text-yellow-500 text-sm mt-4">{atWorkMessage}</p>}
          {isOwner && paintingData.is_rented && !paintingData.is_for_rent && <p className="text-orange-500 text-sm mt-4">{rentedMessage}</p>}

        </div>
      </div>
    </div>
  );
};
