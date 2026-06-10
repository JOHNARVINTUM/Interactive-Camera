"use client";

import { RefObject, useCallback, useEffect } from "react";
import {
  CANVAS_SIZES,
  COLLAGE_LAYOUTS,
  type CapturedPhoto,
  type CollageLayoutId,
  type EditorSettings,
  type FilterId,
  type FrameId,
  type StickerId
} from "@/lib/types";

function getFilter(filter: FilterId) {
  switch (filter) {
    case "grayscale":
      return "grayscale(1)";
    case "sepia":
      return "sepia(.85) saturate(1.1)";
    case "bright":
      return "brightness(1.16) saturate(1.08)";
    case "contrast":
      return "contrast(1.22) saturate(1.12)";
    case "vintage":
      return "sepia(.35) contrast(1.08) brightness(1.05) saturate(.9)";
    default:
      return "none";
  }
}

function getSlotRects(layout: CollageLayoutId, width: number, height: number, padding: number) {
  const layoutConfig = COLLAGE_LAYOUTS.find((item) => item.id === layout) ?? COLLAGE_LAYOUTS[1];
  const contentWidth = width - padding * 2;
  const contentHeight = height - padding * 2;
  const gap = Math.max(22, Math.round(width * 0.018));

  if (layout === "grid4") {
    const cellWidth = (contentWidth - gap) / 2;
    const cellHeight = (contentHeight - gap) / 2;
    return Array.from({ length: 4 }, (_, index) => ({
      x: padding + (index % 2) * (cellWidth + gap),
      y: padding + Math.floor(index / 2) * (cellHeight + gap),
      width: cellWidth,
      height: cellHeight
    }));
  }

  if (layout === "collage6") {
    const cellWidth = (contentWidth - gap * 2) / 3;
    const cellHeight = (contentHeight - gap) / 2;
    return Array.from({ length: 6 }, (_, index) => ({
      x: padding + (index % 3) * (cellWidth + gap),
      y: padding + Math.floor(index / 3) * (cellHeight + gap),
      width: cellWidth,
      height: cellHeight
    }));
  }

  const cellHeight = (contentHeight - gap * (layoutConfig.slots - 1)) / layoutConfig.slots;
  return Array.from({ length: layoutConfig.slots }, (_, index) => ({
    x: padding,
    y: padding + index * (cellHeight + gap),
    width: contentWidth,
    height: cellHeight
  }));
}

function drawCoverImage(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function drawFrame(context: CanvasRenderingContext2D, frame: FrameId, x: number, y: number, width: number, height: number) {
  context.save();
  if (frame === "instant") {
    context.strokeStyle = "#ffffff";
    context.lineWidth = Math.max(20, width * 0.035);
    context.strokeRect(x, y, width, height);
    context.fillStyle = "rgba(255,255,255,.92)";
    context.fillRect(x, y + height - Math.max(68, height * 0.11), width, Math.max(68, height * 0.11));
  } else if (frame === "dashed") {
    context.setLineDash([24, 16]);
    context.strokeStyle = "#1c1f2a";
    context.lineWidth = Math.max(8, width * 0.012);
    context.strokeRect(x + 8, y + 8, width - 16, height - 16);
  } else if (frame === "neon") {
    context.shadowColor = "#2475ff";
    context.shadowBlur = 30;
    context.strokeStyle = "#20be9e";
    context.lineWidth = Math.max(10, width * 0.016);
    context.strokeRect(x + 8, y + 8, width - 16, height - 16);
  } else {
    context.strokeStyle = "rgba(28,31,42,.16)";
    context.lineWidth = Math.max(6, width * 0.008);
    context.strokeRect(x, y, width, height);
  }
  context.restore();
}

function drawSticker(context: CanvasRenderingContext2D, sticker: StickerId, width: number, height: number) {
  if (sticker === "none") return;

  const labelMap: Record<Exclude<StickerId, "none">, string> = {
    sparkles: "* * *",
    hearts: "<3 <3",
    stars: "STAR",
    smile: ":)"
  };

  context.save();
  context.font = `700 ${Math.max(40, width * 0.052)}px Arial`;
  context.fillStyle = sticker === "hearts" ? "#ff6d56" : "#2475ff";
  context.textAlign = "right";
  context.fillText(labelMap[sticker], width - width * 0.06, height * 0.1);
  context.restore();
}

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function renderToCanvas(canvas: HTMLCanvasElement, photos: CapturedPhoto[], settings: EditorSettings) {
  const size = CANVAS_SIZES.find((item) => item.id === settings.canvasSize) ?? CANVAS_SIZES[0];
  const context = canvas.getContext("2d");
  if (!context) return;

  canvas.width = size.width;
  canvas.height = size.height;

  context.fillStyle = settings.background;
  context.fillRect(0, 0, size.width, size.height);

  const padding = settings.canvasSize === "strip" ? Math.round(size.width * 0.08) : Math.round(Math.min(size.width, size.height) * 0.06);
  const rects = getSlotRects(settings.layout, size.width, size.height, padding);
  const images = await Promise.all(photos.map((photo) => loadImage(photo.dataUrl)));

  rects.forEach((rect, index) => {
    context.save();
    context.fillStyle = "rgba(255,255,255,.74)";
    context.fillRect(rect.x, rect.y, rect.width, rect.height);

    const image = images[index];
    if (image) {
      context.filter = getFilter(settings.filter);
      drawCoverImage(context, image, rect.x, rect.y, rect.width, rect.height);
      context.filter = "none";
    } else {
      context.fillStyle = "rgba(28,31,42,.24)";
      context.font = `700 ${Math.max(34, rect.width * 0.045)}px Arial`;
      context.textAlign = "center";
      context.fillText(`Slot ${index + 1}`, rect.x + rect.width / 2, rect.y + rect.height / 2);
    }

    drawFrame(context, settings.frame, rect.x, rect.y, rect.width, rect.height);
    context.restore();
  });

  if (settings.filter === "vintage") {
    context.save();
    context.globalCompositeOperation = "multiply";
    context.fillStyle = "rgba(255, 222, 162, .18)";
    context.fillRect(0, 0, size.width, size.height);
    context.restore();
  }

  drawSticker(context, settings.sticker, size.width, size.height);

  if (settings.text.trim()) {
    context.save();
    context.fillStyle = "#1c1f2a";
    context.textAlign = "center";
    context.font = `800 ${Math.max(42, size.width * 0.045)}px Arial`;
    context.fillText(settings.text.trim(), size.width / 2, size.height - Math.max(52, size.height * 0.035));
    context.restore();
  }
}

export function useCanvasRenderer(canvasRef: RefObject<HTMLCanvasElement>, photos: CapturedPhoto[], settings: EditorSettings) {
  const render = useCallback(async () => {
    if (!canvasRef.current) return;
    await renderToCanvas(canvasRef.current, photos, settings);
  }, [canvasRef, photos, settings]);

  const exportImage = useCallback(
    async (format: "png" | "jpeg") => {
      if (!canvasRef.current) return;
      await render();
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const url = canvasRef.current.toDataURL(mime, 0.92);
      const link = document.createElement("a");
      link.href = url;
      link.download = `interactive-photobooth.${format === "png" ? "png" : "jpg"}`;
      link.click();
    },
    [canvasRef, render]
  );

  useEffect(() => {
    void render();
  }, [render]);

  return { exportImage, render };
}
