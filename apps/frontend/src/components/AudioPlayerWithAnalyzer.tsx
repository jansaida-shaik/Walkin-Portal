'use client';

import { useRef, useEffect, useState } from 'react';

interface AudioPlayerWithAnalyzerProps {
  src: string;
}

export default function AudioPlayerWithAnalyzer({ src }: AudioPlayerWithAnalyzerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [loading, setLoading] = useState(true);

  // Format seconds to mm:ss
  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch and decode audio to pre-render the waveform
  useEffect(() => {
    setLoading(true);
    let active = true;

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.arrayBuffer();
      })
      .then((arrayBuffer) => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        return audioCtx.decodeAudioData(arrayBuffer);
      })
      .then((buffer) => {
        if (active) {
          setAudioBuffer(buffer);
          setDuration(buffer.duration);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to pre-render waveform, falling back to basic visualizer:', err);
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [src]);

  // Redraw waveform when currentTime, duration, or buffer changes
  useEffect(() => {
    drawWaveform();
  }, [audioBuffer, currentTime, duration]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // If still loading or buffer is missing, draw a flat loading bar
    if (loading || !audioBuffer) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(0, height / 2 - 1, width, 2);
      return;
    }

    const channelData = audioBuffer.getChannelData(0);
    const progressPercent = currentTime / duration;
    const progressX = width * progressPercent;

    // Draw bars
    const numBars = 50;
    const barWidth = 3;
    const gap = 2;
    const step = Math.floor(channelData.length / numBars);

    for (let i = 0; i < numBars; i++) {
      let max = 0;
      const start = i * step;
      for (let j = 0; j < step; j++) {
        const val = Math.abs(channelData[start + j]);
        if (val > max) max = val;
      }

      // scale the amplitude
      let amplitude = max;
      
      // If playing, add a tiny subtle animation/bounce to active playhead bars
      const barX = i * (barWidth + gap);
      let animatedHeight = amplitude * height * 0.85;

      if (isPlaying && Math.abs(barX - progressX) < 25) {
        // Subtle bouncing animation for bars near the playhead
        const bounce = Math.sin(Date.now() * 0.015 + i) * 2.5;
        animatedHeight = Math.max(4, animatedHeight + bounce);
      }

      const finalHeight = Math.max(3, animatedHeight);
      const y = (height - finalHeight) / 2;

      // Active vs Inactive coloring
      if (barX < progressX) {
        // Active playhead gradient
        const activeGradient = ctx.createLinearGradient(0, y, 0, y + finalHeight);
        activeGradient.addColorStop(0, '#a855f7'); // neon purple
        activeGradient.addColorStop(1, '#6366f1'); // neon indigo
        ctx.fillStyle = activeGradient;
      } else {
        // Muted inactive gray
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      }

      // Draw rounded rectangle for premium look
      drawRoundedRect(ctx, barX, y, barWidth, finalHeight, 1.5);
    }
  };

  // Helper to draw rounded bars
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  };

  // Bouncing animation frame loop for active playhead
  useEffect(() => {
    let animationFrameId: number;
    const renderLoop = () => {
      if (isPlaying) {
        drawWaveform();
        animationFrameId = requestAnimationFrame(renderLoop);
      }
    };
    if (isPlaying) {
      animationFrameId = requestAnimationFrame(renderLoop);
    }
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch((e) => console.warn('Audio playback failed:', e));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Click on waveform to seek
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || loading) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    
    audio.currentTime = percentage * duration;
    setCurrentTime(audio.currentTime);
    drawWaveform();
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '320px',
        height: '42px',
        padding: '0 12px',
        background: 'rgba(30, 41, 59, 0.72)', // dark slate glass
        borderRadius: '999px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 18px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxSizing: 'border-box',
      }}
    >
      {/* Invisible HTML5 Audio Tag */}
      <audio
        ref={audioRef}
        src={src}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        disabled={loading}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: loading
            ? 'rgba(255, 255, 255, 0.1)'
            : 'linear-gradient(135deg, #a855f7, #6366f1)',
          border: 'none',
          color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isPlaying ? '0.7rem' : '0.8rem',
          boxShadow: loading ? 'none' : '0 2px 8px rgba(99, 102, 241, 0.4)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          outline: 'none',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'scale(1.06)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        {loading ? (
          <span style={{ fontSize: '0.65rem' }}>⏳</span>
        ) : isPlaying ? (
          '⏸'
        ) : (
          '▶'
        )}
      </button>

      {/* Waveform Canvas */}
      <div
        onClick={handleTimelineClick}
        style={{
          flex: 1,
          height: '28px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        <canvas
          ref={canvasRef}
          width={180}
          height={28}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      {/* Monospace Timer Label */}
      <div
        style={{
          fontSize: '0.74rem',
          fontFamily: 'monospace',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.7)',
          letterSpacing: '0.02em',
          minWidth: '78px',
          textAlign: 'right',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
}
