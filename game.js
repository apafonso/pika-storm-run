const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const primaryButton = document.getElementById("primaryButton");
const restartButton = document.getElementById("restartButton");
const newCampaignButton = document.getElementById("newCampaignButton");
const messageLine = document.getElementById("messageLine");
const characterPicker = document.getElementById("characterPicker");
const campaignNote = document.getElementById("campaignNote");
const progressStrip = document.getElementById("progressStrip");

const levelValue = document.getElementById("levelValue");
const worldValue = document.getElementById("worldValue");
const characterValue = document.getElementById("characterValue");
const partsValue = document.getElementById("partsValue");
const powerValue = document.getElementById("powerValue");
const heartValue = document.getElementById("heartValue");
const bossValue = document.getElementById("bossValue");
const levelName = document.getElementById("levelName");

const VIEW_WIDTH = canvas.width;
const VIEW_HEIGHT = canvas.height;
const STAGE_COUNT = 100;
const STAGES_PER_WORLD = 10;
const BASE_GRAVITY = 0.58;

const NORMAL_STAGE_NAMES = [
  "Scout Path",
  "Gear Grove",
  "Ridge Relay",
  "Vault Route",
  "Spring Yard",
  "Signal Run",
  "Sky Steps",
  "Hidden Shaft",
  "Core Approach"
];

const CHARACTERS = [
  {
    id: "pikachu",
    name: "Pikachu",
    title: "Fast electric scout",
    blurb: "The quickest choice. Thunder Dash fires a bolt and launches Pikachu forward through danger.",
    skillName: "Thunder Dash",
    resourceName: "Volt Cells",
    passive: "Highest speed and strongest horizontal burst.",
    speed: 5.7,
    jump: 14.8,
    basePowerCap: 6,
    body: "#ffd84d",
    accent: "#9f6200",
    outline: "#3d2800",
    powerColor: "#fff08a",
    powerType: "dash"
  },
  {
    id: "bulbasaur",
    name: "Bulbasaur",
    title: "Vine-climbing tactician",
    blurb: "Steadier movement and a vertical vine lift. Great for tall levels and careful boss fights.",
    skillName: "Vine Lift",
    resourceName: "Seed Pods",
    passive: "Best air control and an extra lift when the route goes vertical.",
    speed: 4.85,
    jump: 14.9,
    basePowerCap: 6,
    body: "#6cc66e",
    accent: "#c13e67",
    outline: "#143921",
    powerColor: "#a8ff93",
    powerType: "vine"
  },
  {
    id: "charmander",
    name: "Charmander",
    title: "Aggressive flame striker",
    blurb: "Flame Burst gives a short hop and a harder-hitting fire shot. Best for beating bosses quickly.",
    skillName: "Flame Burst",
    resourceName: "Ember Stones",
    passive: "Highest damage output and great for clearing enemy packs.",
    speed: 5.05,
    jump: 15.3,
    basePowerCap: 6,
    body: "#ff9651",
    accent: "#ffdb7a",
    outline: "#532717",
    powerColor: "#ffbf5c",
    powerType: "flame"
  },
  {
    id: "squirtle",
    name: "Squirtle",
    title: "Shielded shell runner",
    blurb: "Shell Spin creates a defensive slide and bubble shot. Safest pick in crowded stages.",
    skillName: "Shell Spin",
    resourceName: "Bubble Pearls",
    passive: "Best defense, strongest recovery, and easier control in water zones.",
    speed: 4.55,
    jump: 14.2,
    basePowerCap: 6,
    body: "#63d8df",
    accent: "#e6fff6",
    outline: "#0b3540",
    powerColor: "#b2fbff",
    powerType: "shell"
  }
];

const WORLDS = [
  {
    name: "Viridian Fields",
    featureName: "spring pads",
    skyTop: "#84d7ff",
    skyBottom: "#f6d56f",
    hillA: "#2b885f",
    hillB: "#1e5647",
    groundTop: "#66cb73",
    groundFace: "#765131",
    platformTop: "#fff1b6",
    platformFace: "#8a6137",
    cloud: "rgba(255,255,255,0.72)",
    gravity: 0.58,
    wind: 0,
    grip: 0.76,
    springs: true
  },
  {
    name: "Granite Gorges",
    featureName: "crosswinds",
    skyTop: "#78c6ff",
    skyBottom: "#ff9b70",
    hillA: "#59765f",
    hillB: "#3c4c3e",
    groundTop: "#c8d171",
    groundFace: "#725135",
    platformTop: "#ffe39d",
    platformFace: "#845830",
    cloud: "rgba(255,245,226,0.68)",
    gravity: 0.58,
    wind: 0.024,
    grip: 0.75,
    updrafts: true
  },
  {
    name: "Neon Depot",
    featureName: "tight machinery",
    skyTop: "#5f8bff",
    skyBottom: "#223251",
    hillA: "#2c4f82",
    hillB: "#1b2d4e",
    groundTop: "#5bc58a",
    groundFace: "#515160",
    platformTop: "#dbe7ff",
    platformFace: "#57637c",
    cloud: "rgba(222,235,255,0.58)",
    gravity: 0.57,
    wind: 0.012,
    grip: 0.78
  },
  {
    name: "Frostbite Caves",
    featureName: "icy footing",
    skyTop: "#9fe7ff",
    skyBottom: "#6ca7d8",
    hillA: "#6bbbd2",
    hillB: "#3d728c",
    groundTop: "#d8f5ff",
    groundFace: "#7e9aa8",
    platformTop: "#f4fdff",
    platformFace: "#9ab0bc",
    cloud: "rgba(240,250,255,0.66)",
    gravity: 0.56,
    wind: 0.01,
    grip: 0.56
  },
  {
    name: "Canopy Lifts",
    featureName: "tall climbs",
    skyTop: "#9cf0d3",
    skyBottom: "#47c19d",
    hillA: "#3b9c70",
    hillB: "#235d47",
    groundTop: "#90e28a",
    groundFace: "#5f4d37",
    platformTop: "#fff0c6",
    platformFace: "#816342",
    cloud: "rgba(245,255,248,0.74)",
    gravity: 0.54,
    wind: 0,
    grip: 0.8,
    springs: true
  },
  {
    name: "Magma Junction",
    featureName: "heat vents",
    skyTop: "#ffb96d",
    skyBottom: "#ff5d4b",
    hillA: "#83563f",
    hillB: "#4f3028",
    groundTop: "#b9cf67",
    groundFace: "#764f35",
    platformTop: "#ffe89f",
    platformFace: "#8b5a2d",
    cloud: "rgba(255,247,232,0.62)",
    gravity: 0.57,
    wind: 0.018,
    grip: 0.74,
    updrafts: true
  },
  {
    name: "Indigo Harbor",
    featureName: "water basins",
    skyTop: "#7ad1ff",
    skyBottom: "#3d75dd",
    hillA: "#2f7b89",
    hillB: "#1c4d5d",
    groundTop: "#74cd86",
    groundFace: "#6d5439",
    platformTop: "#d7f2ff",
    platformFace: "#5e7d92",
    cloud: "rgba(231,246,255,0.64)",
    gravity: 0.55,
    wind: 0.01,
    grip: 0.75,
    water: true
  },
  {
    name: "Thunder Peaks",
    featureName: "storm gusts",
    skyTop: "#607dff",
    skyBottom: "#171d3e",
    hillA: "#324d8d",
    hillB: "#202f56",
    groundTop: "#67bf77",
    groundFace: "#554736",
    platformTop: "#d5ddff",
    platformFace: "#5d6182",
    cloud: "rgba(226,232,255,0.6)",
    gravity: 0.56,
    wind: 0.03,
    grip: 0.73,
    updrafts: true
  },
  {
    name: "Sky Fortress",
    featureName: "low gravity",
    skyTop: "#bfe4ff",
    skyBottom: "#7f95e8",
    hillA: "#6887b2",
    hillB: "#46608a",
    groundTop: "#cfdc89",
    groundFace: "#6f6242",
    platformTop: "#fff7d2",
    platformFace: "#8a7754",
    cloud: "rgba(246,251,255,0.74)",
    gravity: 0.49,
    wind: 0.012,
    grip: 0.79
  },
  {
    name: "Psi Citadel",
    featureName: "warped physics",
    skyTop: "#c091ff",
    skyBottom: "#28174b",
    hillA: "#5f3f8b",
    hillB: "#342154",
    groundTop: "#87cf84",
    groundFace: "#5e4b3a",
    platformTop: "#f2ddff",
    platformFace: "#7d6291",
    cloud: "rgba(245,231,255,0.6)",
    gravity: 0.53,
    wind: 0.02,
    grip: 0.7,
    updrafts: true
  }
];

