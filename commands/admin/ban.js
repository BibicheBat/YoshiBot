// commands/admin/ban.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('🔨 Bannir un membre du serveur')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(opt => opt.setName('membre').setDescription('Membre à bannir').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison du ban').setRequired(false))
    .addIntegerOption(opt => opt.setName('jours').setDescription('Jours de messages à supprimer (0-7)').setMinValue(0).setMaxValue(7).setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getMember('membre');
    const raison = interaction.options.getString('raison') || 'Aucune raison fournie';
    const jours = interaction.options.getInteger('jours') || 0;

    if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    if (!target.bannable) return interaction.reply({ content: '❌ Je ne peux pas bannir ce membre.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ Tu ne peux pas te bannir toi-même !', ephemeral: true });

    try {
      await target.send(`🔨 Tu as été **banni** du serveur **${interaction.guild.name}**.\nRaison : ${raison}`).catch(() => {});
      await target.ban({ deleteMessageDays: jours, reason: raison });

      const embed = new EmbedBuilder()
        .setTitle('🔨 Membre banni')
        .setColor(0xFF0000)
        .addFields(
          { name: '👤 Membre', value: `${target.user.tag}`, inline: true },
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
