"use client";

import React from "react";
import FormDataSender from "@/components/FormDataSender";

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        📜 עורך הדין הווירטואלי - בדיקת זכויות יוצרים
      </h1>
      <FormDataSender />
    </main>
  );
}
