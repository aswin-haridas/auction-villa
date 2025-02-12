"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link"; // Import Link from next/link
import { signOutAction } from "../actions";

const symbols = ["𖤐", "𖤍", "⁶⁶⁶", "🕇"];

const Header: React.FC = () => {
  const [symbol, setSymbol] = useState<string>("");

  useEffect(() => {
    const changeSymbol = () => {
      const randomIndex = Math.floor(Math.random() * symbols.length);
      setSymbol(symbols[randomIndex]);
    };

    changeSymbol();
    const interval = setInterval(
      changeSymbol,
      Math.floor(Math.random() * (1200 - 500 + 1)) + 500
    );

    return () => clearInterval(interval);
  }, []);

  
  return (
    <div className="w-full h-14 flex items-center px-4">
      <div className="text-red-500 flex justify-start flex-1">
        {symbol}
      </div>
      <div className="flex justify-around flex-1">
        <Link href="/" className="text-red-500 mx-2 no-underline text-base cursor-pointer hover:underline">
          Auctions
        </Link>
        <Link href="/basement" className="text-red-500 mx-2 no-underline text-base cursor-pointer hover:underline">
          Basement
        </Link>
        <Link href="/trade" className="text-red-500 mx-2 no-underline text-base cursor-pointer hover:underline">
          Sell
        </Link>
        <Link href="/bank" className="text-red-500 mx-2 no-underline text-base cursor-pointer hover:underline">
          Bank
        </Link>
      </div>
      <div className="flex justify-end flex-1">
        <button onClick={signOutAction} className="text-red-500 mx-2 no-underline text-base cursor-pointer hover:underline">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;