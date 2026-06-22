// commands/info/info.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Obtenir des informations sur le bot Yoshi 🦕'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🦕 Bot Yoshi — Informations')
      .setColor(0x4CAF50)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setDescription('Bienvenue sur le Bot Yoshi ! Adopte ton Yoshi, améliore-le et vis des aventures sur ce serveur !')
      .addFields(
        { name: '👤 Développeur', value: 'Yoshi Team', inline: true },
        { name: '📅 En ligne depuis', value: `<t:${Math.floor(interaction.client.readyTimestamp / 1000)}:R>`, inline: true },
        { name: '🏓 Latence', value: `${interaction.client.ws.ping}ms`, inline: true },
        { name: '🖥️ Serveurs', value: `${interaction.client.guilds.cache.size}`, inline: true },
        { name: '👥 Utilisateurs', value: `${interaction.client.users.cache.size}`, inline: true },
        { name: '⚙️ Version', value: 'v1.0.0', inline: true },
        {
          name: '📋 Commandes disponibles',
          value: [
            '`/info` `/info-user` `/info-serveur`',
            '`/play` `/pause` `/skip`',
            '`/yoshi` `/yoshi-music`',
            '`/adopter` `/mon-yoshi` `/collecter`',
            '`/competences` `/couple`',
            '`/ban` `/kick` `/mute` `/clear`',
            '`/envoyer` `/giveaway`',
          ].join('\n'),
        },
      )
      .setFooter({ text: 'Yoshi Bot 🥚', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
