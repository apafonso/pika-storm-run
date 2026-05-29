const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const primaryButton = document.getElementById("primaryButton");
const restartButton = document.getElementById("restartButton");
const messageLine = document.getElementById("messageLine");
const characterPicker = document.getElementById("characterPicker");
const progressStrip = document.getElementById("progressStrip");

const levelValue = document.getElementById("levelValue");
const characterValue = document.getElementById("characterValue");
const stormValue = document.getElementById("stormValue");
const skillValue = document.getElementById("skillValue");
const heartValue = document.getElementById("heartValue");
const levelName = document.getElementById("levelName");

const VIEW_WIDTH = canvas.width;
const VIEW_HEIGHT = canvas.height;
const GRAVITY = 0.55;
const MAX_SKILL_CHARGES = 4;

const CHARACTERS = [
  {
    id: "spark",
    name: "Pikachu",
    title: "Fast electric runner",
    blurb: "A bright yellow speedster with a quick thunder dash for clearing gaps and blasting through danger.",
    skillName: "Thunder Dash",
    speed: 5.2,
    jump: 14.8,
    body: "#ffd84c",
    accent: "#9d5d00",
    outline: "#3f2a00",
    applySkill(player) {
      const direction = player.facing || 1;
      player.vx = 11.5 * direction;
      player.vy = Math.min(player.vy, -2);
      player.dashTimer = 15;
      player.invulnerable = Math.max(player.invulnerable, 20);
    }
  },
  {
    id: "blaze",
    name: "Charmander",
    title: "High-jump striker",
    blurb: "A fire-tailed climber that trades top speed for a powerful flame jump and extra reach.",
    skillName: "Flame Jump",
    speed: 4.75,
    jump: 15.9,
    body: "#ff8f4a",
    accent: "#ffd76c",
    outline: "#512515",
    applySkill(player) {
      player.vy = -18.2;
      player.vx += (player.facing || 1) * 1.8;
      player.invulnerable = Math.max(player.invulnerable, 12);
    }
  },
  {
    id: "tide",
    name: "Squirtle",
    title: "Steady shield glider",
    blurb: "A steady shell-backed tank that can glide safely and shrug off contact while its shell is active.",
    skillName: "Shell Glide",
    speed: 4.35,
    jump: 13.9,
    body: "#41d7d0",
    accent: "#e9fff6",
    outline: "#09343c",
    applySkill(player) {
      player.shieldTimer = 92;
      player.glideTimer = 92;
      player.vy = Math.min(player.vy, -5.8);
      player.invulnerable = Math.max(player.invulnerable, 18);
    }
  }
];

const LEVEL_NAMES = [
  "Meadow Spark",
  "Cloud Ladder",
  "Gusty Orchard",
  "Lantern Ridge",
  "Bolt Bridge",
  "Amber Canyon",
  "Rainstep Run",
  "Mosswire Pass",
  "Skydrop Basin",
  "Cyclone Steps",
  "Cinder Boardwalk",
  "Moonlit Vines",
  "Static Cliffs",
  "Thunder Hollow",
  "Wild Current",
  "Tempest Quarry",
  "Shimmer Heights",
  "Night Flash Yard",
  "Stormcoil Woods",
  "Echo Plateau",
  "Crackle Ravine",
  "Highwind Ascent",
  "Afterglow Tunnels",
  "Skyforge Sprint",
  "Crown of Storms"
];

const THEMES = [
  {
    skyTop: "#85d4ff",
    skyBottom: "#f8c166",
    mist: "#ffffff",
    hillA: "#2b7c5f",
    hillB: "#1f5448",
    groundTop: "#50c173",
    groundFace: "#78522d",
    platformTop: "#fff3be",
    platformFace: "#8e6237",
    cloud: "rgba(255,255,255,0.72)"
  },
  {
    skyTop: "#7fc8ff",
    skyBottom: "#ff9e7d",
    mist: "#fff2d8",
    hillA: "#3f7f6b",
    hillB: "#295345",
    groundTop: "#6dc36d",
    groundFace: "#6d482c",
    platformTop: "#fce2a8",
    platformFace: "#805431",
    cloud: "rgba(255,248,231,0.7)"
  },
  {
    skyTop: "#4d7bfd",
    skyBottom: "#162242",
    mist: "#bfd3ff",
    hillA: "#234568",
    hillB: "#172d49",
    groundTop: "#3a8a74",
    groundFace: "#554330",
    platformTop: "#d8e6ff",
    platformFace: "#4d5e78",
    cloud: "rgba(226,237,255,0.62)"
  },
  {
    skyTop: "#a0f0dc",
    skyBottom: "#4bb9b3",
    mist: "#ebfffd",
    hillA: "#3e9589",
    hillB: "#1c605b",
    groundTop: "#84da87",
    groundFace: "#5b4f34",
    platformTop: "#fff0cf",
    platformFace: "#7c6446",
    cloud: "rgba(244,255,255,0.75)"
  },
  {
    skyTop: "#ffd27e",
    skyBottom: "#ff6e55",
    mist: "#fff1dd",
    hillA: "#666444",
    hillB: "#413a2d",
    groundTop: "#b5c35d",
    groundFace: "#705336",
    platformTop: "#fff0af",
    platformFace: "#885d31",
    cloud: "rgba(255,247,232,0.68)"
  }
];

