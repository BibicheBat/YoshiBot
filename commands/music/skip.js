const { SlashCommandBuilder } = require('discord.js');
const { getKazagumo } = require('../../utils/musicManager');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('⏭️ Passer à la musique suivante'),
  async execute(interaction, client) {
    const player = getKazagumo(client).getPlayer(interaction.guild.id);
    if (!player) return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    const title = player.queue.current?.title || 'Musique';
    await player.skip();
    await interaction.reply(`⏭️ **${title}** passée !`);
  },
};
