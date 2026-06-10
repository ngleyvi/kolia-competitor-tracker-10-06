"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function SyncDataButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleSync = () => {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const result = await response.json();
      setMessage(`Đã thêm ${result.createdPosts} bản ghi mới, cập nhật ${result.updatedPosts ?? 0} bản ghi`);
      router.refresh();
      window.setTimeout(() => setMessage(""), 3500);
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleSync}
        disabled={isPending}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded bg-kolia-green px-4 text-sm font-bold text-white shadow-soft transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        )}
      >
        <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
        {isPending ? "Đang sync" : "Sync Data"}
      </button>
      {message ? (
        <div className="absolute right-0 top-12 w-56 rounded border border-kolia-line bg-white px-3 py-2 text-xs font-medium text-kolia-green shadow-soft">
          {message}
        </div>
      ) : null}
    </div>
  );
}
