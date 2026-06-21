const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getYoshi } = require('../../data/db');
const { YOSHI_EMOJIS } = require('../../utils/yoshiGame');

module.exports = {
  data: new SlashCommandBuilder().setName('couple').setDescription('💑 Proposer un couple entre vos Yoshis !').addUserOption(opt => opt.setName('joueur').setDescription('Le joueur').setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('joueur');
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ Tu ne peux pas te mettre en couple avec toi-même !', ephemeral: true });
    if (target.bot) return interaction.reply({ content: `❌ Les bots ne peuvent pas avoir de Yoshi ! ${YOSHI_EMOJIS.danse}`, ephemeral: true });
    const yoshiA = await getYoshi(interaction.user.id);
    const yoshiB = await getYoshi(target.id);
    if (!yoshiA) return interaction.reply({ content: '❌ Tu n\'as pas de Yoshi !', ephemeral: true });
    if (!yoshiB) return interaction.reply({ content: `❌ ${target.username} n'a pas de Yoshi !`, ephemeral: true });
    if (yoshiA.partner) return interaction.reply({ content: `❌ Ton Yoshi est déjà en couple !`, ephemeral: true });
    if (yoshiB.partner) return interaction.reply({ content: `❌ Le Yoshi de ${target.username} est déjà en couple !`, ephemeral: true });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`couple_accept_${interaction.user.id}_${target.id}`).setLabel('💕 Accepter').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`couple_decline_${interaction.user.id}_${target.id}`).setLabel('💔 Refuser').setStyle(ButtonStyle.Danger),
    );
    await interaction.reply({ embeds: [new EmbedBuilder().setTitle(`${YOSHI_EMOJIS.danse} Demande en couple !`).setColor(0xFF69B4).setDescription(`${yoshiA.emoji} **${yoshiA.name}** (${interaction.user}) propose à ${yoshiB.emoji} **${yoshiB.name}** (${target}) de former un couple ! 💕\n\n<@${target.id}>, acceptes-tu ? 💌`)], components: [row] });
  },
};
