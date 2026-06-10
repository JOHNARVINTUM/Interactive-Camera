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
const swipeMinDistance = 0.18;
const swipeMaxVerticalDrift = 0.16;
const swipeWindowMs = 900;
const swipeCooldownMs = 1200;
const movingHandThreshold = 0.035;
const palmHoldMs = 650;
const peaceHoldMs = 220;

interface SwipeTracker {
  cooldownUntil: number;
  startTime: number;
  startX: number;
  startY: number;
}

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

function detectSwipe(points: Keypoint[], tracker: SwipeTracker): GestureName {
  const wrist = points[0];
  if (!wrist) return "none";

  const now = Date.now();
  if (now < tracker.cooldownUntil) return "none";

  const elapsed = now - tracker.startTime;
  if (!tracker.startTime || elapsed > swipeWindowMs) {
    tracker.startTime = now;
    tracker.startX = wrist.x;
    tracker.startY = wrist.y;
    return "none";
  }

  const deltaX = wrist.x - tracker.startX;
  const deltaY = Math.abs(wrist.y - tracker.startY);

  if (Math.abs(deltaX) >= swipeMinDistance && deltaY <= swipeMaxVerticalDrift) {
    tracker.cooldownUntil = now + swipeCooldownMs;
    tracker.startTime = now;
    tracker.startX = wrist.x;
    tracker.startY = wrist.y;
    return deltaX > 0 ? "swipe_right" : "swipe_left";
  }

  return "none";
}

function getWristMotion(points: Keypoint[], tracker: SwipeTracker) {
  const wrist = points[0];
  if (!wrist || !tracker.startTime) return 0;
  return Math.hypot(wrist.x - tracker.startX, wrist.y - tracker.startY);
}

function classifyPoseGesture(points: Keypoint[]): GestureName {
  const extended = fingerTips.map((_, index) => isFingerExtended(points, index));
  const extendedCount = extended.filter(Boolean).length;

  if (extended[0] && extended[1] && !extended[2] && !extended[3]) return "peace";
  if (extendedCount >= 4) return "open_palm";

  return "none";
}

function filterPoseGesture(pose: GestureName, poseTracker: PoseTracker, moving: boolean) {
  const now = Date.now();

  if (pose !== poseTracker.candidate) {
    poseTracker.candidate = pose;
    poseTracker.since = now;
    return "none";
  }

  if (pose === "open_palm" && (moving || now - poseTracker.since < palmHoldMs)) {
    return "none";
  }

  if (pose === "peace" && now - poseTracker.since < peaceHoldMs) {
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
  const swipeTrackerRef = useRef<SwipeTracker>({
    cooldownUntil: 0,
    startTime: 0,
    startX: 0,
    startY: 0
  });
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
          const rawPoints = results.multiHandLandmarks?.[0];
          if (rawPoints?.length) {
            const points = mirrorLandmarks(rawPoints);
            const swipeGesture = detectSwipe(points, swipeTrackerRef.current);
            const moving = getWristMotion(points, swipeTrackerRef.current) > movingHandThreshold;
            const poseGesture = classifyPoseGesture(points);
            const nextGesture =
              swipeGesture === "none" ? filterPoseGesture(poseGesture, poseTrackerRef.current, moving) : swipeGesture;
            setGesture(nextGesture);
            emitGesture(nextGesture);
          } else {
            swipeTrackerRef.current.startTime = 0;
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
        setMessage("Show an open palm, peace sign, or swipe near the camera.");

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
