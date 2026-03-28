// src/components/TarotInterpretation.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TarotCard {
  id: number;
  nameEn: string;
  nameCn: string;
  image: string;
  type: 'major' | 'minor';
}

interface DrawnCardResult {
  card: TarotCard;
  orientation: 'upright' | 'reversed';
}

interface TarotInterpretationProps {
  drawnCards: DrawnCardResult[];
  onRestart?: () => void;
}

export function TarotInterpretation({ drawnCards, onRestart }: TarotInterpretationProps) {
  const [visibleIndex, setVisibleIndex] = useState(-1);
  const [showInterpretation, setShowInterpretation] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      let current = 0;
      setVisibleIndex(current);

      const interval = setInterval(() => {
        current++;
        setVisibleIndex(current);
        if (current >= drawnCards.length) {
          clearInterval(interval);
          setTimeout(() => setShowInterpretation(true), 500);
        }
      }, 400);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(startTimer);
  }, [drawnCards.length]);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-amber-50 overflow-y-auto overflow-x-hidden font-serif">
      <div className="fixed inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')` }} 
      />

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <header className={cn(
          "text-center mb-20 transition-all duration-1000 ease-out transform",
          visibleIndex >= 0 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        )}>
          <div className="inline-flex items-center gap-2 text-amber-500/80 mb-4 text-sm tracking-[0.2em] uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Destiny Revealed</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent pb-2">
            命 运 的 指 引
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto mt-6" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-start">
          {drawnCards.map((item, index) => {
            const isVisible = index <= visibleIndex;
            const isReversed = item.orientation === 'reversed';

            return (
              <div 
                key={`${item.card.id}-${index}`}
                className={cn(
                  "flex flex-col items-center transition-all duration-1000 ease-out transform",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative group perspective-1000 mb-8">
                  <div className={cn(
                    "relative w-[220px] h-[380px] rounded-xl shadow-2xl transition-all duration-700",
                    "border-[3px] border-amber-900/40 bg-black",
                    isVisible && "shadow-[0_0_30px_rgba(251,191,36,0.15)]",
                    isReversed && "rotate-180"
                  )}>
                    <img 
                      src={item.card.image} 
                      alt={item.card.nameCn}
                      className="w-full h-full object-cover rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none rounded-lg" />
                  </div>

                  {isReversed && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/30 text-red-200 text-xs shadow-lg backdrop-blur-sm whitespace-nowrap z-20">
                      <RefreshCw className="w-3 h-3" />
                      <span>逆位能量</span>
                    </div>
                  )}
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-amber-100 mb-1 tracking-wide">
                    {item.card.nameCn}
                  </h2>
                  <p className="text-sm font-serif italic text-amber-400/60 font-medium">
                    {item.card.nameEn}
                  </p>
                </div>

                <div className={cn(
                  "w-full bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm transition-all duration-1000 delay-500",
                  showInterpretation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                )}>
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                      isReversed ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"
                    )}>
                      {isReversed ? "Reversed" : "Upright"}
                    </span>
                    <span className="text-xs text-white/40 uppercase tracking-widest">
                      Position {index + 1}
                    </span>
                  </div>
                  
                  <p className="text-sm leading-relaxed text-gray-300 text-justify">
                    {isReversed 
                      ? "逆位通常代表能量的阻塞、内在的探索或需要重新评估的领域。" 
                      : "正位代表该牌核心能量的直接体现，事情正在顺畅发展。"}
                  </p>
                  
                  <div className="mt-4 flex items-center gap-2 text-xs text-amber-500/50 cursor-pointer hover:text-amber-400 transition-colors">
                    <span>查看完整详情</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={cn(
          "mt-24 text-center pb-12 transition-all duration-1000 delay-700",
          showInterpretation ? "opacity-100" : "opacity-0"
        )}>
          <Button 
            onClick={onRestart}
            variant="outline"
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 px-8 py-6 text-lg rounded-full transition-all duration-300"
          >
            <RefreshCw className="mr-2 w-5 h-5" />
            开启新的占卜
          </Button>
        </div>
      </div>
    </div>
  );
}
