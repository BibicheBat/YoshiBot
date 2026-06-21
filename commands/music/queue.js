// commands/music/queue.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('🎶 Voir la file d\'attente musicale'),

  async execute(interaction, client) {
    const queue = client.musicQueues.get(interaction.guild.id);

    if (!queue || queue.tracks.length === 0) {
      return interaction.reply({ content: '❌ Aucune musique en file d\'attente.', ephemeral: true });
    }

    const current = queue.tracks[0];
    const upcoming = queue.tracks.slice(1, 11);

    const embed = new EmbedBuilder()
      .setTitle('🎵 File d\'attente')
      .setColor(0x4CAF50)
      .addFields({
        name: queue.paused ? '⏸️ En pause' : '▶️ En cours',
        value: `**[${current.title}](${current.url})**\nDemandé par : ${current.requestedBy}`,
      });

    if (upcoming.length > 0) {
      embed.addFields({
        name: `📋 À venir (${queue.tracks.length - 1} musique${queue.tracks.length - 1 > 1 ? 's' : ''})`,
        value: upcoming.map((t, i) => `**${i + 1}.** [${t.title}](${t.url})`).join('\n'),
      });
    }

    embed.setFooter({ text: `${queue.tracks.length} musique(s) au total • Yoshi Music 🦕` });

    await interaction.reply({ embeds: [embed] });
  },
};
