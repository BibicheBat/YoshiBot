const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('pause').setDescription('⏸️ Pause ou reprendre'),
  async execute(interaction, client) {
    const queue = client.musicQueues?.get(interaction.guild.id);
    if (!queue?.playing) return interaction.reply({ content: '❌ Aucune musique !', ephemeral: true });
    if (queue.paused) { queue.resume(); await interaction.reply('▶️ Reprise !'); }
    else { queue.pause(); await interaction.reply('⏸️ Pause !'); }
  },
};
