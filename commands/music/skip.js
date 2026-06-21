// commands/music/skip.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('⏭️ Passer à la musique suivante'),

  async execute(interaction, client) {
    const queue = client.musicQueues.get(interaction.guild.id);
    if (!queue || !queue.playing) {
      return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    }
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '❌ Tu dois être dans le salon vocal !', ephemeral: true });
    }

    const current = queue.nowPlaying();
    queue.skip();
    await interaction.reply(`⏭️ **${current?.title || 'Musique'}** passée !`);
  },
};
