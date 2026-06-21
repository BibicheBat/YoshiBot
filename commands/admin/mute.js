// commands/admin/mute.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const DURATIONS = {
  '60':    { label: '1 minute',  ms: 60 * 1000 },
  '300':   { label: '5 minutes', ms: 5 * 60 * 1000 },
  '600':   { label: '10 minutes',ms: 10 * 60 * 1000 },
  '1800':  { label: '30 minutes',ms: 30 * 60 * 1000 },
  '3600':  { label: '1 heure',   ms: 60 * 60 * 1000 },
  '21600': { label: '6 heures',  ms: 6 * 60 * 60 * 1000 },
  '86400': { label: '1 jour',    ms: 24 * 60 * 60 * 1000 },
  '604800':{ label: '7 jours',   ms: 7 * 24 * 60 * 60 * 1000 },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('🔇 Mettre un membre en sourdine (timeout)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('membre').setDescription('Membre à muter').setRequired(true))
    .addStringOption(opt => {
      opt.setName('durée').setDescription('Durée du mute').setRequired(true);
      Object.entries(DURATIONS).forEach(([val, { label }]) => opt.addChoices({ name: label, value: val }));
      return opt;
    })
    .addStringOption(opt => opt.setName('raison').setDescription('Raison').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getMember('membre');
    const durKey = interaction.options.getString('durée');
    const raison = interaction.options.getString('raison') || 'Aucune raison fournie';
    const dur = DURATIONS[durKey];

    if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    if (!target.moderatable) return interaction.reply({ content: '❌ Je ne peux pas muter ce membre.', ephemeral: true });

    try {
      await target.timeout(dur.ms, raison);

      const embed = new EmbedBuilder()
        .setTitle('🔇 Membre muté')
        .setColor(0xFFC107)
        .addFields(
          { name: '👤 Membre', value: target.user.tag, inline: true },
          { name: '👮 Modérateur', value: interaction.user.tag, inline: true },
          { name: '⏱️ Durée', value: dur.label, inline: true },
          { name: '📝 Raison', value: raison },
          { name: '🔓 Fin du mute', value: `<t:${Math.floor((Date.now() + dur.ms) / 1000)}:R>` },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({ content: `❌ Erreur : ${err.message}`, ephemeral: true });
    }
  },
};
