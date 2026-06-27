// components/site/VideoModal.tsx
"use client";

import { X } from "lucide-react";

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

function getYoutubeEmbedUrl(url: string) {
  if (!url) return "";

  const videoId =
    url.match(/youtu\.be\/([^?&]+)/)?.[1] ||
    url.match(/[?&]v=([^?&]+)/)?.[1] ||
    url.match(/youtube\.com\/embed\/([^?&]+)/)?.[1];

  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
}

export function VideoModal({
  open,
  onClose,
  videoUrl,
  title = "Assista ao vídeo",
}: VideoModalProps) {
  if (!open) return null;

  const embedUrl = getYoutubeEmbedUrl(videoUrl);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 px-3 py-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-950">{title}</h3>
            <p className="text-sm text-slate-500">
              Conheça a Previsiva em 1 minuto.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar vídeo"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="bg-slate-950 p-2 md:p-4">
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/70">
                Adicione a URL do vídeo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}