import type { CSSProperties } from "react";

import { isMiniDesawarName, normalizeShiftName } from "./result-display";

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

const PRESENTATION_ALIASES: Record<string, string> = {
  desawar: "disawar",
  olddesawar: "olddesawar",
  galidisawarmix: "gali",
  chotigali: "gali",
  newgali: "gali",
  galibazar: "gali",
  newghaziabad: "ghaziabad",
  ghaziabaddin: "ghaziabad",
  ghaziabadnight: "ghaziabad",
  shriganesh: "shriganesh",
  shreeganesh: "shriganesh",
  faridabazar: "faridabad",
};

const TOKEN_HINDI: Record<string, string> = {
  "1": "1",
  agra: "आगरा",
  ahmedabad: "अहमदाबाद",
  al: "अल",
  anarkali: "अनारकली",
  bala: "बाला",
  bangalore: "बैंगलोर",
  bazaar: "बाज़ार",
  bazar: "बाज़ार",
  bhagwati: "भगवती",
  bharat: "भारत",
  bihar: "बिहार",
  bikaner: "बीकानेर",
  bk: "बीके",
  bombay: "बॉम्बे",
  brij: "बृज",
  burj: "बुर्ज",
  challenge: "चैलेंज",
  chand: "चाँद",
  chennai: "चेन्नई",
  choti: "छोटी",
  city: "सिटी",
  dadri: "दादरी",
  deep: "दीप",
  dehradun: "देहरादून",
  delhi: "दिल्ली",
  desawar: "दिसावर",
  dhan: "धन",
  din: "दिन",
  disawar: "दिसावर",
  dream: "ड्रीम",
  ds: "डीएस",
  dubai: "दुबई",
  e: "ए",
  evening: "इवनिंग",
  express: "एक्सप्रेस",
  farida: "फरीदा",
  faridabad: "फरीदाबाद",
  gali: "गली",
  ganesh: "गणेश",
  ganga: "गंगा",
  ghaziabad: "गाज़ियाबाद",
  gold: "गोल्ड",
  golden: "गोल्डन",
  gurgaon: "गुड़गांव",
  guru: "गुरु",
  hindustan: "हिंदुस्तान",
  india: "इंडिया",
  jaipur: "जयपुर",
  jaisalmer: "जैसलमेर",
  jalandhar: "जालंधर",
  janta: "जनता",
  ji: "जी",
  ka: "का",
  kalka: "कालका",
  khalifa: "खलीफा",
  king: "किंग",
  kuber: "कुबेर",
  laxmi: "लक्ष्मी",
  ludhiana: "लुधियाना",
  maa: "माँ",
  mahalaxmi: "महालक्ष्मी",
  maharaj: "महाराज",
  malik: "मलिक",
  mangal: "मंगल",
  matka: "मटका",
  max: "मैक्स",
  meerut: "मेरठ",
  mix: "मिक्स",
  mohali: "मोहाली",
  mumbai: "मुंबई",
  nagar: "नगर",
  nagpur: "नागपुर",
  neelkanth: "नीलकंठ",
  new: "नया",
  night: "नाइट",
  noida: "नोएडा",
  number: "नंबर",
  old: "पुराना",
  p: "पी",
  palwal: "पलवल",
  paras: "पारस",
  punjab: "पंजाब",
  rahat: "राहत",
  rajdhani: "राजधानी",
  rani: "रानी",
  royal: "रॉयल",
  rozana: "रोज़ाना",
  sagar: "सागर",
  sahibabad: "साहिबाबाद",
  savera: "सवेरा",
  sawariya: "सावरिया",
  seth: "सेठ",
  shaan: "शान",
  shakti: "शक्ति",
  shankar: "शंकर",
  shiv: "शिव",
  shree: "श्री",
  shri: "श्री",
  sone: "सोने",
  star: "स्टार",
  super: "सुपर",
  taj: "ताज",
  tara: "तारा",
  today: "टुडे",
  u: "यू",
  udaan: "उड़ान",
  ujala: "उजाला",
  uk: "यूके",
  up: "यूपी",
  uttarakhand: "उत्तराखंड",
  veera: "वीरा",
  waheguru: "वाहेगुरु",
  white: "व्हाइट",
};

const GAME_PRESENTATION: Record<string, GamePresentation> = {
  minidesawar: {
    hindi: "मिनी दिसावर",
    background:
      "radial-gradient(circle at 50% 0%, rgba(255, 214, 79, 0.34), transparent 42%), linear-gradient(145deg, rgba(255, 109, 26, 0.26), rgba(39, 104, 240, 0.18))",
    shadow: "rgba(255, 214, 79, 0.28)",
  },
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
      "radial-gradient(circle at 50% 0%, rgba(255, 214, 120, 0.38), transparent 44%), linear-gradient(145deg, rgba(168, 98, 8, 0.92), rgba(62, 38, 4, 0.96))",
    shadow: "rgba(255, 196, 67, 0.32)",
  },
  olddesawar: {
    hindi: "पुराना दिसावर",
    background:
      "radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.32), transparent 44%), linear-gradient(145deg, rgba(120, 82, 10, 0.9), rgba(48, 32, 4, 0.95))",
    shadow: "rgba(212, 175, 55, 0.28)",
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

export function resolveGameKey(shiftName: string | undefined) {
  const key = normalizeShiftName(shiftName);

  return PRESENTATION_ALIASES[key] ?? key;
}

function tokenizeGameName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function buildHindiFromTokens(name: string) {
  const tokens = tokenizeGameName(name);

  if (!tokens.length) {
    return "रिज़ल्ट";
  }

  return tokens.map((token) => TOKEN_HINDI[token] ?? token.toUpperCase()).join(" ");
}

function getPresentation(shiftName: string | undefined) {
  const key = resolveGameKey(shiftName);

  return GAME_PRESENTATION[key] ?? DEFAULT_PRESENTATION;
}

export function getGameCardLabel(shiftName: string | undefined, featured = false) {
  if (featured || isMiniDesawarName(shiftName)) {
    return getPresentation(shiftName).hindi || "मिनी दिसावर";
  }

  const presentation = getPresentation(shiftName);

  if (presentation.hindi) {
    return presentation.hindi;
  }

  return buildHindiFromTokens(shiftName || "") || shiftName || "रिज़ल्ट";
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

export function getGameCardLabelClassName() {
  return "today-card-label today-card-label-hindi";
}

export function isDesawarStripGame(name: string | undefined) {
  const key = resolveGameKey(name);

  return key === "disawar" || key === "olddesawar";
}

export function getStripClassName(shiftName: string | undefined, isLive: boolean, isPriority: boolean) {
  const classes = ["result-strip"];

  if (isPriority) {
    classes.push("is-priority");
  }

  if (isDesawarStripGame(shiftName)) {
    classes.push("is-desawar");
  }

  classes.push(isLive ? "is-live" : "is-waiting");

  return classes.join(" ");
}
