// commands/admin/unmute.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('🔊 Retirer le mute d\'un membre')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('membre').setDescription('Membre à démuter').setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getMember('membre');
    if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });

    try {
      await target.timeout(null);
      const embed = new EmbedBuilder()
        .setTitle('🔊 Membre démuté')
        .setColor(0x4CAF50)
        .addFields(
          { name: '👤 Membre', value: target.user.tag, inline: true },
          { name: '👮 Modérateur', value: interaction.user.tag, inline: true },
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({ content: `❌ Erreur : ${err.message}`, ephemeral: true });
    }
  },
};
