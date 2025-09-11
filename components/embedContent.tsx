// components/EmbedContent.tsx
import React from "react";

interface EmbedContentProps {
  url: string;
}

const EmbedContent: React.FC<EmbedContentProps> = ({ url }) => {
  if (!url) return null;

  // Detect platform
  const hostname = new URL(url).hostname;

  // YouTube
  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
    const videoId = url.includes("youtu.be")
      ? url.split("/").pop()
      : new URL(url).searchParams.get("v");
    if (!videoId) return null;
    return (
      <div className="relative w-full aspect-video">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Instagram
  if (hostname.includes("instagram.com")) {
    return (
      <div className="relative w-full max-w-md mx-auto" style={{ aspectRatio: '400/480' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.instagram.com/p/DFg9pIASoq_/embed`}
          frameBorder="0"
          scrolling="no"
        ></iframe>
      </div>
    );
  }

  // TikTok
  if (hostname.includes("tiktok.com")) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <blockquote
          className="tiktok-embed"
          cite="https://www.tiktok.com/@scout2015/video/6718335390845095173"
          data-video-id="6718335390845095173"
          style={{ width: "100%", minHeight: "500px" }}
        ></blockquote>
        <script async src="https://www.tiktok.com/embed.js"></script>
      </div>
    );
  }

  // SoundCloud
  if (hostname.includes("soundcloud.com")) {
    return (
      <div className="w-full">
        <iframe
          className="w-full h-32 sm:h-40"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`}
        ></iframe>
      </div>
    );
  }

  // Spotify
  if (hostname.includes("spotify.com")) {
    const parts = url.split("/");
    const trackId = parts[parts.length - 1].split("?")[0];
    return (
      <div className="relative w-full max-w-sm mx-auto" style={{ aspectRatio: '280/380' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://open.spotify.com/embed/track/${trackId}`}
          frameBorder="0"
          allow="encrypted-media"
        ></iframe>
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {url}
    </a>
  );
};

export default EmbedContent;
