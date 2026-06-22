// utils/yoshiGame.js
const { getYoshi, setYoshi, getAllYoshis } = require('../data/db');

const YOSHI_EMOJIS = {
  // Emojis animés (à compléter avec tes IDs)
  danse:        '<a:Yoshi_dance:1517583470799355976>',
  danse2:       '<a:yoshi_qui_danse:1505495035959836754>',

  // Emojis Yoshi par couleur (IDs réels)
  bleu:         '<:Blue_Yoshi:1517819395802402916>',
  'bleu clair': '<:Light_Blue_Yoshi:1517820817914855424>',
  gris:         '<:Gray_Yoshi:1517820607394480249>',
  dore:         '<:Gold_Yoshi:1517820410140557392>',
  vert:         '<:Green_Yoshi:1517585241097764944>',
  jaune:        '<:Yellow_Yoshi:1517819627072131213>',
  rouge:        '<:Red_Yoshi:1517818713867423914>',
  violet:       '<:Purple_Yoshi:1517819908056940544>',
  orange:       '<:Orange_Yoshi:1517819505210818560>',

  // Rose : pas d'emoji custom, fallback Unicode
  rose:         '<:Pink_Yoshi:1517818864208056391>',
};

const YOSHI_COLORS = {
  vert:         { emoji: YOSHI_EMOJIS.vert,          emojiAnim: YOSHI_EMOJIS.danse,  color: 0x4CAF50, rare: false },
  rose:         { emoji: YOSHI_EMOJIS.rose,           emojiAnim: YOSHI_EMOJIS.danse,  color: 0xFF69B4, rare: false },
  'bleu clair': { emoji: YOSHI_EMOJIS['bleu clair'],  emojiAnim: YOSHI_EMOJIS.danse,  color: 0x87CEEB, rare: false },
  rouge:        { emoji: YOSHI_EMOJIS.rouge,          emojiAnim: YOSHI_EMOJIS.danse,  color: 0xF44336, rare: false },
  orange:       { emoji: YOSHI_EMOJIS.orange,         emojiAnim: YOSHI_EMOJIS.danse,  color: 0xFF9800, rare: false },
  jaune:        { emoji: YOSHI_EMOJIS.jaune,          emojiAnim: YOSHI_EMOJIS.danse,  color: 0xFFEB3B, rare: false },
  bleu:         { emoji: YOSHI_EMOJIS.bleu,           emojiAnim: YOSHI_EMOJIS.danse,  color: 0x2196F3, rare: false },
  violet:       { emoji: YOSHI_EMOJIS.violet,         emojiAnim: YOSHI_EMOJIS.danse2, color: 0x9C27B0, rare: false },
  gris:         { emoji: YOSHI_EMOJIS.gris,           emojiAnim: YOSHI_EMOJIS.danse2, color: 0x9E9E9E, rare: false },
  dore:         { emoji: YOSHI_EMOJIS.dore,           emojiAnim: YOSHI_EMOJIS.danse2, color: 0xFFD700, rare: true  },
};

const SKILLS = [
  { id: 'speed',    name: '⚡ Rapidité',   desc: 'Augmente la vitesse de collecte des œufs.' },
  { id: 'luck',     name: '🍀 Chance',     desc: 'Augmente les chances de trouver des œufs rares.' },
  { id: 'strength', name: '💪 Force',      desc: 'Augmente les dégâts en combat.' },
  { id: 'charisma', name: '💖 Charisme',   desc: 'Facilite la mise en couple.' },
  { id: 'stamina',  name: '🛡️ Endurance', desc: 'Augmente les PV du Yoshi.' },
  { id: 'magic',    name: '🔮 Magie',      desc: 'Débloque des capacités spéciales.' },
];

const EGG_TYPES = [
  { name: 'Œuf Normal', emoji: '🥚',   value: 1,  chance: 70 },
  { name: 'Œuf Bleu',   emoji: '🔵🥚', value: 3,  chance: 20 },
  { name: 'Œuf Rouge',  emoji: '🔴🥚', value: 5,  chance: 8  },
  { name: 'Œuf Doré',   emoji: '✨🥚', value: 15, chance: 2  },
];

