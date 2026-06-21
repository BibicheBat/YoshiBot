// commands/info/info-serveur.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info-serveur')
    .setDescription('Obtenir des informations sur le serveur'),

  async execute(interaction) {
    const guild = interaction.guild;
    await guild.fetch();

    const channels = guild.channels.cache;
    const textChannels = channels.filter(c => c.type === 0).size;
    const voiceChannels = channels.filter(c => c.type === 2).size;

    const verificationLevels = { 0: 'Aucune', 1: 'Faible', 2: 'Moyenne', 3: 'Élevée', 4: 'Très élevée' };

    const embed = new EmbedBuilder()
      .setTitle(`🏰 ${guild.name}`)
      .setColor(0x5865F2)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '👥 Membres', value: `${guild.memberCount}`, inline: true },
        { name: '💬 Salons texte', value: `${textChannels}`, inline: true },
        { name: '🔊 Salons vocaux', value: `${voiceChannels}`, inline: true },
        { name: '🎭 Rôles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '🛡️ Vérification', value: verificationLevels[guild.verificationLevel], inline: true },
        { name: '🚀 Boosts', value: `${guild.premiumSubscriptionCount} (Niveau ${guild.premiumTier})`, inline: true },
      )
      .setImage(guild.bannerURL({ size: 1024 }) || null)
      .setTimestamp()
      .setFooter({ text: `Demandé par ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  },
};
