"use client";

import { AuthButton } from "@/components/AuthButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RemindMe</h1>
        <p className="text-gray-600">Sign in to continue</p>
      </div>
      <AuthButton />
    </div>
  );
}
