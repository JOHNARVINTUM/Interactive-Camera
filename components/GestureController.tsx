"use client";

import { Hand, SlidersHorizontal, Timer } from "lucide-react";
import type { GestureName } from "@/lib/types";

const labels: Record<GestureName, string> = {
  open_palm: "Open palm",
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
    <section className="overflow-hidden rounded-2xl border border-accent/20 bg-[#0d0710]/85 text-paper">
      <div className="flex items-center justify-between gap-3 border-b border-accent/15 px-4 py-3">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-accent">Gesture Control</h2>
          <p className="mt-0.5 text-xs font-medium leading-5 text-paper/45">{message}</p>
        </div>
        <button
          aria-pressed={enabled}
          className="h-6 w-10 flex-shrink-0 rounded-full p-0.5 transition-colors duration-200"
          onClick={() => onToggle(!enabled)}
          style={{ background: enabled ? "#ab2031" : "rgba(255,255,255,0.12)" }}
          type="button"
        >
          <span
            className="block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
            style={{ transform: enabled ? "translateX(16px)" : "translateX(0)" }}
          />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className="rounded-xl border border-accent/10 bg-[#07040a] p-2.5 text-[0.65rem] text-paper/50">
          <Hand className="mx-auto mb-2 h-5 w-5 text-coral" aria-hidden />
          Hold palm starts countdown
        </div>
        <div className="rounded-xl border border-accent/10 bg-[#07040a] p-2.5 text-[0.65rem] text-paper/50">
          <SlidersHorizontal className="mx-auto mb-2 h-5 w-5 text-accent" aria-hidden />
          Edit exposure manually
        </div>
        <div className="rounded-xl border border-accent/10 bg-[#07040a] p-2.5 text-[0.65rem] text-paper/50">
          <Timer className="mx-auto mb-2 h-5 w-5 text-mint" aria-hidden />
          Button captures photo
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-accent/15 bg-[#07040a] px-3 py-2">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-paper/35">{status}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${gesture === "none" ? "bg-white/8 text-paper/50" : "bg-coral text-paper"}`}>
          {labels[gesture]}
        </span>
      </div>
      </div>
    </section>
  );
}
