"use client";

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

const swatches = ["#fff8ed", "#ffffff", "#dff8f2", "#ffe5dd", "#dce8ff", "#1c1f2a"];

export function CanvasEditor({
  canvasRef,
  settings,
  onChange
}: {
  canvasRef: RefObject<HTMLCanvasElement>;
  settings: EditorSettings;
  onChange: (settings: EditorSettings) => void;
}) {
  return (
    <section className="rounded-[28px] bg-white/82 p-4 shadow-panel ring-1 ring-black/10 backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-[24px] bg-studio p-4">
          <canvas ref={canvasRef} className="max-h-[68vh] w-auto max-w-full rounded-xl bg-white shadow-lg" />
        </div>

        <div className="w-full space-y-5 xl:w-80">
          <ControlBlock title="Canvas size">
            <select
              className="w-full rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-bold"
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

          <ControlBlock title="Frame">
            <Segmented
              items={Object.entries(FRAME_LABELS)}
              onChange={(value) => onChange({ ...settings, frame: value as FrameId })}
              value={settings.frame}
            />
          </ControlBlock>

          <ControlBlock title="Background">
            <div className="flex flex-wrap gap-2">
              {swatches.map((color) => (
                <button
                  aria-label={`Set background ${color}`}
                  className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ${settings.background === color ? "ring-accent" : "ring-transparent"}`}
                  key={color}
                  onClick={() => onChange({ ...settings, background: color })}
                  style={{ background: color }}
                  type="button"
                />
              ))}
              <input
                aria-label="Custom background color"
                className="h-9 w-12 rounded-xl border border-black/10 bg-white"
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
          </ControlBlock>

          <ControlBlock title="Caption">
            <input
              className="w-full rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-bold"
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
      <h3 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-ink/54">{title}</h3>
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
    <div className="grid grid-cols-2 gap-2">
      {items.map(([id, label]) => (
        <button
          className={`min-h-10 rounded-2xl px-3 py-2 text-sm font-bold transition ${
            id === value ? "bg-ink text-white" : "bg-studio text-ink hover:bg-white"
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
