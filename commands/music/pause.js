const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder().setName('pause').setDescription('⏸️ Mettre la musique en pause ou reprendre'),
  async execute(interaction, client) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying()) return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    if (queue.node.isPaused()) { queue.node.resume(); await interaction.reply('▶️ Musique reprise !'); }
    else { queue.node.pause(); await interaction.reply('⏸️ Musique en pause !'); }
  },
};
