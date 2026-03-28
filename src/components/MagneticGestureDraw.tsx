'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button'; 
import { X, Loader2 } from 'lucide-react'; // 引入 Loader 图标
import { useTarotInteraction } from '@/hooks/use-tarot-interaction';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- 基础工具 ---
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// --- 类型 ---
interface TarotCard {
  id: number;
  nameEn: string;
  nameCn: string;
  image: string;
  type: 'major' | 'minor';
}

// --- 数据生成 ---
const MAJOR_ARCANA: TarotCard[] = [
  { id: 0, nameEn: "The Fool", nameCn: "愚者", image: "https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg", type: 'major' },
  { id: 1, nameEn: "The Magician", nameCn: "魔术师", image: "https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg", type: 'major' },
  { id: 2, nameEn: "The High Priestess", nameCn: "女祭司", image: "https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg", type: 'major' },
  { id: 3, nameEn: "The Empress", nameCn: "皇后", image: "https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg", type: 'major' },
  { id: 4, nameEn: "The Emperor", nameCn: "皇帝", image: "https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg", type: 'major' },
  { id: 5, nameEn: "The Hierophant", nameCn: "教皇", image: "https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg", type: 'major' },
  { id: 6, nameEn: "The Lovers", nameCn: "恋人", image: "https://upload.wikimedia.org/wikipedia/commons/3/3a/TheLovers.jpg", type: 'major' },
  { id: 7, nameEn: "The Chariot", nameCn: "战车", image: "https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg", type: 'major' },
  { id: 8, nameEn: "Strength", nameCn: "力量", image: "https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg", type: 'major' },
  { id: 9, nameEn: "The Hermit", nameCn: "隐士", image: "https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg", type: 'major' },
  { id: 10, nameEn: "Wheel of Fortune", nameCn: "命运之轮", image: "https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg", type: 'major' },
  { id: 11, nameEn: "Justice", nameCn: "正义", image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg", type: 'major' },
  { id: 12, nameEn: "The Hanged Man", nameCn: "倒吊人", image: "https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg", type: 'major' },
  { id: 13, nameEn: "Death", nameCn: "死神", image: "https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg", type: 'major' },
  { id: 14, nameEn: "Temperance", nameCn: "节制", image: "https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg", type: 'major' },
  { id: 15, nameEn: "The Devil", nameCn: "恶魔", image: "https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg", type: 'major' },
  { id: 16, nameEn: "The Tower", nameCn: "高塔", image: "https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg", type: 'major' },
  { id: 17, nameEn: "The Star", nameCn: "星星", image: "https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg", type: 'major' },
  { id: 18, nameEn: "The Moon", nameCn: "月亮", image: "https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg", type: 'major' },
  { id: 19, nameEn: "The Sun", nameCn: "太阳", image: "https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg", type: 'major' },
  { id: 20, nameEn: "Judgement", nameCn: "审判", image: "https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg", type: 'major' },
  { id: 21, nameEn: "The World", nameCn: "世界", image: "https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg", type: 'major' },
];

const generateFullDeck = (): TarotCard[] => {
  const deck = [...MAJOR_ARCANA];
  const clones = MAJOR_ARCANA.map(c => ({
      ...c,
      id: c.id + 100,
      nameEn: `(Minor) ${c.nameEn}`,
      type: 'minor' as const
  }));
  return [...deck, ...clones];
};

const FULL_TAROT_DECK = generateFullDeck();
const BACK_IMAGE = "https://www.transparenttextures.com/patterns/stardust.png"; 

// --- MediaPipe 辅助 ---
const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = src; script.crossOrigin = "anonymous";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
};

interface MagneticGestureDrawProps {
  targetCount: number;
  onComplete: (cards: { card: TarotCard, orientation: 'upright' | 'reversed' }[]) => void;
  onClose?: () => void;
}