const BOSSES = [
  { name: "Meowth", pattern: "pouncer", hp: 10, color: "#f1ca8e", accent: "#7a4d25" },
  { name: "Lapras", pattern: "wave", hp: 14, color: "#6db7ff", accent: "#e8f8ff" },
  { name: "Arbok", pattern: "shooter", hp: 16, color: "#9772d6", accent: "#fee181" },
  { name: "Scyther", pattern: "pouncer", hp: 18, color: "#9ed861", accent: "#4e6b2e" },
  { name: "Gengar", pattern: "teleport", hp: 20, color: "#6842ae", accent: "#f45aa4" },
  { name: "Snorlax", pattern: "tank", hp: 24, color: "#5f84a1", accent: "#fff0de" },
  { name: "Gyarados", pattern: "wave", hp: 26, color: "#4f93ff", accent: "#ffe2ab" },
  { name: "Charizard", pattern: "pouncer", hp: 28, color: "#ff8b49", accent: "#ffd173" },
  { name: "Dragonite", pattern: "shooter", hp: 30, color: "#dca362", accent: "#93d9ff" },
  { name: "Mewtwo", pattern: "teleport", hp: 36, color: "#d6c4ff", accent: "#8a58ff" }
];

const game = {
  screen: "menu",
  selectedCharacterId: CHARACTERS[0].id,
  stageTemplates: [],
  currentStage: null,
  stageIndex: 0,
  highestUnlocked: 0,
  stageResults: Array.from({ length: STAGE_COUNT }, () => null),
  player: null,
  projectiles: [],
  cameraX: 0,
  tick: 0,
  input: {
    left: false,
    right: false,
    jumpHeld: false,
    jumpQueued: false,
    powerQueued: false
  },
  notice: {
    text: "Choose a Pokemon. The choice locks for the whole run.",
    timer: -1
  },
  recoveryTimer: 0,
  campaign: {
    lockedCharacterId: null,
    maxHearts: 5,
    powerCap: 6,
    cores: 0,
    totalParts: 0,
    totalPowerDrops: 0
  }
};

function createRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function cloneStage(stage) {
  return JSON.parse(JSON.stringify(stage));
}

function getCurrentCharacterId() {
  return game.campaign.lockedCharacterId || game.selectedCharacterId;
}

function getCharacter(id = getCurrentCharacterId()) {
  return CHARACTERS.find((character) => character.id === id);
}

function getWorld(index = game.stageIndex) {
  return WORLDS[Math.floor(index / STAGES_PER_WORLD)];
}

function getStageNumberInWorld(index = game.stageIndex) {
  return (index % STAGES_PER_WORLD) + 1;
}

function isBossStage(index = game.stageIndex) {
  return getStageNumberInWorld(index) === STAGES_PER_WORLD;
}

function getStageName(index) {
  const world = getWorld(index);
  const stageInWorld = getStageNumberInWorld(index);
  if (stageInWorld === STAGES_PER_WORLD) {
    return `${world.name}: ${BOSSES[Math.floor(index / STAGES_PER_WORLD)].name} Lair`;
  }
  return `${world.name}: ${NORMAL_STAGE_NAMES[stageInWorld - 1]}`;
}

function getPowerItemName() {
  return getCharacter().resourceName;
}

function showNotice(text, timer = 140) {
  game.notice.text = text;
  game.notice.timer = timer;
}

function tickNotice() {
  if (game.notice.timer > 0) {
    game.notice.timer -= 1;
    if (game.notice.timer === 0) {
      game.notice.text = "";
    }
  }
}

function getRunTotals() {
  return game.stageResults.reduce(
    (totals, result) => {
      if (!result) {
        return totals;
      }
      totals.parts += result.parts;
      totals.powerDrops += result.powerDrops;
      totals.bosses += result.bossStage ? 1 : 0;
      return totals;
    },
    { parts: 0, powerDrops: 0, bosses: 0 }
  );
}

function defaultMessage() {
  const character = getCharacter();
  if (game.screen === "menu") {
    return `Choose a Pokemon and start the 100-level campaign. ${character.skillName} uses X, and the choice locks until New Campaign.`;
  }
  if (game.screen === "paused") {
    return "Paused. Press Enter or click Resume to continue.";
  }
  if (game.screen === "stageClear") {
    return "Stage clear. Press Enter or click Next Stage.";
  }
  if (game.screen === "gameComplete") {
    const totals = getRunTotals();
    return `Campaign complete with ${character.name}. Parts found: ${totals.parts}. Bosses beaten: ${totals.bosses}.`;
  }
  if (game.screen === "recovering") {
    return "You were knocked out. Restarting the stage...";
  }
  if (!game.currentStage || !game.player) {
    return "Choose a Pokemon. The choice locks for the whole run.";
  }
  if (game.currentStage.bossStage && game.currentStage.boss && !game.currentStage.boss.defeated) {
    return `Defeat ${game.currentStage.boss.name}, grab the Core Part, and reach the gate.`;
  }
  const remaining = Math.max(0, game.currentStage.partsRequired - game.player.partsCollected);
  if (remaining > 0) {
    return `Collect ${remaining} more comet parts to open the exit. ${character.resourceName} power your skill.`;
  }
  return "The exit gate is active. Reach the arch to clear the stage.";
}

function getMessageLine() {
  if (game.notice.timer !== 0) {
    return game.notice.text;
  }
  return defaultMessage();
}

function resetCampaignState() {
  const character = getCharacter(game.selectedCharacterId);
  game.campaign.lockedCharacterId = null;
  game.campaign.maxHearts = 5;
  game.campaign.powerCap = character.basePowerCap;
  game.campaign.cores = 0;
  game.campaign.totalParts = 0;
  game.campaign.totalPowerDrops = 0;
  game.stageResults = Array.from({ length: STAGE_COUNT }, () => null);
  game.highestUnlocked = 0;
}

function createPlayer(character, spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    w: character.id === "squirtle" ? 42 : 38,
    h: character.id === "bulbasaur" ? 40 : 38,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: false,
    coyote: 0,
    jumpBuffer: 0,
    invulnerable: 0,
    powerCooldown: 0,
    dashTimer: 0,
    shieldTimer: 0,
    burnTimer: 0,
    vineLiftReady: true,
    hearts: game.campaign.maxHearts,
    maxHearts: game.campaign.maxHearts,
    power: game.campaign.powerCap,
    powerMax: game.campaign.powerCap,
    partsCollected: 0,
    powerDropsCollected: 0,
    animationStep: 0
  };
}

function makeCollectible(kind, x, y) {
  const size = kind === "heart" ? 20 : kind === "core" ? 24 : 20;
  return {
    kind,
    x,
    y,
    w: size,
    h: size,
    collected: false
  };
}

function addGroundAnchors(pool, stage, countPerSegment = 3) {
  stage.ground.forEach((segment) => {
    if (segment.w < 160) {
      return;
    }
    for (let index = 0; index < countPerSegment; index += 1) {
      const t = countPerSegment === 1 ? 0.5 : index / (countPerSegment - 1);
      pool.push({
        x: segment.x + 60 + t * Math.max(10, segment.w - 120),
        y: stage.baseY - 36
      });
    }
  });
}

function addPlatformAnchors(pool, stage) {
  stage.platforms.forEach((platform) => {
    const count = clamp(Math.floor(platform.w / 60), 1, 3);
    for (let index = 0; index < count; index += 1) {
      const t = count === 1 ? 0.5 : index / (count - 1);
      pool.push({
        x: platform.x + 20 + t * Math.max(10, platform.w - 40),
        y: platform.y - 28
      });
    }
  });
}

function shuffleInPlace(items, rng) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
}

