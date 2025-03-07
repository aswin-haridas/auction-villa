"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const symbols = ["𖤐", "𖤍", "⁶⁶⁶", "🕇"];

const Header: React.FC = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [username, setUsername] = useState<string | null>("");
  const router = useRouter();

  useEffect(() => {
    const checkUsername = () => {
      const storedUsername = sessionStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        router.push("/auth");
      }
    };

    checkUsername();

    const changeSymbol = () => {
      setSymbol(symbols[Math.floor(Math.random() * symbols.length)]);
    };

    changeSymbol();
    const interval = setInterval(
      changeSymbol,
      Math.random() * (1200 - 500) + 500
    );

    return () => clearInterval(interval);
  }, [router]);

  const handleSignOut = () => {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("user_id");
    setUsername(null);
    router.push("/auth");
  };

  return (
    <div className="w-full h-14 flex items-center pt-4 px-12 ">
      <div className="text-[#ba3737] flex-1">{symbol}</div>
      <div className="flex justify-around flex-1">
        {["Basement", "Auction", "Trade", "Bank"].map((item, idx) => (
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
          {username || "###"}
        </button>
      </div>
    </div>
  );
};

export default Header;
