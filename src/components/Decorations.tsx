'use client';

import { useEffect, useState } from 'react';
import { Moon, Star, Sparkles } from 'lucide-react';

export function StarField() {
  const [stars, setStars] = useState<Array<{
    id: number;
    left: number;
    top: number;
    size: number;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    setStars(Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
    })));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full opacity-30"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

export function FloatingMoon() {
  return (
    <div className="fixed top-10 right-10 pointer-events-none opacity-20 animate-float">
      <Moon className="w-32 h-32 text-purple-300" fill="currentColor" />
    </div>
  );
}

export function MysticalBackground() {
  return (
    <>
      <StarField />
      <FloatingMoon />
    </>
  );
}
