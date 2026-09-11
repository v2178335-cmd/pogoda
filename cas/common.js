/* ═══════════════════════════════════════════════════════
   ОБЩИЙ КОД ИГРЫ
   Требует, чтобы до подключения были заданы глобальные:
     window.ICONS  — объект { sun:{src,label,emoji}, ... }
     window.SKINS  — массив скинов [{id,name,wins|jackpots,rare,secret?,img}]
   ═══════════════════════════════════════════════════════ */

(function(){
  "use strict";

  const ALL_SYMBOLS = ["cloud","rain","sun","storm","snow","umbrella"];
  const ICONS = window.ICONS;
  const SKINS = window.SKINS;

  if(!ICONS || !SKINS){
    console.error("common.js: window.ICONS и window.SKINS должны быть заданы до загрузки");
    return;
  }

  /* ─── Тексты реакций ───────────────────────────── */
  const REACTIONS = {
    jackpot: [
      "🎰 ДЖЕКПОТ! Три зонтика. Такого не бывает почти никогда.",
      "🎰 ДЖЕКПОТ! Вы собрали все зонты мира.",
      "🎰 ДЖЕКПОТ! Ура! Секретный зонтик открыт — трижды."
    ],
    goodWeather: [
      "☀️ Отличная погода! Три солнца подряд.",
      "☀️ Три солнца — духовное, интеллектуальное и материальное.",
      "☀️ Солнечно и оттого прекрасно."
    ],
    smallWin: {
      cloud: ["Три облака. Пора в Тилимилитрямдию.", "Три облака. Небо в раздумьях."],
      rain:  ["Вам досталось три дождя. Вот счастье-то.", "Три дождя. Поздравляем, вы испортили погоду."],
      storm: ["Три грозы. Побежим домой! Поскорее.", "Три грозы. Где-то там сверкает."],
      snow:  ["Три снега. А в Антарктиде так всегда.", "Три снега. Вам выпал снег. Поздравляем."]
    },
    pair: {
      sun:      ["Два солнца из трёх. Почти лето.", "Скоро будет солнечно. Наверное."],
      cloud:    ["Два облака. Небо в раздумьях.", "Серо, но терпимо."],
      rain:     ["Два дождя. Зонт бы не помешал.", "Вам досталось два дождя. Вот счастье-то."],
      storm:    ["Две грозы. Побежим домой! Поскорее.", "Где-то там сверкает."],
      snow:     ["Два снега. Лопату доставайте.", "А в Антарктиде так всегда."],
      umbrella: ["Два зонта. Один про запас.", "Зонтов много не бывает."]
    },
    tripleMix: {
      "cloud+rain+sun":       ["Облако, дождь и солнце. Классика русского лета.", "И светит, и капает, и облачно. Полный набор."],
      "cloud+rain+storm":     ["Облако, дождь и гроза. Погода решила не мелочиться.", "Пасмурно, мокро и сверкает. Красота."],
      "cloud+rain+snow":      ["Дождь со снегом и облака. Ноябрь, привет.", "Слякоть в трёх лицах."],
      "cloud+sun+umbrella":   ["Солнце, облако и зонт. На всякий случай.", "Зонт при солнце — оптимизм."],
      "cloud+storm+sun":      ["Солнце, облако и гроза. Погода передумала три раза.", "Сначала светило, потом нахмурилось, потом бахнуло."],
      "cloud+umbrella+rain":  ["Зонт, дождь и облако. Всё по плану.", "Зонт явно не лишний в этой компании."],
      "rain+storm+sun":       ["Солнце, дождь и гроза. Радуга точно будет.", "Грибная гроза — редкий зверь."],
      "rain+sun+umbrella":    ["Солнце, дождь и зонт. Грибной дождь с зонтом.", "И светит, и капает, и зонт наготове."],
      "rain+snow+storm":      ["Дождь, снег и гроза. Апокалипсис местного масштаба.", "Всё, что могло выпасть — выпало."],
      "cloud+snow+sun":       ["Солнце, облако и снег. Зимняя сказка.", "Снежок при солнце — красиво же."],
      "cloud+rain+umbrella":  ["Зонт, дождь и облако. Зонт не зря."],
      "snow+storm+umbrella":  ["Зонт, снег и гроза. Зонт против града.", "Гроза со снегом — зонт точно пригодится."],
      "sun+snow+umbrella":    ["Солнце, снег и зонт. Зонт от снега, ага.", "Снег и солнце — зонт как шляпа."],
      "rain+snow+sun":        ["Солнце, дождь и снег. Всё сразу.", "Ледоход в миниатюре."],
      "rain+snow+umbrella":   ["Зонт, дождь и снег. Мокрый снег — худший вид.", "Зонт при дожде со снегом — спасение."],
      "snow+storm+sun":       ["Солнце, гроза и снег. Погода сломалась.", "Такое бывает только в горах."],
      "cloud+storm+umbrella": ["Зонт, облако и гроза. Зонт не спасёт от молнии.", "Зонт при грозе — смело."],
      "cloud+snow+storm":     ["Облако, снег и гроза. Метель с громом.", "Снежная гроза — редкое явление."],
      "rain+storm+umbrella":  ["Зонт, дождь и гроза. Зонт просто обязан быть.", "Полный мокрый комплект."],
      "cloud+snow+umbrella":  ["Зонт, облако и снег. Зонт от снега — ну ок.", "Зонт при снеге — бывает."],
      "cloud+sun+storm":      ["Солнце, облако и гроза. Всё меняется на глазах."],
      "rain+sun+storm":       ["Солнце, дождь и гроза. Тройной форсаж."],
      "rain+storm+snow":      ["Дождь, гроза и снег. Погода сошла с ума."]
    },
    allDifferent: [
      "Все три разные. Погода и удача непредсказуемы. Продолжайте.",
      "Снова не повезло — зато разнообразие.",
      "Третий проигрыш подряд — это почти выигрыш. Попробуйте еще раз.",
      "А некоторые, бывает, выигрывают.",
      "Просто продолжайте.",
      "Ну еще разок!",
      "Чем дальше — тем интереснее.",
      "Сложно управлять погодой.",
      "Осторожнее, вы так погоду испортите.",
      "Вот такая дёрганая погода."
    ]
  };

  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const tripleKey = syms => [...syms].sort().join("+");

  /* ─── СОХРАНЕНИЕ ───────────────────────────────── */
  const STORE_KEY = "bandit_save_v2";

  const Save = (() => {
    let data = {
      attempts: 0, wins: 0, jackpots: 0, misses: 0,
      selectedSkinId: 1, unlockedSkinIds: [1], history: [],
    };

    function load(){
      try{
        const raw = localStorage.getItem(STORE_KEY);
        if(raw){
          const parsed = JSON.parse(raw);
          data = { ...data, ...parsed };
          if(!Array.isArray(data.unlockedSkinIds) || !data.unlockedSkinIds.includes(1)){
            data.unlockedSkinIds = Array.from(new Set([1, ...(data.unlockedSkinIds||[])]));
          }
          if(!Array.isArray(data.history)) data.history = [];
          if(typeof data.jackpots !== "number") data.jackpots = 0;
        }
      }catch(e){}
    }
    function persist(){
      try{ localStorage.setItem(STORE_KEY, JSON.stringify(data)); }catch(e){}
    }
    load();

    return {
      get: () => data,
      save: persist,
      reset(){
        data = { attempts:0, wins:0, jackpots:0, misses:0,
                 selectedSkinId:1, unlockedSkinIds:[1], history:[] };
        persist();
      }
    };
  })();

  /* ─── НАСТРОЙКИ ЗВУКА ──────────────────────────── */
  const AudioSettings = (() => {
    const KEY = "bandit_audio_latency";
    let latency = 80;
    try{
      const saved = localStorage.getItem(KEY);
      if(saved !== null){
        const v = parseInt(saved, 10);
        if(!isNaN(v) && v >= 0 && v <= 1500) latency = v;
      }
    }catch(e){}
    return {
      get: () => latency,
      set: (v) => {
        latency = Math.max(0, Math.min(1500, v|0));
        try{ localStorage.setItem(KEY, latency); }catch(e){}
      }
    };
  })();

  /* ─── ЗВУК ─────────────────────────────────────── */
  const SoundEngine = (() => {
    let ctx = null, enabled = true;
    try{
      if(localStorage.getItem("bandit_sound") === "off") enabled = false;
    }catch(e){}

    function ensureCtx(){
      if(!ctx){
        const AC = window.AudioContext || window.webkitAudioContext;
        if(!AC) return null;
        ctx = new AC();
      }
      if(ctx.state === "suspended") ctx.resume();
      return ctx;
    }

    function tone(freq, duration, opts={}){
      if(!enabled) return;
      const c = ensureCtx(); if(!c) return;
      const osc = c.createOscillator(), gain = c.createGain();
      const t0 = c.currentTime;
      osc.type = opts.type || "sine";
      osc.frequency.setValueAtTime(freq, t0);
      const vol = opts.volume ?? 0.15;
      const attack = opts.attack ?? 0.01;
      const release = opts.release ?? duration;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(vol, t0 + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + release);
      osc.connect(gain); gain.connect(c.destination);
      osc.start(t0); osc.stop(t0 + attack + release + 0.05);
    }

    function tick(){
      if(!enabled) return;
      const c = ensureCtx(); if(!c) return;
      const t0 = c.currentTime;
      const osc = c.createOscillator(), gain = c.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(1500, t0);
      osc.frequency.exponentialRampToValueAtTime(500, t0 + 0.025);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.045, t0 + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);
      osc.connect(gain); gain.connect(c.destination);
      osc.start(t0); osc.stop(t0 + 0.05);
    }

    function ding(){
      if(!enabled) return;
      const c = ensureCtx(); if(!c) return;
      const t0 = c.currentTime;
      [1046.5, 1568.0].forEach((f, idx)=>{
        const osc = c.createOscillator(), gain = c.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.14 : 0.07, t0 + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
        osc.connect(gain); gain.connect(c.destination);
        osc.start(t0); osc.stop(t0 + 0.22);
      });
    }

    function win(){
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i)=>{
        setTimeout(()=>{ tone(f, 0.35, { type:"triangle", volume:0.14 }); }, i * 90);
      });
    }

    function jackpot(){
      [523.25, 659.25, 783.99, 1046.5].forEach(f => tone(f, 0.9, { type:"triangle", volume:0.12 }));
      setTimeout(()=>{
        [587.33, 739.99, 880, 1174.66].forEach(f => tone(f, 0.9, { type:"triangle", volume:0.12 }));
      }, 180);
      setTimeout(()=>{
        [659.25, 830.61, 987.77, 1318.51].forEach(f => tone(f, 1.2, { type:"triangle", volume:0.14 }));
      }, 380);
    }

    function leverPull(){
      if(!enabled) return;
      const c = ensureCtx(); if(!c) return;
      const t0 = c.currentTime;
      const osc = c.createOscillator(), gain = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, t0);
      osc.frequency.linearRampToValueAtTime(180, t0 + 0.12);
      osc.frequency.linearRampToValueAtTime(140, t0 + 0.22);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.035, t0 + 0.03);
      gain.gain.setValueAtTime(0.035, t0 + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);
      osc.connect(gain); gain.connect(c.destination);
      osc.start(t0); osc.stop(t0 + 0.3);

      const bufferSize = c.sampleRate * 0.2;
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i=0;i<bufferSize;i++){
        data[i] = (Math.random()*2 - 1) * (1 - i/bufferSize) * 0.3;
      }
      const noise = c.createBufferSource(); noise.buffer = buffer;
      const noiseGain = c.createGain();
      noiseGain.gain.setValueAtTime(0.015, t0);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
      const filter = c.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 800;
      filter.Q.value = 1.5;
      noise.connect(filter); filter.connect(noiseGain);
      noiseGain.connect(c.destination);
      noise.start(t0); noise.stop(t0 + 0.25);
    }

    function unlock(){
      const c = ensureCtx();
      if(c && c.state === "suspended") c.resume();
    }

    return {
      tick, ding, win, jackpot, leverPull, unlock,
      isEnabled: () => enabled,
      setEnabled: (v) => {
        enabled = v;
        try{ localStorage.setItem("bandit_sound", v ? "on" : "off"); }catch(e){}
      }
    };
  })();

  /* ─── Кнопка звука ─────────────────────────────── */
  const soundToggle = document.getElementById("soundToggle");
  const soundIcon = document.getElementById("soundIcon");
  const soundLabel = document.getElementById("soundLabel");

  function updateSoundUI(){
    const on = SoundEngine.isEnabled();
    soundIcon.textContent = on ? "🔊" : "🔇";
    soundLabel.textContent = on ? "Вкл" : "Выкл";
    soundToggle.classList.toggle("off", !on);
  }
  updateSoundUI();
  soundToggle.addEventListener("click", ()=>{
    SoundEngine.setEnabled(!SoundEngine.isEnabled());
    updateSoundUI();
    if(SoundEngine.isEnabled()){
      SoundEngine.unlock();
      SoundEngine.ding();
    }
  });

  /* ─── Калибровка ───────────────────────────────── */
  const calibBtn = document.getElementById("calibBtn");
  const calibOverlay = document.getElementById("calibOverlay");
  const calibRange = document.getElementById("calibRange");
  const calibVal = document.getElementById("calibVal");
  const calibTest = document.getElementById("calibTest");
  const calibClose = document.getElementById("calibClose");
  const calibFlash = document.getElementById("calibFlash");

  calibRange.value = AudioSettings.get();
  calibVal.textContent = AudioSettings.get();
  calibRange.addEventListener("input", ()=>{
    const v = parseInt(calibRange.value, 10);
    calibVal.textContent = v;
    AudioSettings.set(v);
  });
  calibBtn.addEventListener("click", ()=>{
    calibRange.value = AudioSettings.get();
    calibVal.textContent = AudioSettings.get();
    calibOverlay.classList.add("open");
  });
  calibClose.addEventListener("click", ()=> calibOverlay.classList.remove("open"));
  calibTest.addEventListener("click", ()=>{
    SoundEngine.unlock();
    const latency = AudioSettings.get();
    calibFlash.classList.remove("on");
    void calibFlash.offsetWidth;
    calibFlash.classList.add("on");
    setTimeout(()=>{ SoundEngine.ding(); }, latency);
  });

  /* ─── Коллекция ────────────────────────────────── */
  const collectionOverlay = document.getElementById("collectionOverlay");
  const collectionGrid = document.getElementById("collectionGrid");
  const collectionTotal = document.getElementById("collectionTotal");
  const collectionUnlocked = document.getElementById("collectionUnlocked");
  const openCollectionBtn = document.getElementById("openCollection");
  const collectionClose = document.getElementById("collectionClose");
  const collectionReset = document.getElementById("collectionReset");
  const currentSkinImg = document.getElementById("currentSkinImg");
  const currentSkinName = document.getElementById("currentSkinName");
  const currentSkinProgress = document.getElementById("currentSkinProgress");

  let selectedSkinId = Save.get().selectedSkinId || 1;

  function getSkinById(id){
    return SKINS.find(s => s.id === id) || SKINS[0];
  }
  function isUnlocked(id){
    return Save.get().unlockedSkinIds.includes(id);
  }
  function getUmbrellaIconSrc(){
    return getSkinById(selectedSkinId).img;
  }

  function refreshProgressOnBar(){
    const data = Save.get();
    const skin = getSkinById(selectedSkinId);
    currentSkinImg.innerHTML = "";
    const img = document.createElement("img");
    img.src = skin.img;
    img.alt = skin.name;
    img.onerror = function(){ currentSkinImg.textContent = "☂️"; };
    currentSkinImg.appendChild(img);
    currentSkinName.textContent = skin.name;

    const nextWinSkin = SKINS.find(s => !s.secret && !isUnlocked(s.id) && s.wins > data.wins);
    const secretSkin = SKINS.find(s => s.secret && !isUnlocked(s.id));

    if(nextWinSkin){
      currentSkinProgress.textContent = `${data.wins} / ${nextWinSkin.wins} выигрышей до «${nextWinSkin.name}»`;
    } else if(secretSkin){
      currentSkinProgress.textContent = `${data.jackpots} / ${secretSkin.jackpots} джекпотов до «${secretSkin.name}»`;
    } else {
      currentSkinProgress.textContent = `${data.wins} выигрышей · все зонты открыты`;
    }
  }

  function refreshUmbrellaIconsInReels(){
    const src = getUmbrellaIconSrc();
    document.querySelectorAll('.cell[data-sym="umbrella"] img').forEach(img=>{
      img.src = src;
      img.onerror = function(){
        this.replaceWith(document.createTextNode("☂️"));
      };
    });
  }

  function refreshCollection(){
    collectionGrid.innerHTML = "";
    const data = Save.get();
    SKINS.forEach(skin => {
      const unlocked = data.unlockedSkinIds.includes(skin.id);
      const card = document.createElement("div");
      card.className = "skin-card";
      if(!unlocked) card.classList.add("locked");
      if(skin.id === selectedSkinId) card.classList.add("selected");

      let badge = "";
      if(skin.rare) badge = `<div class="skin-card-badge rare">RARE</div>`;
      if(skin.id === selectedSkinId) badge = `<div class="skin-card-check">✓</div>` + badge;

      let progressText, isSecretLock = false;
      if(unlocked){ progressText = "Открыт"; }
      else if(skin.secret){ progressText = "Секретный"; isSecretLock = true; }
      else { progressText = `Ещё ${Math.max(0, skin.wins - data.wins)} выигрышей`; }

      const imgWrapper = document.createElement("div");
      imgWrapper.className = "skin-card-img";
      const img = document.createElement("img");
      img.src = skin.img;
      img.alt = skin.name;
      img.onerror = function(){ imgWrapper.textContent = "☂️"; };
      imgWrapper.appendChild(img);

      card.innerHTML = badge;
      card.appendChild(imgWrapper);
      const nameEl = document.createElement("div");
      nameEl.className = "skin-card-name";
      nameEl.textContent = skin.name;
      card.appendChild(nameEl);
      const progEl = document.createElement("div");
      progEl.className = "skin-card-progress";
      if(isSecretLock) progEl.classList.add("secret");
      progEl.textContent = progressText;
      card.appendChild(progEl);

      card.addEventListener("click", ()=>{
        if(!unlocked) return;
        selectedSkinId = skin.id;
        const d = Save.get();
        d.selectedSkinId = skin.id;
        Save.save();
        refreshCollection();
        refreshProgressOnBar();
        refreshUmbrellaIconsInReels();
      });

      collectionGrid.appendChild(card);
    });
    collectionTotal.textContent = SKINS.length;
    collectionUnlocked.textContent = data.unlockedSkinIds.length;
  }

  openCollectionBtn.addEventListener("click", ()=>{
    refreshCollection();
    collectionOverlay.classList.add("open");
  });
  collectionClose.addEventListener("click", ()=> collectionOverlay.classList.remove("open"));
  collectionReset.addEventListener("click", ()=>{
    if(!confirm("Сбросить весь прогресс? Прокрутки, зонты, история — всё исчезнет.")) return;
    Save.reset();
    selectedSkinId = 1;
    updateStatsUI();
    updateLuckUI();
    renderHistory();
    refreshProgressOnBar();
    refreshUmbrellaIconsInReels();
    refreshCollection();
    checkUnlocks();
  });

  function checkUnlocks(){
    const data = Save.get();
    let changed = false;
    SKINS.forEach(skin => {
      if(data.unlockedSkinIds.includes(skin.id)) return;
      if(skin.secret){
        if(data.jackpots >= skin.jackpots){ data.unlockedSkinIds.push(skin.id); changed = true; }
      } else if(skin.wins !== undefined && data.wins >= skin.wins){
        data.unlockedSkinIds.push(skin.id); changed = true;
      }
    });
    if(changed) Save.save();
    refreshProgressOnBar();
  }

  /* ─── КОНФЕТТИ — дождь сверху по всей ширине ─── */
  const confettiLayer = document.getElementById("confettiLayer");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function dropConfetti(sym, count){
    if(prefersReducedMotion) return;
    const icon = ICONS[sym];
    if(!icon) return;
    const src = (sym === "umbrella") ? getUmbrellaIconSrc() : icon.src;

    const vw = window.innerWidth;
    const baseSize = vw <= 600 ? 34 : 52;

    for(let i=0;i<count;i++){
      const piece = document.createElement("div");
      piece.className = "confetti-piece";

      const size = baseSize * (0.7 + Math.random()*0.7);
      piece.style.width = size + "px";
      piece.style.height = size + "px";

      // Ключевое: случайная позиция по X по всей ширине экрана
      piece.style.left = (Math.random() * vw) + "px";
      // стартуем с разной высоты — не все с самого верха, чуть разброс
      piece.style.top = (-80 - Math.random()*120) + "px";

      // дрейф по X при падении
      const dx = (Math.random() - 0.5) * 160;
      piece.style.setProperty("--dx", dx + "px");

      const rot = (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random()*540);
      piece.style.setProperty("--rot", rot + "deg");

      const duration = 2400 + Math.random()*1600;
      const delay = Math.random()*600;
      piece.style.animationDuration = duration + "ms";
      piece.style.animationDelay = delay + "ms";

      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.onerror = function(){
        const span = document.createElement("span");
        span.textContent = icon.emoji;
        span.style.fontSize = size + "px";
        span.style.lineHeight = "1";
        span.style.display = "block";
        piece.replaceChild(span, img);
      };
      piece.appendChild(img);

      confettiLayer.appendChild(piece);
      setTimeout(()=>{ piece.remove(); }, duration + delay + 200);
    }
  }

  /* ─── PITY ─────────────────────────────────────── */
  const BASE_CHANCE = 1/36, MAX_CHANCE = 0.5, PITY_SCALE = 20;

  function currentChance(){
    const progress = Math.min(Save.get().misses / PITY_SCALE, 1);
    const bonus = progress * progress * (MAX_CHANCE - BASE_CHANCE);
    return Math.min(BASE_CHANCE + bonus, MAX_CHANCE);
  }
  function resetChance(){ const d = Save.get(); d.misses = 0; Save.save(); }
  function registerMiss(){ const d = Save.get(); d.misses += 1; Save.save(); }

  /* ─── БАРАБАНЫ ─────────────────────────────────── */
  const VISUAL_REELS = [
    ["cloud","rain","sun","storm","snow","umbrella"],
    ["rain","sun","cloud","snow","storm","umbrella"],
    ["sun","storm","rain","cloud","umbrella","snow"],
  ];

  let CELL_H = 170;
  const REPEAT = 12, DURATION = 2600;
  const currentStops = [0, 0, 0];
  const strips = [0,1,2].map(i=>document.getElementById("reel"+i));

  function buildStrip(stripEl, symbols){
    stripEl.innerHTML = "";
    for(let r=0;r<REPEAT;r++){
      symbols.forEach(sym=>{
        const icon = ICONS[sym];
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.sym = sym;
        const src = (sym === "umbrella") ? getUmbrellaIconSrc() : icon.src;
        cell.innerHTML = `
          <img src="${src}" alt="${icon.label}"
               onerror="this.replaceWith(document.createTextNode('${icon.emoji}'))"
               style="font-size:56px;line-height:1;">
          <div class="label">${icon.label}</div>
        `;
        stripEl.appendChild(cell);
      });
    }
  }
  strips.forEach((el,i)=>buildStrip(el, VISUAL_REELS[i]));

  function measureCellHeight(){
    const firstCell = document.querySelector(".cell");
    if(firstCell){ CELL_H = firstCell.getBoundingClientRect().height || 170; }
  }
  measureCellHeight();

  let resizeTimer = null;
  window.addEventListener("resize", ()=>{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(()=>{
      measureCellHeight();
      strips.forEach((el, i)=>{
        const stopIndex = currentStops[i] ?? 0;
        const targetPos = (REPEAT - 1) * VISUAL_REELS[i].length + stopIndex;
        el.style.transform = `translateY(${-targetPos * CELL_H}px)`;
      });
    }, 150);
  });

  /* ─── ЛАМПОЧКИ ─────────────────────────────────── */
  const lampsEl = document.getElementById("lamps");
  const LAMPS = 9, lamps = [];
  for(let i=0;i<LAMPS;i++){
    const d = document.createElement("div");
    d.className = "lamp";
    lampsEl.appendChild(d);
    lamps.push(d);
  }
  let lampTimer = null;
  function startLamps(){
    let i = 0;
    lampTimer = setInterval(()=>{
      lamps.forEach((l, idx)=>{
        const phase = (idx - i + LAMPS*2) % LAMPS;
        l.classList.toggle("on", phase === 0 || phase === 1);
      });
      i++;
    }, 110);
  }
  function stopLamps(){
    clearInterval(lampTimer);
    lampTimer = null;
    lamps.forEach(l=>l.classList.remove("on"));
  }

  /* ─── ПРОКРУТКА ────────────────────────────────── */
  function spinReel(stripEl, symbols, stopIndex, duration){
    return new Promise(resolve=>{
      const targetPos = (REPEAT - 1) * symbols.length + stopIndex;
      const startY = 0, endY = -targetPos * CELL_H;
      let lastCellIndex = -1, dingPlayed = false;
      const start = performance.now();

      function frame(now){
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        const e = 1 - Math.pow(1 - t, 3);
        const y = startY + (endY - startY) * e;
        stripEl.style.transform = `translateY(${y}px)`;

        const cellIndex = Math.floor(Math.abs(y) / CELL_H);
        if(cellIndex !== lastCellIndex){ lastCellIndex = cellIndex; SoundEngine.tick(); }

        const latency = AudioSettings.get();
        if(!dingPlayed && elapsed >= duration - latency){
          dingPlayed = true; SoundEngine.ding();
        }

        if(t < 1){ requestAnimationFrame(frame); }
        else {
          stripEl.style.transform = `translateY(${endY}px)`;
          if(!dingPlayed){ dingPlayed = true; SoundEngine.ding(); }
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  function findSymbolIndex(reelIdx, sym){
    const idx = VISUAL_REELS[reelIdx].indexOf(sym);
    return idx >= 0 ? idx : 0;
  }

  /* ─── РЫЧАГ ────────────────────────────────────── */
  const lever = document.getElementById("lever");
  function pullLever(){
    return new Promise(resolve=>{
      lever.classList.add("pulling");
      setTimeout(()=>{
        lever.classList.remove("pulling");
        lever.classList.add("pulled");
        setTimeout(()=>{
          lever.classList.remove("pulled");
          lever.classList.add("recoil");
          setTimeout(()=>{
            lever.classList.remove("recoil");
            resolve();
          }, 550);
        }, 200);
      }, 150);
    });
  }

  /* ─── ИСТОРИЯ ──────────────────────────────────── */
  const historyListEl = document.getElementById("historyList");
  const historyClearBtn = document.getElementById("historyClear");
  const HISTORY_MAX = 20;

  function renderHistory(){
    const history = Save.get().history || [];
    historyListEl.innerHTML = "";
    if(history.length === 0){
      const empty = document.createElement("div");
      empty.className = "history-empty";
      empty.textContent = "Пока пусто — дёрни рычаг.";
      historyListEl.appendChild(empty);
      return;
    }
    history.slice().reverse().forEach(item=>{
      const el = document.createElement("div");
      el.className = "history-item";
      if(item.type === "jackpot") el.classList.add("jackpot");
      else if(item.type === "goodWeather" || item.type === "smallWin") el.classList.add("win");

      const symsRow = document.createElement("div");
      symsRow.className = "history-syms";
      item.syms.forEach(sym=>{
        const icon = ICONS[sym];
        const img = document.createElement("img");
        const src = (sym === "umbrella") ? getUmbrellaIconSrc() : icon.src;
        img.src = src;
        img.alt = "";
        img.onerror = function(){
          const sp = document.createElement("span");
          sp.className = "emoji";
          sp.textContent = icon.emoji;
          img.replaceWith(sp);
        };
        symsRow.appendChild(img);
      });
      el.appendChild(symsRow);

      const lbl = document.createElement("div");
      lbl.className = "history-label";
      if(item.type === "jackpot") lbl.textContent = "Джекпот";
      else if(item.type === "goodWeather") lbl.textContent = "Солнце";
      else if(item.type === "smallWin") lbl.textContent = "Выигрыш";
      else lbl.textContent = "Мимо";
      el.appendChild(lbl);
      historyListEl.appendChild(el);
    });
  }

  historyClearBtn.addEventListener("click", ()=>{
    const data = Save.get();
    data.history = [];
    Save.save();
    renderHistory();
  });

  /* ─── ИГРА ─────────────────────────────────────── */
  const resultEl = document.getElementById("result");
  const attemptsEl = document.getElementById("attempts");
  const winsEl = document.getElementById("wins");
  const jackpotsEl = document.getElementById("jackpots");
  const luckFillEl = document.getElementById("luckFill");
  const luckLabelEl = document.getElementById("luckLabel");
  const reelEls = document.querySelectorAll(".reel");

  let spinning = false;

  function updateStatsUI(){
    const d = Save.get();
    attemptsEl.textContent = d.attempts;
    winsEl.textContent = d.wins;
    jackpotsEl.textContent = d.jackpots;
  }

  function updateLuckUI(){
    const chance = currentChance();
    const pct = (chance * 100);
    luckFillEl.style.width = `${Math.min(pct * 2, 100)}%`;
    luckLabelEl.textContent = `Удача: ${pct.toFixed(1).replace('.', ',')}%`;
    if(chance > 0.1) luckLabelEl.classList.add("active");
    else luckLabelEl.classList.remove("active");
  }

  function decideOutcome(){
    const chance = currentChance();
    const roll = Math.random();
    if(roll < chance){
      const prizeRoll = Math.random();
      if(prizeRoll < 1/6)  return { type:"jackpot",     sym:"umbrella" };
      if(prizeRoll < 3/6)  return { type:"goodWeather", sym:"sun" };
      const others = ["cloud","rain","storm","snow"];
      return { type:"smallWin", sym: pick(others) };
    } else {
      if(Math.random() < 0.4){
        const pairSym = pick(ALL_SYMBOLS);
        let otherSym = pick(ALL_SYMBOLS);
        while(otherSym === pairSym) otherSym = pick(ALL_SYMBOLS);
        return { type:"pair", pairSym, otherSym };
      } else {
        const shuffled = [...ALL_SYMBOLS].sort(()=>Math.random()-0.5);
        return { type:"allDifferent", syms: shuffled.slice(0,3) };
      }
    }
  }

  function buildSymbolsFromOutcome(outcome){
    if(outcome.type === "jackpot" || outcome.type === "goodWeather" || outcome.type === "smallWin"){
      return [outcome.sym, outcome.sym, outcome.sym];
    }
    if(outcome.type === "pair"){
      return [outcome.pairSym, outcome.pairSym, outcome.otherSym].sort(()=>Math.random()-0.5);
    }
    return outcome.syms;
  }

  async function spin(){
    if(spinning) return;
    spinning = true;
    SoundEngine.unlock();
    lever.style.pointerEvents = "none";
    resultEl.style.opacity = 0;
    reelEls.forEach(r => r.style.boxShadow = "");

    SoundEngine.leverPull();
    pullLever();
    startLamps();

    const data = Save.get();
    data.attempts += 1;
    Save.save();
    updateStatsUI();

    const outcome = decideOutcome();
    const syms = buildSymbolsFromOutcome(outcome);
    const indexes = syms.map((sym, i)=> findSymbolIndex(i, sym));
    indexes.forEach((idx,i)=> currentStops[i] = idx);

    await Promise.all([
      spinReel(strips[0], VISUAL_REELS[0], indexes[0], DURATION),
      spinReel(strips[1], VISUAL_REELS[1], indexes[1], DURATION + 350),
      spinReel(strips[2], VISUAL_REELS[2], indexes[2], DURATION + 700),
    ]);
    stopLamps();

    const isWin = (outcome.type === "jackpot" || outcome.type === "goodWeather" || outcome.type === "smallWin");
    if(isWin){
      data.wins += 1;
      if(outcome.type === "jackpot") data.jackpots += 1;
      resetChance();
    } else {
      registerMiss();
    }
    Save.save();
    updateStatsUI();
    updateLuckUI();
    checkUnlocks();

    const history = Save.get().history;
    history.push({ type: outcome.type, syms, ts: Date.now() });
    while(history.length > HISTORY_MAX) history.shift();
    Save.save();
    renderHistory();

    setTimeout(()=>{ showOutcomeSound(outcome); }, AudioSettings.get() + 140);
    showOutcome(outcome, syms);

    spinning = false;
    lever.style.pointerEvents = "";
  }

  function showOutcomeSound(outcome){
    if(outcome.type === "jackpot") SoundEngine.jackpot();
    else if(outcome.type === "goodWeather" || outcome.type === "smallWin") SoundEngine.win();
  }

  function showOutcome(outcome, syms){
    let text = "";
    if(outcome.type === "jackpot"){
      text = `<span class="jackpot">${pick(REACTIONS.jackpot)}</span>`;
      reelEls.forEach(r => { r.style.boxShadow = "0 0 0 3px var(--jackpot), 0 0 32px rgba(255,181,83,.7)"; });
      setTimeout(()=>{ reelEls.forEach(r => r.style.boxShadow = ""); }, 2200);
      dropConfetti("umbrella", 40);
    }
    else if(outcome.type === "goodWeather"){
      text = `<span class="win">${pick(REACTIONS.goodWeather)}</span>`;
      reelEls.forEach(r => { r.style.boxShadow = "0 0 0 2px var(--accent), 0 0 24px rgba(176,237,0,.5)"; });
      setTimeout(()=>{ reelEls.forEach(r => r.style.boxShadow = ""); }, 1800);
      dropConfetti("sun", 30);
    }
    else if(outcome.type === "smallWin"){
      text = `<span class="win">${pick(REACTIONS.smallWin[outcome.sym])}</span>`;
      reelEls.forEach(r => { r.style.boxShadow = "0 0 0 2px var(--accent), 0 0 24px rgba(176,237,0,.5)"; });
      setTimeout(()=>{ reelEls.forEach(r => r.style.boxShadow = ""); }, 1500);
      dropConfetti(outcome.sym, 20);
    }
    else if(outcome.type === "pair"){
      text = pick(REACTIONS.pair[outcome.pairSym]);
    }
    else {
      const key = tripleKey(syms);
      const specific = REACTIONS.tripleMix[key];
      text = specific ? pick(specific) : pick(REACTIONS.allDifferent);
    }
    resultEl.innerHTML = text;
    resultEl.style.opacity = 1;
  }

  lever.addEventListener("click", spin);
  document.addEventListener("keydown", e=>{
    if(e.code === "Space"){
      if(document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;
      e.preventDefault();
      spin();
    }
    if(e.key === "Escape"){
      calibOverlay.classList.remove("open");
      collectionOverlay.classList.remove("open");
    }
  });

  /* ─── Инициализация ───────────────────────────── */
  updateStatsUI();
  updateLuckUI();
  renderHistory();
  refreshProgressOnBar();
  refreshUmbrellaIconsInReels();
  checkUnlocks();
})();