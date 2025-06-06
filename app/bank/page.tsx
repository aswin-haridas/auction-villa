"use client";

import React, { useEffect, useState } from "react";
import { anton } from "../font/fonts";
import { getWalletBalance } from "../services/bank";

const Bank: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);

  // Move sessionStorage access into useEffect (runs only in browser)
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("user_id");

    if (!storedUserId) {
      window.location.href = "/auth";
    }
  }, []);

  useEffect(() => {
    getWalletBalance().then((balance) => {
      setBalance(balance);
    });
  }, []);

  return (
    <>
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
