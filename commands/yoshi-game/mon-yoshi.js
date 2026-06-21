const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getYoshi } = require('../../data/db');
const { YOSHI_COLORS, YOSHI_EMOJIS, SKILLS } = require('../../utils/yoshiGame');

function bar(cur, max, len = 10) {
  const f = Math.round((cur / max) * len);
  return '█'.repeat(f) + '░'.repeat(len - f);
}

module.exports = {
  data: new SlashCommandBuilder().setName('mon-yoshi').setDescription('🦕 Voir les infos de ton Yoshi').addUserOption(opt => opt.setName('joueur').setDescription('Voir le Yoshi d\'un autre joueur').setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('joueur') || interaction.user;
    const yoshi = await getYoshi(target.id);
    if (!yoshi) return interaction.reply({ content: target.id === interaction.user.id ? '❌ Tu n\'as pas de Yoshi ! Utilise `/adopter`.' : `❌ ${target.username} n'a pas de Yoshi !`, ephemeral: true });
    const colorInfo = YOSHI_COLORS[yoshi.color] || YOSHI_COLORS['vert'];
    const skillList = yoshi.skills.length > 0 ? yoshi.skills.map(sId => { const s = SKILLS.find(sk => sk.id === sId); return s ? s.name : sId; }).join('\n') : 'Aucune compétence';
    const embed = new EmbedBuilder()
      .setTitle(`${yoshi.emoji} ${yoshi.name} — Niveau ${yoshi.level} ${colorInfo.emojiAnim}`)
      .setColor(colorInfo.color)
      .setDescription(colorInfo.rare ? `${YOSHI_EMOJIS.dore} **Yoshi Doré — LÉGENDAIRE**` : `${yoshi.emoji} Yoshi ${yoshi.color}`)
      .addFields(
        { name: '❤️ PV', value: `${bar(yoshi.hp, yoshi.maxHp)} ${yoshi.hp}/${yoshi.maxHp}` },
        { name: '⭐ XP', value: `${bar(yoshi.xp, yoshi.xpNeeded)} ${yoshi.xp}/${yoshi.xpNeeded}` },
        { name: '🥚 Œufs actuels', value: `${yoshi.eggs}`, inline: true },
        { name: '🥚 Œufs totaux', value: `${yoshi.totalEggs}`, inline: true },
        { name: '🎯 Points compétence', value: `${yoshi.skillPoints}`, inline: true },
        { name: '💑 Partenaire', value: yoshi.partner ? `<@${yoshi.partner}>` : 'Célibataire 💔', inline: true },
        { name: `🛠️ Compétences (${yoshi.skills.length})`, value: skillList },
        { name: '📅 Adopté', value: `<t:${Math.floor(yoshi.createdAt / 1000)}:R>`, inline: true },
      )
      .setFooter({ text: `Appartient à ${target.username}` }).setTimestamp();
    if (yoshi.skillPoints > 0) embed.addFields({ name: `${YOSHI_EMOJIS.danse} Points disponibles !`, value: `Tu as **${yoshi.skillPoints}** point(s) ! Utilise \`/competences\`` });
    await interaction.reply({ embeds: [embed] });
  },
};
