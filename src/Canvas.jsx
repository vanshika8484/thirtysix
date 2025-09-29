import { useEffect, useRef, useState, useCallback } from "react";
import canvasImages from "./canvasimages";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// Memoize the image loading to prevent unnecessary re-renders
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

function Canvas({ details }) {
  const { startIndex, numImages, duration, size, top, left, zIndex } = details;

  const [index, setIndex] = useState({ value: startIndex });
  const canvasRef = useRef(null);

  const updateCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const scale = window.devicePixelRatio;
    
    try {
      const img = await loadImage(canvasImages[Math.round(index.value)]);
      
      canvas.width = canvas.offsetWidth * scale;
      canvas.height = canvas.offsetHeight * scale;
      canvas.style.width = `${canvas.offsetWidth}px`;
      canvas.style.height = `${canvas.offsetHeight}px`;
      
      ctx.scale(scale, scale);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
    } catch (error) {
      console.error("Error loading image:", error);
    }
  }, [index.value]);

  useGSAP(() => {
    const animation = gsap.to(index, {
      value: startIndex + numImages - 1,
      duration: duration,
      repeat: -1,
      ease: "linear",
      onUpdate: () => {
        setIndex(prev => ({ ...prev, value: Math.round(index.value) }));
      },
    });

    gsap.from(canvasRef.current, {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
    });

    return () => {
      animation.kill();
    };
  }, { scope: canvasRef });

  useEffect(() => {
    updateCanvas();
  }, [index.value, updateCanvas]);

  const canvasStyle = {
    width: `${size * 1.8}px`,
    height: `${size * 1.8}px`,
    top: `${top}%`,
    left: `${left}%`,
    zIndex: zIndex,
    transform: 'translateZ(0)', // Hardware acceleration
    willChange: 'transform, opacity' // Optimize for animations
  };

  return (
    <canvas
      data-scroll
      data-scroll-speed={Math.random().toFixed(1)}
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={canvasStyle}
      aria-hidden="true"
    />
  );
}

export default Canvas;