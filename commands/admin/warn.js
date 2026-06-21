// commands/admin/warn.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getWarns, saveWarns } = require('../../data/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('⚠️ Avertir un membre')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('membre').setDescription('Membre à avertir').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison').setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getMember('membre');
    const raison = interaction.options.getString('raison');
    if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ Tu ne peux pas te warn toi-même !', ephemeral: true });

    const warns = await getWarns(target.id);
    const warnEntry = { id: warns.length + 1, raison, modId: interaction.user.id, modTag: interaction.user.tag, date: Date.now() };
    warns.push(warnEntry);
    await saveWarns(target.id, warns);

    await target.send(`⚠️ Avertissement sur **${interaction.guild.name}**\n📝 Raison : ${raison}\n👮 Mod : ${interaction.user.tag}\n🔢 Warn n°${warns.length}`).catch(() => {});

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Avertissement émis').setColor(0xFFC107)
      .addFields(
        { name: '👤 Membre', value: `${target.user.tag}`, inline: true },
        { name: '👮 Modérateur', value: interaction.user.tag, inline: true },
        { name: '🔢 Warn n°', value: `${warns.length}`, inline: true },
        { name: '📝 Raison', value: raison },
      ).setTimestamp();

    if (warns.length >= 3) embed.addFields({ name: '🚨 Attention', value: `Ce membre a **${warns.length}** avertissements !` });
    await interaction.reply({ embeds: [embed] });
  },
};