function buildNormalStage(index) {
  const world = getWorld(index);
  const rng = createRng(5000 + index * 131);
  const stageInWorld = getStageNumberInWorld(index);
  const worldIndex = Math.floor(index / STAGES_PER_WORLD);
  const difficulty = worldIndex + stageInWorld * 0.5;
  const worldWidth = 2150 + worldIndex * 110 + stageInWorld * 72;
  const baseY = 476;

  const pits = [];
  let cursor = 380;
  const pitCount = clamp(1 + Math.floor(difficulty / 2), 1, 6);
  for (let pitIndex = 0; pitIndex < pitCount; pitIndex += 1) {
    const start = cursor + 180 + Math.floor(rng() * 170);
    const width = 92 + Math.floor(rng() * 40) + worldIndex * 5 + stageInWorld * 3;
    if (start + width > worldWidth - 360) {
      break;
    }
    pits.push({ start, end: start + width });
    cursor = start + width;
  }

  const ground = [];
  let segmentStart = 0;
  pits.forEach((pit) => {
    ground.push({
      x: segmentStart,
      y: baseY,
      w: pit.start - segmentStart,
      h: VIEW_HEIGHT - baseY + 60
    });
    segmentStart = pit.end;
  });
  ground.push({
    x: segmentStart,
    y: baseY,
    w: worldWidth - segmentStart,
    h: VIEW_HEIGHT - baseY + 60
  });

  const platforms = [];
  pits.forEach((pit, pitIndex) => {
    platforms.push({
      x: pit.start - 18,
      y: baseY - 112 - (pitIndex % 2) * 34,
      w: pit.end - pit.start + 36,
      h: 18
    });
    if (worldIndex > 3) {
      platforms.push({
        x: (pit.start + pit.end) / 2 - 52,
        y: baseY - 190 - (pitIndex % 2) * 18,
        w: 104,
        h: 18
      });
    }
  });

  const platformCount = 7 + worldIndex + stageInWorld;
  for (let platformIndex = 0; platformIndex < platformCount; platformIndex += 1) {
    const w = 96 + Math.floor(rng() * 70);
    let x = 120 + platformIndex * ((worldWidth - 240) / platformCount) + (rng() - 0.5) * 90;
    const y =
      baseY -
      84 -
      (platformIndex % 4) * 46 -
      (worldIndex > 4 && platformIndex % 3 === 0 ? 26 : 0) -
      (world.name === "Canopy Lifts" ? 20 : 0);
    x = clamp(x, 80, worldWidth - w - 100);
    const overPit = pits.some((pit) => x + w * 0.5 > pit.start && x + w * 0.5 < pit.end);
    if (overPit) {
      continue;
    }
    platforms.push({ x, y, w, h: 18 });

    if (stageInWorld > 4 && platformIndex % 4 === 1) {
      const upperWidth = Math.max(74, w - 26);
      platforms.push({
        x: x + (w - upperWidth) / 2,
        y: y - 78,
        w: upperWidth,
        h: 18
      });
    }
  }

  const springs = [];
  const updrafts = [];
  const waterZones = [];

  if (world.springs) {
    const springTargets = [...ground.slice(1, 3), ...platforms.filter((platform) => platform.w > 110)];
    springTargets.slice(0, 4).forEach((target, index) => {
      springs.push({
        x: target.x + Math.max(8, target.w * 0.5 - 20),
        y: target.y - 10,
        w: 40,
        h: 10,
        power: 17 + index
      });
    });
  }

  if (world.updrafts) {
    const driftTargets = [...pits, ...ground.filter((segment) => segment.w > 200).slice(0, 2)];
    driftTargets.slice(0, 4).forEach((target, index) => {
      const x = target.start ? target.start + 10 : target.x + target.w * 0.35;
      const width = target.start ? target.end - target.start - 20 : 90;
      updrafts.push({
        x,
        y: baseY - 170 - index * 12,
        w: Math.max(70, width),
        h: 180 + index * 12,
        strength: 0.22 + index * 0.015
      });
    });
  }

  if (world.water) {
    ground.filter((segment) => segment.w > 230).slice(1, 4).forEach((segment) => {
      waterZones.push({
        x: segment.x + 42,
        y: baseY - 36,
        w: Math.max(120, segment.w - 84),
        h: 86
      });
    });
  }

  const stage = {
    index,
    stage: index + 1,
    worldIndex,
    stageInWorld,
    name: getStageName(index),
    world,
    bossStage: false,
    worldWidth,
    baseY,
    spawn: { x: 84, y: baseY - 74 },
    ground,
    platforms,
    springs,
    updrafts,
    waterZones,
    collectibles: [],
    enemies: [],
    partsRequired: clamp(3 + worldIndex + Math.floor(stageInWorld / 3), 3, 8),
    goal: {
      x: worldWidth - 130,
      y: baseY - 120,
      w: 58,
      h: 120
    }
  };

  const anchorPool = [];
  addGroundAnchors(anchorPool, stage, 3);
  addPlatformAnchors(anchorPool, stage);
  shuffleInPlace(anchorPool, rng);

  for (let indexPart = 0; indexPart < stage.partsRequired; indexPart += 1) {
    const anchor = anchorPool.shift();
    if (anchor) {
      stage.collectibles.push(makeCollectible("part", anchor.x, anchor.y));
    }
  }

  const powerCount = 4 + Math.floor(stageInWorld / 3);
  for (let powerIndex = 0; powerIndex < powerCount; powerIndex += 1) {
    const anchor = anchorPool.shift();
    if (anchor) {
      stage.collectibles.push(makeCollectible("power", anchor.x, anchor.y - 8));
    }
  }

  if (anchorPool[0]) {
    stage.collectibles.push(makeCollectible("heart", anchorPool[0].x, anchorPool[0].y - 10));
  }

  const enemySurfaces = [
    ...ground.filter((segment) => segment.w > 180).map((segment) => ({
      x: segment.x + 12,
      maxX: segment.x + segment.w - 48,
      y: segment.y - 34
    })),
    ...platforms.filter((platform) => platform.w > 100).map((platform) => ({
      x: platform.x + 10,
      maxX: platform.x + platform.w - 42,
      y: platform.y - 34
    }))
  ];

  const enemyCount = clamp(4 + worldIndex + Math.floor(stageInWorld / 2), 4, 10);
  for (let enemyIndex = 0; enemyIndex < enemyCount && enemyIndex < enemySurfaces.length; enemyIndex += 1) {
    const surface = enemySurfaces[enemyIndex];
    const pattern = ["runner", "hopper", "flyer", "tank"][(enemyIndex + worldIndex) % 4];
    stage.enemies.push({
      type: pattern,
      x: surface.x + rng() * Math.max(8, surface.maxX - surface.x),
      y: pattern === "flyer" ? surface.y - 48 : surface.y,
      w: pattern === "tank" ? 40 : 34,
      h: pattern === "flyer" ? 30 : 34,
      hp: pattern === "tank" ? 3 : pattern === "flyer" ? 2 : 1,
      maxHp: pattern === "tank" ? 3 : pattern === "flyer" ? 2 : 1,
      dir: rng() < 0.5 ? -1 : 1,
      speed: 1.25 + rng() * 0.7 + worldIndex * 0.05,
      minX: surface.x,
      maxX: surface.maxX,
      homeY: pattern === "flyer" ? surface.y - 48 : surface.y,
      surfaceY: surface.y,
      phase: rng() * Math.PI * 2,
      cooldown: 40 + Math.floor(rng() * 80),
      invulnerable: 0,
      defeated: false
    });
  }

  return stage;
}

function createBoss(worldIndex, worldWidth, baseY) {
  const spec = BOSSES[worldIndex];
  const hoverBoss = spec.pattern === "wave" || spec.pattern === "teleport";
  const bossHeight = spec.pattern === "tank" ? 92 : spec.pattern === "wave" ? 84 : 78;
  return {
    name: spec.name,
    pattern: spec.pattern,
    color: spec.color,
    accent: spec.accent,
    maxHp: spec.hp,
    hp: spec.hp,
    x: worldWidth - 430,
    y: hoverBoss ? baseY - 160 : baseY - bossHeight,
    w: spec.pattern === "tank" ? 104 : 82,
    h: bossHeight,
    vx: 0,
    vy: 0,
    dir: -1,
    phase: 0,
    cooldown: 70,
    invulnerable: 0,
    defeated: false,
    groundY: baseY - bossHeight,
    baseY: hoverBoss ? baseY - 160 : baseY - bossHeight,
    chargeTimer: 0
  };
}

function buildBossStage(index) {
  const world = getWorld(index);
  const worldIndex = Math.floor(index / STAGES_PER_WORLD);
  const baseY = 476;
  const worldWidth = 1880 + worldIndex * 90;

  const ground = [
    { x: 0, y: baseY, w: worldWidth, h: VIEW_HEIGHT - baseY + 60 }
  ];

  const platforms = [
    { x: 240, y: baseY - 96, w: 126, h: 18 },
    { x: 470, y: baseY - 168, w: 132, h: 18 },
    { x: 760, y: baseY - 118, w: 138, h: 18 },
    { x: 1080, y: baseY - 170, w: 126, h: 18 },
    { x: 1400, y: baseY - 100, w: 142, h: 18 }
  ];

  const springs = world.springs
    ? [
        { x: 276, y: baseY - 10, w: 40, h: 10, power: 19 },
        { x: 1180, y: baseY - 10, w: 40, h: 10, power: 19 }
      ]
    : [];

  const updrafts = world.updrafts
    ? [
        { x: 620, y: baseY - 210, w: 120, h: 220, strength: 0.25 },
        { x: 1310, y: baseY - 200, w: 120, h: 210, strength: 0.24 }
      ]
    : [];

  const waterZones = world.water
    ? [{ x: 650, y: baseY - 38, w: 420, h: 90 }]
    : [];

  const collectibles = [
    makeCollectible("power", 320, baseY - 140),
    makeCollectible("power", 610, baseY - 210),
    makeCollectible("power", 1215, baseY - 210),
    makeCollectible("heart", 1520, baseY - 146)
  ];

  return {
    index,
    stage: index + 1,
    worldIndex,
    stageInWorld: STAGES_PER_WORLD,
    name: getStageName(index),
    world,
    bossStage: true,
    worldWidth,
    baseY,
    spawn: { x: 90, y: baseY - 74 },
    ground,
    platforms,
    springs,
    updrafts,
    waterZones,
    collectibles,
    enemies: [],
    partsRequired: 1,
    boss: createBoss(worldIndex, worldWidth, baseY),
    coreDropped: false,
    goal: {
      x: worldWidth - 128,
      y: baseY - 120,
      w: 58,
      h: 120
    }
  };
}

function buildStage(index) {
  return isBossStage(index) ? buildBossStage(index) : buildNormalStage(index);
}

function getSurfaceRects() {
  return [...game.currentStage.ground, ...game.currentStage.platforms];
}

