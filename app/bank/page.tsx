"use client";
import React from "react";
import { anton } from "../lib/font/fonts";
import useBank from "../lib/hooks/useBank";
import checkUser from "../lib/utils/checkUser";

function Bank() {
  checkUser();
  const balance = useBank();
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
}
export default Bank;
