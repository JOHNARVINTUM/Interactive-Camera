"use client";

import { useCallback, useState } from "react";
import type { RefObject } from "react";
import {
  CANVAS_SIZES,
  FILTER_LABELS,
  FRAME_LABELS,
  STICKER_LABELS,
  type CanvasSizeId,
  type EditorSettings,
  type FilterId,
  type FrameId,
  type StickerId
} from "@/lib/types";

const swatches = ["#120b0d", "#ffffff", "#fff8ed", "#dff8f2", "#1c1f2a", "#0d0d0d"];
const adjustmentControls = [
  { key: "exposure", label: "Exposure", min: -50, max: 50 },
  { key: "contrast", label: "Contrast", min: -50, max: 60 },
  { key: "saturation", label: "Saturation", min: -60, max: 70 },
  { key: "warmth", label: "Warmth", min: -50, max: 50 },
  { key: "fade", label: "Fade", min: 0, max: 70 },
  { key: "vignette", label: "Vignette", min: 0, max: 70 }
] as const;

export function CanvasEditor({
  canvasRef,
  settings,
  onChange
}: {
  canvasRef: RefObject<HTMLCanvasElement>;
  settings: EditorSettings;
  onChange: (settings: EditorSettings) => void;
}) {
  const [draggingSticker, setDraggingSticker] = useState(false);

  const moveSticker = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || settings.sticker === "none") return;

      const bounds = canvas.getBoundingClientRect();
      const x = Math.min(0.96, Math.max(0.04, (clientX - bounds.left) / bounds.width));
      const y = Math.min(0.96, Math.max(0.04, (clientY - bounds.top) / bounds.height));
      onChange({ ...settings, stickerX: x, stickerY: y });
    },
    [canvasRef, onChange, settings]
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-accent/25 bg-[#0d0710]/90 text-paper backdrop-blur">
      <div className="flex items-center gap-3 border-b border-accent/15 bg-[#0a0610] px-5 py-3.5">
        <div className="flex gap-1.5">
          {["#c41e3a", "#d4af37", "#fff8ed"].map((color) => (
            <div className="h-2.5 w-2.5 rounded-full" key={color} style={{ background: color }} />
          ))}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Director&apos;s Cut</p>
          <h2 className="premiere-display text-xl font-bold text-paper">Strip Editor</h2>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-4 md:p-5 xl:flex-row">
        <div
          className="flex min-h-[340px] flex-1 items-center justify-center rounded-xl border border-accent/15 bg-[#07040a] p-4"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(214,178,94,0.04) 0%, #07040a 60%)" }}
        >
          <canvas
            ref={canvasRef}
            className={`max-h-[65vh] w-auto max-w-full rounded-lg bg-white shadow-2xl ${
              settings.sticker === "none" ? "" : draggingSticker ? "cursor-grabbing" : "cursor-grab"
            }`}
            onPointerDown={(event) => {
              if (settings.sticker === "none") return;
              event.currentTarget.setPointerCapture(event.pointerId);
              setDraggingSticker(true);
              moveSticker(event.clientX, event.clientY);
            }}
            onPointerMove={(event) => {
              if (draggingSticker) moveSticker(event.clientX, event.clientY);
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              setDraggingSticker(false);
            }}
          />
        </div>

        <div className="w-full space-y-5 xl:w-72">
          <ControlBlock title="Canvas size">
            <select
              className="w-full rounded-xl border border-accent/25 bg-[#0d0710] px-3 py-2.5 text-sm font-medium text-paper"
              onChange={(event) => onChange({ ...settings, canvasSize: event.target.value as CanvasSizeId })}
              value={settings.canvasSize}
            >
              {CANVAS_SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </ControlBlock>

          <ControlBlock title="Filter">
            <Segmented
              items={Object.entries(FILTER_LABELS)}
              onChange={(value) => onChange({ ...settings, filter: value as FilterId })}
              value={settings.filter}
            />
          </ControlBlock>

          <ControlBlock title="Exposure & color">
            <div className="space-y-3">
              {adjustmentControls.map((control) => (
                <label className="block" key={control.key}>
                  <span className="mb-1 flex items-center justify-between text-xs font-black uppercase tracking-[0.14em] text-paper/50">
                    {control.label}
                    <span className="text-accent">{settings.adjustments[control.key]}</span>
                  </span>
                  <input
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-accent"
                    max={control.max}
                    min={control.min}
                    onChange={(event) =>
                      onChange({
                        ...settings,
                        adjustments: {
                          ...settings.adjustments,
                          [control.key]: Number(event.target.value)
                        }
                      })
                    }
                    type="range"
                    value={settings.adjustments[control.key]}
                  />
                </label>
              ))}
              <button
                className="rounded-xl border border-accent/20 bg-transparent px-3 py-2 text-xs font-semibold text-paper/60 transition hover:border-accent/50 hover:text-accent"
                onClick={() =>
                  onChange({
                    ...settings,
                    adjustments: {
                      exposure: 0,
                      contrast: 0,
                      saturation: 0,
                      warmth: 0,
                      fade: 0,
                      vignette: 0
                    }
                  })
                }
                type="button"
              >
                Reset edits
              </button>
            </div>
          </ControlBlock>

          <ControlBlock title="Frame">
            <Segmented
              items={Object.entries(FRAME_LABELS)}
              onChange={(value) => onChange({ ...settings, frame: value as FrameId })}
              value={settings.frame}
            />
          </ControlBlock>

          <ControlBlock title="Border color">
            <div className="flex items-center gap-3">
              <input
                aria-label="Custom border color"
                className="h-9 w-12 cursor-pointer rounded-lg border border-accent/25 bg-[#07040a]"
                onChange={(event) => onChange({ ...settings, borderColor: event.target.value })}
                type="color"
                value={settings.borderColor}
              />
              <span className="text-xs font-medium text-paper/45">Applies to classic, instant, dashed and neon frames.</span>
            </div>
          </ControlBlock>

          <ControlBlock title="Background">
            <div className="flex flex-wrap gap-2">
              {swatches.map((color) => (
                <button
                  aria-label={`Set background ${color}`}
                  className="h-8 w-8 rounded-full border border-accent/20 transition-transform hover:scale-110"
                  key={color}
                  onClick={() => onChange({ ...settings, background: color })}
                  style={{
                    background: color,
                    outline: settings.background === color ? "2px solid rgb(214 178 94)" : "2px solid transparent",
                    outlineOffset: "2px"
                  }}
                  type="button"
                />
              ))}
              <input
                aria-label="Custom background color"
                className="h-8 w-10 rounded-lg border border-accent/25 bg-[#07040a]"
                onChange={(event) => onChange({ ...settings, background: event.target.value })}
                type="color"
                value={settings.background}
              />
            </div>
          </ControlBlock>

          <ControlBlock title="Sticker">
            <Segmented
              items={Object.entries(STICKER_LABELS)}
              onChange={(value) => onChange({ ...settings, sticker: value as StickerId })}
              value={settings.sticker}
            />
            <p className="mt-2 text-xs font-medium text-paper/45">Choose a sticker, then drag it on the strip preview.</p>
          </ControlBlock>

          <ControlBlock title="Caption">
            <input
              className="w-full rounded-xl border border-accent/25 bg-[#0d0710] px-3 py-2.5 text-sm font-semibold text-paper"
              maxLength={34}
              onChange={(event) => onChange({ ...settings, text: event.target.value })}
              placeholder="Add a caption"
              value={settings.text}
            />
          </ControlBlock>
        </div>
      </div>
    </section>
  );
}

function ControlBlock({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-accent">{title}</h3>
      {children}
    </div>
  );
}

function Segmented({
  items,
  onChange,
  value
}: {
  items: [string, string][];
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {items.map(([id, label]) => (
        <button
          className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
            id === value
              ? "border-accent/50 bg-accent/15 text-accent"
              : "border-accent/15 bg-[#07040a] text-paper/55 hover:border-accent/35 hover:text-paper/85"
          }`}
          key={id}
          onClick={() => onChange(id)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
