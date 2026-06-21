// commands/music/yoshi-music.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateQueue } = require('../../utils/musicManager');

// ════════════════════════════════════════════════
//  🎵 PLAYLIST YOSHI — AJOUTE TES MUSIQUES ICI !
// ════════════════════════════════════════════════
const YOSHI_PLAYLIST = [
  { title: "Yoshi's Island Theme",       url: 'https://www.youtube.com/watch?v=mVSmY5TQVOI', emoji: '🏝️' },
  { title: "Yoshi's Story — Happy Together", url: 'https://www.youtube.com/watch?v=8v8FKqPNQvo', emoji: '📖' },
  { title: "Yoshi's Woolly World Theme", url: 'https://www.youtube.com/watch?v=LyOH8pQEeLo', emoji: '🧶' },
  { title: "Yoshi's Crafted World",      url: 'https://www.youtube.com/watch?v=ZKlFNYiOPGk', emoji: '🎨' },
  // Ajoute tes musiques ici :
  // { title: 'Nom', url: 'https://youtube.com/watch?v=...', emoji: '🎵' },
];
// ════════════════════════════════════════════════

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yoshi-music')
    .setDescription('🦕 Lancer une musique Yoshi depuis la playlist officielle !')
    .addStringOption(opt => {
      opt.setName('musique').setDescription('Choisir une musique').setRequired(false);
      YOSHI_PLAYLIST.forEach((track, i) => {
        opt.addChoices({ name: `${track.emoji} ${track.title}`, value: `${i}` });
      });
      return opt;
    }),

  async execute(interaction, client) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '❌ Tu dois être dans un salon vocal !', ephemeral: true });
    }

    const choice = interaction.options.getString('musique');
    const track = choice !== null
      ? YOSHI_PLAYLIST[parseInt(choice)]
      : YOSHI_PLAYLIST[Math.floor(Math.random() * YOSHI_PLAYLIST.length)];

    if (!track) return interaction.reply({ content: '❌ Musique introuvable.', ephemeral: true });

    await interaction.deferReply();

    const queue = await getOrCreateQueue(interaction, client);
    if (!queue) return interaction.editReply('❌ Impossible de rejoindre le salon vocal !');

    const trackInfo = {
      title: track.title,
      url: track.url,
      duration: '??:??',
      thumbnail: null,
      requestedBy: interaction.user.tag,
    };

    await queue.addTrack(trackInfo);

    const embed = new EmbedBuilder()
      .setTitle('🦕 Yoshi Music')
      .setColor(0x4CAF50)
      .setDescription(`${track.emoji} **${track.title}**\n\nYoshi danse pour toi ! 💃`)
      .addFields(
        { name: '👤 Demandé par', value: interaction.user.tag,      inline: true },
        { name: '🎶 Position',    value: `#${queue.tracks.length}`, inline: true },
      )
      .setFooter({ text: `Playlist Yoshi • ${YOSHI_PLAYLIST.length} musiques` });

    await interaction.editReply({ embeds: [embed] });
  },
};
