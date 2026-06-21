// commands/music/stop.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('⏹️ Arrêter la musique et vider la file d\'attente'),

  async execute(interaction, client) {
    const queue = client.musicQueues.get(interaction.guild.id);

    if (!queue || !queue.playing) {
      return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    }
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '❌ Tu dois être dans le salon vocal !', ephemeral: true });
    }

    queue.stop();
    queue.connection.destroy();
    client.musicQueues.delete(interaction.guild.id);

    await interaction.reply('⏹️ Musique arrêtée et file d\'attente vidée ! Yoshi va se reposer... 💤');
  },
};
