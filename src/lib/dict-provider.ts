// Dictionary Provider Interface utilities

export function normalizePinyin(pinyin: string): string {
  return pinyin.toLowerCase().replace(/\s+/g, '').trim();
}

export function createWordId(word: { id?: string; chinese: string }): string {
  return word.id || `${word.chinese}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}