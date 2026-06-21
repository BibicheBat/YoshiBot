// commands/admin/clear.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('🗑️ Supprimer des messages dans le salon')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt =>
      opt.setName('nombre').setDescription('Nombre de messages à supprimer (1-100)').setMinValue(1).setMaxValue(100).setRequired(true)
    )
    .addUserOption(opt =>
      opt.setName('membre').setDescription('Supprimer uniquement les messages de ce membre').setRequired(false)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('nombre');
    const target = interaction.options.getUser('membre');

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages = await interaction.channel.messages.fetch({ limit: 100 });

      if (target) {
        messages = messages.filter(m => m.author.id === target.id);
      }

      messages = [...messages.values()].slice(0, amount);

      // Filter messages older than 14 days (Discord limit)
      const deletable = messages.filter(m => Date.now() - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000);

      await interaction.channel.bulkDelete(deletable, true);

      const embed = new EmbedBuilder()
        .setTitle('🗑️ Messages supprimés')
        .setColor(0xFF6600)
        .addFields(
          { name: '🔢 Messages supprimés', value: `${deletable.length}`, inline: true },
          { name: '👮 Modérateur', value: interaction.user.tag, inline: true },
          target ? { name: '👤 Filtre', value: target.tag, inline: true } : { name: '\u200b', value: '\u200b', inline: true },
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply(`❌ Erreur : ${err.message}`);
    }
  },
};
