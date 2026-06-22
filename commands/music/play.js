const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getKazagumo } = require('../../utils/musicManager');

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

      const result = await kazagumo.search(query, { requester: interaction.user });
      if (!result || !result.tracks.length) {
        return interaction.editReply('❌ Aucun résultat trouvé !');
      }

      if (result.type === 'PLAYLIST') {
        for (const track of result.tracks) player.queue.add(track);
        await interaction.editReply(`✅ Playlist ajoutée : **${result.playlistName}** (${result.tracks.length} musiques)`);
      } else {
        player.queue.add(result.tracks[0]);
        const track = result.tracks[0];
        const embed = new EmbedBuilder()
          .setTitle(player.playing ? '➕ Ajouté à la file' : '▶️ Lecture en cours')
          .setColor(0x4CAF50)
          .setDescription(`**[${track.title}](${track.uri})**`)
          .setThumbnail(track.thumbnail)
          .addFields(
            { name: '⏱️ Durée',       value: track.length ? `${Math.floor(track.length/60000)}:${String(Math.floor((track.length%60000)/1000)).padStart(2,'0')}` : 'Live', inline: true },
            { name: '👤 Artiste',     value: track.author || '?', inline: true },
            { name: '👤 Demandé par', value: interaction.user.tag, inline: true },
          )
          .setFooter({ text: 'Yoshi Music 🎵 • YouTube' });
        await interaction.editReply({ embeds: [embed] });
      }

      if (!player.playing && !player.paused) await player.play();
    } catch (err) {
      console.error('Erreur /play:', err.message);
      await interaction.editReply(`❌ Erreur : \`${err.message}\``);
    }
  },
};
