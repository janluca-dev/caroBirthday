// Zustand im localStorage. Alles in try/catch, damit die Seite auch ohne Speicher
// (privater Modus, blockierter Speicher) funktioniert – dann eben nur bis zum Neuladen.

const empty = () => ({ gate: false, unlocked: {}, choice: null, welcomed: false });

export function createStore(key) {
  let state = empty();
  try {
    const raw = localStorage.getItem(key);
    if (raw) state = { ...empty(), ...JSON.parse(raw) };
  } catch {
    /* kein Speicher verfügbar */
  }

  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* egal */
    }
  };

  return {
    get: () => state,
    set(patch) {
      state = { ...state, ...patch };
      save();
    },
    unlock(id) {
      state = { ...state, unlocked: { ...state.unlocked, [id]: true } };
      save();
    },
    isUnlocked: (id) => Boolean(state.unlocked[id]),
    reset() {
      state = empty();
      try {
        localStorage.removeItem(key);
      } catch {
        /* egal */
      }
    },
  };
}
