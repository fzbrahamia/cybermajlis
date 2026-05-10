//THIS FILE IS REDUNDANT NOW
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password!");
      return;
    }

    // Save mock auth state
    localStorage.setItem("isAuthenticated", "true");

    // Redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-[#25344F] p-8 rounded-2xl shadow-lg w-80 text-white"
    >
      <h2 className="text-2xl font-bold text-center">Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 rounded bg-[#1B2433] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#632024]"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 rounded bg-[#1B2433] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#632024]"
      />

      <button
        type="submit"
        className="bg-[#632024] py-2 rounded-lg font-semibold hover:opacity-90 transition"
      >
        Login
      </button>
    </form>
  );
}
