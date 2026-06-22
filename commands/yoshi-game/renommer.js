const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getYoshi, setYoshi } = require('../../data/db');
const { YOSHI_COLORS, YOSHI_EMOJIS } = require('../../utils/yoshiGame');

module.exports = {
  data: new SlashCommandBuilder().setName('renommer').setDescription('✏️ Renommer ton Yoshi').addStringOption(opt => opt.setName('nom').setDescription('Nouveau nom (max 32 caractères)').setMinLength(2).setMaxLength(32).setRequired(true)),
  async execute(interaction) {
    const yoshi = await getYoshi(interaction.user.id);
    if (!yoshi) return interaction.reply({ content: '❌ Tu n\'as pas de Yoshi !', ephemeral: true });
    const ancien = yoshi.name;
    yoshi.name = interaction.options.getString('nom').trim();
    await setYoshi(interaction.user.id, yoshi);
    const colorInfo = YOSHI_COLORS[yoshi.color] || YOSHI_COLORS['vert'];
    await interaction.reply({ embeds: [new EmbedBuilder().setTitle(`${YOSHI_EMOJIS.danse} Yoshi renommé !`).setColor(colorInfo.color).setDescription(`${yoshi.emoji} **${ancien}** s'appelle maintenant **${yoshi.name}** !`)] });
  },
};
