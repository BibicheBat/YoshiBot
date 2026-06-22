const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('⏭️ Passer à la suivante'),
  async execute(interaction, client) {
    const queue = client.musicQueues?.get(interaction.guild.id);
    if (!queue?.playing) return interaction.reply({ content: '❌ Aucune musique !', ephemeral: true });
    const title = queue.nowPlaying()?.title || 'Musique';
    queue.skip();
    await interaction.reply(`⏭️ **${title}** passée !`);
  },
};
