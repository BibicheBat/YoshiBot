const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getYoshi } = require('../../data/db');
const { createYoshi, YOSHI_COLORS, YOSHI_EMOJIS } = require('../../utils/yoshiGame');

const COLOR_CHOICES = [
  { name: '🟢 Yoshi Vert',        value: 'vert' },
  { name: '🌸 Yoshi Rose',        value: 'rose' },
  { name: '🩵 Yoshi Bleu Clair',  value: 'bleu clair' },
  { name: '❤️ Yoshi Rouge',       value: 'rouge' },
  { name: '🟠 Yoshi Orange',      value: 'orange' },
  { name: '💛 Yoshi Jaune',       value: 'jaune' },
  { name: '💙 Yoshi Bleu',        value: 'bleu' },
  { name: '💜 Yoshi Violet',      value: 'violet' },
  { name: '🩶 Yoshi Gris',        value: 'gris' },
  { name: '✨ Yoshi Doré (RARE)', value: 'dore' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adopter')
    .setDescription('🥚 Adopter ton premier Yoshi !')
    .addStringOption(opt => { opt.setName('couleur').setDescription('La couleur de ton Yoshi').setRequired(true); COLOR_CHOICES.forEach(c => opt.addChoices(c)); return opt; }),

  async execute(interaction) {
    const existing = await getYoshi(interaction.user.id);
    if (existing) {
      return interaction.reply({ embeds: [new EmbedBuilder().setTitle('Tu as déjà un Yoshi !').setColor(0xFF0000).setDescription(`Tu possèdes déjà **${existing.emoji} ${existing.name}** (Niv. ${existing.level}) !\nUtilise \`/mon-yoshi\` pour le voir.`)], ephemeral: true });
    }
    const color = interaction.options.getString('couleur');
    const yoshi = await createYoshi(interaction.user.id, color);
    if (!yoshi) return interaction.reply({ content: 'Couleur invalide.', ephemeral: true });
    const colorInfo = YOSHI_COLORS[color];
    const embed = new EmbedBuilder()
      .setTitle(`${colorInfo.emojiAnim} Félicitations ! Tu as adopté un Yoshi !`)
      .setColor(colorInfo.color)
      .setDescription(`Tu as adopté **${yoshi.emoji} Yoshi ${color}** ! ${colorInfo.emojiAnim}\n\n${colorInfo.rare ? `${YOSHI_EMOJIS.dore} **Yoshi Doré LÉGENDAIRE !**\n\n` : ''}**Comment l'améliorer ?**\n• \`/collecter\` toutes les 4h pour des œufs\n• Monte de niveau pour débloquer des **compétences** !\n• Forme un **couple** avec un autre Yoshi ! 💑`)
      .addFields({ name: '❤️ PV', value: `${yoshi.hp}/${yoshi.maxHp}`, inline: true }, { name: '⭐ Niveau', value: `${yoshi.level}`, inline: true }, { name: '🥚 Œufs', value: `${yoshi.eggs}`, inline: true })
      .setFooter({ text: 'Prends bien soin de ton Yoshi !' });
    await interaction.reply({ embeds: [embed] });
  },
};
