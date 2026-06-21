// commands/admin/kick.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('👢 Expulser un membre du serveur')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(opt => opt.setName('membre').setDescription('Membre à expulser').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison du kick').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getMember('membre');
    const raison = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    if (!target.kickable) return interaction.reply({ content: '❌ Je ne peux pas expulser ce membre.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ Tu ne peux pas t\'expulser toi-même !', ephemeral: true });

    try {
      await target.send(`👢 Tu as été **expulsé(e)** du serveur **${interaction.guild.name}**.\nRaison : ${raison}`).catch(() => {});
      await target.kick(raison);

      const embed = new EmbedBuilder()
        .setTitle('👢 Membre expulsé')
        .setColor(0xFF6600)
        .addFields(
          { name: '👤 Membre', value: target.user.tag, inline: true },
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
