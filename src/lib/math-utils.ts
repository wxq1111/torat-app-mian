// src/lib/math-utils.ts

export type Point = { x: number; y: number; z?: number };

// 计算两点距离 (用于检测捏合)
export const getDistance = (p1: Point, p2: Point) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

// 线性插值 (用于让光标平滑跟随，而不是抖动)
export const lerp = (start: number, end: number, amt: number) => {
  return (1 - amt) * start + amt * end;
};

// 计算手掌在画面中的大小 (用于模拟 Z 轴深度)
// 我们取 "手腕" 到 "中指根部" 的距离作为手掌大小的参考
export const getHandScale = (landmarks: any[]) => {
  // 0: WRIST, 9: MIDDLE_FINGER_MCP
  if (!landmarks || landmarks.length < 10) return 0;
  return getDistance(landmarks[0], landmarks[9]);
};
