"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import type { GestureName } from "@/lib/types";

type GestureStatus = "idle" | "loading" | "ready" | "unsupported" | "error" | "disabled";

interface Keypoint {
  x: number;
  y: number;
}

interface MediaPipeHandsResults {
  multiHandLandmarks?: Keypoint[][];
}

interface MediaPipeHandsInstance {
  close?: () => void;
  onResults(callback: (results: MediaPipeHandsResults) => void): void;
  send(input: { image: HTMLVideoElement }): Promise<void>;
  setOptions(options: {
    maxNumHands: number;
    modelComplexity: number;
    minDetectionConfidence: number;
    minTrackingConfidence: number;
  }): void;
}

interface MediaPipeHandsConstructor {
  new (config: { locateFile: (file: string) => string }): MediaPipeHandsInstance;
}

declare global {
  interface Window {
    Hands?: MediaPipeHandsConstructor;
  }
}

interface GestureOptions {
  enabled: boolean;
  onGesture: (gesture: GestureName) => void;
}

const fingerTips = [8, 12, 16, 20];
const fingerPips = [6, 10, 14, 18];
const palmHoldMs = 650;

interface PoseTracker {
  candidate: GestureName;
  since: number;
}

function isFingerExtended(points: Keypoint[], fingerIndex: number) {
  const tip = points[fingerTips[fingerIndex]];
  const pip = points[fingerPips[fingerIndex]];
  if (!tip || !pip) return false;
  return tip.y < pip.y - 0.025;
}

function mirrorLandmarks(points: Keypoint[]) {
  return points.map((point) => ({ ...point, x: 1 - point.x }));
}

function classifyPalmGesture(points: Keypoint[]): GestureName {
  const extendedFingers = fingerTips.map((_, index) => isFingerExtended(points, index)).filter(Boolean).length;
  return extendedFingers >= 4 ? "open_palm" : "none";
}

function filterStableGesture(pose: GestureName, poseTracker: PoseTracker) {
  const now = Date.now();

  if (pose !== poseTracker.candidate) {
    poseTracker.candidate = pose;
    poseTracker.since = now;
    return "none";
  }

  if (now - poseTracker.since < palmHoldMs) {
    return "none";
  }

  return pose;
}

export function useGestureDetection(videoRef: RefObject<HTMLVideoElement>, options: GestureOptions) {
  const [status, setStatus] = useState<GestureStatus>("idle");
  const [gesture, setGesture] = useState<GestureName>("none");
  const [message, setMessage] = useState("Manual controls are ready.");
  const handsRef = useRef<MediaPipeHandsInstance | null>(null);
  const rafRef = useRef<number>();
  const lastGestureRef = useRef<{ name: GestureName; time: number }>({ name: "none", time: 0 });
  const poseTrackerRef = useRef<PoseTracker>({
    candidate: "none",
    since: 0
  });
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const emitGesture = useCallback((nextGesture: GestureName) => {
    if (nextGesture === "none") return;
    const now = Date.now();
    const last = lastGestureRef.current;
    if (last.name === nextGesture && now - last.time < 1800) return;

    lastGestureRef.current = { name: nextGesture, time: now };
    setGesture(nextGesture);
    optionsRef.current.onGesture(nextGesture);
  }, []);

  const loadMediaPipeScript = useCallback(async () => {
    if (window.Hands) return;

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>("script[data-mediapipe-hands]");
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("MediaPipe Hands failed to load.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.mediapipeHands = "true";
      script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("MediaPipe Hands failed to load."));
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      if (!options.enabled) {
        setStatus("disabled");
        setMessage("Gesture control is off. Manual buttons stay available.");
        return;
      }

      if (!navigator.mediaDevices || typeof window === "undefined") {
        setStatus("unsupported");
        setMessage("Gesture control is not supported in this browser.");
        return;
      }

      setStatus("loading");
      setMessage("Loading hand tracking...");

      try {
        await loadMediaPipeScript();
        if (!window.Hands) throw new Error("MediaPipe Hands is unavailable.");

        const hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.72,
          minTrackingConfidence: 0.62
        });

        hands.onResults((results) => {
          const points = results.multiHandLandmarks?.[0] ? mirrorLandmarks(results.multiHandLandmarks[0]) : undefined;
          if (points?.length) {
            const nextGesture = filterStableGesture(classifyPalmGesture(points), poseTrackerRef.current);
            setGesture(nextGesture);
            emitGesture(nextGesture);
          } else {
            poseTrackerRef.current = { candidate: "none", since: 0 };
            setGesture("none");
          }
        });

        if (cancelled) {
          hands.close?.();
          return;
        }

        handsRef.current = hands;
        setStatus("ready");
        setMessage("Hold an open palm to start countdown. Use manual controls for filters.");

        const tick = async () => {
          const video = videoRef.current;
          const handsInstance = handsRef.current;
          if (video && handsInstance && video.readyState >= 2) {
            await handsInstance.send({ image: video });
          }
          rafRef.current = window.requestAnimationFrame(tick);
        };

        rafRef.current = window.requestAnimationFrame(tick);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Hand tracking could not start.");
      }
    }

    setup();

    return () => {
      cancelled = true;
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      handsRef.current?.close?.();
      handsRef.current = null;
    };
  }, [emitGesture, loadMediaPipeScript, options.enabled, videoRef]);

  return { gesture, message, status };
}
