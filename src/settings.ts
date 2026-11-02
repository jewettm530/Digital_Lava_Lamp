export const COLORS = {
  Red: '#D64559', Orange: '#F28C45', Yellow: '#EFCB63', Green: '#419B83',
  Blue: '#365AAB', Purple: '#9355B9', Pink: '#E89ACB', Brown: '#81573F',
  Black: '#14151D', Gray: '#777D8D', White: '#E5E2DB'
} as const;
// Distinct, saturated wax pigments. Keep the approved soft ivory white unchanged.
// Specular highlights and local contrast are handled in the shader.
export const LAVA_COLORS: Record<keyof typeof COLORS,string> = {
  Red:'#DB3E50', Orange:'#EE812D', Yellow:'#E9C43E', Green:'#31B276',
  Blue:'#417DDA', Purple:'#A34AD9', Pink:'#E86AB9', Brown:'#98552E',
  Black:'#17171E', Gray:'#8E95A2', White:'#DFDCD5'
};
export type ColorName = keyof typeof COLORS;
export type Settings = { top: ColorName; bottom: ColorName; lava: ColorName; speed: number; keepAwake: boolean };
export const DEFAULTS: Settings = { top: 'Blue', bottom: 'Purple', lava: 'Pink', speed: 1, keepAwake: true };
const KEY = 'lava-lamp-settings-v1';
export function loadSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<Settings>;
    return {
      top: saved.top && saved.top in COLORS ? saved.top : DEFAULTS.top,
      bottom: saved.bottom && saved.bottom in COLORS ? saved.bottom : DEFAULTS.bottom,
      lava: saved.lava && saved.lava in COLORS ? saved.lava : DEFAULTS.lava,
      speed: [0.5, 1, 1.5, 2, 3].includes(Number(saved.speed)) ? Number(saved.speed) : 1,
      keepAwake: typeof saved.keepAwake === 'boolean' ? saved.keepAwake : true
    };
  } catch { return { ...DEFAULTS }; }
}
export function saveSettings(settings: Settings): void {
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* Storage can be disabled */ }
}
export function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
}
