"use client";

import { RefObject, useCallback, useEffect } from "react";
import { getCanvasFilter } from "@/lib/filters";
import {
  CANVAS_SIZES,
  COLLAGE_LAYOUTS,
  type CapturedPhoto,
  type CollageLayoutId,
  type EditorSettings,
  type FrameId,
  type StickerId
} from "@/lib/types";

function getSlotRects(layout: CollageLayoutId, width: number, height: number, padding: number, bottomReserve = 0) {
  const layoutConfig = COLLAGE_LAYOUTS.find((item) => item.id === layout) ?? COLLAGE_LAYOUTS[1];
  const contentWidth = width - padding * 2;
  const contentHeight = height - padding * 2 - bottomReserve;
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

function drawFrame(
  context: CanvasRenderingContext2D,
  frame: FrameId,
  borderColor: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  context.save();
  if (frame === "instant") {
    context.strokeStyle = borderColor;
    context.lineWidth = Math.max(20, width * 0.035);
    context.strokeRect(x, y, width, height);
    context.fillStyle = borderColor;
    context.fillRect(x, y + height - Math.max(68, height * 0.11), width, Math.max(68, height * 0.11));
  } else if (frame === "classic") {
    const outer = Math.max(18, width * 0.03);
    context.strokeStyle = borderColor;
    context.lineWidth = outer;
    context.strokeRect(x + outer / 2, y + outer / 2, width - outer, height - outer);
    context.strokeStyle = "rgba(28,31,42,.18)";
    context.lineWidth = Math.max(4, width * 0.006);
    context.strokeRect(x + outer * 1.25, y + outer * 1.25, width - outer * 2.5, height - outer * 2.5);
  } else if (frame === "dashed") {
    context.setLineDash([24, 16]);
    context.strokeStyle = borderColor;
    context.lineWidth = Math.max(8, width * 0.012);
    context.strokeRect(x + 8, y + 8, width - 16, height - 16);
  } else if (frame === "neon") {
    context.shadowColor = borderColor;
    context.shadowBlur = 30;
    context.strokeStyle = borderColor;
    context.lineWidth = Math.max(10, width * 0.016);
    context.strokeRect(x + 8, y + 8, width - 16, height - 16);
  } else {
    context.strokeStyle = borderColor;
    context.lineWidth = Math.max(6, width * 0.008);
    context.strokeRect(x, y, width, height);
  }
  context.restore();
}

function drawSticker(context: CanvasRenderingContext2D, sticker: StickerId, x: number, y: number, width: number) {
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
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(labelMap[sticker], x, y);
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
  const stripFooterHeight = settings.canvasSize === "strip" ? Math.round(size.height * 0.07) : 0;
  const rects = getSlotRects(settings.layout, size.width, size.height, padding, stripFooterHeight);
  const images = await Promise.all(photos.map((photo) => loadImage(photo.dataUrl)));

  rects.forEach((rect, index) => {
    context.save();
    context.fillStyle = "rgba(255,255,255,.74)";
    context.fillRect(rect.x, rect.y, rect.width, rect.height);

    const image = images[index];
    if (image) {
      context.filter = getCanvasFilter(settings.filter, settings.adjustments);
      drawCoverImage(context, image, rect.x, rect.y, rect.width, rect.height);
      context.filter = "none";
      drawAdjustmentOverlay(context, settings, rect.x, rect.y, rect.width, rect.height);
    } else {
      context.fillStyle = "rgba(28,31,42,.24)";
      context.font = `700 ${Math.max(34, rect.width * 0.045)}px Arial`;
      context.textAlign = "center";
      context.fillText(`Slot ${index + 1}`, rect.x + rect.width / 2, rect.y + rect.height / 2);
    }

    drawFrame(context, settings.frame, settings.borderColor, rect.x, rect.y, rect.width, rect.height);
    context.restore();
  });

  if (settings.filter === "vintage") {
    context.save();
    context.globalCompositeOperation = "multiply";
    context.fillStyle = "rgba(255, 222, 162, .18)";
    context.fillRect(0, 0, size.width, size.height);
    context.restore();
  }

  drawSticker(context, settings.sticker, settings.stickerX * size.width, settings.stickerY * size.height, size.width);

  if (settings.text.trim()) {
    context.save();
    context.fillStyle = "#1c1f2a";
    context.textAlign = "center";
    context.textBaseline = "middle";
    if (settings.canvasSize === "strip") {
      context.font = `800 ${Math.max(28, size.width * 0.035)}px Arial`;
      context.fillText(settings.text.trim(), size.width / 2, size.height - stripFooterHeight / 2);
    } else {
      context.font = `800 ${Math.max(42, size.width * 0.045)}px Arial`;
      context.fillText(settings.text.trim(), size.width / 2, size.height - Math.max(52, size.height * 0.035));
    }
    context.restore();
  }
}

function drawAdjustmentOverlay(
  context: CanvasRenderingContext2D,
  settings: EditorSettings,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const { fade, vignette, warmth } = settings.adjustments;
  context.save();

  if (fade > 0) {
    context.fillStyle = `rgba(255, 246, 225, ${Math.min(0.34, fade / 180)})`;
    context.fillRect(x, y, width, height);
  }

  if (warmth !== 0) {
    context.globalCompositeOperation = warmth > 0 ? "soft-light" : "screen";
    context.fillStyle = warmth > 0 ? `rgba(214, 178, 94, ${Math.min(0.22, warmth / 260)})` : `rgba(80, 130, 210, ${Math.min(0.16, Math.abs(warmth) / 320)})`;
    context.fillRect(x, y, width, height);
    context.globalCompositeOperation = "source-over";
  }

  if (vignette > 0) {
    const gradient = context.createRadialGradient(
      x + width / 2,
      y + height / 2,
      Math.min(width, height) * 0.24,
      x + width / 2,
      y + height / 2,
      Math.max(width, height) * 0.72
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, `rgba(0,0,0,${Math.min(0.58, vignette / 100)})`);
    context.fillStyle = gradient;
    context.fillRect(x, y, width, height);
  }

  context.restore();
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
