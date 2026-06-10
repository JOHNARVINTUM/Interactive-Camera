"use client";

import { Hand, MoveHorizontal, Sparkles } from "lucide-react";
import type { GestureName } from "@/lib/types";

const labels: Record<GestureName, string> = {
  open_palm: "Open palm",
  peace: "Peace sign",
  swipe_left: "Swipe left",
  swipe_right: "Swipe right",
  none: "Waiting"
};

export function GestureController({
  enabled,
  gesture,
  message,
  onToggle,
  status
}: {
  enabled: boolean;
  gesture: GestureName;
  message: string;
  onToggle: (enabled: boolean) => void;
  status: string;
}) {
  return (
    <section className="rounded-[24px] bg-white/80 p-4 ring-1 ring-black/10 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black">Gesture control</h2>
          <p className="mt-1 text-sm leading-5 text-ink/64">{message}</p>
        </div>
        <button
          aria-pressed={enabled}
          className={`h-7 w-12 rounded-full p-1 transition ${enabled ? "bg-mint" : "bg-black/16"}`}
          onClick={() => onToggle(!enabled)}
          type="button"
        >
          <span className={`block h-5 w-5 rounded-full bg-white transition ${enabled ? "translate-x-5" : ""}`} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
        <div className="rounded-2xl bg-studio p-3">
          <Hand className="mx-auto mb-2 h-5 w-5 text-coral" aria-hidden />
          Hold palm starts countdown
        </div>
        <div className="rounded-2xl bg-studio p-3">
          <Sparkles className="mx-auto mb-2 h-5 w-5 text-accent" aria-hidden />
          Peace captures
        </div>
        <div className="rounded-2xl bg-studio p-3">
          <MoveHorizontal className="mx-auto mb-2 h-5 w-5 text-mint" aria-hidden />
          Swing to change style
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-ink px-4 py-3 text-white">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/56">{status}</span>
        <span className={`rounded-full px-3 py-1 text-sm font-black ${gesture === "none" ? "bg-white/10" : "bg-coral"}`}>
          {labels[gesture]}
        </span>
      </div>
    </section>
  );
}
