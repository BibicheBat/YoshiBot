const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('⏭️ Passer à la musique suivante'),
  async execute(interaction, client) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying()) return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    const track = queue.currentTrack;
    queue.node.skip();
    await interaction.reply(`⏭️ **${track?.title || 'Musique'}** passée !`);
  },
};
