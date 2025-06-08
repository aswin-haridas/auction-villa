"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "../store/store";

const symbols = ["𖤐", "𖤍", "⁶⁶⁶", "🕇"];
const links = ["Basement", "Auction", "Create", "Bank"];
const SYMBOL_INTERVAL = 800; // Time in milliseconds

export default function Header() {
  const [symbol, setSymbol] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();
  const name = useStore((state) => state.name);
  if (pathname === "/auth") {
    return null;
  }
  useEffect(() => {
    const changeSymbol = () => {
      setSymbol(symbols[Math.floor(Math.random() * symbols.length)]);
    };

    changeSymbol();
    const interval = setInterval(changeSymbol, SYMBOL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    router.push("/auth");
  };

  return (
    <div className="w-full h-14 flex items-center pt-4 px-12 ">
      <div className="text-[#ba3737] flex-1">{symbol}</div>
      <div className="flex justify-around flex-1">
        {links.map((item, idx) => (
          <Link
            key={idx}
            href={
              item.toLowerCase() === "basement" ? "/" : `/${item.toLowerCase()}`
            }
            className="text-[#ba3737] no-underline text-base cursor-pointer hover:underline"
          >
            {item}
          </Link>
        ))}
      </div>
      <div className="flex justify-end flex-1">
        <button
          onClick={handleSignOut}
          className="text-[#ba3737] text-base cursor-pointer hover:underline"
        >
          {name || "###"}
        </button>
      </div>
    </div>
  );
}
