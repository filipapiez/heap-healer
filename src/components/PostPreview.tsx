import { useMemo, useState, useEffect } from "react";

export type PreviewMedia = {
  id: string;
  url: string | null;
  kind: "image" | "video";
};

type Props = {
  platforms: string[];
  caption: string;
  overrides: Record<string, { caption?: string }>;
  media: PreviewMedia[];
  accountName?: string;
  accountHandle?: string;
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  threads: "Threads",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  meta: "Facebook",
};

export function PostPreview({ platforms, caption, overrides, media, accountName, accountHandle }: Props) {
  const list = useMemo(
    () => (platforms.length ? platforms : ["instagram"]),
    [platforms],
  );
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx >= list.length) setIdx(0);
  }, [list, idx]);

  const platform = list[Math.min(idx, list.length - 1)];
  const text = overrides[platform]?.caption?.trim() || caption;
  const name = accountName || "your.account";
  const handle = accountHandle || name;

  const prev = () => setIdx((i) => (i - 1 + list.length) % list.length);
  const next = () => setIdx((i) => (i + 1) % list.length);

  return (
    <div className="sticky top-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/60">
          Preview
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={list.length < 2}
            className="grid h-7 w-7 place-items-center rounded-full border border-[var(--color-mist-200)] text-sm disabled:opacity-30"
            aria-label="Previous platform"
          >
            ‹
          </button>
          <div className="min-w-[6rem] text-center text-sm font-medium">
            {PLATFORM_LABELS[platform] ?? platform}
          </div>
          <button
            type="button"
            onClick={next}
            disabled={list.length < 2}
            className="grid h-7 w-7 place-items-center rounded-full border border-[var(--color-mist-200)] text-sm disabled:opacity-30"
            aria-label="Next platform"
          >
            ›
          </button>
        </div>
      </div>

      {list.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {list.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => setIdx(i)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                i === idx
                  ? "bg-[var(--color-ink-700)] text-white"
                  : "bg-[var(--color-mist-200)]/50 text-[var(--color-ink-700)]/70"
              }`}
            >
              {PLATFORM_LABELS[p] ?? p}
            </button>
          ))}
        </div>
      )}

      <PhoneFrame>
        <PlatformMock platform={platform} caption={text} media={media} name={name} handle={handle} />
      </PhoneFrame>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="relative rounded-[2.5rem] bg-black p-3 shadow-2xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-white">
          <div className="pointer-events-none absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="h-[560px] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

function MediaBlock({ media, aspect = "square" }: { media: PreviewMedia[]; aspect?: "square" | "vertical" | "wide" }) {
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [media.length]);
  if (media.length === 0) {
    return (
      <div className={`grid place-items-center bg-neutral-100 text-xs text-neutral-400 ${aspectClass(aspect)}`}>
        No media
      </div>
    );
  }
  const m = media[Math.min(i, media.length - 1)];
  return (
    <div className={`relative bg-black ${aspectClass(aspect)}`}>
      {m.kind === "video" ? (
        <video src={m.url ?? undefined} className="h-full w-full object-cover" controls playsInline />
      ) : (
        <img src={m.url ?? ""} alt="" className="h-full w-full object-cover" />
      )}
      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setI((v) => (v - 1 + media.length) % media.length)}
            className="absolute left-1 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-xs text-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setI((v) => (v + 1) % media.length)}
            className="absolute right-1 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-xs text-white"
          >
            ›
          </button>
          <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
            {media.map((_, k) => (
              <span key={k} className={`h-1 w-1 rounded-full ${k === i ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function aspectClass(a: "square" | "vertical" | "wide") {
  if (a === "vertical") return "aspect-[9/16]";
  if (a === "wide") return "aspect-video";
  return "aspect-square";
}

function PlatformMock({
  platform,
  caption,
  media,
  name,
  handle,
}: {
  platform: string;
  caption: string;
  media: PreviewMedia[];
  name: string;
  handle: string;
}) {
  if (platform === "instagram") {
    return (
      <div className="text-[13px] text-neutral-900">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-400" />
          <div className="flex-1 truncate font-semibold">{handle}</div>
          <span className="text-lg leading-none">⋯</span>
        </div>
        <MediaBlock media={media} aspect="square" />
        <div className="flex items-center gap-3 px-3 pt-2 text-lg">♡ 💬 ↗<span className="ml-auto">⌘</span></div>
        <div className="px-3 pt-1 text-xs font-semibold">1,234 likes</div>
        <div className="px-3 pb-3 pt-1">
          <span className="font-semibold">{handle}</span>{" "}
          <span className="whitespace-pre-wrap">{caption || "Your caption will appear here"}</span>
        </div>
      </div>
    );
  }

  if (platform === "threads") {
    return (
      <div className="p-3 text-[13px] text-neutral-900">
        <div className="flex gap-2">
          <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-800" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className="truncate font-semibold">{handle}</span>
              <span className="text-xs text-neutral-400">now</span>
            </div>
            <div className="mt-1 whitespace-pre-wrap">{caption || "What's new?"}</div>
            {media.length > 0 && (
              <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200">
                <MediaBlock media={media} aspect="square" />
              </div>
            )}
            <div className="mt-2 flex gap-4 text-neutral-500">♡ 💬 ↻ ↗</div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "tiktok") {
    return (
      <div className="relative h-full bg-black text-white">
        <MediaBlock media={media} aspect="vertical" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="text-sm font-semibold">@{handle}</div>
          <div className="mt-1 line-clamp-3 text-xs whitespace-pre-wrap">
            {caption || "Your caption will appear here"}
          </div>
        </div>
        <div className="absolute bottom-16 right-2 flex flex-col items-center gap-3 text-lg">
          <span>♡</span><span>💬</span><span>↗</span>
        </div>
      </div>
    );
  }

  if (platform === "youtube") {
    return (
      <div className="text-[13px] text-neutral-900">
        <MediaBlock media={media} aspect="wide" />
        <div className="flex gap-2 p-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-red-500" />
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 font-semibold">{caption || "Your video title"}</div>
            <div className="mt-1 text-xs text-neutral-500">{handle} · 0 views · now</div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "linkedin") {
    return (
      <div className="text-[13px] text-neutral-900">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="h-9 w-9 rounded-full bg-blue-700" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{name}</div>
            <div className="text-xs text-neutral-500">now · 🌐</div>
          </div>
        </div>
        <div className="whitespace-pre-wrap px-3 pb-2 text-[13px]">
          {caption || "Share an update…"}
        </div>
        {media.length > 0 && <MediaBlock media={media} aspect="square" />}
        <div className="flex justify-around px-3 py-2 text-xs text-neutral-500">👍 Like · 💬 Comment · ↻ Repost · ↗ Send</div>
      </div>
    );
  }

  // Facebook / Meta default
  return (
    <div className="text-[13px] text-neutral-900">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="h-9 w-9 rounded-full bg-blue-600" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{name}</div>
          <div className="text-xs text-neutral-500">Just now · 🌐</div>
        </div>
      </div>
      <div className="whitespace-pre-wrap px-3 pb-2">{caption || "What's on your mind?"}</div>
      {media.length > 0 && <MediaBlock media={media} aspect="square" />}
      <div className="flex justify-around px-3 py-2 text-xs text-neutral-500">👍 Like · 💬 Comment · ↗ Share</div>
    </div>
  );
}