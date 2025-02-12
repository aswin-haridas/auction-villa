"use client";
import React from "react";

interface Bid {
  id: number;
  user: string;
  amount: number;
  timestamp: string;
}

const userColors: string[] = ["#d062fc", "#8efc62"];

const fakeBids: Bid[] = [
  { id: 1, user: "Alice", amount: 100, timestamp: "2024-01-20 10:00:00" },
  { id: 2, user: "Charlie", amount: 150, timestamp: "2024-01-20 10:01:00" },
  { id: 3, user: "Alice", amount: 120, timestamp: "2024-01-20 10:02:00" },
  { id: 4, user: "Charlie", amount: 170, timestamp: "2024-01-20 10:03:00" },
  { id: 5, user: "Alice", amount: 130, timestamp: "2024-01-20 10:04:00" },
  { id: 6, user: "Charlie", amount: 180, timestamp: "2024-01-20 10:05:00" },
];

const BiddingLog: React.FC = () => (
  <div className="mt-5 p-2.5 max-h-[200px] overflow-y-auto">
    {fakeBids.map(({ id, user, amount, timestamp }, index) => (
      <div key={id} className="mb-2.5">
        <strong style={{ color: userColors[index % 2] }}>{user}</strong> bid
        <strong className="font-bold"> ${amount}</strong> at {timestamp}
      </div>
    ))}
  </div>
);

export default BiddingLog;