const game = {
  screen: "menu",
  selectedCharacterId: CHARACTERS[0].id,
  levelTemplates: [],
  currentLevel: null,
  levelIndex: 0,
  highestUnlocked: 0,
  levelResults: Array.from({ length: LEVEL_NAMES.length }, () => null),
  player: null,
  input: {
    left: false,
    right: false,
    jumpHeld: false,
    jumpQueued: false,
    skillQueued: false
  },
  cameraX: 0,
  tick: 0,
  notice: {
    text: "Pick a Pokemon and press start.",
    timer: -1
  },
  recoveryTimer: 0
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

function range(count, fn) {
  return Array.from({ length: count }, (_, index) => fn(index));
}

function cloneLevel(level) {
  return JSON.parse(JSON.stringify(level));
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function getCharacter(id = game.selectedCharacterId) {
  return CHARACTERS.find((character) => character.id === id);
}

function defaultMessage() {
  const character = getCharacter();
  if (game.screen === "menu") {
    return `Pick a Pokemon, then start the 25-level run. ${character.skillName} is mapped to X.`;
  }
  if (game.screen === "paused") {
    return "Paused. Press Enter or click Resume to continue.";
  }
  if (game.screen === "stageClear") {
    return "Stage clear. Press Enter or click Next Level.";
  }
  if (game.screen === "gameComplete") {
    const totals = getRunTotals();
    return `All 25 stages cleared. Total storm sparks: ${totals.storms}. Click Play Again to restart the full run.`;
  }
  if (game.screen === "recovering") {
    return "The shadows caught you. Restarting the stage...";
  }
  if (!game.currentLevel || !game.player) {
    return "Pick a Pokemon and press start.";
  }
  const needed = Math.max(0, game.currentLevel.requiredStorms - game.player.stormsCollected);
  if (needed > 0) {
    return `Collect ${needed} more storm sparks to open the gate. ${character.skillName} uses one skill charge.`;
  }
  return "The storm gate is active. Reach the glowing arch to clear the stage.";
}

function showNotice(text, timer = 140) {
  game.notice.text = text;
  game.notice.timer = timer;
}

function getMessageLine() {
  if (game.notice.timer !== 0) {
    return game.notice.text;
  }
  return defaultMessage();
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
  return game.levelResults.reduce(
    (totals, result) => {
      if (result) {
        totals.storms += result.storms;
        totals.skills += result.skills;
      }
      return totals;
    },
    { storms: 0, skills: 0 }
  );
}

function addLineCollectibles(target, kind, x, y, count, spacing) {
  for (let index = 0; index < count; index += 1) {
    target.push({
      kind,
      x: x + index * spacing,
      y: y + Math.sin(index * 0.8) * 6,
      w: kind === "storm" ? 18 : 20,
      h: kind === "storm" ? 18 : 20,
      collected: false
    });
  }
}

function pointOverPit(pits, x) {
  return pits.some((pit) => x > pit.start && x < pit.end);
}

function buildLevel(index) {
  const rng = createRng(1017 + index * 73);
  const stage = index + 1;
  const worldWidth = 2150 + index * 125 + Math.floor(index / 5) * 60;
  const baseY = 472;
  const theme = THEMES[index % THEMES.length];

  const pits = [];
  const pitCount = Math.min(6, Math.max(0, Math.floor((stage - 2) / 4)));
  let cursor = 420;

  for (let pitIndex = 0; pitIndex < pitCount; pitIndex += 1) {
    const gapStart = cursor + 260 + Math.floor(rng() * 200);
    const gapWidth = 96 + Math.floor(rng() * 48) + Math.floor(index * 3.5);
    if (gapStart + gapWidth > worldWidth - 360) {
      break;
    }
    pits.push({ start: gapStart, end: gapStart + gapWidth });
    cursor = gapStart + gapWidth;
  }

  const ground = [];
  let segmentStart = 0;
  pits.forEach((pit) => {
    ground.push({
      x: segmentStart,
      y: baseY,
      w: pit.start - segmentStart,
      h: VIEW_HEIGHT - baseY + 40
    });
    segmentStart = pit.end;
  });
  ground.push({
    x: segmentStart,
    y: baseY,
    w: worldWidth - segmentStart,
    h: VIEW_HEIGHT - baseY + 40
  });

  const platforms = [];
  pits.forEach((pit, pitIndex) => {
    const bridgeHeight = baseY - 112 - (pitIndex % 2) * 34;
    platforms.push({
      x: pit.start - 18,
      y: bridgeHeight,
      w: pit.end - pit.start + 36,
      h: 18
    });
    if (stage > 8) {
      platforms.push({
        x: (pit.start + pit.end) / 2 - 54,
        y: bridgeHeight - 72,
        w: 108,
        h: 18
      });
    }
  });

  const extraPlatformCount = 6 + Math.floor(stage * 0.65);
  const spacing = (worldWidth - 360) / extraPlatformCount;

  for (let platformIndex = 0; platformIndex < extraPlatformCount; platformIndex += 1) {
    let x = 180 + platformIndex * spacing + (rng() - 0.5) * 95;
    const y =
      baseY -
      95 -
      ((platformIndex + stage) % 4) * 42 -
      (stage > 14 && platformIndex % 3 === 0 ? 22 : 0);
    const w = 112 + Math.floor(rng() * 70);
    x = clamp(x, 110, worldWidth - w - 110);

    if (pointOverPit(pits, x + w / 2)) {
      continue;
    }

    platforms.push({ x, y, w, h: 18 });

    if (stage > 10 && platformIndex % 4 === 1) {
      const upperWidth = Math.max(76, w - 28);
      platforms.push({
        x: x + (w - upperWidth) / 2,
        y: y - 80,
        w: upperWidth,
        h: 18
      });
    }
  }

  const collectibles = [];
  ground.forEach((segment, segmentIndex) => {
    const safeStart = segmentIndex === 0 ? 160 : 48;
    if (segment.w < 180) {
      return;
    }
    const count = clamp(Math.floor(segment.w / 170), 2, 5);
    const spread = (segment.w - safeStart - 50) / Math.max(1, count - 1);
    addLineCollectibles(collectibles, "storm", segment.x + safeStart, baseY - 36, count, spread);
  });

  platforms.forEach((platform, platformIndex) => {
    const count = clamp(Math.floor(platform.w / 46), 2, 4);
    const offset = count === 1 ? platform.w / 2 : 20;
    const spacingSize = count === 1 ? 0 : (platform.w - 40) / (count - 1);
    addLineCollectibles(collectibles, "storm", platform.x + offset, platform.y - 26, count, spacingSize);

    if ((platformIndex + stage) % 4 === 0) {
      collectibles.push({
        kind: "skill",
        x: platform.x + platform.w / 2 - 10,
        y: platform.y - 70,
        w: 20,
        h: 20,
        collected: false
      });
    }
  });

  pits.forEach((pit) => {
    collectibles.push({
      kind: "skill",
      x: (pit.start + pit.end) / 2 - 10,
      y: baseY - 170,
      w: 20,
      h: 20,
      collected: false
    });
  });

  const enemyCandidates = [
    ...ground
      .filter((segment) => segment.w > 180)
      .map((segment) => ({
        x: segment.x,
        y: segment.y,
        w: segment.w,
        h: segment.h
      })),
    ...platforms
      .filter((platform) => platform.w > 110)
      .map((platform) => ({
        x: platform.x,
        y: platform.y,
        w: platform.w,
        h: platform.h
      }))
  ];

  const enemies = [];
  const enemyCount = Math.min(enemyCandidates.length, 3 + Math.floor(stage * 0.5));
  const used = new Set();

  for (let enemyIndex = 0; enemyIndex < enemyCount; enemyIndex += 1) {
    let choiceIndex = Math.floor(rng() * enemyCandidates.length);
    while (used.has(choiceIndex)) {
      choiceIndex = (choiceIndex + 1) % enemyCandidates.length;
    }
    used.add(choiceIndex);

    const surface = enemyCandidates[choiceIndex];
    if (surface.x < 180 || surface.x > worldWidth - 260) {
      continue;
    }

    const type = stage > 11 && enemyIndex % 3 === 0 ? "stalker" : "patrol";
    enemies.push({
      type,
      x: surface.x + 22 + rng() * Math.max(18, surface.w - 66),
      y: surface.y - 36,
      w: 36,
      h: 36,
      minX: surface.x + 12,
      maxX: surface.x + surface.w - 48,
      dir: rng() < 0.5 ? -1 : 1,
      speed: 1.25 + rng() * 0.65 + stage * 0.035,
      phase: rng() * Math.PI * 2,
      defeated: false
    });
  }

  const stormCount = collectibles.filter((item) => item.kind === "storm").length;
  const requiredStorms = Math.max(8, Math.floor(stormCount * 0.7));
  const lastSegment = ground[ground.length - 1];
  const goal = {
    x: Math.max(worldWidth - 150, lastSegment.x + lastSegment.w - 120),
    y: baseY - 126,
    w: 56,
    h: 126
  };

  return {
    index,
    name: LEVEL_NAMES[index],
    stage,
    theme,
    worldWidth,
    baseY,
    spawn: {
      x: 84,
      y: baseY - 74
    },
    ground,
    platforms,
    collectibles,
    enemies,
    pits,
    goal,
    requiredStorms,
    totalStorms: stormCount
  };
}

function createPlayer(character, spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    w: character.id === "tide" ? 42 : 38,
    h: character.id === "tide" ? 40 : 38,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: false,
    coyote: 0,
    jumpBuffer: 0,
    dashTimer: 0,
    shieldTimer: 0,
    glideTimer: 0,
    invulnerable: 0,
    hearts: 4,
    stormsCollected: 0,
    skillCharges: 1,
    skillMotesCollected: 0,
    animationStep: 0
  };
}

function loadLevel(index) {
  game.levelIndex = index;
  game.currentLevel = cloneLevel(game.levelTemplates[index]);
  game.player = createPlayer(getCharacter(), game.currentLevel.spawn);
  game.cameraX = 0;
  if (game.screen !== "menu") {
    game.screen = "playing";
  }
  showNotice(`${game.currentLevel.name}. Collect ${game.currentLevel.requiredStorms} storm sparks to activate the gate.`, 180);
  updateButtons();
  updateHud();
  renderProgressStrip();
}

function startRun(resetProgress) {
  if (resetProgress) {
    game.highestUnlocked = 0;
    game.levelResults = Array.from({ length: LEVEL_NAMES.length }, () => null);
  }
  loadLevel(0);
  game.screen = "playing";
  showNotice(`${getCharacter().name} starts the run.`, 160);
  updateButtons();
  updateHud();
  renderProgressStrip();
}

function restartLevel() {
  loadLevel(game.levelIndex);
  game.screen = "playing";
  updateButtons();
}

function advanceLevel() {
  if (game.levelIndex >= LEVEL_NAMES.length - 1) {
    game.screen = "gameComplete";
    updateButtons();
    return;
  }
  loadLevel(game.levelIndex + 1);
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
    startRun(true);
    return;
  }
  if (game.screen === "playing" || game.screen === "paused") {
    pauseToggle();
    return;
  }
  if (game.screen === "stageClear") {
    advanceLevel();
    return;
  }
  if (game.screen === "gameComplete") {
    startRun(true);
  }
}

