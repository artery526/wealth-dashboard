const random = ([min, max]) => min + Math.random() * (max - min);
const DEBUG_CHARACTERS = window.DEBUG_CHARACTERS === true;

window.AnimatedCharacter = class AnimatedCharacter {
  constructor({ character, animationConfig, position, size, onClick, mount }) {
    this.config = animationConfig;
    this.panelOpen = false;
    this.queue = [];
    this.button = document.createElement('button');
    this.button.className = 'animated-character';
    this.button.type = 'button';
    this.button.setAttribute('aria-label', `${character}，開啟角色面板`);
    Object.assign(this.button.style, position, size ? { width: size } : {});
    this.button.innerHTML = '<span class="character-art"></span><span class="character-debug"></span>';
    this.art = this.button.querySelector('.character-art');
    this.debug = this.button.querySelector('.character-debug');
    this.button.hidden = true;
    this.button.classList.toggle('debug-enabled', DEBUG_CHARACTERS);
    this.button.addEventListener('click', event => { event.stopPropagation(); onClick(event); });
    mount.append(this.button);
    this.motion = matchMedia('(prefers-reduced-motion: reduce)');
    this.resume = () => {
      clearTimeout(this.timer);
      this.queue = [];
      if (!this.ready || this.destroyed) return;
      this.show(this.config.idleFrame || '01', 'idle');
      if (document.hidden || this.motion.matches) return;
      this.resetDeadlines();
      this.schedule(this.config.timing.idle);
    };
    document.addEventListener('visibilitychange', this.resume);
    this.motion.addEventListener('change', this.resume);
    this.loaded = this.preload();
  }
  async preload() {
    const entries = Object.entries(this.config.frames).map(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.alt = '';
      return [key, img];
    });
    const idleKey = this.config.idleFrame || '01';
    const idleEntry = entries.find(([key]) => key === idleKey) || entries[0];
    if (!idleEntry) throw new Error(`${this.config.name} 沒有可用影格`);
    await idleEntry[1].decode();
    if (this.destroyed) return;
    this.images = Object.fromEntries([idleEntry]);
    idleEntry[1].hidden = false;
    this.art.append(idleEntry[1]);
    this.ready = true;
    this.button.hidden = false;
    this.resume();

    // 先讓場景與待機人物出現，再在背景完成其餘影格的解碼。
    const remaining = entries.filter(([key]) => key !== idleEntry[0]);
    const decoded = await Promise.all(remaining.map(async ([key, img]) => {
      await img.decode();
      return [key, img];
    }));
    if (this.destroyed) return;
    for (const [key, img] of decoded) {
      img.hidden = key !== this.button.dataset.frame;
      this.images[key] = img;
      this.art.append(img);
    }
  }
  resetDeadlines() {
    const now = Date.now();
    this.deadlines = Object.fromEntries(Object.entries(this.config.events || {}).map(([name, event]) => {
      return [name, now + random(event.interval)];
    }));
  }
  show(frame, state) {
    for (const [key, img] of Object.entries(this.images)) img.hidden = key !== frame;
    this.art.style.setProperty('--frame-scale', String(this.config.frameScale?.[frame] || 1));
    this.state = state;
    this.button.dataset.state = state;
    this.button.dataset.frame = frame;
    if (DEBUG_CHARACTERS) this.debug.textContent = `${this.config.name} STATE: ${state} FRAME: ${frame}`;
  }
  schedule(range) { this.timer = setTimeout(() => this.tick(), random(range)); }
  enqueue(eventName) {
    const event = this.config.events?.[eventName];
    if (!event) return false;
    this.deadlines[eventName] = Date.now() + random(event.interval);
    this.queue = event.sequence.map(step => [step.frame, step.state || eventName, step.duration]);
    return true;
  }
  tick() {
    if (document.hidden || this.destroyed || this.motion.matches) return;
    const t = this.config.timing;
    if (!this.queue.length) {
      const now = Date.now();
      const priority = this.panelOpen ? ['blink', 'secondaryIdle'] : ['specialAction', 'blink', 'secondaryIdle'];
      const dueEvent = priority.find(name => now >= (this.deadlines?.[name] ?? Infinity));
      if (dueEvent && this.enqueue(dueEvent)) {
        // The event sequence now owns the next frame transitions.
      } else {
        this.queue = (this.config.breathing || []).map(step => [step.frame, step.state || 'breathing', step.duration]);
      }
    }
    const [frame, state, duration] = this.queue.shift();
    this.show(frame, state);
    this.schedule(duration);
  }
  setPanelOpen(open) { this.panelOpen = open; this.resume(); }
  destroy() {
    this.destroyed = true;
    clearTimeout(this.timer);
    document.removeEventListener('visibilitychange', this.resume);
    this.motion.removeEventListener('change', this.resume);
    this.button.remove();
  }
}
