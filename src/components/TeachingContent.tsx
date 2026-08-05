import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { createRoot, type Root } from "react-dom/client";
import { getVideoPosterUrl } from "@/lib/video";

const sanitizeHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "");

const LazyFacade = ({ poster, onActivate }: { poster: string | null; onActivate: () => void }) => (
  <button
    type="button"
    onClick={onActivate}
    className="lazy-video-facade group absolute inset-0 flex items-center justify-center overflow-hidden bg-black"
    aria-label="Lire la vidéo"
  >
    {poster ? (
      <>
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
      </>
    ) : (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-royal/60 to-slate-950" aria-hidden="true" />
    )}
    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 backdrop-blur-sm motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-110">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-slate-950 shadow-gold">
        <Play className="ml-0.5 h-5 w-5 fill-current" />
      </div>
    </div>
  </button>
);

const enhanceEmbeds = (container: HTMLElement) => {
  const roots: Root[] = [];
  const iframes = container.querySelectorAll<HTMLIFrameElement>(
    'iframe[src*="youtube.com/embed"], iframe[src*="youtu.be"], iframe[src*="mediadelivery.net"]',
  );

  iframes.forEach((iframe) => {
    if (iframe.dataset.lazyEnhanced === "true") return;

    const src = iframe.getAttribute("src");
    if (!src) return;

    const host =
      (iframe.closest("[data-youtube-video]") as HTMLElement | null) ??
      (iframe.parentElement as HTMLElement | null);
    if (!host) return;

    iframe.dataset.lazyEnhanced = "true";
    host.classList.add("prose-video-shell");

    if (getComputedStyle(host).position === "static") {
      host.style.position = "relative";
    }

    iframe.classList.add("prose-video-iframe");
    iframe.style.visibility = "hidden";

    const mount = document.createElement("div");
    mount.className = "prose-video-facade-root";
    host.appendChild(mount);

    const root = createRoot(mount);
    roots.push(root);

    root.render(
      <LazyFacade
        poster={getVideoPosterUrl(src)}
        onActivate={() => {
          iframe.style.visibility = "visible";
          root.unmount();
          mount.remove();
        }}
      />,
    );
  });

  return () => {
    roots.forEach((root) => {
      try {
        root.unmount();
      } catch {
        /* ignore */
      }
    });
    container.querySelectorAll(".prose-video-facade-root").forEach((node) => node.remove());
    container.querySelectorAll<HTMLIFrameElement>(".prose-video-iframe").forEach((iframe) => {
      iframe.style.visibility = "";
      delete iframe.dataset.lazyEnhanced;
    });
    container.querySelectorAll(".prose-video-shell").forEach((node) => node.classList.remove("prose-video-shell"));
  };
};

type TeachingContentProps = {
  content: string;
  className?: string;
};

const TeachingContent = ({ content, className }: TeachingContentProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  useEffect(() => {
    if (!isHtml || !ref.current) return undefined;
    return enhanceEmbeds(ref.current);
  }, [content, isHtml]);

  if (!isHtml) {
    return (
      <div className={className}>
        <div className="whitespace-pre-wrap break-words overflow-hidden [word-break:break-word] [overflow-wrap:anywhere]">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
    />
  );
};

export default TeachingContent;
