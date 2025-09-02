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
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  }

  // Instagram
  if (hostname.includes("instagram.com")) {
    return (
      <iframe
        src={`https://www.instagram.com/p/DFg9pIASoq_/embed`}
        width="400"
        height="480"
        frameBorder="0"
        scrolling="no"
      ></iframe>
    );
  }

  // TikTok
  if (hostname.includes("tiktok.com")) {
    return (
      <>
        <blockquote
          className="tiktok-embed"
          cite="https://www.tiktok.com/@scout2015/video/6718335390845095173"
          data-video-id="6718335390845095173"
          style={{ width: "100%", height: "500px" }}
        ></blockquote>
        <script async src="https://www.tiktok.com/embed.js"></script>
      </>
    );
  }

  // SoundCloud
  if (hostname.includes("soundcloud.com")) {
    return (
      <iframe
        width="100%"
        height="166"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`}
      ></iframe>
    );
  }

  // Spotify
  if (hostname.includes("spotify.com")) {
    const parts = url.split("/");
    const trackId = parts[parts.length - 1].split("?")[0];
    return (
      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}`}
        width="300"
        height="380"
        frameBorder="0"
        allow="encrypted-media"
      ></iframe>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {url}
    </a>
  );
};

export default EmbedContent;
