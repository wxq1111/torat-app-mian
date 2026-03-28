import { useState, useRef, useCallback } from 'react';

type InteractionStatus = 'IDLE' | 'HOVER' | 'GRABBED' | 'REVEALED';

interface Point {
  x: number;
  y: number;
}

export function useTarotInteraction(totalCards: number) {
  // --- 状态 (用于渲染) ---
  const [status, setStatus] = useState<InteractionStatus>('IDLE');
  const [focusedCardId, setFocusedCardId] = useState<number | null>(null);
  const [cursor, setCursor] = useState<Point>({ x: 50, y: 50 });
  const [scrollOffset, setScrollOffset] = useState(50); 

  // --- 内部变量 (用于高频计算，不触发渲染) ---
  const stateRef = useRef({
    status: 'IDLE' as InteractionStatus,
    focusedId: null as number | null,
    scroll: 50,
    grabCounter: 0,
    releaseCounter: 0
  });

  const processFrame = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return;

    const internal = stateRef.current;

    // 1. 基础坐标映射 (翻转 X 轴以匹配镜像)
    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];
    const x = (1 - indexTip.x) * 100;
    const y = indexTip.y * 100;

    // 始终更新光标位置 (这是唯一需要高频更新的 UI)
    setCursor({ x, y });

    // 2. 状态锁检查：如果已经是“抓取”或“揭示”状态，停止一切背景计算
    // 这解决了“文字跳动”和“抓到了但感觉没抓到”的问题
    if (internal.status === 'GRABBED' || internal.status === 'REVEALED') {
        // 计算捏合距离仅用于检测“松开”
        const pinchDist = Math.sqrt(
          Math.pow(indexTip.x - thumbTip.x, 2) + 
          Math.pow(indexTip.y - thumbTip.y, 2)
        );
        
        // 如果松开了 (距离 > 0.1)
        if (pinchDist > 0.1) {
             internal.releaseCounter++;
             internal.grabCounter = 0;
        } else {
             internal.releaseCounter = 0;
        }

        // 只有在 GRABBED 状态下松手，才触发 REVEALED
        if (internal.status === 'GRABBED' && internal.releaseCounter > 5) {
             internal.status = 'REVEALED';
             setStatus('REVEALED'); // 通知 UI
        }
        return; // <--- 关键：直接结束，不再计算滚动和焦点
    }

    // --- 以下逻辑仅在 IDLE / HOVER 时运行 ---

    // 3. 滚动计算
    if (x < 15) internal.scroll = Math.max(0, internal.scroll - 1.5);
    if (x > 85) internal.scroll = Math.min(100, internal.scroll + 1.5);
    
    // 只有当滚动值变化较大时才更新 UI，减少渲染
    if (Math.abs(internal.scroll - scrollOffset) > 0.5) {
        setScrollOffset(internal.scroll);
    }

    // 4. 焦点计算 (吸附)
    let newFocusId = null;
    const centerIndex = (internal.scroll / 100) * (totalCards - 1);
    
    // 只有手在下半部分才计算吸附
    if (y > 55) { 
        let minDistance = 1000;
        // 性能优化：只遍历中心附近的牌
        const start = Math.max(0, Math.floor(centerIndex - 8));
        const end = Math.min(totalCards, Math.ceil(centerIndex + 8));

        for (let i = start; i < end; i++) {
           const cardX = 50 + ((i - centerIndex) * 7); // 7 是卡片间距系数
           const dist = Math.abs(cardX - x);
           
           // 吸附阈值 5%
           if (dist < 5 && dist < minDistance) {
               minDistance = dist;
               newFocusId = i;
           }
        }
    }

    // 更新焦点状态
    if (internal.focusedId !== newFocusId) {
        internal.focusedId = newFocusId;
        setFocusedCardId(newFocusId);
        
        // 自动切换 HOVER / IDLE
        const newStatus = newFocusId !== null ? 'HOVER' : 'IDLE';
        if (internal.status !== newStatus) {
            internal.status = newStatus;
            setStatus(newStatus);
        }
    }

    // 5. 抓取检测 (捏合)
    const pinchDist = Math.sqrt(
      Math.pow(indexTip.x - thumbTip.x, 2) + 
      Math.pow(indexTip.y - thumbTip.y, 2)
    );

    if (pinchDist < 0.08) {
        internal.grabCounter++;
    } else {
        internal.grabCounter = 0;
    }

    // 触发抓取
    if (internal.grabCounter > 5 && internal.focusedId !== null) {
        internal.status = 'GRABBED';
        setStatus('GRABBED');
        // 这里不需要重置 releaseCounter，因为它是独立的
    }

  }, [totalCards, scrollOffset]); // 依赖项大幅减少

  // 6. 强制重置
  const reset = useCallback(() => {
    stateRef.current = {
        status: 'IDLE',
        focusedId: null,
        scroll: stateRef.current.scroll, // 保持当前滚动位置，体验更好
        grabCounter: 0,
        releaseCounter: 0
    };
    setStatus('IDLE');
    setFocusedCardId(null);
  }, []);

  return {
    status,
    focusedCardId,
    cursor,
    scrollOffset,
    processFrame,
    reset
  };
}
