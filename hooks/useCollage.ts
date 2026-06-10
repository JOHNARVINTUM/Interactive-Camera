"use client";

import { useCallback, useMemo, useState } from "react";
import { COLLAGE_LAYOUTS, type CapturedPhoto, type CollageLayoutId } from "@/lib/types";

export function useCollage(initialLayout: CollageLayoutId = "strip3") {
  const [layout, setLayoutState] = useState<CollageLayoutId>(initialLayout);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);

  const layoutConfig = useMemo(
    () => COLLAGE_LAYOUTS.find((item) => item.id === layout) ?? COLLAGE_LAYOUTS[1],
    [layout]
  );

  const addPhoto = useCallback(
    (photo: CapturedPhoto) => {
      setPhotos((current) => {
        const next = [...current, photo];
        return next.slice(Math.max(0, next.length - layoutConfig.slots));
      });
    },
    [layoutConfig.slots]
  );

  const removePhoto = useCallback((photoId: string) => {
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
  }, []);

  const clearPhotos = useCallback(() => setPhotos([]), []);

  const setLayout = useCallback((nextLayout: CollageLayoutId) => {
    setLayoutState(nextLayout);
    const nextSlots = COLLAGE_LAYOUTS.find((item) => item.id === nextLayout)?.slots ?? 3;
    setPhotos((current) => current.slice(Math.max(0, current.length - nextSlots)));
  }, []);

  return {
    addPhoto,
    clearPhotos,
    layout,
    layoutConfig,
    photos,
    removePhoto,
    setLayout
  };
}
