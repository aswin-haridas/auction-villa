"use client";

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { getWalletBalance } from "../services/bank";
import { getUserId } from "../services/auth";
import { anton } from "../font/fonts";
const Bank: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const user_id = getUserId();
  return (
    <>
      <Header />

      <div className="px-12">
        <p className={`${anton.className} text-[#878787] text-3xl pt-8`}>
          Bank
        </p>
        <p className="text-4xl text-green-500 font-semibold">{balance}u</p>
      </div>
    </>
  );
};

export default Bank;
