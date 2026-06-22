const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getYoshi } = require('../../data/db');
const { SKILLS, YOSHI_COLORS } = require('../../utils/yoshiGame');

module.exports = {
  data: new SlashCommandBuilder().setName('competences').setDescription('🛠️ Voir et débloquer des compétences pour ton Yoshi'),
  async execute(interaction) {
    const yoshi = await getYoshi(interaction.user.id);
    if (!yoshi) return interaction.reply({ content: '❌ Tu n\'as pas de Yoshi ! Utilise `/adopter`.', ephemeral: true });

    const colorInfo = YOSHI_COLORS[yoshi.color] || YOSHI_COLORS['vert'];
    const embed = new EmbedBuilder()
      .setTitle(`🛠️ Compétences — ${yoshi.emoji} ${yoshi.name}`)
      .setColor(colorInfo.color)
      .setDescription(`**Points disponibles : ${yoshi.skillPoints}** 🎯\n\n${yoshi.skillPoints > 0 ? 'Clique sur un bouton pour débloquer une compétence !' : 'Monte de niveau pour gagner des points de compétence !'}`)
      .addFields(...SKILLS.map(s => ({
        name: `${s.name} ${yoshi.skills.includes(s.id) ? '✅' : '🔒'}`,
        value: s.desc + (yoshi.skills.includes(s.id) ? '\n*(Débloquée)*' : ''),
        inline: true,
      })))
      .setFooter({ text: 'Chaque compétence coûte 1 point' });

    const components = [];
    // N'affiche les boutons QUE si le joueur a des points ET des compétences disponibles
    const available = SKILLS.filter(s => !yoshi.skills.includes(s.id));
    if (yoshi.skillPoints > 0 && available.length > 0) {
      for (let i = 0; i < available.length; i += 3) {
        const row = new ActionRowBuilder();
        available.slice(i, i + 3).forEach(s => {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`skill_${s.id}`)
              .setLabel(s.name.replace(/[\u0300-\u036f]/g, '').substring(0, 80))
              .setStyle(ButtonStyle.Primary)
          );
        });
        components.push(row);
      }
    }

    await interaction.reply({ embeds: [embed], components, ephemeral: true });
  },
};
