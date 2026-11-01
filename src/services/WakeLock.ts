export class WakeLock {
  private lock: WakeLockSentinel | null = null;
  async request(): Promise<string | null> {
    if (!('wakeLock' in navigator)) return 'Screen wake lock is unavailable in this browser.';
    if (this.lock && !this.lock.released) return null;
    try {
      this.lock = await navigator.wakeLock.request('screen');
      this.lock.addEventListener('release', () => { this.lock = null; });
      return null;
    } catch { return 'Screen wake lock could not be activated; device may still sleep.'; }
  }
  async release(): Promise<void> {
    const lock=this.lock;this.lock=null;
    if (lock && !lock.released) await lock.release().catch(()=>{});
  }
}