function loadStage(index) {
  game.stageIndex = index;
  game.currentStage = cloneStage(game.stageTemplates[index]);
  game.player = createPlayer(getCharacter(), game.currentStage.spawn);
  game.projectiles = [];
  game.cameraX = 0;
  game.screen = game.campaign.lockedCharacterId ? "playing" : "menu";
  showNotice(`${game.currentStage.name}. ${game.currentStage.bossStage ? "Boss stage." : `Collect ${game.currentStage.partsRequired} comet parts.`}`, 180);
  updateHud();
  updateButtons();
  updateCampaignNote();
  renderProgressStrip();
}

function startCampaign() {
  game.campaign.lockedCharacterId = game.selectedCharacterId;
  const character = getCharacter();
  game.campaign.maxHearts = 5;
  game.campaign.powerCap = character.basePowerCap;
  game.campaign.cores = 0;
  game.campaign.totalParts = 0;
  game.campaign.totalPowerDrops = 0;
  game.stageResults = Array.from({ length: STAGE_COUNT }, () => null);
  game.highestUnlocked = 0;
  loadStage(0);
  game.screen = "playing";
  showNotice(`${character.name} begins the 100-level campaign.`, 160);
  updateButtons();
  updateCampaignNote();
}

function restartStage() {
  if (!game.campaign.lockedCharacterId) {
    return;
  }
  loadStage(game.stageIndex);
  game.screen = "playing";
  updateButtons();
}

function newCampaign() {
  resetCampaignState();
  game.screen = "menu";
  game.projectiles = [];
  game.stageIndex = 0;
  game.currentStage = cloneStage(game.stageTemplates[0]);
  game.player = createPlayer(getCharacter(game.selectedCharacterId), game.currentStage.spawn);
  game.cameraX = 0;
  showNotice("New campaign ready. Pick any Pokemon and start again.", -1);
  updateButtons();
  updateCampaignNote();
  renderCharacterPicker();
  renderProgressStrip();
  updateHud();
}

function advanceStage() {
  if (game.stageIndex >= STAGE_COUNT - 1) {
    game.screen = "gameComplete";
    updateButtons();
    return;
  }
  loadStage(game.stageIndex + 1);
  game.screen = "playing";
  updateButtons();
}

function pauseToggle() {
  if (game.screen === "playing") {
    game.screen = "paused";
  } else if (game.screen === "paused") {
    game.screen = "playing";
  }
  updateButtons();
}

function handlePrimaryAction() {
  if (game.screen === "menu") {
    startCampaign();
    return;
  }
  if (game.screen === "playing" || game.screen === "paused") {
    pauseToggle();
    return;
  }
  if (game.screen === "stageClear") {
    advanceStage();
    return;
  }
  if (game.screen === "gameComplete") {
    newCampaign();
  }
}

function completeStage() {
  game.stageResults[game.stageIndex] = {
    completed: true,
    parts: game.player.partsCollected,
    powerDrops: game.player.powerDropsCollected,
    bossStage: game.currentStage.bossStage
  };
  game.highestUnlocked = Math.max(game.highestUnlocked, game.stageIndex + 1);
  game.campaign.totalParts += game.player.partsCollected;
  game.campaign.totalPowerDrops += game.player.powerDropsCollected;

  if (game.currentStage.bossStage) {
    game.campaign.cores += 1;
    game.campaign.powerCap = Math.min(getCharacter().basePowerCap + 4, game.campaign.powerCap + 1);
    if (game.campaign.cores % 2 === 0) {
      game.campaign.maxHearts = Math.min(8, game.campaign.maxHearts + 1);
    }
  }

  if (game.stageIndex === STAGE_COUNT - 1) {
    game.screen = "gameComplete";
    const totals = getRunTotals();
    showNotice(`Mewtwo is down. Campaign complete with ${totals.parts} parts found and ${game.campaign.cores} cores recovered.`, -1);
  } else {
    game.screen = "stageClear";
    showNotice(`Stage clear. ${game.currentStage.bossStage ? "Core Part recovered." : "Exit reached."} Next: ${getStageName(game.stageIndex + 1)}.`, -1);
  }

  updateButtons();
  updateCampaignNote();
  renderProgressStrip();
}

function triggerRecovery() {
  game.screen = "recovering";
  game.recoveryTimer = 90;
  showNotice("You were knocked out. Restarting the stage...", -1);
  updateButtons();
}

function damagePlayer(message, knockback = 5.6) {
  if (game.screen !== "playing" || !game.player || game.player.invulnerable > 0) {
    return;
  }
  if (game.player.shieldTimer > 0) {
    return;
  }
  game.player.hearts -= 1;
  game.player.invulnerable = 88;
  game.player.vx = -game.player.facing * knockback;
  game.player.vy = -7.5;
  showNotice(message, 110);

  if (game.player.hearts <= 0) {
    triggerRecovery();
  }
}

function damageEnemy(enemy, amount = 1) {
  if (enemy.defeated || enemy.invulnerable > 0) {
    return;
  }
  enemy.hp -= amount;
  enemy.invulnerable = 12;
  if (enemy.hp <= 0) {
    enemy.defeated = true;
    if (Math.random() < 0.28) {
      game.currentStage.collectibles.push(makeCollectible("power", enemy.x + enemy.w * 0.5, enemy.y - 10));
    }
  }
}

function spawnBossCore() {
  if (!game.currentStage.boss || game.currentStage.coreDropped) {
    return;
  }
  game.currentStage.coreDropped = true;
  game.currentStage.collectibles.push(
    makeCollectible(
      "core",
      game.currentStage.boss.x + game.currentStage.boss.w * 0.5 - 12,
      game.currentStage.boss.y - 20
    )
  );
  showNotice(`${game.currentStage.boss.name} is beaten. Recover the Core Part.`, 160);
}

function damageBoss(amount = 1) {
  const boss = game.currentStage.boss;
  if (!boss || boss.defeated || boss.invulnerable > 0) {
    return;
  }
  boss.hp -= amount;
  boss.invulnerable = 16;
  showNotice(`${boss.name} takes damage.`, 45);
  if (boss.hp <= 0) {
    boss.defeated = true;
    boss.vx = 0;
    boss.vy = 0;
    spawnBossCore();
  }
}

function createProjectile(options) {
  game.projectiles.push({
    x: options.x,
    y: options.y,
    w: options.w || 12,
    h: options.h || 12,
    vx: options.vx,
    vy: options.vy || 0,
    life: options.life || 90,
    damage: options.damage || 1,
    owner: options.owner,
    color: options.color,
    kind: options.kind || "orb",
    gravity: options.gravity || 0,
    pulse: 0
  });
}

function usePower() {
  if (game.screen !== "playing" || game.player.powerCooldown > 0) {
    return;
  }

  const player = game.player;
  const character = getCharacter();

  if (player.power <= 0) {
    showNotice(`No ${character.resourceName} left. Find more pickups.`, 110);
    return;
  }

  const dir = player.facing || 1;
  player.power -= 1;
  player.powerCooldown = 26;

  if (character.powerType === "dash") {
    player.vx = dir * 11.5;
    player.vy = Math.min(player.vy, -2);
    player.dashTimer = 15;
    player.invulnerable = Math.max(player.invulnerable, 12);
    createProjectile({
      x: player.x + player.w / 2 + dir * 18,
      y: player.y + player.h / 2 - 6,
      vx: dir * 9.6,
      life: 28,
      owner: "player",
      color: character.powerColor,
      damage: 2,
      kind: "electric"
    });
  } else if (character.powerType === "vine") {
    if (!player.onGround && player.vineLiftReady) {
      player.vy = -16.5;
      player.vineLiftReady = false;
    } else {
      player.vy = Math.min(player.vy, -8.5);
    }
    createProjectile({
      x: player.x + player.w / 2 + dir * 16,
      y: player.y + player.h / 2 - 4,
      vx: dir * 7.2,
      vy: -2.2,
      gravity: 0.08,
      life: 70,
      owner: "player",
      color: character.powerColor,
      damage: 2,
      kind: "seed"
    });
  } else if (character.powerType === "flame") {
    player.vy = Math.min(player.vy, -7.4);
    createProjectile({
      x: player.x + player.w / 2 + dir * 16,
      y: player.y + player.h / 2 - 6,
      vx: dir * 7.8,
      vy: -1.4,
      gravity: 0.02,
      life: 60,
      owner: "player",
      color: character.powerColor,
      damage: 3,
      kind: "flame"
    });
    createProjectile({
      x: player.x + player.w / 2 + dir * 14,
      y: player.y + player.h / 2,
      vx: dir * 6.3,
      vy: 1.1,
      gravity: 0.03,
      life: 46,
      owner: "player",
      color: "#ff784b",
      damage: 2,
      kind: "ember"
    });
  } else if (character.powerType === "shell") {
    player.shieldTimer = 70;
    player.vx = dir * 8.2;
    createProjectile({
      x: player.x + player.w / 2 + dir * 14,
      y: player.y + player.h / 2 - 4,
      vx: dir * 6.5,
      vy: -0.6,
      gravity: 0,
      life: 74,
      owner: "player",
      color: character.powerColor,
      damage: 2,
      kind: "bubble"
    });
  }

  showNotice(`${character.skillName} activated.`, 55);
}

