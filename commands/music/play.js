// commands/music/play.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateQueue, searchYoutube } = require('../../utils/musicManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('🎵 Lancer une musique YouTube dans le salon vocal')
    .addStringOption(opt =>
      opt.setName('recherche')
        .setDescription('Nom de la musique ou URL YouTube')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '❌ Tu dois être dans un salon vocal !', ephemeral: true });
    }

    await interaction.deferReply();

    const query = interaction.options.getString('recherche');

    try {
      const trackInfo = await searchYoutube(query);
      trackInfo.requestedBy = interaction.user.tag;

      const queue = await getOrCreateQueue(interaction, client);
      if (!queue) {
        return interaction.editReply('❌ Impossible de rejoindre le salon vocal !');
      }

      await queue.addTrack(trackInfo);

      const embed = new EmbedBuilder()
        .setTitle(queue.tracks.length > 1 ? '➕ Ajouté à la file' : '▶️ Lecture en cours')
        .setColor(0x4CAF50)
        .setDescription(`**${trackInfo.title}**`)
        .setThumbnail(trackInfo.thumbnail)
        .addFields(
          { name: '⏱️ Durée',       value: trackInfo.duration || '??:??', inline: true },
          { name: '👤 Demandé par', value: trackInfo.requestedBy,          inline: true },
          { name: '🎶 Position',    value: `#${queue.tracks.length}`,       inline: true },
        )
        .setFooter({ text: 'Yoshi Music' });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Erreur /play:', err.message);
      await interaction.editReply(`❌ Erreur : \`${err.message}\``);
    }
  },
};
