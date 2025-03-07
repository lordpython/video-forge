import React, { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

export interface Props {
  audioUrl?: string;
  audioData?: string; // base64 encoded audio data
  height?: number;
  waveColor?: string;
  progressColor?: string;
  barWidth?: number;
  barGap?: number;
  responsive?: boolean;
  cursorColor?: string;
  showPlayButton?: boolean;
  showTime?: boolean;
  className?: string;
}

export const AudioWaveform: React.FC<Props> = ({
  audioUrl,
  audioData,
  height = 100,
  waveColor = "#4c1d95",
  progressColor = "#8b5cf6",
  barWidth = 2,
  barGap = 1,
  responsive = true,
  cursorColor = "#8b5cf6",
  showPlayButton = true,
  showTime = true,
  className = "",
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (waveformRef.current) {
      // Create WaveSurfer instance
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        height,
        waveColor,
        progressColor,
        barWidth,
        barGap,
        responsive,
        cursorColor,
        normalize: true,
      });

      // Set up event listeners
      ws.on("play", () => setIsPlaying(true));
      ws.on("pause", () => setIsPlaying(false));
      ws.on("ready", () => {
        setDuration(formatTime(ws.getDuration()));
      });
      ws.on("audioprocess", () => {
        setCurrentTime(formatTime(ws.getCurrentTime()));
      });
      ws.on("seek", () => {
        setCurrentTime(formatTime(ws.getCurrentTime()));
      });

      wavesurfer.current = ws;

      // Load audio
      if (audioUrl) {
        ws.load(audioUrl);
      } else if (audioData) {
        // Load from base64
        const audio = new Audio();
        audio.src = `data:audio/mp3;base64,${audioData}`;
        ws.loadMediaElement(audio);
        audio.load();
      }

      return () => {
        ws.destroy();
      };
    }
  }, [audioUrl, audioData, height, waveColor, progressColor, barWidth, barGap, responsive, cursorColor]);

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const handleStop = () => {
    if (wavesurfer.current) {
      wavesurfer.current.stop();
      setIsPlaying(false);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {showPlayButton && (
          <div className="flex gap-2">
            <button
              onClick={handlePlayPause}
              className="flex items-center justify-center w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>
            <button
              onClick={handleStop}
              className="flex items-center justify-center w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
              aria-label="Stop"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="6" width="12" height="12"></rect>
              </svg>
            </button>
          </div>
        )}
        {showTime && (
          <div className="text-sm font-mono text-gray-300">
            {currentTime} / {duration}
          </div>
        )}
      </div>
      <div ref={waveformRef} className="w-full bg-gray-800 rounded-lg overflow-hidden" />
    </div>
  );
};