function getPlayerEnvironment() {
  const player = game.player;
  const inWater = game.currentStage.waterZones.some((zone) => rectsOverlap(player, zone));
  const inUpdraft = game.currentStage.updrafts.find((zone) => rectsOverlap(player, zone));
  return { inWater, updraft: inUpdraft || null };
}

function updatePlayer() {
  const player = game.player;
  const character = getCharacter();
  const world = game.currentStage.world;
  const colliders = getSurfaceRects();
  const environment = getPlayerEnvironment();

  if (game.input.jumpQueued) {
    player.jumpBuffer = 10;
    game.input.jumpQueued = false;
  } else if (player.jumpBuffer > 0) {
    player.jumpBuffer -= 1;
  }

  if (game.input.powerQueued) {
    usePower();
    game.input.powerQueued = false;
  }

  const moveDirection = (game.input.right ? 1 : 0) - (game.input.left ? 1 : 0);
  const targetSpeed = moveDirection * character.speed * (environment.inWater ? 0.72 : 1);
  const acceleration = player.onGround ? 0.32 : 0.18;
  player.vx += (targetSpeed - player.vx) * acceleration;

  if (moveDirection === 0) {
    player.vx *= player.onGround ? world.grip : 0.97;
  } else {
    player.facing = moveDirection;
  }

  if (player.onGround) {
    player.coyote = 8;
    player.vineLiftReady = true;
  } else if (player.coyote > 0) {
    player.coyote -= 1;
  }

  if (player.jumpBuffer > 0 && player.coyote > 0) {
    player.vy = -character.jump;
    player.onGround = false;
    player.coyote = 0;
    player.jumpBuffer = 0;
  }

  if (!game.input.jumpHeld && player.vy < -4.5) {
    player.vy += 0.34;
  }

  let gravity = world.gravity || BASE_GRAVITY;
  if (environment.inWater) {
    gravity *= character.id === "squirtle" ? 0.18 : 0.32;
    player.vx *= 0.985;
  }
  if (environment.updraft) {
    player.vy -= environment.updraft.strength;
  }

  player.vx += world.wind * (environment.inWater ? 0.4 : 1);
  player.vy += gravity;
  player.vx = clamp(player.vx, -12, 12);
  player.vy = clamp(player.vy, -20, 16);

  if (player.dashTimer > 0) {
    player.dashTimer -= 1;
  }
  if (player.shieldTimer > 0) {
    player.shieldTimer -= 1;
  }
  if (player.powerCooldown > 0) {
    player.powerCooldown -= 1;
  }
  if (player.invulnerable > 0) {
    player.invulnerable -= 1;
  }

  player.x += player.vx;
  for (const collider of colliders) {
    if (!rectsOverlap(player, collider)) {
      continue;
    }
    if (player.vx > 0) {
      player.x = collider.x - player.w;
    } else if (player.vx < 0) {
      player.x = collider.x + collider.w;
    }
    player.vx = 0;
  }

  const previousY = player.y;
  player.y += player.vy;
  player.onGround = false;
  for (const collider of colliders) {
    if (!rectsOverlap(player, collider)) {
      continue;
    }
    if (player.vy > 0 && previousY + player.h <= collider.y + 14) {
      player.y = collider.y - player.h;
      player.vy = 0;
      player.onGround = true;
    } else if (player.vy < 0 && previousY >= collider.y + collider.h - 8) {
      player.y = collider.y + collider.h;
      player.vy = 0;
    }
  }

  if (player.onGround) {
    for (const spring of game.currentStage.springs) {
      const feet = {
        x: player.x + 4,
        y: player.y + player.h - 6,
        w: player.w - 8,
        h: 8
      };
      if (rectsOverlap(feet, spring)) {
        player.vy = -spring.power;
        player.onGround = false;
        showNotice("Spring pad launch.", 26);
        break;
      }
    }
  }

  player.animationStep += Math.abs(player.vx) * 0.12 + 0.06;
  player.x = clamp(player.x, 0, game.currentStage.worldWidth - player.w);

  const overPit = game.currentStage.ground.every(
    (segment) => player.x + player.w * 0.5 < segment.x || player.x + player.w * 0.5 > segment.x + segment.w
  );
  if (!environment.inWater && overPit && player.y > game.currentStage.baseY + 18) {
    damagePlayer("You dropped into a ravine.");
    if (game.screen === "playing") {
      player.x = game.currentStage.spawn.x;
      player.y = game.currentStage.spawn.y;
      player.vx = 0;
      player.vy = 0;
    }
  }

  if (player.y > VIEW_HEIGHT + 180) {
    damagePlayer("You fell out of the stage.");
    if (game.screen === "playing") {
      player.x = game.currentStage.spawn.x;
      player.y = game.currentStage.spawn.y;
      player.vx = 0;
      player.vy = 0;
    }
  }
}

function updateEnemies() {
  const player = game.player;

  for (const enemy of game.currentStage.enemies) {
    if (enemy.defeated) {
      continue;
    }

    if (enemy.invulnerable > 0) {
      enemy.invulnerable -= 1;
    }

    enemy.phase += 0.06;

    if (enemy.type === "runner" || enemy.type === "tank") {
      const chaseBoost = enemy.type === "tank" ? 0.2 : 0.3;
      const desiredDir = Math.abs(player.x - enemy.x) < 200 ? Math.sign(player.x - enemy.x) || enemy.dir : enemy.dir;
      enemy.dir = desiredDir;
      enemy.x += enemy.speed * chaseBoost * enemy.dir;
      if (enemy.x < enemy.minX) {
        enemy.x = enemy.minX;
        enemy.dir = 1;
      }
      if (enemy.x > enemy.maxX) {
        enemy.x = enemy.maxX;
        enemy.dir = -1;
      }
    } else if (enemy.type === "hopper") {
      enemy.cooldown -= 1;
      if (enemy.cooldown <= 0) {
        enemy.cooldown = 55;
        enemy.vy = -8.2;
      }
      enemy.vy = (enemy.vy || 0) + 0.42;
      enemy.y += enemy.vy;
      if (enemy.y > enemy.surfaceY) {
        enemy.y = enemy.surfaceY;
        enemy.vy = 0;
      }
      enemy.x += enemy.speed * 0.6 * enemy.dir;
      if (enemy.x < enemy.minX || enemy.x > enemy.maxX) {
        enemy.dir *= -1;
      }
    } else if (enemy.type === "flyer") {
      enemy.x += enemy.speed * 0.75 * enemy.dir;
      enemy.y = enemy.homeY + Math.sin(enemy.phase) * 22;
      if (enemy.x < enemy.minX || enemy.x > enemy.maxX) {
        enemy.dir *= -1;
      }
    }

    if (!rectsOverlap(player, enemy) || game.screen !== "playing") {
      continue;
    }

    const stomping = player.vy > 2 && player.y + player.h - enemy.y < 16;
    if (stomping || player.dashTimer > 0 || player.shieldTimer > 0) {
      damageEnemy(enemy, enemy.type === "tank" ? 2 : enemy.hp);
      player.vy = -8;
    } else {
      damagePlayer("A rogue Pokemon clipped you.");
    }
  }
}

function spawnEnemyProjectile(x, y, vx, vy, color, damage = 1) {
  createProjectile({
    x,
    y,
    vx,
    vy,
    w: 14,
    h: 14,
    life: 95,
    owner: "enemy",
    color,
    damage,
    kind: "enemy",
    gravity: 0
  });
}

