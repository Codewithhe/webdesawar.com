import type { CSSProperties } from "react";

import { isMiniDesawarName, normalizeShiftName } from "./result-display";
import { SITE_NAME } from "./site";

type GamePresentation = {
  hindi: string;
  background: string;
  shadow: string;
};

const DEFAULT_PRESENTATION: GamePresentation = {
  hindi: "",
  background:
    "radial-gradient(circle at 50% 0%, rgba(255, 43, 43, 0.22), transparent 46%), linear-gradient(145deg, rgba(120, 24, 24, 0.55), rgba(18, 28, 58, 0.92)), var(--panel-bg-strong)",
  shadow: "rgba(255, 43, 43, 0.22)",
};

const GAME_PRESENTATION: Record<string, GamePresentation> = {
  faridabad: {
    hindi: "फरीदाबाद",
    background:
      "radial-gradient(circle at 50% 0%, rgba(255, 77, 77, 0.34), transparent 44%), linear-gradient(145deg, rgba(183, 28, 28, 0.72), rgba(74, 12, 12, 0.92))",
    shadow: "rgba(255, 77, 77, 0.28)",
  },
  ghaziabad: {
    hindi: "गाज़ियाबाद",
    background:
      "radial-gradient(circle at 50% 0%, rgba(255, 120, 67, 0.32), transparent 44%), linear-gradient(145deg, rgba(198, 72, 18, 0.72), rgba(92, 34, 8, 0.92))",
    shadow: "rgba(255, 120, 67, 0.28)",
  },
  gali: {
    hindi: "गली",
    background:
      "radial-gradient(circle at 50% 0%, rgba(255, 196, 67, 0.3), transparent 44%), linear-gradient(145deg, rgba(176, 122, 8, 0.72), rgba(74, 52, 6, 0.92))",
    shadow: "rgba(255, 196, 67, 0.26)",
  },
  disawar: {
    hindi: "दिसावर",
    background:
      "radial-gradient(circle at 50% 0%, rgba(255, 92, 138, 0.3), transparent 44%), linear-gradient(145deg, rgba(168, 24, 72, 0.72), rgba(74, 10, 36, 0.92))",
    shadow: "rgba(255, 92, 138, 0.26)",
  },
  delhinoon: {
    hindi: "दिल्ली नून",
    background:
      "radial-gradient(circle at 50% 0%, rgba(88, 166, 255, 0.32), transparent 44%), linear-gradient(145deg, rgba(24, 88, 198, 0.72), rgba(8, 28, 74, 0.92))",
    shadow: "rgba(88, 166, 255, 0.26)",
  },
  tatamorning: {
    hindi: "टाटा मॉर्निंग",
    background:
      "radial-gradient(circle at 50% 0%, rgba(120, 214, 255, 0.3), transparent 44%), linear-gradient(145deg, rgba(18, 118, 176, 0.72), rgba(8, 42, 74, 0.92))",
    shadow: "rgba(120, 214, 255, 0.24)",
  },
  delhitime: {
    hindi: "दिल्ली टाइम",
    background:
      "radial-gradient(circle at 50% 0%, rgba(147, 112, 255, 0.32), transparent 44%), linear-gradient(145deg, rgba(88, 38, 198, 0.72), rgba(34, 12, 74, 0.92))",
    shadow: "rgba(147, 112, 255, 0.26)",
  },
  newfaridabad: {
    hindi: "नई फरीदाबाद",
    background:
      "radial-gradient(circle at 50% 0%, rgba(255, 99, 132, 0.32), transparent 44%), linear-gradient(145deg, rgba(176, 32, 64, 0.72), rgba(74, 12, 28, 0.92))",
    shadow: "rgba(255, 99, 132, 0.26)",
  },
  hyderabad: {
    hindi: "हैदराबाद",
    background:
      "radial-gradient(circle at 50% 0%, rgba(67, 214, 164, 0.3), transparent 44%), linear-gradient(145deg, rgba(12, 128, 98, 0.72), rgba(6, 52, 42, 0.92))",
    shadow: "rgba(67, 214, 164, 0.24)",
  },
  delhi2pm: {
    hindi: "दिल्ली 2 बजे",
    background:
      "radial-gradient(circle at 50% 0%, rgba(255, 168, 88, 0.3), transparent 44%), linear-gradient(145deg, rgba(176, 88, 18, 0.72), rgba(74, 42, 8, 0.92))",
    shadow: "rgba(255, 168, 88, 0.24)",
  },
  punjabday: {
    hindi: "पंजाब डे",
    background:
      "radial-gradient(circle at 50% 0%, rgba(118, 255, 122, 0.28), transparent 44%), linear-gradient(145deg, rgba(24, 142, 48, 0.72), rgba(8, 58, 22, 0.92))",
    shadow: "rgba(118, 255, 122, 0.22)",
  },
  jailuxmi: {
    hindi: "जय लक्ष्मी",
    background:
      "radial-gradient(circle at 50% 0%, rgba(255, 214, 102, 0.32), transparent 44%), linear-gradient(145deg, rgba(168, 128, 18, 0.72), rgba(68, 48, 8, 0.92))",
    shadow: "rgba(255, 214, 102, 0.24)",
  },
  shriganesh: {
    hindi: "श्री गणेश",
    background:
      "radial-gradient(circle at 50% 0%, rgba(255, 140, 235, 0.3), transparent 44%), linear-gradient(145deg, rgba(148, 38, 168, 0.72), rgba(58, 12, 74, 0.92))",
    shadow: "rgba(255, 140, 235, 0.24)",
  },
};

function getPresentation(shiftName: string | undefined) {
  const key = normalizeShiftName(shiftName);

  return GAME_PRESENTATION[key] ?? DEFAULT_PRESENTATION;
}

export function getGameCardLabel(shiftName: string | undefined, featured = false) {
  if (featured || isMiniDesawarName(shiftName)) {
    return shiftName || SITE_NAME;
  }

  const presentation = getPresentation(shiftName);

  return presentation.hindi || shiftName || "रिज़ल्ट";
}

export function getGameCardStyle(
  shiftName: string | undefined,
  featured = false
): CSSProperties | undefined {
  if (featured || isMiniDesawarName(shiftName)) {
    return undefined;
  }

  const presentation = getPresentation(shiftName);

  return {
    background: presentation.background,
    boxShadow: `0 14px 32px ${presentation.shadow}`,
  };
}

export function getGameCardLabelClassName(featured = false) {
  return featured ? "today-card-label" : "today-card-label today-card-label-hindi";
}