function completeStage() {
  game.levelResults[game.levelIndex] = {
    storms: game.player.stormsCollected,
    skills: game.player.skillMotesCollected
  };
  game.highestUnlocked = Math.max(game.highestUnlocked, game.levelIndex + 1);

  if (game.levelIndex === LEVEL_NAMES.length - 1) {
    game.screen = "gameComplete";
    const totals = getRunTotals();
    showNotice(`Run complete. You caught ${totals.storms} storm sparks and ${totals.skills} skill motes.`, -1);
  } else {
    game.screen = "stageClear";
    showNotice(`${game.currentLevel.name} clear. Next stop: ${LEVEL_NAMES[game.levelIndex + 1]}.`, -1);
  }

  updateButtons();
  updateHud();
  renderProgressStrip();
}

function triggerRecovery() {
  game.screen = "recovering";
  game.recoveryTimer = 90;
  showNotice("The shadows caught you. Restarting the stage...", -1);
  updateButtons();
}

function damagePlayer(message) {
  if (game.screen !== "playing") {
    return;
  }
  if (game.player.invulnerable > 0 || game.player.shieldTimer > 0) {
    return;
  }

  game.player.hearts -= 1;
  game.player.invulnerable = 84;
  game.player.vx = -game.player.facing * 5;
  game.player.vy = -7.5;
  showNotice(message, 120);

  if (game.player.hearts <= 0) {
    triggerRecovery();
  }
}

