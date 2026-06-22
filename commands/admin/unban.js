// commands/admin/unban.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('🔓 Débannir un utilisateur')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(opt =>
      opt.setName('id')
        .setDescription('L\'ID Discord de l\'utilisateur à débannir')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('raison')
        .setDescription('Raison du déban')
        .setRequired(false)
    ),

  async execute(interaction) {
    const userId = interaction.options.getString('id');
    const raison = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({ content: '❌ ID invalide. Un ID Discord contient 17 à 20 chiffres.', ephemeral: true });
    }

    try {
      const banList = await interaction.guild.bans.fetch();
      const ban = banList.get(userId);

      if (!ban) {
        return interaction.reply({ content: `❌ Cet utilisateur n'est pas banni (ID : \`${userId}\`).`, ephemeral: true });
      }

      await interaction.guild.members.unban(userId, raison);

      const embed = new EmbedBuilder()
        .setTitle('🔓 Utilisateur débanni')
        .setColor(0x4CAF50)
        .addFields(
          { name: '👤 Utilisateur', value: `${ban.user.tag} (\`${userId}\`)`, inline: true },
          { name: '👮 Modérateur', value: interaction.user.tag, inline: true },
          { name: '📝 Raison', value: raison },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({ content: `❌ Erreur : ${err.message}`, ephemeral: true });
    }
  },
};
