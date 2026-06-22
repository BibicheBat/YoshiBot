// commands/admin/giveaway.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getGiveaways, saveGiveaways } = require('../../data/db');
const { msToTime } = require('../../utils/giveaway');
const { YOSHI_EMOJIS } = require('../../utils/yoshiGame');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('🎉 Créer un giveaway !')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt => opt.setName('lot').setDescription('Ce que tu offres').setRequired(true))
    .addStringOption(opt => {
      opt.setName('durée').setDescription('Durée du giveaway').setRequired(true);
      [
        { name: '1 minute (test)', value: '60000' },
        { name: '10 minutes',      value: '600000' },
        { name: '30 minutes',      value: '1800000' },
        { name: '1 heure',         value: '3600000' },
        { name: '6 heures',        value: '21600000' },
        { name: '12 heures',       value: '43200000' },
        { name: '1 jour',          value: '86400000' },
        { name: '3 jours',         value: '259200000' },
        { name: '7 jours',         value: '604800000' },
      ].forEach(c => opt.addChoices(c));
      return opt;
    })
    .addIntegerOption(opt =>
      opt.setName('gagnants').setDescription('Nombre de gagnants').setMinValue(1).setMaxValue(10).setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('description').setDescription('Description optionnelle du giveaway').setRequired(false)
    ),

  async execute(interaction) {
    const prize = interaction.options.getString('lot');
    const durationMs = parseInt(interaction.options.getString('durée'));
    const winnersCount = interaction.options.getInteger('gagnants') || 1;
    const description = interaction.options.getString('description') || '';
    const endsAt = Date.now() + durationMs;

    const embed = new EmbedBuilder()
      .setTitle(`${YOSHI_EMOJIS.danse} 🎉 GIVEAWAY 🎉 ${YOSHI_EMOJIS.danse2}`)
      .setColor(0xFF6B9D)
      .setDescription([
        `**${prize}**`,
        description ? `\n📝 ${description}\n` : '',
        `React avec 🎉 pour participer !`,
      ].join('\n'))
      .addFields(
        { name: '⏱️ Durée', value: msToTime(durationMs), inline: true },
        { name: '🏆 Gagnant(s)', value: `${winnersCount}`, inline: true },
        { name: '👤 Organisé par', value: `${interaction.user}`, inline: true },
        { name: '⏰ Se termine', value: `<t:${Math.floor(endsAt / 1000)}:R>`, inline: true },
      )
      .setFooter({ text: `Yoshi Giveaway • Fin : ${new Date(endsAt).toLocaleString('fr-FR')}` })
      .setTimestamp(endsAt);

    const msg = await interaction.channel.send({ embeds: [embed] });
    await msg.react('🎉');

    // Save giveaway
    const giveaways = getGiveaways();
    giveaways.push({
      messageId: msg.id,
      channelId: interaction.channel.id,
      guildId: interaction.guild.id,
      prize,
      winners: winnersCount,
      endsAt,
      ended: false,
      hostedBy: interaction.user.id,
    });
    saveGiveaways(giveaways);

    await interaction.reply({ content: `✅ Giveaway créé ! ${YOSHI_EMOJIS.danse}`, ephemeral: true });
  },
};
