"use client";

import { Camera, CheckCircle2, RotateCcw, Timer, Video } from "lucide-react";
import type { RefObject } from "react";
import { ToolButton } from "./Toolbar";

interface CameraPreviewProps {
  active: boolean;
  countdown: number | null;
  devices: MediaDeviceInfo[];
  deviceId: string;
  error: string;
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
  permission,
  videoRef,
  onCapture,
  onStartCamera,
  onSwitchCamera
}: CameraPreviewProps) {
  return (
    <section className="overflow-hidden rounded-[32px] bg-ink p-3 text-white shadow-panel">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-black">
        <video ref={videoRef} className="h-full w-full -scale-x-100 object-cover" muted playsInline />

        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/92 p-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white/12">
              <Video className="h-8 w-8" aria-hidden />
            </div>
            <div>
              <h2 className="text-2xl font-black">Open the studio camera</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/72">
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
          <div className="absolute inset-0 grid place-items-center bg-black/35">
            <div className="grid h-28 w-28 animate-pulseRing place-items-center rounded-full bg-white text-6xl font-black text-ink">
              {countdown}
            </div>
          </div>
        )}

        {active && (
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-2 text-xs font-bold backdrop-blur">
            <CheckCircle2 className="h-4 w-4 text-mint" aria-hidden />
            Live preview
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ToolButton disabled={!active || countdown !== null} icon={<Timer className="h-4 w-4" aria-hidden />} onClick={onCapture} variant="primary">
            Capture
          </ToolButton>
          <ToolButton disabled={!active} icon={<RotateCcw className="h-4 w-4" aria-hidden />} onClick={onStartCamera}>
            Restart
          </ToolButton>
        </div>

        <label className="flex items-center gap-2 text-sm font-bold text-white/80">
          Camera
          <select
            className="max-w-48 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-white"
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