function tryUseSkill() {
  if (game.screen !== "playing") {
    return;
  }
  if (game.player.skillCharges <= 0) {
    showNotice("No skill charges left. Catch a blue skill orb first.", 110);
    return;
  }

  const character = getCharacter();
  game.player.skillCharges -= 1;
  character.applySkill(game.player);
  showNotice(`${character.skillName} activated.`, 60);
}

function getColliders(level) {
  return [...level.ground, ...level.platforms];
}

function updatePlayer() {
  const character = getCharacter();
  const player = game.player;
  const colliders = getColliders(game.currentLevel);

  if (game.input.jumpQueued) {
    player.jumpBuffer = 9;
    game.input.jumpQueued = false;
  } else if (player.jumpBuffer > 0) {
    player.jumpBuffer -= 1;
  }

  if (game.input.skillQueued) {
    tryUseSkill();
    game.input.skillQueued = false;
  }

  const moveDirection = (game.input.right ? 1 : 0) - (game.input.left ? 1 : 0);
  const targetSpeed = moveDirection * character.speed;
  const acceleration = player.onGround ? 0.32 : 0.18;
  player.vx += (targetSpeed - player.vx) * acceleration;

  if (moveDirection === 0) {
    player.vx *= player.onGround ? 0.74 : 0.97;
  } else {
    player.facing = moveDirection;
  }

  if (player.onGround) {
    player.coyote = 8;
  } else if (player.coyote > 0) {
    player.coyote -= 1;
  }

  if (player.jumpBuffer > 0 && player.coyote > 0) {
    player.vy = -character.jump;
    player.onGround = false;
    player.coyote = 0;
    player.jumpBuffer = 0;
  }

  if (!game.input.jumpHeld && player.vy < -4.4) {
    player.vy += 0.34;
  }

  if (player.glideTimer > 0 && player.vy > 3.4) {
    player.vy = 3.4;
  }

  player.vy += GRAVITY;
  player.vx = clamp(player.vx, -12, 12);
  player.vy = clamp(player.vy, -21, 16);

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

  if (player.invulnerable > 0) {
    player.invulnerable -= 1;
  }
  if (player.dashTimer > 0) {
    player.dashTimer -= 1;
  }
  if (player.shieldTimer > 0) {
    player.shieldTimer -= 1;
  }
  if (player.glideTimer > 0) {
    player.glideTimer -= 1;
  }

  player.animationStep += Math.abs(player.vx) * 0.12 + 0.05;
  player.x = clamp(player.x, 0, game.currentLevel.worldWidth - player.w);

  if (player.y > VIEW_HEIGHT + 180) {
    damagePlayer("You slipped into the storm below.");
    if (game.screen === "playing") {
      player.x = game.currentLevel.spawn.x;
      player.y = game.currentLevel.spawn.y;
      player.vx = 0;
      player.vy = 0;
    }
  }
}

