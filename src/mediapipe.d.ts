// src/mediapipe.d.ts
declare module '@mediapipe/hands' {
    export class Hands {
      constructor(config: any);
      setOptions(options: any): void;
      onResults(callback: (results: any) => void): void;
      send(input: any): Promise<void>;
    }
    export interface Results {
      multiHandLandmarks: any[][];
      image: any;
    }
  }
  
  declare module '@mediapipe/camera_utils' {
    export class Camera {
      constructor(videoElement: HTMLVideoElement, config: any);
      start(): Promise<void>;
    }
  }
  