function updateBoss() {
  const boss = game.currentStage.boss;
  if (!boss || boss.defeated) {
    return;
  }

  const player = game.player;
  boss.phase += 0.05;
  boss.cooldown -= 1;
  if (boss.invulnerable > 0) {
    boss.invulnerable -= 1;
  }

  if (boss.pattern === "pouncer") {
    boss.dir = Math.sign(player.x - boss.x) || boss.dir;
    boss.vx += (boss.dir * 2.1 - boss.vx) * 0.06;
    if (boss.cooldown <= 0 && boss.y >= boss.groundY - 1) {
      boss.vy = -13.5;
      boss.vx = boss.dir * 4.6;
      boss.cooldown = 96;
    }
    boss.vy += 0.55;
    boss.x += boss.vx;
    boss.y += boss.vy;
    if (boss.y > boss.groundY) {
      boss.y = boss.groundY;
      boss.vy = 0;
    }
  } else if (boss.pattern === "wave") {
    boss.dir = Math.sign(player.x - boss.x) || boss.dir;
    boss.x += boss.dir * 1.8;
    boss.y = boss.baseY + Math.sin(boss.phase) * 24;
    if (boss.cooldown <= 0) {
      boss.cooldown = 88;
      spawnEnemyProjectile(boss.x, boss.y + 24, -4.2, 0.4, boss.accent, 1);
      spawnEnemyProjectile(boss.x, boss.y + 34, -3.6, -1.2, boss.accent, 1);
      spawnEnemyProjectile(boss.x, boss.y + 14, -3.6, 1.2, boss.accent, 1);
    }
  } else if (boss.pattern === "shooter") {
    boss.dir = Math.sign(player.x - boss.x) || boss.dir;
    boss.vx += (boss.dir * 1.8 - boss.vx) * 0.05;
    boss.x += boss.vx;
    boss.y = boss.groundY;
    if (boss.cooldown <= 0) {
      boss.cooldown = 76;
      spawnEnemyProjectile(boss.x + boss.w * 0.2, boss.y + boss.h * 0.35, boss.dir * 5.2, -0.2, boss.accent, 1);
    }
  } else if (boss.pattern === "tank") {
    boss.dir = Math.sign(player.x - boss.x) || boss.dir;
    if (boss.chargeTimer > 0) {
      boss.chargeTimer -= 1;
      boss.x += boss.dir * 6.4;
      if (boss.chargeTimer % 12 === 0) {
        spawnEnemyProjectile(boss.x + boss.w / 2, boss.y + boss.h - 8, boss.dir * 4.8, -0.4, boss.accent, 1);
      }
    } else {
      boss.vx += (boss.dir * 1.2 - boss.vx) * 0.05;
      boss.x += boss.vx;
      if (boss.cooldown <= 0) {
        boss.cooldown = 118;
        boss.chargeTimer = 28;
      }
    }
    boss.y = boss.groundY;
  } else if (boss.pattern === "teleport") {
    boss.y = boss.baseY + Math.sin(boss.phase) * 18;
    if (boss.cooldown <= 0) {
      boss.cooldown = boss.name === "Mewtwo" ? 64 : 90;
      const phaseShift = Math.sin(game.tick * 0.07) * 140;
      boss.x = clamp(player.x + phaseShift, 320, game.currentStage.worldWidth - 260);
      const burst = boss.name === "Mewtwo" ? 5 : 3;
      for (let shot = 0; shot < burst; shot += 1) {
        const angle = -0.8 + shot * (1.6 / Math.max(1, burst - 1));
        spawnEnemyProjectile(
          boss.x + boss.w / 2,
          boss.y + boss.h / 2,
          Math.cos(angle) * 4.8,
          Math.sin(angle) * 3.4,
          boss.accent,
          1
        );
      }
    }
  }

  boss.x = clamp(boss.x, 240, game.currentStage.worldWidth - boss.w - 110);

  if (rectsOverlap(player, boss) && game.screen === "playing") {
    const stomping = player.vy > 2 && player.y + player.h - boss.y < 18;
    if (stomping || player.dashTimer > 0 || player.shieldTimer > 0) {
      damageBoss(player.dashTimer > 0 ? 2 : 1);
      player.vy = -8.4;
    } else {
      damagePlayer(`${boss.name} struck back.`, 7.2);
    }
  }
}

function updateProjectiles() {
  const player = game.player;
  const boss = game.currentStage.boss;

  game.projectiles = game.projectiles.filter((projectile) => {
    projectile.life -= 1;
    projectile.pulse += 0.16;
    projectile.vy += projectile.gravity;
    projectile.x += projectile.vx;
    projectile.y += projectile.vy;

    if (
      projectile.x < -60 ||
      projectile.x > game.currentStage.worldWidth + 60 ||
      projectile.y < -60 ||
      projectile.y > VIEW_HEIGHT + 120 ||
      projectile.life <= 0
    ) {
      return false;
    }

    if (projectile.owner === "player") {
      for (const enemy of game.currentStage.enemies) {
        if (!enemy.defeated && rectsOverlap(projectile, enemy)) {
          damageEnemy(enemy, projectile.damage);
          return false;
        }
      }
      if (boss && !boss.defeated && rectsOverlap(projectile, boss)) {
        damageBoss(projectile.damage);
        return false;
      }
    } else if (rectsOverlap(projectile, player)) {
      damagePlayer("A boss attack hit you.");
      return false;
    }

    return true;
  });
}

function updateCollectibles() {
  for (const item of game.currentStage.collectibles) {
    if (item.collected || !rectsOverlap(game.player, item)) {
      continue;
    }
    item.collected = true;

    if (item.kind === "part") {
      game.player.partsCollected += 1;
      showNotice("Comet Part recovered.", 46);
    } else if (item.kind === "power") {
      game.player.power = Math.min(game.player.powerMax, game.player.power + 1);
      game.player.powerDropsCollected += 1;
      showNotice(`${getPowerItemName()} collected.`, 52);
    } else if (item.kind === "heart") {
      game.player.hearts = Math.min(game.player.maxHearts, game.player.hearts + 1);
      showNotice("Heart berry collected.", 52);
    } else if (item.kind === "core") {
      game.player.partsCollected = game.currentStage.partsRequired;
      showNotice("Core Part secured. The exit gate is live.", 120);
    }
  }
}

function updateGoal() {
  const player = game.player;
  const goal = game.currentStage.goal;
  if (!rectsOverlap(player, goal)) {
    return;
  }
  if (player.partsCollected >= game.currentStage.partsRequired) {
    completeStage();
  } else {
    showNotice("The gate is still locked. Find the missing parts first.", 88);
  }
}

