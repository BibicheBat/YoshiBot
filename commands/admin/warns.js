// commands/admin/warns.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getWarns, saveWarns } = require('../../data/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('📋 Voir ou effacer les avertissements')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(sub => sub.setName('liste').setDescription('Voir les warns').addUserOption(opt => opt.setName('membre').setDescription('Membre').setRequired(true)))
    .addSubcommand(sub => sub.setName('effacer').setDescription('Effacer un warn').addUserOption(opt => opt.setName('membre').setDescription('Membre').setRequired(true)).addIntegerOption(opt => opt.setName('id').setDescription('ID du warn (0 = tous)').setRequired(true).setMinValue(0))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser('membre');
    const warns = await getWarns(target.id);

    if (sub === 'liste') {
      const embed = new EmbedBuilder().setTitle(`⚠️ Warns — ${target.tag}`).setColor(warns.length > 0 ? 0xFFC107 : 0x4CAF50);
      if (warns.length === 0) { embed.setDescription('✅ Aucun avertissement.'); }
      else { warns.slice(-10).forEach(w => embed.addFields({ name: `Warn #${w.id} — <t:${Math.floor(w.date/1000)}:D>`, value: `📝 ${w.raison}\n👮 ${w.modTag}` })); }
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'effacer') {
      const warnId = interaction.options.getInteger('id');
      if (warnId === 0) { await saveWarns(target.id, []); return interaction.reply({ content: `✅ Tous les warns de **${target.tag}** effacés.`, ephemeral: true }); }
      const idx = warns.findIndex(w => w.id === warnId);
      if (idx === -1) return interaction.reply({ content: `❌ Warn #${warnId} introuvable.`, ephemeral: true });
      warns.splice(idx, 1);
      await saveWarns(target.id, warns);
      return interaction.reply({ content: `✅ Warn #${warnId} supprimé.`, ephemeral: true });
    }
  },
};
