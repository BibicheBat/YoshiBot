const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getYoshi } = require('../../data/db');
const { YOSHI_COLORS, YOSHI_EMOJIS, addEggs } = require('../../utils/yoshiGame');

const combatCooldowns = new Map();

function calcDamage(yoshi) {
  const base = Math.floor(Math.random() * 15) + 5;
  return base + (yoshi.skills.includes('strength') ? 8 : 0) + (yoshi.skills.includes('magic') ? Math.floor(Math.random() * 10) : 0);
}

module.exports = {
  data: new SlashCommandBuilder().setName('combat').setDescription('⚔️ Défier le Yoshi d\'un autre joueur !')
    .addUserOption(opt => opt.setName('adversaire').setDescription('Le joueur à défier').setRequired(true)),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('adversaire');
    if (targetUser.id === interaction.user.id) return interaction.reply({ content: '❌ Tu ne peux pas te battre contre toi-même !', ephemeral: true });
    if (targetUser.bot) return interaction.reply({ content: `❌ Je refuse de me battre ! ${YOSHI_EMOJIS.danse}`, ephemeral: true });
    const lastFight = combatCooldowns.get(interaction.user.id) || 0;
    if (Date.now() - lastFight < 3600000) {
      const m = Math.ceil((3600000 - (Date.now() - lastFight)) / 60000);
      return interaction.reply({ content: `⏳ Ton Yoshi est fatigué ! Réessaie dans **${m} min**.`, ephemeral: true });
    }
    const yoshiA = await getYoshi(interaction.user.id);
    const yoshiB = await getYoshi(targetUser.id);
    if (!yoshiA) return interaction.reply({ content: '❌ Tu n\'as pas de Yoshi !', ephemeral: true });
    if (!yoshiB) return interaction.reply({ content: `❌ ${targetUser.username} n'a pas de Yoshi !`, ephemeral: true });

    let hpA = yoshiA.maxHp, hpB = yoshiB.maxHp;
    const log = [];
    for (let r = 1; r <= 3; r++) {
      const dmgAB = calcDamage(yoshiA); hpB = Math.max(0, hpB - dmgAB);
      log.push(`**Round ${r}** — ${yoshiA.emoji} attaque pour **${dmgAB}** dégâts ! ${yoshiB.emoji} PV: ${hpB}/${yoshiB.maxHp}`);
      if (hpB <= 0) break;
      const dmgBA = calcDamage(yoshiB); hpA = Math.max(0, hpA - dmgBA);
      log.push(`↩️ ${yoshiB.emoji} riposte pour **${dmgBA}** dégâts ! ${yoshiA.emoji} PV: ${hpA}/${yoshiA.maxHp}`);
      if (hpA <= 0) break;
    }
    const draw = hpA === hpB;
    const aWins = hpA > hpB;
    let rewardMsg = '';
    if (!draw) {
      const reward = 5 + (aWins ? yoshiB.level : yoshiA.level);
      await addEggs(aWins ? interaction.user.id : targetUser.id, reward);
      combatCooldowns.set(interaction.user.id, Date.now());
      combatCooldowns.set(targetUser.id, Date.now());
      rewardMsg = `\n\n🏆 ${aWins ? yoshiA.emoji + ' ' + yoshiA.name : yoshiB.emoji + ' ' + yoshiB.name} gagne **+${reward} œufs** !`;
    }
    const colorInfo = YOSHI_COLORS[aWins ? yoshiA.color : yoshiB.color] || YOSHI_COLORS['vert'];
    const embed = new EmbedBuilder()
      .setTitle(`⚔️ ${draw ? '🤝 Match nul !' : `${aWins ? yoshiA.emoji : yoshiB.emoji} Victoire !`}`)
      .setColor(draw ? 0xFFD700 : colorInfo.color)
      .setDescription(`${yoshiA.emoji} **${yoshiA.name}** VS ${yoshiB.emoji} **${yoshiB.name}**\n━━━━━━━━━━━━━━━\n${log.join('\n')}\n━━━━━━━━━━━━━━━\n${draw ? '🤝 Égalité !' : `💥 **${aWins ? yoshiA.name : yoshiB.name}** gagne !`}${rewardMsg}`)
      .addFields({ name: `${yoshiA.emoji} ${yoshiA.name}`, value: `PV: **${hpA}**`, inline: true }, { name: `${yoshiB.emoji} ${yoshiB.name}`, value: `PV: **${hpB}**`, inline: true })
      .setFooter({ text: 'Cooldown 1h' }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