async function createYoshi(userId, color) {
  if (!YOSHI_COLORS[color]) return null;
  const yoshi = {
    userId, color,
    emoji: YOSHI_COLORS[color].emoji,
    name: `Yoshi ${color}`,
    level: 1, xp: 0, xpNeeded: 100,
    eggs: 0, totalEggs: 0,
    skills: [], skillPoints: 0,
    partner: null, hp: 100, maxHp: 100,
    createdAt: Date.now(), lastEggCollect: 0,
  };
  await setYoshi(userId, yoshi);
  return yoshi;
}

function getYoshiColor(color) { return YOSHI_COLORS[color]; }
function getAllColors() { return Object.keys(YOSHI_COLORS); }

async function addEggs(userId, amount) {
  const yoshi = await getYoshi(userId);
  if (!yoshi) return null;
  yoshi.eggs += amount;
  yoshi.totalEggs += amount;
  yoshi.xp += amount * 2;
  while (yoshi.xp >= yoshi.xpNeeded) {
    yoshi.xp -= yoshi.xpNeeded;
    yoshi.level++;
    yoshi.xpNeeded = Math.floor(yoshi.xpNeeded * 1.5);
    yoshi.skillPoints++;
    yoshi.maxHp += 10;
    yoshi.hp = yoshi.maxHp;
  }
  await setYoshi(userId, yoshi);
  return yoshi;
}

async function collectEggs(userId) {
  const yoshi = await getYoshi(userId);
  if (!yoshi) return { error: 'Pas de Yoshi' };
  const now = Date.now();
  const cooldown = 4 * 60 * 60 * 1000;
  if (now - yoshi.lastEggCollect < cooldown) {
    const remaining = cooldown - (now - yoshi.lastEggCollect);
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    return { error: `Tu dois attendre encore **${h}h ${m}min** avant de collecter des œufs !` };
  }
  const luckBonus = yoshi.skills.includes('luck') ? 1.5 : 1;
  const roll = Math.random() * 100;
  let egg = EGG_TYPES[0];
  let cumulative = 0;
  for (const e of EGG_TYPES) {
    cumulative += e.chance;
    if (roll < cumulative * luckBonus) { egg = e; break; }
  }
  const amount = egg.value + (yoshi.skills.includes('speed') ? 1 : 0);
  yoshi.lastEggCollect = now;
  await setYoshi(userId, yoshi);
  await addEggs(userId, amount);
  return { egg, amount, yoshi: await getYoshi(userId) };
}

async function upgradeSkill(userId, skillId) {
  const yoshi = await getYoshi(userId);
  if (!yoshi) return { error: 'Pas de Yoshi' };
  if (yoshi.skillPoints <= 0) return { error: 'Pas de points de compétence disponibles !' };
  if (yoshi.skills.includes(skillId)) return { error: 'Tu as déjà cette compétence !' };
  const skill = SKILLS.find(s => s.id === skillId);
  if (!skill) return { error: 'Compétence inconnue.' };
  yoshi.skills.push(skillId);
  yoshi.skillPoints--;
  await setYoshi(userId, yoshi);
  return { success: true, skill, yoshi };
}

async function distributeEggs(client) {
  const all = await getAllYoshis();
  for (const [userId, yoshi] of Object.entries(all)) {
    const coupleBonus = yoshi.partner ? 1 : 0;
    const amount = Math.floor(Math.random() * 3) + 1 + coupleBonus;
    await addEggs(userId, amount);
  }
  console.log(`[Yoshi] Distribution horaire effectuée pour ${Object.keys(all).length} yoshis.`);
}

module.exports = { createYoshi, getYoshiColor, getAllColors, YOSHI_COLORS, YOSHI_EMOJIS, SKILLS, EGG_TYPES, addEggs, collectEggs, upgradeSkill, distributeEggs };
