"use client";

import { Camera, CheckCircle2, RotateCcw, Timer, Video } from "lucide-react";
import type { RefObject } from "react";
import { getCanvasFilter } from "@/lib/filters";
import type { FilterId, ImageAdjustments } from "@/lib/types";
import { ToolButton } from "./Toolbar";

interface CameraPreviewProps {
  active: boolean;
  countdown: number | null;
  devices: MediaDeviceInfo[];
  deviceId: string;
  error: string;
  adjustments: ImageAdjustments;
  filter: FilterId;
  permission: string;
  videoRef: RefObject<HTMLVideoElement>;
  onCapture: () => void;
  onStartCamera: () => void;
  onSwitchCamera: (deviceId: string) => void;
}

export function CameraPreview({
  active,
  countdown,
  devices,
  deviceId,
  error,
  adjustments,
  filter,
  permission,
  videoRef,
  onCapture,
  onStartCamera,
  onSwitchCamera
}: CameraPreviewProps) {
  const filmHoles = Array.from({ length: 18 });

  return (
    <section className="overflow-hidden rounded-2xl border border-accent/30 bg-[#07040a] text-paper shadow-[0_0_60px_rgba(214,178,94,0.07)]">
      <div className="flex h-6 items-center gap-1.5 border-b border-accent/15 bg-[#0d0710] px-4">
        {filmHoles.map((_, index) => (
          <div className="h-3 w-4 flex-shrink-0 rounded-sm border border-accent/30 bg-[#07040a]" key={index} />
        ))}
      </div>

      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="h-full w-full -scale-x-100 object-cover transition-[filter] duration-300"
          muted
          playsInline
          style={{ filter: getCanvasFilter(filter, adjustments) }}
        />
        {active && adjustments.vignette > 0 && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, transparent 44%, rgba(0,0,0,${Math.min(0.58, adjustments.vignette / 100)}) 100%)`
            }}
          />
        )}

        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#07040a]/96 p-8 text-center">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(214,178,94,0.06) 0%, transparent 70%)" }}
            />
            <div className="relative grid h-16 w-16 place-items-center rounded-full border border-accent/30 bg-accent/10">
              <Video className="h-7 w-7 text-accent" aria-hidden />
            </div>
            <div className="relative">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-accent">Camera Offline</p>
              <h2 className="premiere-display mb-1 text-xl font-bold text-paper">Open the Studio Camera</h2>
              <p className="max-w-xs text-sm leading-6 text-paper/50">
                Photos stay local in your browser. Hand gestures unlock after the camera is live.
              </p>
            </div>
            <ToolButton icon={<Camera className="h-4 w-4" aria-hidden />} onClick={onStartCamera} variant="primary">
              {permission === "requesting" ? "Requesting..." : "Start camera"}
            </ToolButton>
            {error ? <p className="max-w-md text-sm text-coral">{error}</p> : null}
          </div>
        )}

        {countdown !== null && (
          <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-sm">
            <div
              className="premiere-display grid h-28 w-28 place-items-center rounded-full border-2 border-accent bg-[#07040a]/90 text-6xl font-black text-accent"
              style={{ animation: "cinemaCountdown 850ms ease-out infinite" }}
            >
              {countdown}
            </div>
          </div>
        )}

        {active && (
          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-black/60 px-3 py-1.5 text-xs font-semibold text-paper/80 backdrop-blur">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden />
            <span>Live</span>
            {filter !== "none" ? <span className="capitalize text-accent/70">- {filter}</span> : null}
          </div>
        )}
      </div>

      <div className="flex h-6 items-center gap-1.5 border-t border-accent/15 bg-[#0d0710] px-4">
        {filmHoles.map((_, index) => (
          <div className="h-3 w-4 flex-shrink-0 rounded-sm border border-accent/30 bg-[#07040a]" key={index} />
        ))}
      </div>

      <div className="flex flex-col gap-3 bg-[#0d0710] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ToolButton disabled={!active || countdown !== null} icon={<Timer className="h-4 w-4" aria-hidden />} onClick={onCapture} variant="primary">
            Capture
          </ToolButton>
          <ToolButton disabled={!active} icon={<RotateCcw className="h-4 w-4" aria-hidden />} onClick={onStartCamera}>
            Restart
          </ToolButton>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-paper/60">
          Camera
          <select
            className="max-w-44 rounded-full border border-accent/25 bg-[#0d0710] px-3 py-1.5 text-sm text-paper"
            disabled={!devices.length}
            onChange={(event) => onSwitchCamera(event.target.value)}
            value={deviceId}
          >
            {devices.length ? (
              devices.map((device, index) => (
                <option className="text-ink" key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${index + 1}`}
                </option>
              ))
            ) : (
              <option className="text-ink" value="">
                Default
              </option>
            )}
          </select>
        </label>
      </div>
    </section>
  );
}
