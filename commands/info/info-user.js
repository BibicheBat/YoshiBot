// commands/info/info-user.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info-user')
    .setDescription('Obtenir des informations sur un utilisateur')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('L\'utilisateur à inspecter').setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('utilisateur') || interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    const roles = member?.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => r.toString())
      .slice(0, 10)
      .join(', ') || 'Aucun rôle';

    const embed = new EmbedBuilder()
      .setTitle(`👤 Informations — ${target.username}`)
      .setColor(member?.displayHexColor || 0x5865F2)
      .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🏷️ Nom d\'utilisateur', value: target.tag, inline: true },
        { name: '🆔 ID', value: target.id, inline: true },
        { name: '🤖 Bot ?', value: target.bot ? 'Oui' : 'Non', inline: true },
        { name: '📅 Compte créé', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:D>\n(<t:${Math.floor(target.createdTimestamp / 1000)}:R>)`, inline: true },
        { name: '📥 A rejoint le serveur', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>\n(<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)` : 'N/A', inline: true },
        { name: '🎭 Pseudo serveur', value: member?.nickname || target.username, inline: true },
        { name: `🎖️ Rôles (${member?.roles.cache.size - 1 || 0})`, value: roles },
      )
      .setTimestamp()
      .setFooter({ text: `Demandé par ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  },
};
