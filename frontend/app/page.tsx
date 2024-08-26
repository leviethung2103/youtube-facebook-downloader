// app/page.tsx
"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  Youtube,
  Facebook,
  Instagram,
  Linkedin,
  Play
} from "lucide-react";

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  quality: string[];
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  const isYouTubeUrl = (url: string) => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const isFacebookUrl = (url: string) => {
    const facebookRegex =
      /^(https?:\/\/)?(www\.)?(facebook\.com)\/.+$/;
    return facebookRegex.test(url);
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    setVideoInfo(null);

    try {
      if (isYouTubeUrl(url)) {
        // Fetch video information
        const infoResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube-info`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        if (!infoResponse.ok) {
          throw new Error("Failed to fetch video information");
        }

        const videoData = await infoResponse.json();
        setVideoInfo(videoData);
      } else if (isFacebookUrl(url)) {
        // Fetch video information
        const infoResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/facebook-info`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        if (!infoResponse.ok) {
          throw new Error("Failed to fetch video information");
        }

        const videoData = await infoResponse.json();
        setVideoInfo(videoData);
      } else {
        throw new Error("Unsupported URL. Please enter a valid YouTube or Facebook URL.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while processing the video. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/youtube-download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to download video");
      }

      const data = await response.json();
      const downloadUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/downloads/${encodeURIComponent(data.filename)}`;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while downloading the video. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Download Videos From Your Favourite Social Media
        </h1>
        <div className="flex justify-center space-x-4 mb-6">
          <Youtube className="text-red-500" size={24} />
          <Facebook className="text-blue-600" size={24} />
          <Instagram className="text-pink-500" size={24} />
          <Linkedin className="text-blue-700" size={24} />
        </div>
        <form onSubmit={handleProcess} className="space-y-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube video URL"
            required
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={processing}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded flex items-center justify-center transition duration-300 ease-in-out"
          >
            {processing ? (
              <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
            ) : (
              <>
                <Play className="mr-2" size={20} />
                Process Video
              </>
            )}
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        {videoInfo && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">{videoInfo.title}</h2>
            <img src={videoInfo.thumbnail} alt="Video thumbnail" className="w-full mb-2 rounded" />
            <p><strong>Duration:</strong> {videoInfo.duration}</p>
            <p><strong>Quality:</strong> {videoInfo.quality.join(", ")}</p>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded flex items-center justify-center transition duration-300 ease-in-out"
            >
              {downloading ? (
                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
              ) : (
                <>
                  <ArrowDownToLine className="mr-2" size={20} />
                  Download Video
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}