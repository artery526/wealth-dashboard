// All timing values are milliseconds. Original PNG files remain untouched.
window.DEBUG_CHARACTERS = false;
const characterPositions = {
  pangtong: { top: '13%', left: '45.5%', width: '9%' },
  zhuge: { top: '54%', left: '16.5%', width: '9%' },
  chenqun: { top: '29%', left: '21%', width: '8.5%' },
  liubei: { top: '26%', left: '74%', width: '8.5%' },
  manchong: { top: '56%', left: '75.5%', width: '10%' }
};
const characterMobilePositions = {
  pangtong: { top: '10%', left: '25%', width: '17.5%' },
  zhuge: { top: '10%', left: '58%', width: '17.5%' },
  liubei: { top: '43%', left: '69%', width: '15%' },
  chenqun: { top: '42%', left: '14%', width: '17%' },
  manchong: { top: '62%', left: '67%', width: '17%' }
};
const pangtongAnimations = {
  name: '龐統',
  frames: {
    '01': './龐統/站立握酒瓶01.webp',
    '02': './龐統/酒瓶喝酒02.webp',
    '03': './龐統/睡眠小憩03.webp',
    '04': './龐統/喝酒遠望04.webp',
    '05': './龐統/帶酒行走05.webp',
    '06': './龐統/帶酒行走放下酒瓶06.webp',
    '07': './龐統/行走放下酒瓶拿出卷軸07.webp',
    '08': './龐統/指點地圖08.webp'
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
    '01': './諸葛亮/待機站立01.webp',
    '02': './諸葛亮/輕搖羽扇02.webp',
    '03': './諸葛亮/輕搖羽扇03.webp',
    '04': './諸葛亮/輕搖羽扇04.webp',
    '05': './諸葛亮/揮扇指揮05.webp',
    '06': './諸葛亮/提出計策06.webp',
    '07': './諸葛亮/提出計策電燈泡07.webp',
    '08': './諸葛亮/運籌帷幄08.webp'
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
  frames: Object.fromEntries(Array.from({ length: 17 }, (_, i) => {
    const key = String(i + 1).padStart(2, '0');
    return [key, `./陳群/chenqun_idle_${key}.webp`];
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
      { frame: '09', state: 'treasury', duration: [700, 1100] },
      { frame: '10', state: 'treasury', duration: [700, 1100] },
      { frame: '11', state: 'writing', duration: [700, 1100] },
      { frame: '12', state: 'grain', duration: [700, 1100] },
      { frame: '13', state: 'idle', duration: [700, 1100] },
      { frame: '14', state: 'grain', duration: [700, 1100] },
      { frame: '15', state: 'grain', duration: [700, 1100] },
      { frame: '16', state: 'grain', duration: [700, 1100] },
      { frame: '17', state: 'grain', duration: [700, 1100] },
      { frame: '01', state: 'idle', duration: [800, 1800] }
    ] }
  },
  timing: {
    idle: [800, 1800]
  }
};
const liubeiAssetVersion = '20260920-liubei-webp1';
const liubeiAsset = file => `./劉備/${file}?v=${liubeiAssetVersion}`;
const liubeiAnimations = {
  name: '劉備',
  frameScale: {
    '12': 1.65,
    '13': 1.65,
    '14': 1.65,
    '15': 1.65,
    '16': 1.65,
    '17': 1.2
  },
  frames: {
    '01': liubeiAsset('站立01.webp'),
    '02': liubeiAsset('大笑02.webp'),
    '03': liubeiAsset('眨眼03.webp'),
    '04': liubeiAsset('呼吸上升04.webp'),
    '05': liubeiAsset('呼吸下沉05.webp'),
    '06': liubeiAsset('思考06.webp'),
    '07': liubeiAsset('翻開書卷07.webp'),
    '08': liubeiAsset('放下書卷08.webp'),
    '09': liubeiAsset('撰寫回憶09.webp'),
    '10': liubeiAsset('放下卷軸苦思10.webp'),
    '11': liubeiAsset('放下卷軸揮劍出擊11.webp'),
    '12': liubeiAsset('放下卷軸揮劍出擊出兵12.webp'),
    '13': liubeiAsset('放下卷軸揮劍出擊出兵13.webp'),
    '14': liubeiAsset('放下卷軸揮劍出擊出兵廝殺14.webp'),
    '15': liubeiAsset('放下卷軸揮劍出擊出兵廝殺15.webp'),
    '16': liubeiAsset('放下卷軸揮劍出擊出兵廝殺16.webp'),
    '17': liubeiAsset('王府前站立17.webp')
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
      { frame: '12', state: 'march-to-battle', duration: [900, 1500] },
      { frame: '13', state: 'lead-the-army', duration: [900, 1500] },
      { frame: '14', state: 'battle-clash', duration: [1000, 1700] },
      { frame: '15', state: 'battle-victory', duration: [1200, 2200] },
      { frame: '16', state: 'return-to-palace', duration: [1200, 2200] },
      { frame: '17', state: 'palace-stand', duration: [1000, 1800] },
      { frame: '01', state: 'idle', duration: [1000, 1800] }
    ] }
  },
  timing: {
    idle: [800, 1800]
  }
};
const manchongAssetVersion = '20260920-manchong-webp1';
const manchongAsset = file => `./滿寵/${file}?v=${manchongAssetVersion}`;
const manchongAnimations = {
  name: '滿寵',
  idleFrame: '05',
  frames: {
    '01': manchongAsset('站立待命01.webp'),
    '02': manchongAsset('查看帳冊02.webp'),
    '03': manchongAsset('提筆登記03.webp'),
    '04': manchongAsset('核對貨單04.webp'),
    '05': manchongAsset('驗收貨物05.webp'),
    '06': manchongAsset('蓋章確認06.webp'),
    '07': manchongAsset('指揮入庫07.webp'),
    '08': manchongAsset('指揮入庫工人08.webp'),
    '09': manchongAsset('指揮入庫工人09.webp')
  },
  breathing: [
    { frame: '05', state: 'inspect-armor', duration: [700, 1200] },
    { frame: '08', state: 'weapons-ready', duration: [700, 1200] },
    { frame: '09', state: 'weapons-ready-hold', duration: [900, 1600] },
    { frame: '05', state: 'idle', duration: [800, 1800] }
  ],
  events: {
    secondaryIdle: { interval: [7000, 14000], sequence: [
      { frame: '05', state: 'inspect-armor', duration: [700, 1300] },
      { frame: '08', state: 'weapons-ready', duration: [700, 1100] },
      { frame: '09', state: 'weapons-ready-hold', duration: [1000, 1600] },
      { frame: '05', state: 'idle', duration: [800, 1800] }
    ] },
    specialAction: { interval: [18000, 36000], sequence: [
      { frame: '05', state: 'inspect-armor', duration: [700, 1100] },
      { frame: '06', state: 'stamp', duration: [500, 900] },
      { frame: '07', state: 'direct-inbound', duration: [500, 900] },
      { frame: '08', state: 'direct-workers', duration: [750, 1200] },
      { frame: '09', state: 'direct-workers-hold', duration: [1400, 2600] },
      { frame: '08', state: 'weapons-ready', duration: [750, 1200] },
      { frame: '05', state: 'idle', duration: [1000, 1800] }
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
window.liubeiAnimations = liubeiAnimations;
window.manchongAnimations = manchongAnimations;
