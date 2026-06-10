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
    <section className="rounded-[24px] bg-white/80 p-4 ring-1 ring-black/10 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black">Collage slots</h2>
          <p className="mt-1 text-sm text-ink/64">
            {photos.length} of {activeLayout.slots} filled
          </p>
        </div>
        <ToolButton disabled={!photos.length} icon={<Trash2 className="h-4 w-4" aria-hidden />} onClick={onClear} variant="ghost">
          Clear
        </ToolButton>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {COLLAGE_LAYOUTS.map((item) => (
          <button
            className={`rounded-2xl px-3 py-3 text-left text-sm font-bold ring-1 transition ${
              item.id === layout ? "bg-ink text-white ring-ink" : "bg-studio text-ink ring-black/8 hover:bg-white"
            }`}
            key={item.id}
            onClick={() => onSetLayout(item.id)}
            type="button"
          >
            {item.label}
            <span className="mt-1 block text-xs font-normal opacity-70">{item.description}</span>
          </button>
        ))}
      </div>

      <div className={`mt-4 grid gap-2 ${activeLayout.slots > 3 ? "grid-cols-3" : "grid-cols-3"}`}>
        {Array.from({ length: activeLayout.slots }).map((_, index) => {
          const photo = photos[index];
          return (
            <button
              aria-label={photo ? `Remove photo ${index + 1}` : `Empty photo slot ${index + 1}`}
              className="aspect-square overflow-hidden rounded-2xl bg-studio ring-1 ring-black/8 transition hover:scale-[1.02]"
              disabled={!photo}
              key={index}
              onClick={() => photo && onRemove(photo.id)}
              type="button"
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" className="h-full w-full object-cover" src={photo.dataUrl} />
              ) : (
                <span className="grid h-full place-items-center text-sm font-black text-ink/36">{index + 1}</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
