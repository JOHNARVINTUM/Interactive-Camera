import type { FilterId, ImageAdjustments } from "./types";

const defaultAdjustments: ImageAdjustments = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  fade: 0,
  vignette: 0
};

export function getCanvasFilter(filter: FilterId, adjustments: ImageAdjustments = defaultAdjustments) {
  const exposure = 1 + adjustments.exposure / 100;
  const contrast = 1 + adjustments.contrast / 100;
  const saturation = 1 + adjustments.saturation / 100;
  const warmth = Math.max(0, adjustments.warmth) / 100;
  const cool = Math.max(0, -adjustments.warmth) / 100;
  const fade = Math.max(0, adjustments.fade) / 100;

  const manual = [
    `brightness(${exposure.toFixed(3)})`,
    `contrast(${contrast.toFixed(3)})`,
    `saturate(${saturation.toFixed(3)})`,
    warmth > 0 ? `sepia(${(warmth * 0.28).toFixed(3)})` : "",
    cool > 0 ? `hue-rotate(${(-cool * 10).toFixed(2)}deg)` : "",
    fade > 0 ? `opacity(${(1 - fade * 0.22).toFixed(3)})` : ""
  ].filter(Boolean);

  const preset = getPresetFilter(filter);
  return [...manual, preset === "none" ? "" : preset].filter(Boolean).join(" ") || "none";
}

function getPresetFilter(filter: FilterId) {
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
