const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getYoshi } = require('../../data/db');
const { YOSHI_EMOJIS } = require('../../utils/yoshiGame');

module.exports = {
  data: new SlashCommandBuilder().setName('divorcer').setDescription('💔 Séparer ton Yoshi de son partenaire'),
  async execute(interaction) {
    const yoshi = await getYoshi(interaction.user.id);
    if (!yoshi) return interaction.reply({ content: '❌ Tu n\'as pas de Yoshi !', ephemeral: true });
    if (!yoshi.partner) return interaction.reply({ content: `❌ Ton Yoshi est célibataire ! ${YOSHI_EMOJIS.danse}`, ephemeral: true });
    const partnerYoshi = await getYoshi(yoshi.partner);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`divorce_confirm_${interaction.user.id}`).setLabel('💔 Confirmer').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`divorce_cancel_${interaction.user.id}`).setLabel('💕 Annuler').setStyle(ButtonStyle.Secondary),
    );
    await interaction.reply({ embeds: [new EmbedBuilder().setTitle('💔 Confirmation').setColor(0xFF4444).setDescription(`Es-tu sûr(e) de vouloir séparer ${yoshi.emoji} **${yoshi.name}** ${partnerYoshi ? `de ${partnerYoshi.emoji} **${partnerYoshi.name}** ?` : 'de son partenaire ?'}\n\n⚠️ **Irréversible !**`)], components: [row], ephemeral: true });
  },
};
