"use client";

import React from "react";
import FormDataSender from "@/components/FormDataSender";
import AnalyzeImageUploader from "@/components/AnalyzeImageUploader";

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        📜 עורך הדין הווירטואלי - בדיקת זכויות יוצרים
      </h1>
      <FormDataSender />

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4 text-center">🔎 ניתוח תמונה עצמאי</h2>
        <AnalyzeImageUploader />
      </div>
    </main>
  );
}
