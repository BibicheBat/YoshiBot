const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllYoshis } = require('../../data/db');
const { YOSHI_EMOJIS } = require('../../utils/yoshiGame');

module.exports = {
  data: new SlashCommandBuilder().setName('classement').setDescription('🏆 Classement des meilleurs Yoshis')
    .addStringOption(opt => opt.setName('tri').setDescription('Trier par...').setRequired(false)
      .addChoices({ name: '⭐ Niveau', value: 'level' }, { name: '🥚 Œufs totaux', value: 'totalEggs' })),
  async execute(interaction) {
    await interaction.deferReply();
    const tri = interaction.options.getString('tri') || 'level';
    const all = await getAllYoshis();
    const entries = Object.entries(all).map(([userId, y]) => ({ userId, ...y })).sort((a, b) => b[tri] - a[tri]).slice(0, 10);
    if (entries.length === 0) return interaction.editReply('❌ Aucun Yoshi n\'a encore été adopté !');
    const medals = ['🥇', '🥈', '🥉'];
    const lines = await Promise.all(entries.map(async (yoshi, i) => {
      let name = `<@${yoshi.userId}>`;
      try { const m = await interaction.guild.members.fetch(yoshi.userId).catch(() => null); if (m) name = m.displayName; } catch {}
      return `${medals[i] || `**#${i+1}**`} ${yoshi.emoji} **${name}** — Niv. ${yoshi.level} • ${yoshi.totalEggs} œufs${yoshi.partner ? ' 💑' : ''}`;
    }));
    const myYoshi = all[interaction.user.id];
    const myRank = Object.entries(all).map(([uid, y]) => ({ uid, ...y })).sort((a, b) => b[tri] - a[tri]).findIndex(y => y.uid === interaction.user.id) + 1;
    const embed = new EmbedBuilder()
      .setTitle(`${YOSHI_EMOJIS.danse} Classement Yoshi`).setColor(0xFFD700)
      .setDescription(lines.join('\n'))
      .setFooter({ text: myYoshi ? `Ta position : #${myRank} | Niv. ${myYoshi.level}` : 'Tu n\'as pas de Yoshi ! Utilise /adopter' }).setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  },
};
