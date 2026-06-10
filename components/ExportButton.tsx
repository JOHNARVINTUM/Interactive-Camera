"use client";

import { Download } from "lucide-react";
import { ToolButton } from "./Toolbar";

export function ExportButton({
  disabled,
  onExport
}: {
  disabled: boolean;
  onExport: (format: "png" | "jpeg") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <ToolButton disabled={disabled} icon={<Download className="h-4 w-4" aria-hidden />} onClick={() => onExport("png")} variant="primary">
        Export PNG
      </ToolButton>
      <ToolButton disabled={disabled} icon={<Download className="h-4 w-4" aria-hidden />} onClick={() => onExport("jpeg")}>
        Export JPG
      </ToolButton>
    </div>
  );
}
