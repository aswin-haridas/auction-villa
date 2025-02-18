"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import checkAuth from "@/app/utils/auth";

const AccessPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await checkAuth(username, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-6 text-white">Access Page</h2>
      <div className="p-8 shadow-md w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 text-white bg-transparent border border-gray-700"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 text-white bg-transparent border border-gray-700"
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