function defeatEnemy(enemy) {
  enemy.defeated = true;
  game.player.vy = -8.2;
}

function updateEnemies() {
  for (const enemy of game.currentLevel.enemies) {
    if (enemy.defeated) {
      continue;
    }

    enemy.phase += 0.07;
    let activeSpeed = enemy.speed;

    if (
      enemy.type === "stalker" &&
      Math.abs(game.player.x - enemy.x) < 220 &&
      Math.abs(game.player.y - enemy.y) < 150
    ) {
      enemy.dir = Math.sign(game.player.x - enemy.x) || enemy.dir;
      activeSpeed *= 1.25;
    }

    enemy.x += activeSpeed * enemy.dir;
    if (enemy.x < enemy.minX) {
      enemy.x = enemy.minX;
      enemy.dir = 1;
    } else if (enemy.x > enemy.maxX) {
      enemy.x = enemy.maxX;
      enemy.dir = -1;
    }

    const player = game.player;
    if (rectsOverlap(player, enemy) && game.screen === "playing") {
      const stomping = player.vy > 1.8 && player.y + player.h - enemy.y < 18;
      if (stomping || player.dashTimer > 0 || player.shieldTimer > 0) {
        defeatEnemy(enemy);
      } else if (player.invulnerable === 0) {
        damagePlayer("A shadow Pokemon clipped you.");
      }
    }
  }
}

function updateCollectibles() {
  for (const item of game.currentLevel.collectibles) {
    if (item.collected || !rectsOverlap(game.player, item)) {
      continue;
    }
    item.collected = true;
    if (item.kind === "storm") {
      game.player.stormsCollected += 1;
      showNotice("Storm spark caught.", 36);
    } else {
      game.player.skillCharges = Math.min(MAX_SKILL_CHARGES, game.player.skillCharges + 1);
      game.player.skillMotesCollected += 1;
      showNotice("Skill mote collected.", 64);
    }
  }
}

