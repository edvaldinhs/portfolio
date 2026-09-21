import { ModelViewer, type ModelViewerConfig } from './ModelViewer'

const VIEWER_PRESETS: Record<string, ModelViewerConfig> = {
  eddy: {
    gltfFile: '/models/EddySit_body.glb',
    headGltfFile: '/models/EddySit_head.glb',
    animation: 'Sitting',
    cameraZ: 5,
    modelY: -1.25,
    scale: 1.4,
    tiltEnabled: false,
    headFollow: true,
    headMaxYaw: 1,
    headMaxPitch: 0.5,
  },
  ydde: {
    gltfFile: '/models/Ydde3.glb',
    animation: 'Idle',
    cameraZ: 5,
    modelY: -1.2,
    scale: 1.4,
    tiltEnabled: true,
  },
}

export function mountModelViewer(
  container: HTMLElement,
  name: string,
  onLoaded?: () => void,
): ModelViewer {
  const preset = VIEWER_PRESETS[name]
  if (!preset) throw new Error(`Unknown model viewer preset: ${name}`)
  return new ModelViewer(container, { ...preset, onLoaded })
}