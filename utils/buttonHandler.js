const { upgradeSkill, YOSHI_EMOJIS, YOSHI_COLORS } = require('./yoshiGame');
const { EmbedBuilder } = require('discord.js');
const { getYoshi, setYoshi, getCouples, saveCouples } = require('../data/db');

async function handleButton(interaction, client) {
  const id = interaction.customId;

  if (id.startsWith('skill_')) {
    const skillId = id.replace('skill_', '');
    const result = await upgradeSkill(interaction.user.id, skillId);
    if (result.error) return interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
    return interaction.reply({ embeds: [new EmbedBuilder().setTitle(`${YOSHI_EMOJIS.danse} Compétence débloquée !`).setColor(0xFFD700).setDescription(`Tu as débloqué **${result.skill.name}** !\n${result.skill.desc}\n\n🎯 Points restants : **${result.yoshi.skillPoints}**`)], ephemeral: true });
  }

  if (id.startsWith('couple_accept_')) {
    const parts = id.split('_'); const proposerId = parts[2]; const targetId = parts[3];
    if (interaction.user.id !== targetId) return interaction.reply({ content: '❌ Ce n\'est pas ta demande !', ephemeral: true });
    const yoshiA = await getYoshi(proposerId); const yoshiB = await getYoshi(targetId);
    if (!yoshiA || !yoshiB) return interaction.reply({ content: '❌ L\'un des Yoshis n\'existe plus !', ephemeral: true });
    if (yoshiA.partner || yoshiB.partner) return interaction.reply({ content: '❌ L\'un des Yoshis est déjà en couple !', ephemeral: true });
    yoshiA.partner = targetId; yoshiB.partner = proposerId;
    await setYoshi(proposerId, yoshiA); await setYoshi(targetId, yoshiB);
    const couples = await getCouples(); couples[`${proposerId}_${targetId}`] = { since: Date.now() }; await saveCouples(couples);
    return interaction.update({ embeds: [new EmbedBuilder().setTitle(`${YOSHI_EMOJIS.danse} Couple formé ! ${YOSHI_EMOJIS.danse2}`).setColor(0xFF69B4).setDescription(`${yoshiA.emoji} **${yoshiA.name}** et ${yoshiB.emoji} **${yoshiB.name}** sont en couple ! 💕\n\nIls recevront un bonus d'œufs horaire !`)], components: [] });
  }

  if (id.startsWith('couple_decline_')) {
    return interaction.update({ embeds: [new EmbedBuilder().setTitle('💔 Demande refusée').setColor(0xFF0000).setDescription('La demande en couple a été refusée...')], components: [] });
  }

  if (id.startsWith('divorce_confirm_')) {
    const userId = id.split('_')[2];
    if (interaction.user.id !== userId) return interaction.reply({ content: '❌ Ce n\'est pas ta confirmation !', ephemeral: true });
    const yoshi = await getYoshi(userId);
    if (!yoshi || !yoshi.partner) return interaction.update({ content: 'Ton Yoshi n\'a plus de partenaire.', embeds: [], components: [] });
    const partnerId = yoshi.partner; const partnerYoshi = await getYoshi(partnerId);
    yoshi.partner = null; await setYoshi(userId, yoshi);
    if (partnerYoshi) { partnerYoshi.partner = null; await setYoshi(partnerId, partnerYoshi); }
    const couples = await getCouples();
    for (const key of Object.keys(couples)) { if (key.includes(userId) && key.includes(partnerId)) delete couples[key]; }
    await saveCouples(couples);
    return interaction.update({ embeds: [new EmbedBuilder().setTitle('💔 Séparation confirmée').setColor(0xFF4444).setDescription(`${yoshi.emoji} **${yoshi.name}** et ${partnerYoshi ? `${partnerYoshi.emoji} **${partnerYoshi.name}**` : 'son partenaire'} se sont séparés... 😢`)], components: [] });
  }

  if (id.startsWith('divorce_cancel_')) {
    const userId = id.split('_')[2];
    if (interaction.user.id !== userId) return interaction.reply({ content: '❌ Ce n\'est pas ton action !', ephemeral: true });
    return interaction.update({ content: `✅ Séparation annulée ! ${YOSHI_EMOJIS.danse}`, embeds: [], components: [] });
  }
}

module.exports = { handleButton };
