const { SlashCommandBuilder } = require('discord.js');
const { getKazagumo } = require('../../utils/musicManager');

module.exports = {
  data: new SlashCommandBuilder().setName('pause').setDescription('⏸️ Pause ou reprendre la musique'),
  async execute(interaction, client) {
    const player = getKazagumo(client).getPlayer(interaction.guild.id);
    if (!player) return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    if (player.paused) { await player.pause(false); await interaction.reply('▶️ Reprise !'); }
    else { await player.pause(true); await interaction.reply('⏸️ Pause !'); }
  },
};
