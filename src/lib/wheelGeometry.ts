export type WheelSector = {
  id: string;
  index: number;
  startAngle: number;
  endAngle: number;
  centerAngle: number;
};

const FULL_TURN = 360;
const POINTER_ANGLE = -90;

export function normalizeAngle(angle: number): number {
  const normalized = angle % FULL_TURN;
  return normalized < 0 ? normalized + FULL_TURN : normalized;
}

export function buildWheelSectors(
  segments: ReadonlyArray<{ id: string }>,
): WheelSector[] {
  if (segments.length === 0) return [];
  const size = FULL_TURN / segments.length;
  return segments.map((segment, index) => ({
    id: segment.id,
    index,
    startAngle: POINTER_ANGLE + index * size,
    endAngle: POINTER_ANGLE + (index + 1) * size,
    centerAngle: POINTER_ANGLE + (index + 0.5) * size,
  }));
}

export function rotationForWinningSegment(
  segments: ReadonlyArray<{ id: string }>,
  winningSegmentId: string,
  turns = 5,
): number {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new Error("turns must be a non-negative number");
  }
  const index = segments.findIndex((segment) => segment.id === winningSegmentId);
  if (index < 0) throw new Error("winning segment is not in the rendered snapshot");
  if (segments.length === 0) throw new Error("wheel requires at least one segment");
  return turns * FULL_TURN - (index + 0.5) * (FULL_TURN / segments.length);
}

export function angleAtPointerAfterRotation(
  sectorCenterAngle: number,
  rotation: number,
): number {
  return normalizeAngle(sectorCenterAngle + rotation);
}

export const WHEEL_POINTER_ANGLE = normalizeAngle(POINTER_ANGLE);
