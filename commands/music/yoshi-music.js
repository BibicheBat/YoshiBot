const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getKazagumo } = require('../../utils/musicManager');

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
  data: new SlashCommandBuilder()
    .setName('yoshi-music')
    .setDescription('🦕 Lancer une musique Yoshi !')
    .addStringOption(opt => {
      opt.setName('musique').setDescription('Choisir une musique').setRequired(false);
      YOSHI_PLAYLIST.forEach((t, i) => opt.addChoices({ name: `${t.emoji} ${t.title}`, value: `${i}` }));
      return opt;
    }),

  async execute(interaction, client) {
    if (!interaction.member.voice.channel) return interaction.reply({ content: '❌ Tu dois être dans un salon vocal !', ephemeral: true });
    const choice = interaction.options.getString('musique');
    const track = choice !== null ? YOSHI_PLAYLIST[parseInt(choice)] : YOSHI_PLAYLIST[Math.floor(Math.random() * YOSHI_PLAYLIST.length)];
    if (!track) return interaction.reply({ content: '❌ Musique introuvable.', ephemeral: true });

    await interaction.deferReply();
    try {
      const kazagumo = getKazagumo(client);
      let player = kazagumo.getPlayer(interaction.guild.id);
      if (!player) {
        player = await kazagumo.createPlayer({
          guildId: interaction.guild.id,
          voiceId: interaction.member.voice.channel.id,
          textId: interaction.channel.id,
          deaf: true,
        });
        player.textChannel = interaction.channel;
      }
      const result = await kazagumo.search(track.url, { requester: interaction.user });
      if (!result?.tracks.length) return interaction.editReply('❌ Musique introuvable !');
      player.queue.add(result.tracks[0]);
      if (!player.playing && !player.paused) await player.play();
      await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('🦕 Yoshi Music').setColor(0x4CAF50).setDescription(`${track.emoji} **${track.title}**\n\nYoshi danse pour toi ! 💃`).setFooter({ text: `Playlist Yoshi • ${YOSHI_PLAYLIST.length} musiques` })] });
    } catch (err) {
      await interaction.editReply(`❌ Erreur : \`${err.message}\``);
    }
  },
};
