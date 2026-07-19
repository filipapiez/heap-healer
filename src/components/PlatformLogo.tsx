import {
  siCursor,
  siFramer,
  siGhost,
  siGithub,
  siGooglesearchconsole,
  siNotion,
  siShopify,
  siWebflow,
  siWordpress,
  type SimpleIcon,
} from "simple-icons";

export type PlatformLogoName =
  | "cursor"
  | "framer"
  | "ghost"
  | "github"
  | "gsc"
  | "lovable"
  | "notion"
  | "shopify"
  | "webflow"
  | "wordpress";

const ICONS: Record<Exclude<PlatformLogoName, "lovable">, SimpleIcon> = {
  cursor: siCursor,
  framer: siFramer,
  ghost: siGhost,
  github: siGithub,
  gsc: siGooglesearchconsole,
  notion: siNotion,
  shopify: siShopify,
  webflow: siWebflow,
  wordpress: siWordpress,
};

export function PlatformLogo({
  name,
  size = 28,
  className,
}: {
  name: PlatformLogoName;
  size?: number;
  className?: string;
}) {
  if (name === "lovable") {
    return (
      <img src="/platforms/lovable.svg" alt="" width={size} height={size} className={className} />
    );
  }

  const icon = ICONS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d={icon.path} fill={`#${icon.hex}`} />
    </svg>
  );
}
