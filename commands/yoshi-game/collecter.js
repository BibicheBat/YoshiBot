const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { collectEggs, YOSHI_COLORS, YOSHI_EMOJIS } = require('../../utils/yoshiGame');

module.exports = {
  data: new SlashCommandBuilder().setName('collecter').setDescription('🥚 Collecter des œufs de Yoshi (toutes les 4h)'),
  async execute(interaction) {
    const result = await collectEggs(interaction.user.id);
    if (result.error) {
      if (result.error === 'Pas de Yoshi') return interaction.reply({ content: '❌ Tu n\'as pas de Yoshi ! Utilise `/adopter`.', ephemeral: true });
      return interaction.reply({ content: `⏳ ${result.error}`, ephemeral: true });
    }
    const { egg, amount, yoshi } = result;
    const colorInfo = YOSHI_COLORS[yoshi.color] || YOSHI_COLORS['vert'];
    const embed = new EmbedBuilder()
      .setTitle(`${egg.emoji} Collecte d'œufs ! ${colorInfo.emojiAnim}`)
      .setColor(colorInfo.color)
      .setDescription(`${yoshi.emoji} Ton Yoshi a trouvé des œufs !\n\n**${egg.name}** — +${amount} œuf${amount > 1 ? 's' : ''}\n\n⏳ Reviens dans 4h pour collecter encore !`)
      .addFields({ name: '🥚 Œufs totaux', value: `${yoshi.eggs}`, inline: true }, { name: '⭐ Niveau', value: `${yoshi.level}`, inline: true }, { name: '📊 XP', value: `${yoshi.xp}/${yoshi.xpNeeded}`, inline: true })
      .setFooter({ text: 'Yoshi Bot' });
    if (yoshi.skillPoints > 0) embed.addFields({ name: '🎉 Compétence disponible !', value: `Tu as **${yoshi.skillPoints}** point(s) ! Utilise \`/competences\`` });
    await interaction.reply({ embeds: [embed] });
  },
};
