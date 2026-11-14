export interface TimerStateFields {
  timerSeconds: number;
  isTimerRunning: boolean;
  timerBaseSeconds?: number;
  timerStartedAt?: number | null;
}

/**
 * Menghitung durasi detik aktual secara akurat berdasarkan wall-clock epoch timestamp,
 * sehingga tetap berjalan meskipun layar HP mati, tab tidak aktif, atau browser ditutup sementara.
 */
export function resolveLiveElapsedSeconds(
  state: Partial<TimerStateFields> | null | undefined,
  nowMs: number = Date.now()
): number {
  if (!state) return 0;

  if (
    state.isTimerRunning &&
    typeof state.timerStartedAt === 'number' &&
    Number.isFinite(state.timerStartedAt) &&
    state.timerStartedAt > 0
  ) {
    const base =
      typeof state.timerBaseSeconds === 'number' && Number.isFinite(state.timerBaseSeconds)
        ? state.timerBaseSeconds
        : state.timerSeconds || 0;
    const elapsedSinceStart = Math.max(0, Math.floor((nowMs - state.timerStartedAt) / 1000));
    return Math.max(0, base + elapsedSinceStart);
  }

  const fallback =
    typeof state.timerSeconds === 'number' && Number.isFinite(state.timerSeconds)
      ? state.timerSeconds
      : typeof state.timerBaseSeconds === 'number' && Number.isFinite(state.timerBaseSeconds)
      ? state.timerBaseSeconds
      : 0;
  return Math.max(0, fallback);
}

/**
 * Memulai atau melanjutkan stopwatch dari posisi detik saat ini menggunakan timestamp sekarang.
 */
export function buildStartTimerFields(
  currentSeconds: number,
  nowMs: number = Date.now()
): TimerStateFields {
  const safeSec = Math.max(0, Math.round(currentSeconds || 0));
  return {
    timerSeconds: safeSec,
    timerBaseSeconds: safeSec,
    timerStartedAt: nowMs,
    isTimerRunning: true,
  };
}

/**
 * Menghentikan / menjeda stopwatch dan mengunci durasi aktual terkini.
 */
export function buildStopTimerFields(
  state: Partial<TimerStateFields> | null | undefined,
  nowMs: number = Date.now()
): TimerStateFields {
  const finalSec = resolveLiveElapsedSeconds(state, nowMs);
  return {
    timerSeconds: finalSec,
    timerBaseSeconds: finalSec,
    timerStartedAt: null,
    isTimerRunning: false,
  };
}

/**
 * Menetapkan nilai detik baru (Target / +30s / -30s / Reset) dengan tetap mempertahankan
 * status berjalan jika timer sedang aktif.
 */
export function buildAdjustTimerFields(
  targetSeconds: number,
  keepRunning: boolean,
  nowMs: number = Date.now()
): TimerStateFields {
  const safeSec = Math.max(0, Math.round(targetSeconds || 0));
  return {
    timerSeconds: safeSec,
    timerBaseSeconds: safeSec,
    timerStartedAt: keepRunning ? nowMs : null,
    isTimerRunning: keepRunning,
  };
}

/**
 * Menyegarkan satu objek state timer menggunakan timestamp saat ini.
 * Mengembalikan flag changed agar state tidak dirender ulang bila angkanya belum berubah.
 */
export function tickTimerFields<T extends Partial<TimerStateFields>>(
  state: T,
  nowMs: number = Date.now()
): { next: T; changed: boolean } {
  if (!state.isTimerRunning) {
    return { next: state, changed: false };
  }

  if (typeof state.timerStartedAt !== 'number' || !Number.isFinite(state.timerStartedAt) || state.timerStartedAt <= 0) {
    const base = Math.max(0, state.timerSeconds || 0);
    return {
      next: {
        ...state,
        timerSeconds: base,
        timerBaseSeconds: base,
        timerStartedAt: nowMs,
      },
      changed: true,
    };
  }

  const liveSeconds = resolveLiveElapsedSeconds(state, nowMs);
  if (liveSeconds === state.timerSeconds && typeof state.timerBaseSeconds === 'number') {
    return { next: state, changed: false };
  }

  return {
    next: {
      ...state,
      timerSeconds: liveSeconds,
    },
    changed: true,
  };
}
