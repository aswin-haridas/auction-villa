"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../lib/hooks/useUser";

const AccessPage = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { loginUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    const result = await loginUser(username);

    if (result) {
      router.push("/");
    } else {
      setError("Failed to login");
    }
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold text-white">Access</h2>
      <div className="p-8 shadow-md w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              placeholder="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 text-white bg-transparent border border-[#878787] "
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 hover:bg-red-700 transition duration-200"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccessPage;
