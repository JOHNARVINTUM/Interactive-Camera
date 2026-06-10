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
import { FILTER_LABELS, type CollageLayoutId, type EditorSettings, type FilterId, type GestureName } from "@/lib/types";

const filterOrder = Object.keys(FILTER_LABELS) as FilterId[];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gestureEnabled, setGestureEnabled] = useState(true);
  const [statusText, setStatusText] = useState("Start the camera, then capture a strip.");
  const [settings, setSettings] = useState<EditorSettings>({
    background: "#fff8ed",
    canvasSize: "strip",
    filter: "none",
    frame: "instant",
    layout: "strip3",
    sticker: "sparkles",
    text: "Photo booth"
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
    setStatusText("Photo added to the collage.");
  }, [camera, collage]);

  const startCountdown = useCallback(() => {
    if (!camera.active || countdown !== null) return;
    setCountdown(3);
    setStatusText("Countdown started.");

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

  const cycleFilter = useCallback((direction: 1 | -1) => {
    setSettings((current) => {
      const currentIndex = filterOrder.indexOf(current.filter);
      const nextIndex = (currentIndex + direction + filterOrder.length) % filterOrder.length;
      return { ...current, filter: filterOrder[nextIndex] };
    });
    setStatusText("Swipe changed the filter.");
  }, []);

  const handleGesture = useCallback(
    (gesture: GestureName) => {
      if (gesture === "open_palm") startCountdown();
      if (gesture === "peace") addCapturedPhoto();
      if (gesture === "swipe_left") cycleFilter(-1);
      if (gesture === "swipe_right") cycleFilter(1);
    },
    [addCapturedPhoto, cycleFilter, startCountdown]
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
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <header className="flex flex-col justify-between gap-4 rounded-[32px] bg-white/70 p-5 ring-1 ring-black/8 backdrop-blur md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">Interactive Camera</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-black leading-[1.02] tracking-normal text-ink sm:text-5xl lg:text-6xl">
              Gesture-ready photobooth studio
            </h1>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <p className="max-w-sm text-sm leading-6 text-ink/68">
              Capture locally, build a strip or collage, style the canvas, then export a PNG or JPG.
            </p>
            <ExportButton disabled={!collage.photos.length} onExport={exportImage} />
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(420px,0.9fr)_minmax(520px,1.1fr)]">
          <div className="space-y-5">
            <CameraPreview
              active={camera.active}
              countdown={countdown}
              devices={camera.devices}
              deviceId={camera.deviceId}
              error={camera.error}
              onCapture={startCountdown}
              onStartCamera={() => void camera.startCamera(camera.deviceId || undefined)}
              onSwitchCamera={(id) => void camera.switchCamera(id)}
              permission={camera.permission}
              videoRef={videoRef}
            />

            <Panel>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-black">Session</h2>
                  <p className="mt-1 text-sm text-ink/64">{statusText}</p>
                </div>
                <span className="rounded-full bg-studio px-4 py-2 text-sm font-black">{filledLabel}</span>
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
