// commands/music/play.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayer } = require('../../utils/musicManager');
const { useMainPlayer } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('🎵 Lancer une musique YouTube dans le salon vocal')
    .addStringOption(opt =>
      opt.setName('recherche').setDescription('Nom ou URL YouTube').setRequired(true)
    ),

  async execute(interaction, client) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '❌ Tu dois être dans un salon vocal !', ephemeral: true });
    }
    await interaction.deferReply();

    const query = interaction.options.getString('recherche');

    try {
      const player = await getPlayer(client);
      const { track } = await player.play(interaction.member.voice.channel, query, {
        nodeOptions: {
          metadata: { channel: interaction.channel },
          selfDeaf: true,
          volume: 80,
          leaveOnEmpty: true,
          leaveOnEmptyCooldown: 30000,
          leaveOnEnd: true,
          leaveOnEndCooldown: 30000,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle('▶️ Lecture en cours')
        .setColor(0x4CAF50)
        .setDescription(`**[${track.title}](${track.url})**`)
        .setThumbnail(track.thumbnail)
        .addFields(
          { name: '⏱️ Durée',       value: track.duration,        inline: true },
          { name: '👤 Artiste',     value: track.author || '?',   inline: true },
          { name: '👤 Demandé par', value: interaction.user.tag,  inline: true },
        )
        .setFooter({ text: 'Yoshi Music 🎵' });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Erreur /play:', err.message);
      await interaction.editReply(`❌ Erreur : \`${err.message}\``);
    }
  },
};
