const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('⏹️ Arrêter la musique'),
  async execute(interaction, client) {
    const queue = client.musicQueues?.get(interaction.guild.id);
    if (!queue) return interaction.reply({ content: '❌ Aucune musique !', ephemeral: true });
    queue.stop();
    queue.connection.destroy();
    client.musicQueues.delete(interaction.guild.id);
    await interaction.reply('⏹️ Arrêté ! Yoshi se repose... 💤');
  },
};
