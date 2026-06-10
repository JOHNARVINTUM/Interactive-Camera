"use client";

import { Trash2 } from "lucide-react";
import { COLLAGE_LAYOUTS, type CapturedPhoto, type CollageLayoutId } from "@/lib/types";
import { ToolButton } from "./Toolbar";

export function CollageBuilder({
  layout,
  onClear,
  onRemove,
  onSetLayout,
  photos
}: {
  layout: CollageLayoutId;
  onClear: () => void;
  onRemove: (id: string) => void;
  onSetLayout: (layout: CollageLayoutId) => void;
  photos: CapturedPhoto[];
}) {
  const activeLayout = COLLAGE_LAYOUTS.find((item) => item.id === layout) ?? COLLAGE_LAYOUTS[1];

  return (
    <section className="overflow-hidden rounded-2xl border border-accent/20 bg-[#0d0710]/85 text-paper">
      <div className="flex items-center justify-between gap-3 border-b border-accent/15 px-4 py-3">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-accent">Collage Slots</h2>
          <p className="mt-0.5 text-xs font-medium text-paper/45">
            {photos.length} of {activeLayout.slots} frames captured
          </p>
        </div>
        <ToolButton disabled={!photos.length} icon={<Trash2 className="h-4 w-4" aria-hidden />} onClick={onClear} variant="ghost">
          Clear
        </ToolButton>
      </div>

      <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-1.5">
        {COLLAGE_LAYOUTS.map((item) => (
          <button
            className={`rounded-xl border px-3 py-2.5 text-left transition ${
              item.id === layout
                ? "border-accent/45 bg-accent/10 text-accent"
                : "border-accent/15 bg-[#07040a] text-paper/60 hover:border-accent/30 hover:text-paper/85"
            }`}
            key={item.id}
            onClick={() => onSetLayout(item.id)}
            type="button"
          >
            <span className="block text-xs font-bold">{item.label}</span>
            <span className="mt-0.5 block text-[0.65rem] font-medium opacity-60">{item.description}</span>
          </button>
        ))}
      </div>

      <div className={`grid gap-1.5 ${activeLayout.slots > 3 ? "grid-cols-3" : "grid-cols-3"}`}>
        {Array.from({ length: activeLayout.slots }).map((_, index) => {
          const photo = photos[index];
          return (
            <button
              aria-label={photo ? `Remove photo ${index + 1}` : `Empty photo slot ${index + 1}`}
              className="aspect-square overflow-hidden rounded-xl border border-accent/15 bg-[#07040a] transition hover:scale-[1.03] hover:border-accent/35"
              disabled={!photo}
              key={index}
              onClick={() => photo && onRemove(photo.id)}
              type="button"
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" className="h-full w-full object-cover" src={photo.dataUrl} />
              ) : (
                <span className="premiere-display grid h-full place-items-center text-xs font-bold text-accent/30">{index + 1}</span>
              )}
            </button>
          );
        })}
      </div>
      </div>
    </section>
  );
}