function updateGame() {
  if (game.screen === "recovering") {
    game.recoveryTimer -= 1;
    if (game.recoveryTimer <= 0) {
      restartStage();
    }
    return;
  }

  if (game.screen !== "playing") {
    return;
  }

  updatePlayer();
  updateEnemies();
  updateBoss();
  updateProjectiles();
  updateCollectibles();
  updateGoal();

  game.cameraX = clamp(game.player.x - VIEW_WIDTH * 0.34, 0, game.currentStage.worldWidth - VIEW_WIDTH);
}

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBackground() {
  const world = game.currentStage.world;
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  gradient.addColorStop(0, world.skyTop);
  gradient.addColorStop(1, world.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  ctx.fillStyle = world.cloud;
  for (let index = 0; index < 5; index += 1) {
    const x = ((index * 220 - game.cameraX * (0.12 + index * 0.02)) % (VIEW_WIDTH + 280)) - 120;
    const y = 58 + (index % 3) * 52;
    ctx.beginPath();
    ctx.ellipse(x, y, 52, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 40, y + 6, 44, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 36, y + 8, 38, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = world.hillB;
  ctx.beginPath();
  ctx.moveTo(0, VIEW_HEIGHT);
  for (let index = 0; index < 8; index += 1) {
    const x = index * 160 - (game.cameraX * 0.2) % 160;
    ctx.lineTo(x, 360 - 80 - (index % 3) * 18);
    ctx.lineTo(x + 90, 404);
  }
  ctx.lineTo(VIEW_WIDTH, VIEW_HEIGHT);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = world.hillA;
  ctx.beginPath();
  ctx.moveTo(0, VIEW_HEIGHT);
  for (let index = 0; index < 7; index += 1) {
    const x = index * 190 - (game.cameraX * 0.32) % 190;
    ctx.lineTo(x, 332 - 100 - (index % 4) * 14);
    ctx.lineTo(x + 100, 398);
  }
  ctx.lineTo(VIEW_WIDTH, VIEW_HEIGHT);
  ctx.closePath();
  ctx.fill();
}

function drawGroundBlock(rect) {
  const world = game.currentStage.world;
  const screenX = rect.x - game.cameraX;
  ctx.fillStyle = world.groundFace;
  ctx.fillRect(screenX, rect.y, rect.w, rect.h);
  ctx.fillStyle = world.groundTop;
  ctx.fillRect(screenX, rect.y, rect.w, 18);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let offset = 14; offset < rect.w; offset += 32) {
    ctx.fillRect(screenX + offset, rect.y + 25 + ((offset / 32) % 2) * 10, 8, 8);
  }
}

function drawPlatform(platform) {
  const world = game.currentStage.world;
  const screenX = platform.x - game.cameraX;
  ctx.fillStyle = world.platformFace;
  drawRoundedRect(screenX, platform.y, platform.w, platform.h, 8);
  ctx.fill();
  ctx.fillStyle = world.platformTop;
  ctx.fillRect(screenX + 4, platform.y + 3, platform.w - 8, 7);
}

function drawSprings() {
  game.currentStage.springs.forEach((spring) => {
    const screenX = spring.x - game.cameraX;
    ctx.fillStyle = "#ff7c50";
    ctx.fillRect(screenX, spring.y, spring.w, spring.h);
    ctx.strokeStyle = "#ffe28d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(screenX + 6, spring.y + spring.h);
    ctx.lineTo(screenX + 14, spring.y + 2);
    ctx.lineTo(screenX + 22, spring.y + spring.h);
    ctx.lineTo(screenX + 30, spring.y + 2);
    ctx.stroke();
  });
}

function drawUpdrafts() {
  game.currentStage.updrafts.forEach((zone, index) => {
    const screenX = zone.x - game.cameraX;
    ctx.fillStyle = "rgba(170, 242, 255, 0.12)";
    ctx.fillRect(screenX, zone.y, zone.w, zone.h);
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 2;
    for (let arrow = 0; arrow < 3; arrow += 1) {
      const x = screenX + 18 + arrow * (zone.w / 3);
      const top = zone.y + 18 + (index % 2) * 8;
      ctx.beginPath();
      ctx.moveTo(x, top + 34);
      ctx.lineTo(x, top);
      ctx.lineTo(x - 8, top + 12);
      ctx.moveTo(x, top);
      ctx.lineTo(x + 8, top + 12);
      ctx.stroke();
    }
  });
}

function drawWaterZones() {
  game.currentStage.waterZones.forEach((zone) => {
    const screenX = zone.x - game.cameraX;
    ctx.fillStyle = "rgba(94, 202, 255, 0.24)";
    ctx.fillRect(screenX, zone.y, zone.w, zone.h);
    ctx.fillStyle = "rgba(218, 248, 255, 0.28)";
    ctx.fillRect(screenX, zone.y, zone.w, 8);
  });
}

function drawCollectible(item) {
  const screenX = item.x - game.cameraX;
  const pulse = 0.84 + Math.sin(game.tick * 0.08 + item.x * 0.03) * 0.12;

  ctx.save();
  ctx.translate(screenX + item.w / 2, item.y + item.h / 2);
  ctx.scale(pulse, pulse);

  if (item.kind === "part") {
    ctx.fillStyle = "rgba(255, 223, 120, 0.22)";
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd974";
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    for (let tooth = 0; tooth < 8; tooth += 1) {
      const angle = tooth * (Math.PI / 4);
      const x = Math.cos(angle) * 12;
      const y = Math.sin(angle) * 12;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
  } else if (item.kind === "power") {
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = getCharacter().powerColor;
    if (getCharacter().id === "pikachu") {
      ctx.beginPath();
      ctx.moveTo(-2, -10);
      ctx.lineTo(8, -2);
      ctx.lineTo(2, -2);
      ctx.lineTo(8, 10);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-2, 0);
      ctx.closePath();
      ctx.fill();
    } else if (getCharacter().id === "bulbasaur") {
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6fd767";
      ctx.beginPath();
      ctx.ellipse(-3, -6, 5, 3, -0.5, 0, Math.PI * 2);
      ctx.ellipse(3, -6, 5, 3, 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (getCharacter().id === "charmander") {
      ctx.fillStyle = "#ff9f58";
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.quadraticCurveTo(10, -4, 4, 10);
      ctx.quadraticCurveTo(0, 14, -4, 10);
      ctx.quadraticCurveTo(-10, -2, 0, -12);
      ctx.fill();
    } else {
      ctx.fillStyle = "#98f5ff";
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e8ffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (item.kind === "heart") {
    ctx.fillStyle = "#ff7e76";
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(-15, -2, -10, -14, 0, -6);
    ctx.bezierCurveTo(10, -14, 15, -2, 0, 10);
    ctx.fill();
  } else if (item.kind === "core") {
    ctx.fillStyle = "rgba(255, 236, 140, 0.24)";
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe27b";
    ctx.fillRect(-10, -10, 20, 20);
    ctx.fillStyle = "#ff8b4c";
    ctx.fillRect(-4, -4, 8, 8);
  }

  ctx.restore();
}

function drawEnemy(enemy) {
  const screenX = enemy.x - game.cameraX;
  const bob = enemy.type === "flyer" ? Math.sin(enemy.phase) * 2 : 0;
  const colorMap = {
    runner: "#5b2c42",
    hopper: "#7f3d5d",
    flyer: "#2f4564",
    tank: "#4c3647"
  };
  ctx.save();
  ctx.translate(screenX + enemy.w / 2, enemy.y + enemy.h / 2 + bob);
  ctx.fillStyle = colorMap[enemy.type];
  ctx.beginPath();
  ctx.ellipse(0, 2, enemy.w * 0.42, enemy.h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff7f0";
  ctx.fillRect(-7, -4, 5, 7);
  ctx.fillRect(2, -4, 5, 7);
  ctx.fillStyle = "#1a1018";
  ctx.fillRect(-5, -2, 2, 3);
  ctx.fillRect(4, -2, 2, 3);
  ctx.restore();
}

function drawBoss() {
  const boss = game.currentStage.boss;
  if (!boss || boss.defeated) {
    return;
  }
  if (boss.invulnerable > 0 && boss.invulnerable % 6 < 3) {
    return;
  }

  const screenX = boss.x - game.cameraX;
  ctx.save();
  ctx.translate(screenX + boss.w / 2, boss.y + boss.h / 2);
  ctx.fillStyle = boss.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, boss.w * 0.46, boss.h * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = boss.accent;
  if (boss.name === "Lapras" || boss.name === "Gyarados") {
    ctx.beginPath();
    ctx.moveTo(-18, -10);
    ctx.lineTo(-4, -34);
    ctx.lineTo(8, -8);
    ctx.closePath();
    ctx.fill();
  } else if (boss.name === "Charizard" || boss.name === "Dragonite") {
    ctx.beginPath();
    ctx.moveTo(-26, -4);
    ctx.lineTo(-48, -26);
    ctx.lineTo(-18, -18);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(26, -4);
    ctx.lineTo(48, -26);
    ctx.lineTo(18, -18);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(-18, -12, 8, 0, Math.PI * 2);
    ctx.arc(18, -12, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#fff6eb";
  ctx.fillRect(-14, -6, 9, 11);
  ctx.fillRect(5, -6, 9, 11);
  ctx.fillStyle = "#120d14";
  ctx.fillRect(-11, -3, 4, 5);
  ctx.fillRect(8, -3, 4, 5);
  ctx.restore();
}

function drawProjectiles() {
  game.projectiles.forEach((projectile) => {
    const screenX = projectile.x - game.cameraX;
    const pulse = 0.88 + Math.sin(projectile.pulse) * 0.16;
    ctx.save();
    ctx.translate(screenX + projectile.w / 2, projectile.y + projectile.h / 2);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(0, 0, projectile.w * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawGoal() {
  const goal = game.currentStage.goal;
  const active = game.player.partsCollected >= game.currentStage.partsRequired;
  const screenX = goal.x - game.cameraX;

  ctx.fillStyle = active ? "rgba(255, 215, 122, 0.18)" : "rgba(255,255,255,0.1)";
  ctx.fillRect(screenX - 16, goal.y - 12, goal.w + 32, goal.h + 16);
  ctx.fillStyle = active ? "#ffe17a" : "#d7dce2";
  ctx.fillRect(screenX, goal.y, 10, goal.h);
  ctx.fillRect(screenX + goal.w - 10, goal.y, 10, goal.h);
  ctx.fillRect(screenX, goal.y, goal.w, 10);
  ctx.strokeStyle = active ? "#ff8b42" : "#93abc1";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(screenX + goal.w / 2 - 9, goal.y + 22);
  ctx.lineTo(screenX + goal.w / 2 + 6, goal.y + 50);
  ctx.lineTo(screenX + goal.w / 2 - 3, goal.y + 50);
  ctx.lineTo(screenX + goal.w / 2 + 11, goal.y + 82);
  ctx.stroke();
}

function drawPlayer() {
  const player = game.player;
  const character = getCharacter();
  if (player.invulnerable > 0 && player.invulnerable % 8 < 4) {
    return;
  }

  const screenX = player.x - game.cameraX;
  const centerX = screenX + player.w / 2;
  const centerY = player.y + player.h / 2;
  const bounce = Math.sin(player.animationStep) * (player.onGround ? 2 : 1);
  const facing = player.facing || 1;

  ctx.save();
  ctx.translate(centerX, centerY + bounce);
  ctx.scale(facing, 1);

  if (character.id === "pikachu") {
    ctx.fillStyle = character.body;
    ctx.beginPath();
    ctx.ellipse(0, 4, 15, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(-16, -22);
    ctx.lineTo(-5, -16);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(3, -7);
    ctx.lineTo(12, -24);
    ctx.lineTo(11, -8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = character.outline;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(12, 5);
    ctx.lineTo(24, 0);
    ctx.lineTo(18, -6);
    ctx.lineTo(31, -12);
    ctx.stroke();
    ctx.fillStyle = "#ff6b57";
    ctx.beginPath();
    ctx.arc(-5, 7, 4, 0, Math.PI * 2);
    ctx.arc(8, 7, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (character.id === "bulbasaur") {
    ctx.fillStyle = character.body;
    ctx.beginPath();
    ctx.ellipse(0, 4, 17, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4aa76a";
    ctx.beginPath();
    ctx.ellipse(0, -5, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = character.accent;
    ctx.beginPath();
    ctx.arc(-5, 3, 4, 0, Math.PI * 2);
    ctx.arc(6, 3, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (character.id === "charmander") {
    ctx.fillStyle = character.body;
    ctx.beginPath();
    ctx.ellipse(0, 4, 15, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7, -10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = character.outline;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-12, 5);
    ctx.lineTo(-24, -2);
    ctx.lineTo(-30, 7);
    ctx.stroke();
    ctx.fillStyle = "#ffd76c";
    ctx.beginPath();
    ctx.moveTo(-30, 7);
    ctx.lineTo(-38, 2);
    ctx.lineTo(-34, 13);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = player.shieldTimer > 0 ? "#c9fff8" : character.body;
    ctx.beginPath();
    ctx.ellipse(0, 4, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1f8f91";
    ctx.beginPath();
    ctx.arc(-2, 4, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = character.body;
    ctx.beginPath();
    ctx.arc(10, -8, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#171011";
  ctx.fillRect(4, -8, 3, 3);
  ctx.fillRect(-3, -8, 3, 3);
  ctx.restore();

  if (player.dashTimer > 0) {
    ctx.strokeStyle = "rgba(255, 224, 122, 0.72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - facing * 22, centerY + 4);
    ctx.lineTo(centerX - facing * 42, centerY + 8);
    ctx.stroke();
  }
}

function drawBossBar() {
  const boss = game.currentStage.boss;
  if (!boss || boss.defeated) {
    return;
  }
  const width = 280;
  const height = 14;
  const x = VIEW_WIDTH - width - 28;
  const y = 22;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  drawRoundedRect(x, y, width, height, 8);
  ctx.fill();
  ctx.fillStyle = boss.color;
  drawRoundedRect(x, y, width * (boss.hp / boss.maxHp), height, 8);
  ctx.fill();
  ctx.fillStyle = "#fff4e0";
  ctx.font = '700 16px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.textAlign = "right";
  ctx.fillText(`${boss.name} ${boss.hp}/${boss.maxHp}`, x + width, y - 6);
}

function drawWorld() {
  drawBackground();
  game.currentStage.ground.forEach(drawGroundBlock);
  drawWaterZones();
  game.currentStage.platforms.forEach(drawPlatform);
  drawSprings();
  drawUpdrafts();

  game.currentStage.collectibles.forEach((item) => {
    if (!item.collected) {
      drawCollectible(item);
    }
  });
  game.currentStage.enemies.forEach((enemy) => {
    if (!enemy.defeated) {
      drawEnemy(enemy);
    }
  });
  drawBoss();
  drawProjectiles();
  drawGoal();
  drawPlayer();
  drawBossBar();
}

function drawOverlay() {
  if (game.screen === "playing") {
    return;
  }

  ctx.fillStyle = "rgba(7, 12, 20, 0.42)";
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  let title = "Pokemon Comet Quest";
  let subtitle = "Choose a Pokemon and start the 100-level campaign.";

  if (game.screen === "paused") {
    title = "Paused";
    subtitle = "Press Enter or click Resume.";
  } else if (game.screen === "stageClear") {
    title = "Stage Clear";
    subtitle = "Press Enter or click Next Stage.";
  } else if (game.screen === "recovering") {
    title = "Try Again";
    subtitle = "Restarting the current stage.";
  } else if (game.screen === "gameComplete") {
    const totals = getRunTotals();
    title = "Campaign Complete";
    subtitle = `${getCharacter().name} cleared all 100 stages. Parts: ${totals.parts}. Bosses: ${totals.bosses}.`;
  }

  ctx.fillStyle = "#f8eed7";
  ctx.font = '700 42px "Avenir Next Condensed", "Trebuchet MS", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(title, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 16);
  ctx.fillStyle = "#d7e7ef";
  ctx.font = '500 21px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.fillText(subtitle, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 28);
}

function render() {
  if (!game.currentStage || !game.player) {
    return;
  }
  drawWorld();
  drawOverlay();
}

function updateCampaignNote() {
  if (!game.campaign.lockedCharacterId) {
    campaignNote.textContent = "Your choice locks for the full 100-level campaign.";
    return;
  }
  const character = getCharacter();
  campaignNote.textContent = `Campaign locked to ${character.name}. Press New Campaign to choose another Pokemon.`;
}

function updateHud() {
  const character = getCharacter();
  levelValue.textContent = `${game.stageIndex + 1} / ${STAGE_COUNT}`;
  worldValue.textContent = game.currentStage ? game.currentStage.world.name : WORLDS[0].name;
  characterValue.textContent = character.name;
  levelName.textContent = game.currentStage ? game.currentStage.name : getStageName(0);

  if (game.player && game.currentStage) {
    partsValue.textContent = `${game.player.partsCollected} / ${game.currentStage.partsRequired}`;
    powerValue.textContent = `${game.player.power} / ${game.player.powerMax}`;
    heartValue.textContent = `${Math.max(0, game.player.hearts)} / ${game.player.maxHearts}`;
    if (game.currentStage.bossStage && game.currentStage.boss && !game.currentStage.boss.defeated) {
      bossValue.textContent = `${game.currentStage.boss.name} ${game.currentStage.boss.hp}/${game.currentStage.boss.maxHp}`;
    } else {
      bossValue.textContent = game.currentStage.bossStage ? "Defeated" : "None";
    }
  } else {
    partsValue.textContent = "0 / 0";
    powerValue.textContent = `0 / ${character.basePowerCap}`;
    heartValue.textContent = "5 / 5";
    bossValue.textContent = "None";
  }

  messageLine.textContent = getMessageLine();
}

function updateButtons() {
  restartButton.disabled = !game.campaign.lockedCharacterId || game.screen === "recovering";
  newCampaignButton.disabled = false;

  if (game.screen === "menu") {
    primaryButton.textContent = "Start 100-Level Campaign";
  } else if (game.screen === "playing") {
    primaryButton.textContent = "Pause";
  } else if (game.screen === "paused") {
    primaryButton.textContent = "Resume";
  } else if (game.screen === "stageClear") {
    primaryButton.textContent = "Next Stage";
  } else if (game.screen === "recovering") {
    primaryButton.textContent = "Restarting...";
    primaryButton.disabled = true;
    return;
  } else if (game.screen === "gameComplete") {
    primaryButton.textContent = "Play Again";
  }

  primaryButton.disabled = false;
}

function renderCharacterPicker() {
  characterPicker.innerHTML = "";
  const locked = Boolean(game.campaign.lockedCharacterId);
  const activeId = getCurrentCharacterId();

  CHARACTERS.forEach((character) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "character-card";
    if (character.id === activeId) {
      card.classList.add("is-selected");
    }
    if (locked && character.id !== activeId) {
      card.classList.add("is-locked");
    }
    card.innerHTML = `
      <div class="character-name">
        <span>${character.name}</span>
        <span class="character-badge">${character.skillName}</span>
      </div>
      <div class="character-copy">${character.blurb}</div>
      <div class="character-stats">${character.resourceName} | ${character.passive}</div>
    `;
    card.addEventListener("click", () => {
      if (game.campaign.lockedCharacterId) {
        return;
      }
      game.selectedCharacterId = character.id;
      renderCharacterPicker();
      game.player = createPlayer(character, game.currentStage.spawn);
      updateCampaignNote();
      updateHud();
    });
    characterPicker.appendChild(card);
  });
}

function renderProgressStrip() {
  progressStrip.innerHTML = "";
  for (let index = 0; index < STAGE_COUNT; index += 1) {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "level-pill";
    const unlocked = index <= game.highestUnlocked || Boolean(game.stageResults[index]);
    if (index === game.stageIndex) {
      pill.classList.add("is-current");
    }
    if (game.stageResults[index]) {
      pill.classList.add("is-complete");
    }
    if (getStageNumberInWorld(index) === STAGES_PER_WORLD) {
      pill.classList.add("is-boss");
    }
    if (!unlocked) {
      pill.classList.add("is-locked");
      pill.disabled = true;
    }
    pill.textContent = `${index + 1}`;
    pill.title = getStageName(index);
    pill.addEventListener("click", () => {
      if (!unlocked || !game.campaign.lockedCharacterId) {
        return;
      }
      loadStage(index);
      game.screen = "playing";
      updateButtons();
    });
    progressStrip.appendChild(pill);
  }
}

function setupInput() {
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", " ", "enter"].includes(key)) {
      event.preventDefault();
    }

    if (key === "a" || key === "arrowleft") {
      game.input.left = true;
    } else if (key === "d" || key === "arrowright") {
      game.input.right = true;
    } else if (key === "w" || key === "arrowup" || key === " ") {
      game.input.jumpHeld = true;
      if (!event.repeat) {
        game.input.jumpQueued = true;
      }
    } else if (key === "x" && !event.repeat) {
      game.input.powerQueued = true;
    } else if (key === "enter" && !event.repeat) {
      handlePrimaryAction();
    } else if (key === "p" && !event.repeat) {
      pauseToggle();
    } else if (key === "n" && !event.repeat) {
      newCampaign();
    }
  });

  window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (key === "a" || key === "arrowleft") {
      game.input.left = false;
    } else if (key === "d" || key === "arrowright") {
      game.input.right = false;
    } else if (key === "w" || key === "arrowup" || key === " ") {
      game.input.jumpHeld = false;
    }
  });
}

function loop() {
  game.tick += 1;
  tickNotice();
  updateGame();
  render();
  updateHud();
  requestAnimationFrame(loop);
}

function init() {
  game.stageTemplates = Array.from({ length: STAGE_COUNT }, (_, index) => buildStage(index));
  game.currentStage = cloneStage(game.stageTemplates[0]);
  game.player = createPlayer(getCharacter(game.selectedCharacterId), game.currentStage.spawn);
  renderCharacterPicker();
  renderProgressStrip();
  updateCampaignNote();
  updateButtons();
  updateHud();
  setupInput();

  primaryButton.addEventListener("click", handlePrimaryAction);
  restartButton.addEventListener("click", restartStage);
  newCampaignButton.addEventListener("click", newCampaign);

  requestAnimationFrame(loop);
}

init();
