"use client";

import React from "react";
import { ModelLevel } from "@/lib/engine/types";

interface LevelSelectorProps {
  currentLevel: ModelLevel;
  onSelectLevel: (level: ModelLevel) => void;
  disabled?: boolean;
}

const LEVELS: { id: ModelLevel; name: string }[] = [
  { id: "underfit", name: "Beginner" },
  { id: "overfit", name: "Memorizer" },
  { id: "stable", name: "Steady" },
];

export function LevelSelector({
  currentLevel,
  onSelectLevel,
  disabled = false,
}: LevelSelectorProps) {
  return (
    <div className="seg" role="group" aria-label="Choose an opponent">
      {LEVELS.map((level) => (
        <button
          key={level.id}
          type="button"
          aria-pressed={currentLevel === level.id}
          onClick={() => onSelectLevel(level.id)}
          disabled={disabled}
        >
          {level.name}
        </button>
      ))}
    </div>
  );
}
