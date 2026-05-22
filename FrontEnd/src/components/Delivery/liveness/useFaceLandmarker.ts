import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm';
const MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export const useFaceLandmarker = () => {
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM);
        let lm: FaceLandmarker;
        try {
          lm = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numFaces: 2,
          });
        } catch {
          lm = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL, delegate: 'CPU' },
            runningMode: 'VIDEO',
            numFaces: 2,
          });
        }
        if (!cancelled) {
          landmarkerRef.current = lm;
          setReady(true);
        }
      } catch {
        if (!cancelled) setLoadError('No se pudo cargar el motor de detección facial.');
      }
    })();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
    };
  }, []);

  return { landmarkerRef, ready, loadError };
};
