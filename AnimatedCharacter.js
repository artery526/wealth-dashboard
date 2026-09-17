const random = ([min, max]) => min + Math.random() * (max - min);
const DEBUG_CHARACTERS = window.DEBUG_CHARACTERS === true;
const CHARACTER_IDLE_TIMEOUT_MS = 8000;

function decodeCharacterImage(img, timeoutMs = CHARACTER_IDLE_TIMEOUT_MS) {
  const decode = typeof img.decode === 'function'
    ? img.decode()
    : new Promise((resolve, reject) => {
        if (img.complete && img.naturalWidth) {
          resolve();
          return;
        }
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', () => reject(new Error('角色影格載入失敗')), { once: true });
      });
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('角色影格載入逾時')), timeoutMs);
  });
  return Promise.race([decode, timeout]).finally(() => clearTimeout(timer));
}

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
    this.button.innerHTML = `<span class="character-art"><span class="character-loading-fallback" aria-hidden="true">${character.slice(0, 1)}</span></span><span class="character-debug"></span>`;
    this.art = this.button.querySelector('.character-art');
    this.debug = this.button.querySelector('.character-debug');
    this.button.hidden = true;
    this.interactive = false;
    this.loadingFrames = {};
    // 首張影格可能因手機網路或快取失效而載入失敗；仍要讓後續
    // loadAllFrames/show() 能安全檢查並保留可點擊的文字入口。
    this.images = {};
    this.button.classList.toggle('debug-enabled', DEBUG_CHARACTERS);
    this.activate = () => {
      if (this.interactive || this.destroyed) return;
      this.interactive = true;
      this.loadAllFrames();
    };
    this.button.addEventListener('pointerenter', this.activate);
    this.button.addEventListener('focus', this.activate);
    this.button.addEventListener('click', event => { this.activate(); event.stopPropagation(); onClick(event); });
    mount.append(this.button);
    // 先提供可點擊的角色入口，影格在背景載入；避免大圖下載卡住整個場景。
    this.button.hidden = false;
    this.button.dataset.characterLoading = 'true';
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
    const idleKey = this.config.idleFrame || '01';
    const idleSrc = this.config.frames[idleKey] || Object.values(this.config.frames)[0];
    if (!idleSrc) throw new Error(`${this.config.name} 沒有可用影格`);
    const idleImg = new Image();
    idleImg.src = idleSrc;
    idleImg.alt = '';
    try {
      await decodeCharacterImage(idleImg);
      if (this.destroyed) return;
      this.images = { [idleKey]: idleImg };
      idleImg.hidden = false;
      this.art.append(idleImg);
      this.ready = true;
      this.button.dataset.characterLoading = 'false';
      this.button.dataset.characterFallback = 'false';
      const fallback = this.art.querySelector('.character-loading-fallback');
      if (fallback) fallback.hidden = true;
      this.resume();
    } catch (error) {
      // 影格失敗時保留可點擊的文字入口，不阻塞其他人物或整個首頁。
      this.ready = true;
      this.button.dataset.characterLoading = 'false';
      this.button.dataset.characterFallback = 'true';
      this.button.setAttribute('title', `${this.config.name}影像載入較慢，仍可點擊開啟面板`);
      this.resume();
    }
  }
  loadFrame(key) {
    if (this.images[key]) return Promise.resolve(this.images[key]);
    if (this.loadingFrames[key]) return this.loadingFrames[key];
    const src = this.config.frames[key];
    if (!src) return Promise.reject(new Error(`${this.config.name} 缺少影格 ${key}`));
    const img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.src = src;
    this.loadingFrames[key] = img.decode().then(() => {
      delete this.loadingFrames[key];
      if (this.destroyed) return img;
      img.hidden = key !== this.button.dataset.frame;
      this.images[key] = img;
      this.art.append(img);
      return img;
    }, error => {
      delete this.loadingFrames[key];
      throw error;
    });
    return this.loadingFrames[key];
  }
  loadAllFrames() {
    const keys = Object.keys(this.config.frames).filter(key => !this.images[key]);
    return Promise.all(keys.map(key => this.loadFrame(key).catch(() => null))).then(() => {
      if (!this.destroyed) this.resume();
    });
  }
  resetDeadlines() {
    const now = Date.now();
    this.deadlines = Object.fromEntries(Object.entries(this.config.events || {}).map(([name, event]) => {
      return [name, now + random(event.interval)];
    }));
  }
  show(frame, state) {
    this.state = state;
    this.button.dataset.state = state;
    this.button.dataset.frame = frame;
    if (!this.images[frame]) {
      if (this.interactive) this.loadFrame(frame).then(() => {
        if (!this.destroyed && this.state === state && this.button.dataset.frame === frame) this.show(frame, state);
      }).catch(() => {});
      return;
    }
    for (const [key, img] of Object.entries(this.images)) img.hidden = key !== frame;
    this.art.style.setProperty('--frame-scale', String(this.config.frameScale?.[frame] || 1));
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
