const { SlashCommandBuilder } = require('discord.js');
const { getKazagumo } = require('../../utils/musicManager');

module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('⏹️ Arrêter la musique'),
  async execute(interaction, client) {
    const player = getKazagumo(client).getPlayer(interaction.guild.id);
    if (!player) return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    await player.destroy();
    await interaction.reply('⏹️ Musique arrêtée ! Yoshi se repose... 💤');
  },
};
