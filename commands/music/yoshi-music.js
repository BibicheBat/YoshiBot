const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateQueue, searchYoutube, YTDLP } = require('../../utils/musicManager');

const YOSHI_PLAYLIST = [
  { title: "Yoshi's Story - Theme",       url: 'https://www.youtube.com/watch?v=nghTrcPBp3s', emoji: '🏝️' },
  { title: "Yoshi's Island", url: 'https://www.youtube.com/watch?v=oKJ2EZnnZRE', emoji: '📖' },
  { title: "Yoshi's Happy Song", url: 'https://www.youtube.com/watch?v=fNmb_hlMfGE', emoji: '🧶' },
  { title: "Yoshi's Story - Ending Story",      url: 'https://www.youtube.com/watch?v=PaSg-4nZTbk', emoji: '🎨' },
  { title: "Yoshi's Island 2",      url: 'https://www.youtube.com/watch?v=Czs-rHs2Aqo', emoji: '🎨' },
  // Ajoute tes musiques ici :
  // { title: 'Nom', url: 'https://youtube.com/watch?v=...', emoji: '🎵' },
];

module.exports = {
  data: new SlashCommandBuilder().setName('yoshi-music').setDescription('🦕 Playlist Yoshi !')
    .addStringOption(opt => { opt.setName('musique').setDescription('Choisir').setRequired(false); YOSHI_PLAYLIST.forEach((t, i) => opt.addChoices({ name: `${t.emoji} ${t.title}`, value: `${i}` })); return opt; }),
  async execute(interaction, client) {
    if (!interaction.member.voice.channel) return interaction.reply({ content: '❌ Tu dois être dans un salon vocal !', ephemeral: true });
    if (!YTDLP) return interaction.reply({ content: '❌ yt-dlp non installé.', ephemeral: true });
    const choice = interaction.options.getString('musique');
    const t = choice !== null ? YOSHI_PLAYLIST[parseInt(choice)] : YOSHI_PLAYLIST[Math.floor(Math.random() * YOSHI_PLAYLIST.length)];
    if (!t) return interaction.reply({ content: '❌ Musique introuvable.', ephemeral: true });
    await interaction.deferReply();
    try {
      const info = await searchYoutube(t.url);
      info.requestedBy = interaction.user.tag;
      const queue = await getOrCreateQueue(interaction, client);
      if (!queue) return interaction.editReply('❌ Impossible de rejoindre le vocal !');
      await queue.addTrack(info);
      await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('🦕 Yoshi Music').setColor(0x4CAF50).setDescription(`${t.emoji} **${t.title}**\n\nYoshi danse ! 💃`).setFooter({ text: `Playlist Yoshi • ${YOSHI_PLAYLIST.length} musiques` })] });
    } catch (err) {
      await interaction.editReply(`❌ Erreur : \`${err.message}\``);
    }
  },
};
