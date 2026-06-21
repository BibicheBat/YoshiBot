const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('⏹️ Arrêter la musique'),
  async execute(interaction, client) {
    const queue = useQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ content: '❌ Aucune musique en cours !', ephemeral: true });
    queue.delete();
    await interaction.reply('⏹️ Musique arrêtée ! Yoshi va se reposer... 💤');
  },
};
