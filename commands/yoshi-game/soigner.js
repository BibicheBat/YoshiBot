const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getYoshi, setYoshi } = require('../../data/db');
const { YOSHI_COLORS, YOSHI_EMOJIS } = require('../../utils/yoshiGame');

module.exports = {
  data: new SlashCommandBuilder().setName('soigner').setDescription('💊 Soigner ton Yoshi (coûte 10 œufs, rend 30 PV)'),
  async execute(interaction) {
    const yoshi = await getYoshi(interaction.user.id);
    if (!yoshi) return interaction.reply({ content: '❌ Tu n\'as pas de Yoshi !', ephemeral: true });
    if (yoshi.hp >= yoshi.maxHp) return interaction.reply({ content: `✅ Ton ${yoshi.emoji} **${yoshi.name}** est déjà en pleine forme !`, ephemeral: true });
    if (yoshi.eggs < 10) return interaction.reply({ content: `❌ Pas assez d'œufs ! Il t'en faut **10** (tu en as **${yoshi.eggs}**).`, ephemeral: true });
    yoshi.eggs -= 10;
    const healed = Math.min(30, yoshi.maxHp - yoshi.hp);
    yoshi.hp = Math.min(yoshi.maxHp, yoshi.hp + 30);
    await setYoshi(interaction.user.id, yoshi);
    const colorInfo = YOSHI_COLORS[yoshi.color] || YOSHI_COLORS['vert'];
    const bar = '█'.repeat(Math.round((yoshi.hp/yoshi.maxHp)*10)) + '░'.repeat(10-Math.round((yoshi.hp/yoshi.maxHp)*10));
    await interaction.reply({ embeds: [new EmbedBuilder().setTitle(`💊 ${yoshi.emoji} ${yoshi.name} soigné ! ${colorInfo.emojiAnim}`).setColor(colorInfo.color).setDescription(`+**${healed} PV** récupérés !`).addFields({ name: '❤️ PV', value: `${bar} ${yoshi.hp}/${yoshi.maxHp}`, inline: false }, { name: '🥚 Œufs restants', value: `${yoshi.eggs}`, inline: true }).setFooter({ text: 'Coût : 10 œufs • Soin : 30 PV' })] });
  },
};
