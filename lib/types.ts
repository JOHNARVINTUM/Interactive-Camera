export type CanvasSizeId = "square" | "portrait" | "story" | "landscape" | "a4" | "strip";

export type CollageLayoutId = "strip2" | "strip3" | "grid4" | "collage6";

export type FilterId = "none" | "grayscale" | "sepia" | "bright" | "contrast" | "vintage";

export type GestureName = "open_palm" | "peace" | "swipe_left" | "swipe_right" | "none";

export type FrameId = "clean" | "instant" | "dashed" | "neon";

export type StickerId = "none" | "sparkles" | "hearts" | "stars" | "smile";

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  createdAt: number;
}

export interface CanvasSize {
  id: CanvasSizeId;
  label: string;
  width: number;
  height: number;
}

export interface CollageLayout {
  id: CollageLayoutId;
  label: string;
  slots: number;
  description: string;
}

export interface EditorSettings {
  canvasSize: CanvasSizeId;
  layout: CollageLayoutId;
  filter: FilterId;
  frame: FrameId;
  background: string;
  sticker: StickerId;
  text: string;
}

export const CANVAS_SIZES: CanvasSize[] = [
  { id: "square", label: "Square 1:1", width: 1600, height: 1600 },
  { id: "portrait", label: "Portrait 4:5", width: 1600, height: 2000 },
  { id: "story", label: "Story 9:16", width: 1080, height: 1920 },
  { id: "landscape", label: "Landscape 16:9", width: 1920, height: 1080 },
  { id: "a4", label: "A4 print", width: 1748, height: 2480 },
  { id: "strip", label: "Classic strip", width: 900, height: 2700 }
];

export const COLLAGE_LAYOUTS: CollageLayout[] = [
  { id: "strip2", label: "2-photo strip", slots: 2, description: "Two stacked frames" },
  { id: "strip3", label: "3-photo strip", slots: 3, description: "Classic vertical run" },
  { id: "grid4", label: "4-photo grid", slots: 4, description: "Two by two collage" },
  { id: "collage6", label: "6-photo collage", slots: 6, description: "Poster-style grid" }
];

export const FILTER_LABELS: Record<FilterId, string> = {
  none: "Natural",
  grayscale: "Mono",
  sepia: "Sepia",
  bright: "Bright",
  contrast: "Punchy",
  vintage: "Vintage"
};

export const FRAME_LABELS: Record<FrameId, string> = {
  clean: "Clean",
  instant: "Instant",
  dashed: "Dashed",
  neon: "Neon"
};

export const STICKER_LABELS: Record<StickerId, string> = {
  none: "None",
  sparkles: "Sparkles",
  hearts: "Hearts",
  stars: "Stars",
  smile: "Smile"
};
