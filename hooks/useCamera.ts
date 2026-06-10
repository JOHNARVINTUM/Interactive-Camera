"use client";

import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CapturedPhoto } from "@/lib/types";

type PermissionState = "idle" | "requesting" | "ready" | "denied" | "unsupported";

export function useCamera(videoRef: RefObject<HTMLVideoElement>) {
  const streamRef = useRef<MediaStream | null>(null);
  const [permission, setPermission] = useState<PermissionState>("idle");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [error, setError] = useState<string>("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const loadDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    setDevices(allDevices.filter((device) => device.kind === "videoinput"));
  }, []);

  const startCamera = useCallback(
    async (nextDeviceId?: string) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setPermission("unsupported");
        setError("This browser does not support webcam access.");
        return;
      }

      setPermission("requesting");
      setError("");
      stopCamera();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: nextDeviceId ? { exact: nextDeviceId } : undefined,
            facingMode: nextDeviceId ? undefined : "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        const actualDeviceId = track?.getSettings().deviceId ?? nextDeviceId ?? "";
        setDeviceId(actualDeviceId);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        await loadDevices();
        setPermission("ready");
      } catch (cameraError) {
        const message = cameraError instanceof Error ? cameraError.message : "Unable to open the camera.";
        setPermission("denied");
        setError(message);
      }
    },
    [loadDevices, stopCamera, videoRef]
  );

  const switchCamera = useCallback(
    async (nextDeviceId: string) => {
      setDeviceId(nextDeviceId);
      await startCamera(nextDeviceId);
    },
    [startCamera]
  );

  const capturePhoto = useCallback((): CapturedPhoto | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return {
      id: crypto.randomUUID(),
      dataUrl: canvas.toDataURL("image/png"),
      createdAt: Date.now()
    };
  }, [videoRef]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const active = useMemo(() => permission === "ready", [permission]);

  return {
    active,
    capturePhoto,
    devices,
    deviceId,
    error,
    permission,
    startCamera,
    stopCamera,
    switchCamera
  };
}