function updateGoal() {
  const player = game.player;
  const goal = game.currentLevel.goal;

  if (!rectsOverlap(player, goal)) {
    return;
  }
  if (player.stormsCollected >= game.currentLevel.requiredStorms) {
    completeStage();
  } else {
    showNotice("The gate needs more storm sparks before it will open.", 80);
  }
}

function updateGame() {
  if (game.screen === "recovering") {
    game.recoveryTimer -= 1;
    if (game.recoveryTimer <= 0) {
      restartLevel();
    }
    return;
  }

  if (game.screen !== "playing") {
    return;
  }

  updatePlayer();
  updateEnemies();
  updateCollectibles();
  updateGoal();

  game.cameraX = clamp(game.player.x - VIEW_WIDTH * 0.34, 0, game.currentLevel.worldWidth - VIEW_WIDTH);
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

function drawBackground(level) {
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  gradient.addColorStop(0, level.theme.skyTop);
  gradient.addColorStop(1, level.theme.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  ctx.fillStyle = level.theme.cloud;
  range(5, (index) => {
    const x = ((index * 220 - game.cameraX * (0.12 + index * 0.02)) % (VIEW_WIDTH + 260)) - 120;
    const y = 56 + (index % 3) * 48;
    ctx.beginPath();
    ctx.ellipse(x, y, 52, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 42, y + 6, 44, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 38, y + 8, 38, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = level.theme.hillB;
  ctx.beginPath();
  ctx.moveTo(0, VIEW_HEIGHT);
  range(8, (index) => {
    const x = index * 160 - (game.cameraX * 0.2) % 160;
    const peakHeight = 84 + (index % 3) * 20;
    ctx.lineTo(x, 360 - peakHeight);
    ctx.lineTo(x + 80, 392);
  });
  ctx.lineTo(VIEW_WIDTH, VIEW_HEIGHT);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = level.theme.hillA;
  ctx.beginPath();
  ctx.moveTo(0, VIEW_HEIGHT);
  range(7, (index) => {
    const x = index * 190 - (game.cameraX * 0.32) % 190;
    const peakHeight = 120 + (index % 4) * 18;
    ctx.lineTo(x, 338 - peakHeight);
    ctx.lineTo(x + 95, 398);
  });
  ctx.lineTo(VIEW_WIDTH, VIEW_HEIGHT);
  ctx.closePath();
  ctx.fill();
}

function drawGroundBlock(rect, theme) {
  const screenX = rect.x - game.cameraX;
  ctx.fillStyle = theme.groundFace;
  ctx.fillRect(screenX, rect.y, rect.w, rect.h);
  ctx.fillStyle = theme.groundTop;
  ctx.fillRect(screenX, rect.y, rect.w, 18);

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let offset = 12; offset < rect.w; offset += 30) {
    ctx.fillRect(screenX + offset, rect.y + 24 + ((offset / 30) % 2) * 10, 8, 8);
  }
}

function drawPlatform(platform, theme) {
  const screenX = platform.x - game.cameraX;
  ctx.fillStyle = theme.platformFace;
  drawRoundedRect(screenX, platform.y, platform.w, platform.h, 8);
  ctx.fill();
  ctx.fillStyle = theme.platformTop;
  ctx.fillRect(screenX + 4, platform.y + 3, platform.w - 8, 7);
}

function drawCollectible(item) {
  const screenX = item.x - game.cameraX;
  const pulse = 0.85 + Math.sin(game.tick * 0.08 + item.x * 0.03) * 0.12;

  if (item.kind === "storm") {
    ctx.save();
    ctx.translate(screenX + item.w / 2, item.y + item.h / 2);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "rgba(255, 241, 161, 0.35)";
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe173";
    ctx.beginPath();
    ctx.moveTo(-2, -10);
    ctx.lineTo(8, -2);
    ctx.lineTo(3, -2);
    ctx.lineTo(7, 10);
    ctx.lineTo(-7, 1);
    ctx.lineTo(-1, 1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(screenX + item.w / 2, item.y + item.h / 2);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = "rgba(65, 215, 208, 0.26)";
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7ceef0";
  ctx.beginPath();
  for (let point = 0; point < 8; point += 1) {
    const radius = point % 2 === 0 ? 11 : 5;
    const angle = (-Math.PI / 2) + point * (Math.PI / 4);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (point === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawEnemy(enemy) {
  const screenX = enemy.x - game.cameraX;
  const bob = Math.sin(enemy.phase) * 2.2;
  const color = enemy.type === "stalker" ? "#3c3554" : "#6d2437";

  ctx.save();
  ctx.translate(screenX + enemy.w / 2, enemy.y + enemy.h / 2 + bob);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-14, 10);
  ctx.quadraticCurveTo(-20, -8, -8, -14);
  ctx.lineTo(-2, -18);
  ctx.lineTo(3, -14);
  ctx.lineTo(8, -18);
  ctx.lineTo(14, -12);
  ctx.quadraticCurveTo(20, -4, 14, 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fff9f0";
  ctx.fillRect(-8, -2, 5, 7);
  ctx.fillRect(3, -2, 5, 7);
  ctx.fillStyle = "#1d1022";
  ctx.fillRect(-6, 0, 2, 4);
  ctx.fillRect(5, 0, 2, 4);
  ctx.restore();
}

function drawGoal(goal, activated) {
  const screenX = goal.x - game.cameraX;
  ctx.save();
  ctx.fillStyle = activated ? "rgba(255, 214, 88, 0.2)" : "rgba(255,255,255,0.1)";
  ctx.fillRect(screenX - 16, goal.y - 12, goal.w + 32, goal.h + 18);

  ctx.fillStyle = activated ? "#ffe07a" : "#d6d9dd";
  ctx.fillRect(screenX, goal.y, 10, goal.h);
  ctx.fillRect(screenX + goal.w - 10, goal.y, 10, goal.h);
  ctx.fillRect(screenX, goal.y, goal.w, 10);

  ctx.strokeStyle = activated ? "#ff8f3b" : "#95b0c4";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(screenX + goal.w / 2 - 10, goal.y + 24);
  ctx.lineTo(screenX + goal.w / 2 + 5, goal.y + 50);
  ctx.lineTo(screenX + goal.w / 2 - 4, goal.y + 50);
  ctx.lineTo(screenX + goal.w / 2 + 10, goal.y + 82);
  ctx.stroke();
  ctx.restore();
}

function drawPlayer(player, character) {
  const flash = player.invulnerable > 0 && player.invulnerable % 8 < 4;
  if (flash) {
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

  if (character.id === "spark") {
    ctx.fillStyle = character.body;
    ctx.beginPath();
    ctx.ellipse(0, 4, 15, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = character.body;
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
  } else if (character.id === "blaze") {
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
    ctx.fillStyle = player.shieldTimer > 0 ? "#c7fff7" : character.body;
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

  ctx.fillStyle = "#1c1110";
  ctx.fillRect(4, -8, 3, 3);
  ctx.fillRect(-3, -8, 3, 3);
  ctx.restore();

  if (player.dashTimer > 0) {
    ctx.strokeStyle = "rgba(255, 224, 122, 0.7)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - facing * 24, centerY + 5);
    ctx.lineTo(centerX - facing * 40, centerY + 8);
    ctx.stroke();
  }
}

function drawWorld() {
  drawBackground(game.currentLevel);
  game.currentLevel.ground.forEach((segment) => drawGroundBlock(segment, game.currentLevel.theme));
  game.currentLevel.platforms.forEach((platform) => drawPlatform(platform, game.currentLevel.theme));

  for (const item of game.currentLevel.collectibles) {
    if (!item.collected) {
      drawCollectible(item);
    }
  }

  for (const enemy of game.currentLevel.enemies) {
    if (!enemy.defeated) {
      drawEnemy(enemy);
    }
  }

  drawGoal(
    game.currentLevel.goal,
    game.player.stormsCollected >= game.currentLevel.requiredStorms
  );
  drawPlayer(game.player, getCharacter());

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (const pit of game.currentLevel.pits) {
    const x = pit.start - game.cameraX;
    ctx.fillRect(x, game.currentLevel.baseY + 14, pit.end - pit.start, 8);
  }
}

function drawOverlay() {
  if (game.screen === "playing") {
    return;
  }

  ctx.fillStyle = "rgba(7, 12, 20, 0.42)";
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  let title = "Pika Storm Run";
  let subtitle = "Press Enter or click Start.";

  if (game.screen === "paused") {
    title = "Paused";
    subtitle = "Press Enter or click Resume to continue.";
  } else if (game.screen === "stageClear") {
    title = "Stage Clear";
    subtitle = "Press Enter or click Next Level.";
  } else if (game.screen === "recovering") {
    title = "Try Again";
    subtitle = "Restarting the current stage.";
  } else if (game.screen === "gameComplete") {
    const totals = getRunTotals();
    title = "Run Complete";
    subtitle = `25 stages cleared. Storm sparks: ${totals.storms}. Skill motes: ${totals.skills}.`;
  } else if (game.screen === "menu") {
    title = "Pika Storm Run";
    subtitle = "Choose a Pokemon and start the run.";
  }

  ctx.fillStyle = "#f8eed7";
  ctx.font = '700 44px "Avenir Next Condensed", "Trebuchet MS", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(title, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 16);

  ctx.fillStyle = "#d7e7ef";
  ctx.font = '500 22px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.fillText(subtitle, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 26);
}

function render() {
  if (!game.currentLevel || !game.player) {
    return;
  }
  drawWorld();
  drawOverlay();
}

function updateHud() {
  const currentCharacter = getCharacter();
  levelValue.textContent = `${game.levelIndex + 1} / ${LEVEL_NAMES.length}`;
  characterValue.textContent = currentCharacter.name;
  levelName.textContent = game.currentLevel ? game.currentLevel.name : LEVEL_NAMES[0];

  if (game.player && game.currentLevel) {
    stormValue.textContent = `${game.player.stormsCollected} / ${game.currentLevel.requiredStorms}`;
    skillValue.textContent = `${game.player.skillCharges}`;
    heartValue.textContent = `${Math.max(0, game.player.hearts)} / 4`;
  } else {
    stormValue.textContent = "0 / 0";
    skillValue.textContent = "0";
    heartValue.textContent = "4 / 4";
  }

  messageLine.textContent = getMessageLine();
}

function updateButtons() {
  primaryButton.disabled = false;
  restartButton.disabled = game.screen === "menu";

  if (game.screen === "menu") {
    primaryButton.textContent = "Start 25-Level Run";
  } else if (game.screen === "playing") {
    primaryButton.textContent = "Pause";
  } else if (game.screen === "paused") {
    primaryButton.textContent = "Resume";
  } else if (game.screen === "stageClear") {
    primaryButton.textContent = "Next Level";
  } else if (game.screen === "recovering") {
    primaryButton.textContent = "Restarting...";
    primaryButton.disabled = true;
    restartButton.disabled = true;
  } else if (game.screen === "gameComplete") {
    primaryButton.textContent = "Play Again";
  }
}

function renderCharacterPicker() {
  characterPicker.innerHTML = "";
  CHARACTERS.forEach((character) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "character-card";
    if (character.id === game.selectedCharacterId) {
      card.classList.add("is-selected");
    }
    card.innerHTML = `
      <div class="character-name">
        <span>${character.name}</span>
        <span class="character-badge">${character.skillName}</span>
      </div>
      <div class="character-copy">${character.blurb}</div>
      <div class="character-stats">Speed ${character.speed.toFixed(1)} | Jump ${character.jump.toFixed(1)} | ${character.title}</div>
    `;
    card.addEventListener("click", () => {
      game.selectedCharacterId = character.id;
      renderCharacterPicker();
      if (game.currentLevel) {
        loadLevel(game.levelIndex);
        if (game.screen === "menu") {
          game.screen = "menu";
        }
      }
      updateHud();
    });
    characterPicker.appendChild(card);
  });
}

function renderProgressStrip() {
  progressStrip.innerHTML = "";
  LEVEL_NAMES.forEach((name, index) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "level-pill";
    const available = index <= game.highestUnlocked || game.levelResults[index];

    if (index === game.levelIndex) {
      pill.classList.add("is-current");
    }
    if (game.levelResults[index]) {
      pill.classList.add("is-complete");
    }
    if (!available) {
      pill.classList.add("is-locked");
      pill.disabled = true;
    }

    pill.textContent = `${index + 1}`;
    pill.title = name;
    pill.addEventListener("click", () => {
      if (!available) {
        return;
      }
      loadLevel(index);
      game.screen = "playing";
      updateButtons();
    });
    progressStrip.appendChild(pill);
  });
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
      game.input.skillQueued = true;
    } else if (key === "enter" && !event.repeat) {
      handlePrimaryAction();
    } else if (key === "p" && !event.repeat) {
      pauseToggle();
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
  game.levelTemplates = LEVEL_NAMES.map((_, index) => buildLevel(index));
  game.currentLevel = cloneLevel(game.levelTemplates[0]);
  game.player = createPlayer(getCharacter(), game.currentLevel.spawn);
  renderCharacterPicker();
  renderProgressStrip();
  updateButtons();
  updateHud();
  setupInput();

  primaryButton.addEventListener("click", handlePrimaryAction);
  restartButton.addEventListener("click", restartLevel);

  requestAnimationFrame(loop);
}

init();
