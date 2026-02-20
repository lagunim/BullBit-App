const KEY = 'habit-quest-v1';
export const loadState = () => { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
export const saveState = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
