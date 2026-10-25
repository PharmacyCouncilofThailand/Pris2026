export type ZoomState = { scale: number; x: number; y: number };
type Size = { width: number; height: number };

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
export const DOUBLE_TAP_ZOOM = 2;

// The content is drawn as translate(x, y) scale(scale) from its top-left corner,
// so a content point p appears on screen at p * scale + offset.
function clampOffset(scale: number, x: number, y: number, bounds: Size): ZoomState {
  return {
    scale,
    x: Math.min(0, Math.max(bounds.width * (1 - scale), x)),
    y: Math.min(0, Math.max(bounds.height * (1 - scale), y)),
  };
}

export function zoomAt(
  state: ZoomState,
  point: { x: number; y: number },
  nextScale: number,
  bounds: Size,
): ZoomState {
  const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextScale));
  const ratio = scale / state.scale;
  return clampOffset(
    scale,
    point.x - (point.x - state.x) * ratio,
    point.y - (point.y - state.y) * ratio,
    bounds,
  );
}

export function panBy(state: ZoomState, dx: number, dy: number, bounds: Size): ZoomState {
  return clampOffset(state.scale, state.x + dx, state.y + dy, bounds);
}
