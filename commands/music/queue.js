const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getKazagumo } = require('../../utils/musicManager');

module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('🎶 Voir la file d\'attente'),
  async execute(interaction, client) {
    const player = getKazagumo(client).getPlayer(interaction.guild.id);
    if (!player || !player.queue.current) return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    const current = player.queue.current;
    const tracks = player.queue.slice(0, 10);
    const embed = new EmbedBuilder()
      .setTitle('🎵 File d\'attente').setColor(0x4CAF50)
      .addFields({ name: '▶️ En cours', value: `**${current.title}**` });
    if (tracks.length > 0) {
      embed.addFields({ name: `📋 À venir (${player.queue.size})`, value: tracks.map((t, i) => `**${i+1}.** ${t.title}`).join('\n') });
    }
    await interaction.reply({ embeds: [embed] });
  },
};
