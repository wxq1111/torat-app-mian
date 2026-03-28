'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// 确保你有安装 lucide-react，如果没有请安装
import { Loader2, Stars, RotateCcw, Hand } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// 假设你的数据文件在这个路径，如果报错请检查路径
import tarotSpreads from '@/data/tarot-spreads.json';

// 为了防止组件导入报错，我先把装饰组件注释掉了
// 如果你确认你有这些文件，请取消注释并将下方的 Placeholder 替换回组件
import { MysticalBackground } from '@/components/Decorations';
import { MagneticGestureDraw } from '@/components/MagneticGestureDraw';

interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  image?: string;
  upright?: string;
  reversed?: string;
  type?: string;
}

interface SpreadPosition {
  index: number;
  name: string;
  meaning: string;
}

interface SelectedCard {
  card: TarotCard;
  position: SpreadPosition;
  orientation: 'upright' | 'reversed';
  revealed: boolean;
}

type AppState = 'input' | 'shuffling' | 'gesture-drawing' | 'ready-to-reveal' | 'revealing' | 'reading';

const BACK_IMAGE = "https://www.transparenttextures.com/patterns/stardust.png"; 

export default function TarotReading() {
  const [question, setQuestion] = useState('');
  const [selectedSpread, setSelectedSpread] = useState(tarotSpreads.spreads[0]);
  const [appState, setAppState] = useState<AppState>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<SelectedCard[]>([]);
  const [interpretation, setInterpretation] = useState('');

  const handleStartProcess = () => {
    if (!question.trim()) { alert('Please enter your question'); return; }
    setAppState('shuffling');
    setTimeout(() => {
        setAppState('gesture-drawing');
    }, 3000);
  };

  const handleGestureComplete = (drawnCards: { card: any, orientation: 'upright' | 'reversed' }[]) => {
    const newCards: SelectedCard[] = drawnCards.map((item, index) => ({
        card: {
            id: item.card.id,
            name: item.card.nameCn || item.card.name, 
            nameEn: item.card.nameEn,
            image: item.card.image,
            type: item.card.type
        },
        position: selectedSpread.positions[index] || { index: index, name: `Position ${index+1}`, meaning: 'Bonus' },
        orientation: item.orientation,
        revealed: true 
    }));

    setCards(newCards);
    setAppState('reading'); 
    startInterpretation(newCards);
  };

  const startInterpretation = async (cardsToUse?: SelectedCard[]) => {
    const currentCards = cardsToUse || cards;
    if (!currentCards || currentCards.length === 0) return;

    setAppState('reading');
    setIsLoading(true);
    setInterpretation(''); 

    try {
      const response = await fetch('/api/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          spreadId: selectedSpread.id,
          cards: currentCards.map(c => ({
             card: c.card, 
             position: c.position,
             orientation: c.orientation
          })),
          mode: 'interpret_only'
        }),
      });

      if (!response.ok) throw new Error('Connection failed');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No reader');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          if (trimmedLine === 'data: [DONE]') {
             setIsLoading(false);
             return; 
          }
          if (trimmedLine.startsWith('data: ')) {
            try {
              const dataStr = trimmedLine.replace('data: ', '');
              const parsed = JSON.parse(dataStr);
              const text = parsed.content || parsed.result || parsed.text || '';
              if (text) setInterpretation(prev => prev + text);
            } catch (e) { 
              console.log("Parse error", trimmedLine);
            }
          }
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      if (!interpretation) setInterpretation(""); 
    } finally {
      setIsLoading(false);
    }
  };

  const resetReading = () => {
    setAppState('input');
    setCards([]);
    setInterpretation('');
    setIsLoading(false);
    setQuestion('');
  };

  const renderCardSlot = (positionIndex: number) => {
    const drawnCard = cards.find((c) => c.position.index === positionIndex);
    const position = selectedSpread.positions[positionIndex];
    
    if (!drawnCard) return <div key={positionIndex} className="w-40 h-64 border border-white/5 rounded-xl bg-white/5 opacity-0"></div>;

    return (
      <div 
        key={positionIndex} 
        className="flex flex-col items-center group animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-both"
        style={{ 
          animationDelay: `${positionIndex * 200}ms`
        }}
      >
        <div className="mb-4">
          <div className="bg-slate-800/80 border border-amber-500/30 text-amber-100 px-4 py-1.5 rounded-full text-xs font-serif tracking-wider shadow-lg">
            {position.name}
          </div>
        </div>

        {/* Removed 'perspective' class and used inline style to be safe */}
        <div className="relative w-40 h-64" style={{ perspective: '1000px' }}>
            <div className="relative w-full h-full shadow-2xl rounded-xl"
                 style={{ transformStyle: 'preserve-3d', transform: 'rotateY(180deg)' }}>
              <div className="absolute inset-0 rounded-xl bg-slate-900" style={{ backfaceVisibility: 'hidden' }} />
              <div className="absolute inset-0 rounded-xl overflow-hidden bg-black border border-amber-500/40 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                   style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                {drawnCard.card.image ? (
                    <img 
                        src={drawnCard.card.image} 
                        alt={drawnCard.card.name} 
                        className={`w-full h-full object-cover ${drawnCard.orientation === 'reversed' ? 'rotate-180' : ''}`}
                    />
                ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs">Card Image</div>
                )}
                
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-8 text-center">
                    <div className="text-amber-100 font-serif text-sm font-bold tracking-wide">{drawnCard.card.name}</div>
                    <div className={`text-[10px] uppercase tracking-widest font-bold mt-0.5 ${drawnCard.orientation === 'reversed' ? 'text-red-400' : 'text-green-400/80'}`}>
                      {drawnCard.orientation === 'reversed' ? 'Reversed' : 'Upright'}
                    </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-amber-500/30">
      
      {/* 恢复这个组件如果你有的话 */}
      <MysticalBackground />

      {appState === 'gesture-drawing' && (
        <MagneticGestureDraw 
          targetCount={selectedSpread.cardCount}
          onComplete={handleGestureComplete}
          onClose={() => setAppState('input')} 
        />
      )}

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-5xl">
        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 shadow-2xl">
          
          <CardHeader className="text-center pb-8 border-b border-white/5">
            <div className="flex justify-center items-center gap-4 mb-4">
               <Stars className="w-6 h-6 text-amber-400/60" />
               <CardTitle className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400/60 tracking-tight">
                 Fate & Tarot
               </CardTitle>
               <Stars className="w-6 h-6 text-amber-400/60" />
            </div>
            <CardDescription className="text-slate-400 font-light tracking-widest uppercase text-xs">
              Reveal your destiny through the stars
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-10 min-h-[600px] flex flex-col items-center">
            
            {appState === 'input' && (
              <div className="w-full max-w-lg space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-4">
                  <label className="text-sm text-slate-400 uppercase tracking-widest ml-1">Your Question</label>
                  <Input
                    placeholder="What guides me today..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="h-14 bg-slate-950/50 border-white/10 text-lg text-amber-100 placeholder:text-slate-700 focus:border-amber-500/50 focus:ring-0 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tarotSpreads.spreads.map(spread => (
                        <div 
                           key={spread.id}
                           onClick={() => setSelectedSpread(spread)}
                           className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 ${
                               selectedSpread.id === spread.id 
                               ? 'bg-amber-900/20 border-amber-500/40 shadow-[0_0_20px_rgba(251,191,36,0.1)]' 
                               : 'bg-white/5 border-white/5 hover:border-white/20'
                           }`}
                        >
                            <div className="font-serif text-amber-100">{spread.name}</div>
                            <div className="text-xs text-slate-500 mt-1">{spread.cardCount} cards</div>
                        </div>
                    ))}
                </div>

                <Button
                    onClick={handleStartProcess}
                    disabled={!question.trim()}
                    className="w-full h-14 text-lg bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-[0_0_30px_rgba(217,119,6,0.3)] transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Hand className="mr-2 h-5 w-5" />
                    Begin Ritual
                </Button>
              </div>
            )}

            {appState === 'shuffling' && (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-1000">
                 <div className="w-32 h-48 bg-slate-800 rounded-lg border border-white/10 relative"
                      style={{ animation: 'pulse 2s infinite' }}> 
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${BACK_IMAGE})` }} />
                 </div>
                 <p className="mt-8 text-amber-100/60 font-serif italic tracking-widest animate-pulse">Shuffling the deck...</p>
              </div>
            )}

            {['ready-to-reveal', 'revealing', 'reading'].includes(appState) && (
                <div className="w-full space-y-10">
                    
                    <div className="flex flex-wrap justify-center gap-8 py-8 animate-in fade-in duration-1000">
                        {selectedSpread.positions.map(pos => renderCardSlot(pos.index))}
                    </div>

                    {appState === 'reading' && (
                        <div className="w-full max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            
                            <div className="flex items-center justify-center gap-4 mb-6 opacity-80">
                                <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50"></div>
                                <span className="text-amber-200 font-serif tracking-[0.2em] text-sm uppercase">The Revelation</span>
                                <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50"></div>
                            </div>

                            <div className="relative bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                                
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
                                
                                <div className="p-8 md:p-12 min-h-[400px]">
                                    
                                    {interpretation ? (
                                      <div className="w-full">
                                          <ReactMarkdown
                                              components={{
                                                  // 1. 段落：强制白色，行高宽松
                                                  p: ({node, ...props}) => <p className="text-slate-50 text-base leading-8 mb-6 font-light" {...props} />,
                                                  
                                                  // 2. 标题：金色，加粗
                                                  h1: ({node, ...props}) => <h1 className="text-2xl text-amber-200 font-serif font-bold mt-8 mb-4 border-b border-white/10 pb-2" {...props} />,
                                                  h2: ({node, ...props}) => <h2 className="text-xl text-amber-100 font-serif font-semibold mt-6 mb-3" {...props} />,
                                                  h3: ({node, ...props}) => <h3 className="text-lg text-amber-100/90 font-serif font-medium mt-4 mb-2" {...props} />,
                                                  
                                                  // 3. 强调/加粗：亮金色
                                                  strong: ({node, ...props}) => <strong className="text-amber-400 font-bold" {...props} />,
                                                  
                                                  // 4. 列表：白色
                                                  ul: ({node, ...props}) => <ul className="list-disc list-inside text-slate-100 mb-4 pl-4 space-y-2" {...props} />,
                                                  ol: ({node, ...props}) => <ol className="list-decimal list-inside text-slate-100 mb-4 pl-4 space-y-2" {...props} />,
                                                  li: ({node, ...props}) => <li className="text-slate-50" {...props} />,
                                                  
                                                  // 5. 引用块：灰色斜体，左侧带边框
                                                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-500/50 pl-4 italic text-slate-400 my-4 bg-white/5 py-2 pr-2 rounded-r" {...props} />
                                              }}
                                          >
                                              {interpretation}
                                          </ReactMarkdown>
                                          
                                          {/* 光标闪烁动画 */}
                                          {isLoading && (
                                              <span className="inline-block w-2 h-5 ml-1 bg-amber-500 animate-pulse align-middle shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                                          )}
                                      </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4">
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-8 h-8 animate-spin text-amber-500/30" />
                                                    <p className="font-serif italic text-lg animate-pulse text-slate-400">Connecting to the Stars...</p>
                                                </>
                                            ) : (
                                                <div className="text-center animate-in fade-in zoom-in duration-300">
                                                    <p className="text-red-400/80 mb-4 font-serif italic">Connection Interrupted</p>
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={() => startInterpretation()}
                                                        className="border-amber-500/30 text-amber-500 hover:bg-amber-950 hover:text-amber-100"
                                                    >
                                                        <RotateCcw className="w-4 h-4 mr-2" /> 
                                                        Retry Connection
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-black/20 p-4 border-t border-white/5 flex justify-between items-center backdrop-blur-sm">
                                    <div className="text-xs text-slate-500 font-mono">
                                        {isLoading ? "Transmitting..." : "Transmission Complete"}
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        onClick={resetReading} 
                                        className="text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" /> 
                                        New Reading
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
