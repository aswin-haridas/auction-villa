import React from "react";
import { anton } from "@/app/font/fonts";
import { useState } from "react";
import {
  getPaintingStatus,
  sendPaintingToWork,
  setPaintingForSale,
  tradePainting,
} from "@/app/services/painting";

const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      <span className="ml-3 text-sm font-medium text-white">
        {checked ? "At Work" : "Not Working"}
      </span>
    </label>
  );
};

export const Dashboard = ({ paintingId }: { paintingId: string }) => {
  const [paintingData, setPaintingData] = useState({
    atWork: false,
    price: 0,
    status: "available",
    moneyMade: 0,
    useCount: 0,
    totalTime: 0,
    popularity: 0,
    rating: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleWorkToggle = async (checked: boolean) => {
    // TODO: Implement work toggle functionality
  };

  const handleSell = async () => {
    // TODO: Implement sell functionality
  };

  const handleTrade = async () => {
    // TODO: Implement trade functionality
  };

  const handleApiAction = async (action: () => Promise<void>, successMessage: string) => {
    // TODO: Implement API action handler
  };

  const renderStatusBadge = () => {
    // TODO: Implement status badge rendering
    return null;
  };

  return (
    <div className="flex flex-col">
      <p className={`${anton.className} text-[#878787] text-3xl pt-8 pb-4`}>
        Dashboard {renderStatusBadge()}
      </p>

      {message && (
        <div
          className={`p-3 rounded-lg mb-4 ${
            message.includes("Failed")
              ? "bg-red-500/20 text-red-300"
              : "bg-green-500/20 text-green-300"
          }`}
        >
          {message}
        </div>
      )}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#171717] p-4 rounded-lg text-white">
            <p className="text-sm text-[#878787] mb-1">Money Made</p>
            <p className="text-lg font-bold">
              ${paintingData.moneyMade.toFixed(2)}
            </p>
          </div>
          <div className="bg-[#171717] p-4 rounded-lg text-white">
            <p className="text-sm text-[#878787] mb-1">Use Count</p>
            <p className="text-lg font-bold">{paintingData.useCount}</p>
          </div>
          <div className="bg-[#171717] p-4 rounded-lg text-white">
            <p className="text-sm text-[#878787] mb-1">Total Time (hrs)</p>
            <p className="text-lg font-bold">{paintingData.totalTime}</p>
          </div>
          <div className="bg-[#171717] p-4 rounded-lg text-white">
            <p className="text-sm text-[#878787] mb-1">Popularity</p>
            <p className="text-lg font-bold">{paintingData.popularity}/100</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-[#171717] p-6 rounded-lg shadow-md">
          <h3 className={`${anton.className} text-[#878787] text-xl mb-4`}>
            Send to Work
          </h3>
          <p className="text-[#878787] text-sm mb-4">
            Put your painting to work and earn passive income. Your painting
            will be displayed in public galleries.
          </p>
          <div className="flex items-center justify-between">
            <ToggleSwitch
              checked={paintingData.atWork}
              onChange={handleWorkToggle}
            />
            {loading && <span className="text-[#878787]">Loading...</span>}
          </div>
        </div>

        <div className="flex-1 bg-[#171717] p-6 rounded-lg shadow-md">
          <h3 className={`${anton.className} text-[#878787] text-xl mb-4`}>
            Marketplace
          </h3>

          <div className="mb-4">
            <label className="block text-[#878787] text-sm mb-2">
              Set Price (USD)
            </label>
            <input
              type="number"
              value={paintingData.price}
              onChange={(e) =>
                setPaintingData({
                  ...paintingData,
                  price: Number(e.target.value),
                })
              }
              className="bg-[#222] border border-[#333] text-white rounded px-3 py-2 w-full"
              placeholder="Enter price"
              min="0"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSell}
              disabled={loading || paintingData.atWork}
              className={`px-4 py-2 rounded-lg ${
                paintingData.atWork
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white flex-1`}
            >
              Sell
            </button>
            <button
              onClick={handleTrade}
              disabled={loading || paintingData.atWork}
              className={`px-4 py-2 rounded-lg ${
                paintingData.atWork
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white flex-1`}
            >
              Trade
            </button>
          </div>
          {paintingData.atWork && (
            <p className="text-yellow-500 text-sm mt-2">
              Painting must be recalled from work before selling or trading
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
