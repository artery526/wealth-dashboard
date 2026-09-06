// All timing values are milliseconds. Original PNG files remain untouched.
window.DEBUG_CHARACTERS = false;
const characterPositions = {
  chenqun: { top: '27%', left: '27%', width: '7.8%' },
  huatuo: { top: '27%', left: '69%', width: '8%' },
  liubei: { top: '30%', left: '46%', width: '8%' },
  simayi: { top: '47%', left: '16%', width: '11%' }
};
const chenqunAnimations = {
  name: '陳群',
  frames: Object.fromEntries(Array.from({ length: 8 }, (_, i) => {
    const key = String(i + 1).padStart(2, '0');
    return [key, `./陳群/chenqun_idle_${key}.png`];
  })),
  breathing: [
    { frame: '02', duration: [250, 400] },
    { frame: '05', duration: [250, 400] },
    { frame: '06', duration: [500, 1200] },
    { frame: '01', state: 'idle', duration: [800, 1800] }
  ],
  events: {
    blink: { interval: [3000, 7000], sequence: [{ frame: '04', duration: [120, 180] }, { frame: '01', state: 'idle', duration: [800, 1800] }] },
    secondaryIdle: { interval: [6000, 12000], sequence: [{ frame: '03', state: 'sleeve', duration: [250, 450] }, { frame: '01', state: 'idle', duration: [800, 1800] }] },
    specialAction: { interval: [12000, 30000], sequence: [
      { frame: '07', state: 'scroll', duration: [400, 650] },
      { frame: '08', state: 'scroll', duration: [2000, 5000] },
      { frame: '07', state: 'scroll', duration: [400, 650] },
      { frame: '01', state: 'idle', duration: [800, 1800] }
    ] }
  },
  timing: {
    idle: [800, 1800]
  }
};
const huatuoAnimations = {
  name: '華佗',
  frames: {
    '01': './華佗/站立01.png',
    '02': './華佗/呼吸下沉02.png',
    '03': './華佗/鬍鬚微動03.png',
    '04': './華佗/眨眼04.png',
    '05': './華佗/呼吸上升05.png',
    '06': './華佗/站立左手背到後面06.png',
    '07': './華佗/拿起藥瓶07.png',
    '08': './華佗/打開藥瓶08.png',
    '09': './華佗/打開藥瓶喝一口09.png',
    '10': './華佗/放下藥瓶10.png',
    '11': './華佗/回復站立11.png'
  },
  breathing: [
    { frame: '02', duration: [250, 400] },
    { frame: '05', duration: [250, 400] },
    { frame: '11', duration: [500, 1000] },
    { frame: '01', state: 'idle', duration: [800, 1800] }
  ],
  events: {
    blink: { interval: [3000, 7000], sequence: [{ frame: '04', duration: [120, 180] }, { frame: '01', state: 'idle', duration: [800, 1800] }] },
    secondaryIdle: { interval: [6000, 12000], sequence: [{ frame: '03', state: 'beard', duration: [250, 500] }, { frame: '01', state: 'idle', duration: [800, 1800] }] },
    specialAction: { interval: [12000, 30000], sequence: [
      { frame: '07', state: 'medicine', duration: [400, 650] },
      { frame: '08', state: 'medicine', duration: [350, 600] },
      { frame: '09', state: 'medicine-hold', duration: [2000, 5000] },
      { frame: '10', state: 'medicine', duration: [450, 700] },
      { frame: '11', state: 'medicine-return', duration: [500, 1000] },
      { frame: '01', state: 'idle', duration: [800, 1800] }
    ] }
  },
  timing: {
    idle: [800, 1800]
  }
};
const liubeiAnimations = {
  name: '劉備',
  frames: {
    '01': './劉備/站立01.png',
    '02': './劉備/大笑02.png',
    '03': './劉備/眨眼03.png',
    '04': './劉備/呼吸上升04.png',
    '05': './劉備/呼吸下沉05.png',
    '06': './劉備/思考06.png',
    '07': './劉備/翻開書卷07.png',
    '08': './劉備/放下書卷08.png',
    '09': './劉備/撰寫回憶09.png',
    '10': './劉備/放下卷軸苦思10.png',
    '11': './劉備/放下卷軸揮劍出擊11.png'
  },
  breathing: [
    { frame: '05', duration: [250, 400] },
    { frame: '04', duration: [250, 400] },
    { frame: '01', state: 'idle', duration: [800, 1800] }
  ],
  events: {
    blink: { interval: [3000, 7000], sequence: [{ frame: '03', duration: [120, 180] }, { frame: '01', state: 'idle', duration: [800, 1800] }] },
    secondaryIdle: { interval: [7000, 14000], sequence: [
      { frame: '06', state: 'think', duration: [700, 1400] },
      { frame: '02', state: 'laugh', duration: [350, 700] },
      { frame: '01', state: 'idle', duration: [800, 1800] }
    ] },
    specialAction: { interval: [18000, 36000], sequence: [
      { frame: '07', state: 'book-open', duration: [450, 700] },
      { frame: '08', state: 'book-lower', duration: [500, 800] },
      { frame: '09', state: 'write-memory', duration: [2200, 5000] },
      { frame: '10', state: 'think-scroll', duration: [800, 1400] },
      { frame: '11', state: 'sword-strike', duration: [900, 1600] },
      { frame: '01', state: 'idle', duration: [1000, 1800] }
    ] }
  },
  timing: {
    idle: [800, 1800]
  }
};
const simayiAnimations = {
  name: '司馬懿',
  frames: {
    '01': './司馬懿/思考01.png',
    '02': './司馬懿/書寫計畫02.png',
    '03': './司馬懿/坐在桌子前分析情報03.png',
    '04': './司馬懿/坐在桌子前繪製地圖04.png',
    '05': './司馬懿/偵查出行05.png',
    '06': './司馬懿/打開地圖06.png',
    '07': './司馬懿/靜觀等待07.png',
    '08': './司馬懿/站立08.png'
  },
  breathing: [
    { frame: '01', duration: [800, 1600] },
    { frame: '07', duration: [1200, 2400] },
    { frame: '01', state: 'idle', duration: [800, 1800] }
  ],
  events: {
    secondaryIdle: { interval: [7000, 14000], sequence: [
      { frame: '02', state: 'planning', duration: [700, 1400] },
      { frame: '03', state: 'analyzing', duration: [1200, 2400] },
      { frame: '01', state: 'idle', duration: [800, 1800] }
    ] },
    specialAction: { interval: [18000, 36000], sequence: [
      { frame: '06', state: 'map-open', duration: [600, 1000] },
      { frame: '04', state: 'map-drawing', duration: [1600, 3000] },
      { frame: '05', state: 'scouting', duration: [1200, 2200] },
      { frame: '08', state: 'stand', duration: [900, 1600] },
      { frame: '01', state: 'idle', duration: [1000, 1800] }
    ] }
  },
  timing: {
    idle: [800, 1800]
  }
};
window.characterPositions = characterPositions;
window.chenqunAnimations = chenqunAnimations;
window.huatuoAnimations = huatuoAnimations;
window.liubeiAnimations = liubeiAnimations;
window.simayiAnimations = simayiAnimations;
