// All timing values are milliseconds. Original PNG files remain untouched.
window.DEBUG_CHARACTERS = false;
const characterPositions = {
  pangtong: { top: '10%', left: '41%', width: '8.8%' },
  zhuge: { top: '10%', left: '50%', width: '8.8%' },
  chenqun: { top: '25.5%', left: '25.5%', width: '7.8%' },
  huatuo: { top: '27%', left: '69%', width: '8%' },
  liubei: { top: '30%', left: '46%', width: '8%' },
  simayi: { top: '47%', left: '16%', width: '11%' },
  manchong: { top: '47%', left: '76%', width: '10%' }
};
const characterMobilePositions = {
  pangtong: { top: '27.5%', left: '19.5%', width: '13%' },
  zhuge: { top: '27.5%', left: '68.5%', width: '13%' },
  liubei: { top: '23.5%', left: '43%', width: '14%' },
  chenqun: { top: '43%', left: '16%', width: '16%' },
  huatuo: { top: '43%', left: '69%', width: '16%' },
  simayi: { top: '62%', left: '16%', width: '17%' },
  manchong: { top: '62%', left: '67%', width: '17%' }
};
const pangtongAnimations = {
  name: '龐統',
  frames: {
    '01': './龐統/站立握酒瓶01.png',
    '02': './龐統/酒瓶喝酒02.png',
    '03': './龐統/睡眠小憩03.png',
    '04': './龐統/喝酒遠望04.png',
    '05': './龐統/帶酒行走05.png',
    '06': './龐統/帶酒行走放下酒瓶06.png',
    '07': './龐統/行走放下酒瓶拿出卷軸07.png',
    '08': './龐統/指點地圖08.png'
  },
  breathing: [
    { frame: '01', state: 'idle', duration: [900, 1800] }
  ],
  events: {
    secondaryIdle: { interval: [8000, 16000], sequence: [
      { frame: '02', state: 'drink', duration: [1500, 3000] },
      { frame: '04', state: 'gaze', duration: [800, 1400] },
      { frame: '01', state: 'idle', duration: [900, 1800] }
    ] },
    specialAction: { interval: [18000, 36000], sequence: [
      { frame: '05', state: 'walk-drink', duration: [700, 1100] },
      { frame: '06', state: 'put-down', duration: [650, 1000] },
      { frame: '07', state: 'scroll', duration: [900, 1400] },
      { frame: '08', state: 'point-map', duration: [1800, 4200] },
      { frame: '01', state: 'idle', duration: [1000, 1800] }
    ] }
  },
  timing: {
    idle: [900, 1800]
  }
};
const zhugeAnimations = {
  name: '諸葛亮',
  frames: {
    '01': './諸葛亮/待機站立01.png',
    '02': './諸葛亮/輕搖羽扇02.png',
    '03': './諸葛亮/輕搖羽扇03.png',
    '04': './諸葛亮/輕搖羽扇04.png',
    '05': './諸葛亮/揮扇指揮05.png',
    '06': './諸葛亮/提出計策06.png',
    '07': './諸葛亮/提出計策電燈泡07.png',
    '08': './諸葛亮/運籌帷幄08.png'
  },
  breathing: [
    { frame: '02', duration: [250, 400] },
    { frame: '03', duration: [250, 400] },
    { frame: '04', duration: [250, 400] },
    { frame: '01', state: 'idle', duration: [800, 1800] }
  ],
  events: {
    secondaryIdle: { interval: [7000, 14000], sequence: [
      { frame: '03', state: 'fan', duration: [700, 1400] },
      { frame: '01', state: 'idle', duration: [800, 1800] }
    ] },
    specialAction: { interval: [18000, 36000], sequence: [
      { frame: '05', state: 'command', duration: [550, 900] },
      { frame: '06', state: 'strategy', duration: [700, 1200] },
      { frame: '07', state: 'strategy-light', duration: [1600, 3000] },
      { frame: '08', state: 'planning', duration: [1800, 4200] },
      { frame: '01', state: 'idle', duration: [1000, 1800] }
    ] }
  },
  timing: {
    idle: [800, 1800]
  }
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
const manchongAnimations = {
  name: '滿寵',
  frames: {
    '01': './滿寵/站立待命01.png',
    '02': './滿寵/查看帳冊02.png',
    '03': './滿寵/提筆登記03.png',
    '04': './滿寵/核對貨單04.png',
    '05': './滿寵/驗收貨物05.png',
    '06': './滿寵/蓋章確認06.png',
    '07': './滿寵/指揮入庫07.png',
    '08': './滿寵/指揮入庫工人08.png',
    '09': './滿寵/指揮入庫工人09.png',
    '10': './滿寵/工人回家10.png'
  },
  breathing: [
    { frame: '02', duration: [300, 500] },
    { frame: '04', duration: [350, 550] },
    { frame: '01', state: 'idle', duration: [800, 1800] }
  ],
  events: {
    secondaryIdle: { interval: [7000, 14000], sequence: [
      { frame: '05', state: 'inspect-goods', duration: [700, 1300] },
      { frame: '06', state: 'stamp', duration: [500, 900] },
      { frame: '01', state: 'idle', duration: [800, 1800] }
    ] },
    specialAction: { interval: [18000, 36000], sequence: [
      { frame: '03', state: 'write-ledger', duration: [700, 1100] },
      { frame: '04', state: 'check-invoice', duration: [600, 1000] },
      { frame: '07', state: 'direct-inbound', duration: [500, 900] },
      { frame: '08', state: 'direct-workers', duration: [750, 1200] },
      { frame: '09', state: 'direct-workers-hold', duration: [1400, 2600] },
      { frame: '10', state: 'workers-depart', duration: [900, 1500] },
      { frame: '01', state: 'idle', duration: [1000, 1800] }
    ] }
  },
  timing: {
    idle: [800, 1800]
  }
};
window.characterPositions = characterPositions;
window.characterMobilePositions = characterMobilePositions;
window.pangtongAnimations = pangtongAnimations;
window.zhugeAnimations = zhugeAnimations;
window.chenqunAnimations = chenqunAnimations;
window.huatuoAnimations = huatuoAnimations;
window.liubeiAnimations = liubeiAnimations;
window.simayiAnimations = simayiAnimations;
window.manchongAnimations = manchongAnimations;
