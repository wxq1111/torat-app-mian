'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
// 仅导入类型，不会触发运行时错误
import type { Results, Hands } from '@mediapipe/hands';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera } from 'lucide-react';
import tarotCards from '@/data/tarot-cards.json';


// 不需要再扩展 Window 接口了

interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  upright: string;
  reversed: string;
  type: string;
  suit?: string;
  suit_cn?: string;
}

interface GestureDrawCardProps {
  onCardDrawn: (card: TarotCard, orientation: 'upright' | 'reversed') => void;
}



export function GestureDrawCard({ onCardDrawn }: GestureDrawCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [cardOffset, setCardOffset] = useState(0);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<{ card: TarotCard; orientation: 'upright' | 'reversed' } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState('正在加载手势识别模型...');
  const [modelReady, setModelReady] = useState(false);

  const targetOffsetRef = useRef(0);
  const lastHandXRef = useRef(0);
  const handsRef = useRef<Hands | null>(null);
  const rafRef = useRef<number>(0);
  const processResultsRef = useRef<(results: Results, w: number, h: number) => void>(() => {});

  // 处理抽牌
  const handleCardDraw = useCallback(
    (index: number) => {
      if (selectedCard) return;

      const card = tarotCards[index];
      const orientation = Math.random() < 0.5 ? 'upright' : 'reversed';

      setSelectedCard({ card, orientation });

      setTimeout(() => {
        onCardDrawn(card, orientation);
      }, 2000);
    },
    [selectedCard, onCardDrawn]
  );

  // 从 MediaPipe landmarks 计算 bbox、handX、handRatio，并更新 UI
  const processResults = useCallback(
    (results: Results, videoWidth: number, videoHeight: number) => {
      const landmarks = results.multiHandLandmarks?.[0];
      if (!landmarks?.length) {
        setHoveredCardIndex(null);
        setIsPinching(false);
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        return;
      }

      const xs = landmarks.map((l) => l.x);
      const ys = landmarks.map((l) => l.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const bbox: [number, number, number, number] = [
        minX * videoWidth,
        minY * videoHeight,
        (maxX - minX) * videoWidth,
        (maxY - minY) * videoHeight,
      ];
      const handX = ((minX + maxX) / 2) * 100;
      const handRatio = (maxX - minX) * (maxY - minY);

      const delta = (handX - lastHandXRef.current) * 2;
      targetOffsetRef.current += delta;
      targetOffsetRef.current = Math.max(
        -((tarotCards.length - 7) * 120),
        Math.min(0, targetOffsetRef.current)
      );
      lastHandXRef.current = handX;
      setCardOffset(targetOffsetRef.current);

      const cardWidth = 120;
      const cardGap = 20;
      const center = 50;
      const cardIndex = Math.round((center - handX) / (cardWidth + cardGap));
      if (cardIndex >= 0 && cardIndex < tarotCards.length) {
        setHoveredCardIndex(cardIndex);
      }

      if (handRatio > 0.15 && Math.abs(handX - 50) < 15) {
        if (!isPinching && cardIndex >= 0 && cardIndex < tarotCards.length) {
          handleCardDraw(cardIndex);
        }
        setIsPinching(true);
      } else {
        setIsPinching(false);
      }

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.strokeStyle = handRatio > 0.15 && Math.abs(handX - 50) < 15 ? '#ec4899' : '#a855f7';
          ctx.lineWidth = 3;
          const scale = canvasRef.current.width / videoWidth;
          const x = bbox[0] * scale;
          const y = bbox[1] * scale;
          const w = bbox[2] * scale;
          const h = bbox[3] * scale;
          ctx.strokeRect(x, y, w, h);
          ctx.fillStyle = ctx.strokeStyle;
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    },
    [handleCardDraw, isPinching, hoveredCardIndex]
  );

  processResultsRef.current = processResults;

  // ... 前面的代码保持不变 ...
  // ... 之前的代码
  // ⚠️ 关键修改：使用这个特定的稳定版本
  const MEDIAPIPE_VERSION = '0.4.1646424915';
  const MEDIAPIPE_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MEDIAPIPE_VERSION}`;
  // ... 状态定义
  // 初始化 MediaPipe Hands
  useEffect(() => {
    let handsInstance: any = null;
    let isCancelled = false;
    const init = async () => {
      if (typeof window === 'undefined') return;
      try {
        setLoadingStatus('正在加载核心脚本...');
        // 1. 手动加载主脚本，确保不经过 Webpack 打包
        if (!(window as any).Hands) {
            const scriptUrl = `${MEDIAPIPE_CDN}/hands.js`;
            await new Promise<void>((resolve, reject) => {
                const script = document.createElement('script');
                script.src = scriptUrl;
                script.crossOrigin = 'anonymous';
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('MediaPipe 脚本下载失败'));
                document.body.appendChild(script);
            });
        }
        if (isCancelled) return;
        setLoadingStatus('正在初始化 AI 模型...');
        const HandsConstructor = (window as any).Hands;
        
        // 2. 实例化
        handsInstance = new HandsConstructor({
          locateFile: (file: string) => {
            // ⚠️ 关键修复：所有关联文件（.wasm, .data 等）都强制指向 CDN
            // 打印日志方便调试，如果成功你应该能看到请求了 .data 文件
            console.log(`MediaPipe 请求文件: ${file}`);
            return `${MEDIAPIPE_CDN}/${file}`;
          },
        });
        // 3. 设置参数
        handsInstance.setOptions({
          selfieMode: true,
          maxNumHands: 1,
          modelComplexity: 1, // 1 = Full Model (对应报错里找的 hand_landmark_full)
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        handsInstance.onResults((results: Results) => {
          if (isCancelled || !handsRef.current) return;
          
          const video = videoRef.current;
          if (!video) return;
          const w = video.videoWidth || video.width;
          const h = video.videoHeight || video.height;
          if (w && h) processResultsRef.current(results, w, h);
        });
        // 4. 初始化引擎
        await handsInstance.initialize();
        if (isCancelled) {
            handsInstance.close();
            return;
        }
        handsRef.current = handsInstance;
        setModelReady(true);
        setLoadingStatus('');
      } catch (error) {
        console.error('MediaPipe 崩溃:', error);
        setLoadingStatus('模型加载出错，请刷新');
      }
    };
    init();
    return () => {
      isCancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (handsRef.current) {
        // 尝试安全关闭
        try {
          (handsRef.current as any).close();
        } catch(e) { 
            console.warn("关闭 MediaPipe 时出错 (可忽略)", e); 
        }
        handsRef.current = null;
      }
    };
  }, []);
  // 检测循环 (保持你的逻辑，但增加 try-catch 保护)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !modelReady || !isCameraReady || selectedCard) return;
    const run = async () => {
        if (selectedCard) return;
        
        const v = videoRef.current;
        const h = handsRef.current;
        
        // 增加 h.send 的非空判断
        if (!v || !h || v.readyState < 2) {
            rafRef.current = requestAnimationFrame(run);
            return;
        }
        try {
            await h.send({ image: v });
        } catch (e) {
            // 捕获运行时的偶尔丢帧错误，防止崩坏整个页面
            console.warn("丢帧:", e);
        }
        
        rafRef.current = requestAnimationFrame(run);
    };
    rafRef.current = requestAnimationFrame(run);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [modelReady, isCameraReady, selectedCard]);
//后面的代码不变


  // 检测循环
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !modelReady || !isCameraReady || selectedCard) return;

    const run = async () => {
        if (selectedCard) return;
        
        const v = videoRef.current;
        const h = handsRef.current;
        
        if (!v || !h || v.readyState < 2) {
            rafRef.current = requestAnimationFrame(run);
            return;
        }

        try {
            await h.send({ image: v });
        } catch (e) {
            console.error("Frame processing error:", e);
        }
        
        rafRef.current = requestAnimationFrame(run);
    };

    rafRef.current = requestAnimationFrame(run);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [modelReady, isCameraReady, selectedCard]);

  // 初始化摄像头
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsCameraReady(true);
          };
        }
      } catch (error) {
        console.error('摄像头访问失败:', error);
        alert('无法访问摄像头，请确保已授予权限');
        setLoadingStatus('摄像头访问失败');
      }
    };

    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 z-50">
      <div className="absolute top-4 left-4 z-10">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-64 h-48 rounded-lg border-2 border-purple-500/50 object-cover"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            width={256}
            height={192}
            className="absolute top-0 left-0 w-64 h-48 rounded-lg pointer-events-none"
          />
          <div className="absolute top-2 left-2 bg-purple-600/80 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {loadingStatus || (isPinching ? '准备抽牌...' : '移动手势选择')}
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 bg-purple-900/50 backdrop-blur-sm px-4 py-3 rounded-lg border border-purple-500/30 max-w-xs">
        <h3 className="text-purple-200 font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          操作提示
        </h3>
        <ul className="text-purple-300 text-xs space-y-1">
          <li>• 左右移动手掌滑动牌阵</li>
          <li>• 将手掌移到画面中心抽牌</li>
          <li>• 确保手部在摄像头视野内</li>
        </ul>
      </div>

      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="flex items-center transition-transform duration-100 ease-out"
          style={{ transform: `translateX(${cardOffset}px)` }}
        >
          {tarotCards.map((card, index) => {
            const isHovered = hoveredCardIndex === index;
            const isSelected = selectedCard?.card.id === card.id;

            return (
              <motion.div
                key={card.id}
                className={`relative flex-shrink-0 mx-2 transition-all duration-200 ${isHovered ? 'z-10' : 'z-0'}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isSelected ? 1.3 : isHovered ? 1.1 : 1,
                  opacity: 1,
                  y: isSelected ? -100 : 0,
                }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`w-32 h-48 rounded-lg shadow-2xl relative ${
                    isSelected ? 'ring-4 ring-purple-400' : ''
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-900 rounded-lg" />
                  <div className="absolute inset-2 border-2 border-purple-400/50 rounded-lg" />
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-purple-300 rounded-full opacity-50"
                        style={{
                          left: `${20 + i * 10}%`,
                          top: `${20 + i * 8}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-purple-300/30 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-purple-200" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-purple-900/90 to-slate-900/90 backdrop-blur-lg p-8 rounded-2xl border-2 border-purple-500/50 shadow-2xl"
              initial={{ scale: 0.5, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
            >
              <h2 className="text-3xl font-bold text-center text-purple-200 mb-4">
                {selectedCard.card.name}
              </h2>
              <div className="text-center mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCard.orientation === 'upright'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {selectedCard.orientation === 'upright' ? '正位' : '逆位'}
                </span>
              </div>
              <p className="text-purple-300 text-center max-w-md">
                {selectedCard.orientation === 'upright'
                  ? selectedCard.card.upright
                  : selectedCard.card.reversed}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => window.location.reload()}
        className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors z-20"
      >
        返回
      </button>
    </div>
  );
}