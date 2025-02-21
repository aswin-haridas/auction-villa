"use client";

import React, { useEffect, useState } from "react";
import { getUsername } from "../utils/session";
import Header from "../components/header";
import { getWalletBalance } from "../utils/bank";
const Bank: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const username: string | null = getUsername();

  useEffect(() => {
    const fetchBalance = async () => {
      if (username) {
        const balance = await getWalletBalance(username);
        setBalance(balance);
      }
    };
    fetchBalance();
  }, [username]);
  if (!username) {
    return <div>Please log in to view your bank details.</div>;
  }
  return (
    <>
      <Header />
      <div className="flex flex-col p-4">
        <p className="text-base text-gray-500">Bank Balance:</p>
        <p className="text-4xl text-green-500 font-semibold">{balance}u</p>
      </div>
    </>
  );
};

export default Bank;
