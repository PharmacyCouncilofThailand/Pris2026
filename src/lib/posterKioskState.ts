export const IDLE_RESET_MS = 60_000;
export const COUNTDOWN_MS = 10_000;
export const ROSTER_REFRESH_MS = 300_000;
export const ROSTER_RETRY_MS = 30_000;

export type KioskMode = "idle" | "results" | "viewing";

export type KioskState = {
  mode: KioskMode;
  query: string;
  viewingTrackingId: string | null;
  lastActivityAt: number;
};

export type KioskAction =
  | { type: "query"; query: string; now: number }
  | { type: "view"; trackingId: string; now: number }
  | { type: "close" }
  | { type: "activity"; now: number }
  | { type: "tick"; now: number };

export const initialKioskState: KioskState = {
  mode: "idle",
  query: "",
  viewingTrackingId: null,
  lastActivityAt: 0,
};

export function kioskReducer(state: KioskState, action: KioskAction): KioskState {
  switch (action.type) {
    case "query":
      if (state.mode === "viewing") return state;
      if (action.query.trim() === "") {
        return { ...state, mode: "idle", query: "", lastActivityAt: action.now };
      }
      return { ...state, mode: "results", query: action.query, lastActivityAt: action.now };
    case "view":
      if (state.mode !== "results") return state;
      return {
        ...state,
        mode: "viewing",
        viewingTrackingId: action.trackingId,
        lastActivityAt: action.now,
      };
    case "close":
      return { ...initialKioskState, lastActivityAt: state.lastActivityAt };
    case "activity":
      return { ...state, lastActivityAt: action.now };
    case "tick":
      if (state.mode === "idle") return state;
      if (action.now - state.lastActivityAt >= IDLE_RESET_MS) {
        return { ...initialKioskState, lastActivityAt: state.lastActivityAt };
      }
      return state;
  }
}

export function secondsUntilReset(state: KioskState, now: number): number | null {
  if (state.mode === "idle") return null;
  const remaining = IDLE_RESET_MS - (now - state.lastActivityAt);
  if (remaining > 0 && remaining <= COUNTDOWN_MS) return Math.ceil(remaining / 1000);
  return null;
}

export function secondsRemaining(state: KioskState, now: number): number | null {
  if (state.mode === "idle") return null;
  const remaining = IDLE_RESET_MS - (now - state.lastActivityAt);
  return Math.max(0, Math.ceil(remaining / 1000));
}

export function canRefreshRoster(state: KioskState): boolean {
  return state.mode === "idle";
}
