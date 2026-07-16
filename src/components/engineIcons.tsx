// =============================================================
// engineIcons.tsx — real brand icons for the AI engines
// Uses the `simple-icons` package (npm i simple-icons), which
// ships the official vector paths and brand colors for these
// marks. We deliberately do NOT hand-draw the logos — the
// package is the standard, maintained source.
//
//   npm i simple-icons
//
// If a slug import fails after a package update, check the
// current slug at https://simpleicons.org (search the brand)
// and adjust the import below.
// =============================================================

import {
  siChatbot, // ChatGPT (siOpenai is unavailable in simple-icons v16)
  siClaude, // Claude (if missing in your version, use siAnthropic)
  siPerplexity, // Perplexity
  siGooglegemini, // Gemini
  siGoogle, // Google
} from "simple-icons";

export type EngineName = "ChatGPT" | "Claude" | "Perplexity" | "Gemini" | "Google";

const MAP: Record<EngineName, { path: string; hex: string }> = {
  ChatGPT: { path: siChatbot.path, hex: `#${siChatbot.hex}` },
  Claude: { path: siClaude.path, hex: `#${siClaude.hex}` },
  Perplexity: { path: siPerplexity.path, hex: `#${siPerplexity.hex}` },
  Gemini: { path: siGooglegemini.path, hex: `#${siGooglegemini.hex}` },
  Google: { path: siGoogle.path, hex: `#${siGoogle.hex}` },
};

export const ENGINE_LIST: EngineName[] = ["ChatGPT", "Claude", "Perplexity", "Gemini", "Google"];

export function engineColor(name: EngineName): string {
  return MAP[name].hex;
}

export default function EngineIcon({
  name,
  size = 20,
  color, // override; defaults to the official brand color
  opacity = 1,
  title,
}: {
  name: EngineName;
  size?: number | string;
  color?: string;
  opacity?: number;
  title?: string;
}) {
  const icon = MAP[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      style={{ display: "inline-block", verticalAlign: "-0.12em", flexShrink: 0 }}
    >
      {title && <title>{title}</title>}
      <path d={icon.path} fill={color ?? icon.hex} opacity={opacity} />
    </svg>
  );
}
