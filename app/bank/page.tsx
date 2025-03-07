"use client";

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { getWalletBalance } from "../services/bank";
import { getUserId } from "../services/session";
const Bank: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const user_id = getUserId();
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
