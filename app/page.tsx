"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CameraPreview } from "@/components/CameraPreview";
import { CanvasEditor } from "@/components/CanvasEditor";
import { CollageBuilder } from "@/components/CollageBuilder";
import { ExportButton } from "@/components/ExportButton";
import { GestureController } from "@/components/GestureController";
import { Panel } from "@/components/Toolbar";
import { useCamera } from "@/hooks/useCamera";
import { useCanvasRenderer } from "@/hooks/useCanvasRenderer";
import { useCollage } from "@/hooks/useCollage";
import { useGestureDetection } from "@/hooks/useGestureDetection";
import { type CollageLayoutId, type EditorSettings, type GestureName } from "@/lib/types";

const marqueeItems = ["NOW SHOWING", "RED CARPET", "PHOTO BOOTH", "HOLLYWOOD", "PREMIERE NIGHT", "LIGHTS CAMERA ACTION", "STAR TREATMENT"];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gestureEnabled, setGestureEnabled] = useState(true);
  const [statusText, setStatusText] = useState("Start the premiere camera, then capture a strip.");
  const [settings, setSettings] = useState<EditorSettings>({
    background: "#120b0d",
    borderColor: "#d6b25e",
    canvasSize: "strip",
    filter: "vintage",
    adjustments: {
      exposure: 6,
      contrast: 14,
      saturation: 8,
      warmth: 12,
      fade: 0,
      vignette: 18
    },
    frame: "classic",
    layout: "strip3",
    sticker: "sparkles",
    stickerX: 0.82,
    stickerY: 0.09,
    text: "Premiere Night"
  });

  const camera = useCamera(videoRef);
  const collage = useCollage(settings.layout);
  const { exportImage } = useCanvasRenderer(canvasRef, collage.photos, settings);

  const addCapturedPhoto = useCallback(() => {
    const photo = camera.capturePhoto();
    if (!photo) {
      setStatusText("Camera is not ready yet.");
      return;
    }
    collage.addPhoto(photo);
      setStatusText("Photo added to the strip.");
  }, [camera, collage]);

  const startCountdown = useCallback(() => {
    if (!camera.active || countdown !== null) return;
    setCountdown(3);
    setStatusText("Countdown started...");

    let next = 3;
    const interval = window.setInterval(() => {
      next -= 1;
      if (next <= 0) {
        window.clearInterval(interval);
        setCountdown(null);
        addCapturedPhoto();
      } else {
        setCountdown(next);
      }
    }, 850);
  }, [addCapturedPhoto, camera.active, countdown]);

  const handleGesture = useCallback(
    (gesture: GestureName) => {
      if (gesture === "open_palm") startCountdown();
    },
    [startCountdown]
  );

  const gesture = useGestureDetection(videoRef, {
    enabled: gestureEnabled && camera.active,
    onGesture: handleGesture
  });

  const filledLabel = useMemo(
    () => `${collage.photos.length}/${collage.layoutConfig.slots} photos`,
    [collage.layoutConfig.slots, collage.photos.length]
  );

  const handleLayoutChange = useCallback(
    (layout: CollageLayoutId) => {
      collage.setLayout(layout);
      setSettings((current) => ({ ...current, layout }));
    },
    [collage]
  );

  return (
    <main className="min-h-screen text-paper">
      <div className="overflow-hidden border-b border-accent/15 bg-[#0a0610] py-2">
        <div className="flex w-max gap-8 whitespace-nowrap" style={{ animation: "marqueeScroll 28s linear infinite" }}>
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span
              className="text-xs font-black uppercase tracking-[0.3em]"
              key={`${item}-${index}`}
              style={{ color: index % 2 === 0 ? "rgba(214,178,94,0.78)" : "rgba(255,248,237,0.22)" }}
            >
              {item}
              <span className="ml-8 text-accent/25">+</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1540px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-2xl border border-accent/25 bg-[#0a0610]/84 shadow-panel backdrop-blur">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <div className="flex flex-col justify-between gap-5 px-6 py-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-8 bg-accent/40" />
                <p className="text-xs font-black uppercase tracking-[0.32em] text-accent">Premiere Night - Red Carpet Studio</p>
                <div className="h-px w-8 bg-accent/40" />
              </div>
              <h1 className="premiere-display max-w-2xl text-[clamp(2rem,5vw,3.5rem)] font-black leading-tight text-paper">
                Red Carpet Photo Booth
              </h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-paper/50">
                Step into the spotlight, tune the look like a stills editor, then export a poster-ready strip.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <div className="flex items-center gap-2 rounded-full border border-accent/25 bg-[#07040a] px-4 py-2">
                <span className="h-2 w-2 rounded-full" style={{ background: camera.active ? "#d6b25e" : "#ab2031" }} />
                <span className="text-xs font-black uppercase tracking-[0.18em] text-paper/60">
                  {camera.active ? "Camera Live" : "Camera Offline"}
                </span>
                <span className="text-xs font-black text-accent">{collage.photos.length} / {collage.layoutConfig.slots} frames</span>
              </div>
              <p className="text-xs text-paper/40 md:text-right">{statusText}</p>
              <ExportButton disabled={!collage.photos.length} onExport={exportImage} />
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(400px,0.85fr)_minmax(520px,1.15fr)]">
          <div className="space-y-4">
            <CameraPreview
              active={camera.active}
              countdown={countdown}
              devices={camera.devices}
              deviceId={camera.deviceId}
              error={camera.error}
              adjustments={settings.adjustments}
              filter={settings.filter}
              onCapture={startCountdown}
              onStartCamera={() => void camera.startCamera(camera.deviceId || undefined)}
              onSwitchCamera={(id) => void camera.switchCamera(id)}
              permission={camera.permission}
              videoRef={videoRef}
            />

            <Panel>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-accent">Session</h2>
                  <p className="mt-1 text-xs font-medium text-paper/45">{statusText}</p>
                </div>
                <span className="rounded-full border border-accent/30 px-4 py-1.5 text-sm font-black text-accent">{filledLabel}</span>
              </div>
            </Panel>

            <GestureController
              enabled={gestureEnabled}
              gesture={gesture.gesture}
              message={gesture.message}
              onToggle={setGestureEnabled}
              status={gesture.status}
            />

            <CollageBuilder
              layout={collage.layout}
              onClear={collage.clearPhotos}
              onRemove={collage.removePhoto}
              onSetLayout={handleLayoutChange}
              photos={collage.photos}
            />
          </div>

          <CanvasEditor canvasRef={canvasRef} onChange={setSettings} settings={settings} />
        </div>
      </div>
    </main>
  );
}
