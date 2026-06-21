const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('🎶 Voir la file d\'attente'),
  async execute(interaction, client) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying()) return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    const current = queue.currentTrack;
    const tracks = queue.tracks.toArray().slice(0, 10);
    const embed = new EmbedBuilder()
      .setTitle('🎵 File d\'attente').setColor(0x4CAF50)
      .addFields({ name: '▶️ En cours', value: `**[${current.title}](${current.url})**` });
    if (tracks.length > 0) {
      embed.addFields({ name: `📋 À venir (${queue.tracks.size})`, value: tracks.map((t, i) => `**${i+1}.** ${t.title}`).join('\n') });
    }
    embed.setFooter({ text: 'Yoshi Music 🎵' });
    await interaction.reply({ embeds: [embed] });
  },
};