export function MagneticGestureDraw({ targetCount = 1, onComplete, onClose }: MagneticGestureDrawProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // --- 资源加载状态 ---
  const [isResourcesReady, setIsResourcesReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [collectedCards, setCollectedCards] = useState<{ card: TarotCard, orientation: 'upright' | 'reversed' }[]>([]);
  const [isFlying, setIsFlying] = useState(false);
  
  // 初始化牌堆
  const shuffledCards = useMemo(() => {
    return [...FULL_TAROT_DECK].sort(() => Math.random() - 0.5);
  }, []);

  // Hook 保持不变
  const { status, focusedCardId, cursor, scrollOffset, processFrame, reset } = useTarotInteraction(shuffledCards.length);

  // 锁定当前卡牌
  const activeCard = useMemo(() => {
    if (focusedCardId === null) return null;
    return shuffledCards[focusedCardId];
  }, [focusedCardId, shuffledCards]);

  const activeCardRef = useRef<TarotCard | null>(null);
  useEffect(() => { activeCardRef.current = activeCard; }, [activeCard]);

  // --- 关键修复：图片预加载 ---
  useEffect(() => {
    let mounted = true;
    let loadedCount = 0;
    const totalImages = shuffledCards.length;

    // 并行加载所有图片
    shuffledCards.forEach((card) => {
      const img = new Image();
      img.src = card.image;
      
      const onFinish = () => {
        if (!mounted) return;
        loadedCount++;
        const percent = Math.round((loadedCount / totalImages) * 100);
        setLoadingProgress(percent);
        
        if (loadedCount === totalImages) {
          // 给一点缓冲时间，让 UI 看起来更自然
          setTimeout(() => {
             if (mounted) setIsResourcesReady(true);
          }, 500);
        }
      };

      img.onload = onFinish;
      img.onerror = onFinish; // 即使加载失败也继续，防止卡死
    });

    return () => { mounted = false; };
  }, [shuffledCards]);


  // --- 交互流程 ---
  useEffect(() => {
    if (status === 'REVEALED') {
      const drawnCard = activeCardRef.current;
      if (!drawnCard) { reset(); return; }
      if (collectedCards.some(c => c.card.id === drawnCard.id)) return;

      const orientation = Math.random() > 0.5 ? 'upright' : 'reversed';
      
      const timer = setTimeout(() => {
        setIsFlying(true); 
        setTimeout(() => {
             setCollectedCards(prev => {
                const newCollection = [...prev, { card: drawnCard, orientation }];
                if (newCollection.length >= targetCount) {
                    setTimeout(() => onComplete(newCollection), 500);
                }
                return newCollection;
             });
             setIsFlying(false);
             reset(); 
        }, 600); 
      }, 1000); 

      return () => clearTimeout(timer);
    }
  }, [status, targetCount, onComplete, reset, collectedCards]);

  // --- MediaPipe 初始化 (只有当资源准备好后才启动) ---
  useEffect(() => {
    if (!isResourcesReady) return; // 等待图片加载完成

    let hands: any;
    let camera: any;

    const init = async () => {
      try {
        await loadScript(`https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js`);
        await loadScript(`https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js`);
        
        const Hands = (window as any).Hands;
        const Camera = (window as any).Camera;
        
        hands = new Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}` });
        
        hands.setOptions({ 
            maxNumHands: 1, 
            modelComplexity: 0, 
            minDetectionConfidence: 0.5, 
            minTrackingConfidence: 0.5 
        });
        
        hands.onResults((res: any) => { 
            if (res.multiHandLandmarks?.[0]) processFrame(res.multiHandLandmarks[0]); 
        });

        if (videoRef.current) {
          camera = new Camera(videoRef.current, {
            onFrame: async () => { if (videoRef.current) await hands.send({ image: videoRef.current }); },
            width: 640, height: 480 
          });
          await camera.start();
        }
      } catch(e) { console.error("Init Error:", e); }
    };
    init();

    return () => {
        if (hands) hands.close();
        if (camera) camera.stop();
    };
  }, [isResourcesReady]); // 依赖项改变：只在资源准备好后运行

  // --- 样式计算 ---
  const getCardStyle = (index: number, card: TarotCard) => {
    const isCollected = collectedCards.some(c => c.card.id === card.id);
    const isFlyingTarget = isFlying && activeCard?.id === card.id;
    
    if (isCollected || isFlyingTarget) return { display: 'none' };

    const centerIndex = (scrollOffset / 100) * (shuffledCards.length - 1);
    const dist = index - centerIndex;
    if (Math.abs(dist) > 10) return { display: 'none' };

    const left = 50 + (dist * 7); 
    const rotate = dist * 3;
    let y = 0;
    let scale = 1;

    if (status === 'HOVER' && index === focusedCardId) {
       y = -60; scale = 1.3;
    }

    const isActive = index === focusedCardId;
    const isGrabbedOrRevealed = status === 'GRABBED' || status === 'REVEALED';
    
    return {
      left: `${left}%`,
      transform: `translate(-50%, ${y}px) rotate(${rotate}deg) scale(${scale})`,
      zIndex: 100 - Math.abs(Math.round(dist)),
      opacity: (isActive && isGrabbedOrRevealed) ? 0 : 1,
      transition: isGrabbedOrRevealed ? 'none' : 'transform 0.1s ease-out, left 0.1s linear'
    };
  };

  const isComplete = collectedCards.length >= targetCount;

  // --- 如果还在加载资源，显示 Loading 界面 ---
  if (!isResourcesReady) {
    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-serif text-amber-100">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-amber-500" />
            <div className="text-lg tracking-widest mb-2">正在感应牌灵...</div>
            <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }} 
                />
            </div>
            <div className="mt-2 text-xs opacity-50">{loadingProgress}%</div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 overflow-hidden font-serif select-none cursor-none">
      
      {/* 顶部 HUD */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-[60]">
         <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full transition-colors duration-300", 
               status === 'IDLE' ? "bg-white/50" : 
               status === 'GRABBED' ? "bg-amber-400 animate-pulse" : "bg-purple-400"
            )} />
            <span className="text-sm font-medium tracking-wide text-white/80">
              {status === 'IDLE' ? "左右移动寻找感应" :
               status === 'HOVER' ? "捏合手指选中" :
               status === 'GRABBED' ? "保持捏合..." : "命运显现"}
            </span>
         </div>

         <div className="flex gap-2">
            {collectedCards.map((item, idx) => (
                <div key={idx} className="w-8 h-12 rounded border border-white/20 overflow-hidden">
                    <img src={item.card.image} className="w-full h-full object-cover" />
                </div>
            ))}
            {Array.from({ length: targetCount - collectedCards.length }).map((_, idx) => (
                <div key={`empty-${idx}`} className="w-8 h-12 rounded border border-dashed border-white/10" />
            ))}
         </div>
      </div>

      <Button variant="ghost" className="absolute top-4 right-4 text-white/30 z-[60]" onClick={onClose}><X /></Button>

      {/* 视频背景 */}
      <div className="absolute inset-0 pointer-events-none opacity-20 grayscale contrast-125">
        <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" playsInline muted autoPlay />
      </div>

      {/* 交互区域 */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        
        {/* 光标 */}
        {!isComplete && (
           <div 
             className="absolute z-[200] -translate-x-1/2 -translate-y-1/2 will-change-transform"
             style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
           >
             <div className={cn(
               "w-12 h-12 rounded-full border border-dashed flex items-center justify-center transition-all duration-200",
               status === 'GRABBED' ? "border-amber-400 scale-75 border-solid bg-amber-400/20" : "border-white/40"
             )}>
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
             </div>
           </div>
        )}

        {/* 牌堆 */}
        {!isComplete && (
        <div className="absolute bottom-0 w-full h-[350px]">
          {shuffledCards.map((card, index) => (
            <div
              key={card.id}
              className="absolute bottom-16 w-[120px] h-[200px] origin-bottom will-change-transform"
              style={getCardStyle(index, card) as any}
            >
              <div className={cn(
                "w-full h-full rounded bg-slate-900 border border-white/10 shadow-xl relative overflow-hidden",
                status === 'HOVER' && index === focusedCardId && "border-amber-400 shadow-amber-900/50"
              )}>
                 <div className="absolute inset-1 opacity-40" style={{ backgroundImage: `url(${BACK_IMAGE})` }} />
              </div>
            </div>
          ))}
        </div>
        )}

        {/* 抓取中 */}
        {status === 'GRABBED' && activeCard && (
          <div 
            className="absolute z-[999] w-[120px] h-[200px] pointer-events-none will-change-transform"
            style={{
              left: `${cursor.x}%`, top: `${cursor.y}%`,
              transform: 'translate(-50%, -60%) rotate(5deg)'
            }}
          >
            <div className="w-full h-full rounded bg-slate-800 border-2 border-amber-400 shadow-2xl relative">
               <div className="absolute inset-1 opacity-60" style={{ backgroundImage: `url(${BACK_IMAGE})` }} />
            </div>
          </div>
        )}

        {/* 揭示/飞行 */}
        {(status === 'REVEALED' || isFlying) && activeCard && (
           <div className="absolute inset-0 z-[1000] flex items-center justify-center">
             {!isFlying && <div className="absolute inset-0 bg-black/60 animate-in fade-in duration-300" />}
             
             <div className={cn(
               "relative flex flex-col items-center", 
               isFlying ? "fly-animation" : "animate-in zoom-in-90 duration-300"
             )}>
                <div className="w-[240px] h-[400px] rounded-lg border-[3px] border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.5)] overflow-hidden bg-black relative">
                   {/* 这里引用的 image 已经被预加载，会秒出 */}
                   <img src={activeCard.image} className="w-full h-full object-cover" />
                </div>
                <h2 className={cn("mt-6 text-3xl font-bold text-amber-100", isFlying && "opacity-0")}>
                    {activeCard.nameCn}
                </h2>
             </div>
           </div>
        )}
      </div>

      <style jsx>{`
        .fly-animation {
          animation: flyToTopRight 0.6s cubic-bezier(0.5, 0, 0.5, 1) forwards;
        }
        @keyframes flyToTopRight {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(45vw, -45vh) scale(0.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
