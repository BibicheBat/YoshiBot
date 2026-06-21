// commands/music/pause.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('⏸️ Mettre la musique en pause ou la reprendre'),

  async execute(interaction, client) {
    const queue = client.musicQueues.get(interaction.guild.id);
    if (!queue || !queue.playing) {
      return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    }
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '❌ Tu dois être dans le salon vocal !', ephemeral: true });
    }

    if (queue.paused) {
      queue.resume();
      await interaction.reply('▶️ Musique reprise !');
    } else {
      queue.pause();
      await interaction.reply('⏸️ Musique mise en pause !');
    }
  },
};
