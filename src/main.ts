import './style.css';
import { COLORS, DEFAULTS, loadSettings, saveSettings, type ColorName, type Settings } from './settings';
import { Simulation } from './simulation/Simulation';
import { Renderer } from './rendering/Renderer';
import { WakeLock } from './services/WakeLock';
import { registerSW } from 'virtual:pwa-register';

const canvas = document.querySelector<HTMLCanvasElement>('#lamp')!;
const panel = document.querySelector<HTMLElement>('#settings')!;
const status = document.querySelector<HTMLElement>('#status')!;
const resumeButton = document.querySelector<HTMLButtonElement>('#resume')!;
let settings: Settings = loadSettings();
let renderer: Renderer;
try { renderer = new Renderer(canvas); }
catch (e) { document.body.innerHTML = `<main style="padding:32px"><h1>Graphics unavailable</h1><p>${String(e)}</p></main>`; throw e; }
const sim = new Simulation(Math.max(0.3, canvas.clientWidth / Math.max(1, canvas.clientHeight)));
const wake = new WakeLock();
let manualPause = false;
let active = false;
let frameId: number | null = null;
let lastFrame: number | null = null;

function isForeground(): boolean { return document.visibilityState === 'visible' && document.hasFocus(); }
function showPanel(visible: boolean): void {
  panel.classList.toggle('hidden', !visible);
  panel.setAttribute('aria-hidden', String(!visible));
  document.body.classList.toggle('paused', visible);
}
async function synchronize(): Promise<void> {
  const shouldPlay = !manualPause && isForeground();
  if (shouldPlay === active) return;
  active = shouldPlay;
  if (active) {
    lastFrame = null;
    if (settings.keepAwake) { const warning=await wake.request(); if(warning) status.textContent=warning; }
    if(active && frameId===null) frameId=requestAnimationFrame(tick);
    if (!active) await wake.release();
  } else {
    if(frameId!==null) cancelAnimationFrame(frameId);
    frameId=null;lastFrame=null;
    await wake.release();
  }
}
function tick(timestamp: number): void {
  frameId=null;
  if(!active) return;
  const dt=lastFrame===null ? 0 : Math.min(Math.max((timestamp-lastFrame)/1000,0), 0.05);
  lastFrame=timestamp;
  sim.update(dt,settings.speed);
  renderer.render(sim,settings);
  frameId=requestAnimationFrame(tick);
}
function pause(): void {manualPause=true;showPanel(true);void synchronize();}
function resume(): void {manualPause=false;showPanel(false);void synchronize();}
canvas.addEventListener('click',()=>{if(!manualPause) pause();});
resumeButton.addEventListener('click',resume);
document.addEventListener('keydown',(e)=>{
  if(e.key==='Escape' && manualPause) resume();
  else if(e.code==='Space' && e.target===document.body){e.preventDefault();manualPause?resume():pause();}
});
function connectColor(id: string, key: 'top'|'bottom'|'lava'): void {
  const el=document.querySelector<HTMLSelectElement>(`#${id}`)!;
  for (const [name,value] of Object.entries(COLORS)) {
    const option=document.createElement('option');option.value=name;option.textContent=`${name}  ·  ${value}`;el.append(option);
  }
  el.addEventListener('change',()=>{settings[key]=el.value as ColorName;saveSettings(settings);renderer.render(sim,settings);});
}
connectColor('top-color','top');connectColor('bottom-color','bottom');connectColor('lava-color','lava');
const speed=document.querySelector<HTMLSelectElement>('#speed')!;
speed.addEventListener('change',()=>{settings.speed=Number(speed.value);saveSettings(settings);});
const keepAwake=document.querySelector<HTMLInputElement>('#wake-lock')!;
keepAwake.addEventListener('change',()=>{
  settings.keepAwake=keepAwake.checked;saveSettings(settings);
  if(!settings.keepAwake) void wake.release();
});
function reflectSettings(): void {
  for(const key of ['top','bottom','lava'] as const) document.querySelector<HTMLSelectElement>(`#${key}-color`)!.value=settings[key];
  speed.value=String(settings.speed);keepAwake.checked=settings.keepAwake;
}
document.querySelector<HTMLButtonElement>('#reset')!.addEventListener('click',()=>{
  settings={...DEFAULTS};saveSettings(settings);reflectSettings();renderer.render(sim,settings);status.textContent='Defaults restored.';
});
let previousAspect = sim.aspect;
function resize(): void {
  const nextAspect = renderer.resize();
  // Browser UI and fractional layout changes should not remap all blob positions.
  if (Math.abs(nextAspect-previousAspect)>0.002) {
    sim.resize(nextAspect);
    previousAspect=nextAspect;
  }
  renderer.render(sim,settings);
}
window.addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{void synchronize();});
window.addEventListener('focus',()=>{void synchronize();});
window.addEventListener('blur',()=>{void synchronize();});
window.addEventListener('pagehide',()=>{active=false;if(frameId!==null)cancelAnimationFrame(frameId);frameId=null;void wake.release();});
// Request wake lock again if the OS revokes it while still visible and active,
// when the next foreground/visibility transition occurs.
reflectSettings();resize();showPanel(false);void synchronize();
registerSW({ immediate: true });
