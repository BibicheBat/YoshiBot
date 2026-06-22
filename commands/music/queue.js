const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('🎶 Voir la file d\'attente'),
  async execute(interaction, client) {
    const queue = client.musicQueues?.get(interaction.guild.id);
    if (!queue?.playing) return interaction.reply({ content: '❌ Aucune musique !', ephemeral: true });
    const current = queue.nowPlaying();
    const tracks = queue.queue().slice(1, 11);
    const embed = new EmbedBuilder().setTitle('🎵 File d\'attente').setColor(0x4CAF50)
      .addFields({ name: '▶️ En cours', value: `**${current.title}**` });
    if (tracks.length > 0) embed.addFields({ name: `📋 À venir (${queue.queue().length - 1})`, value: tracks.map((t, i) => `**${i+1}.** ${t.title}`).join('\n') });
    await interaction.reply({ embeds: [embed] });
  },
};
