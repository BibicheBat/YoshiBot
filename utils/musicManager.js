// utils/musicManager.js
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, joinVoiceChannel, StreamType } = require('@discordjs/voice');
const { spawn, execSync } = require('child_process');

// Trouve yt-dlp où qu'il soit installé
function getYtDlpPath() {
  const candidates = ['yt-dlp', '/usr/bin/yt-dlp', '/usr/local/bin/yt-dlp', '/root/.local/bin/yt-dlp'];
  for (const p of candidates) {
    try { execSync(`${p} --version`, { stdio: 'ignore' }); return p; } catch {}
  }
  return null;
}

const YT_DLP = getYtDlpPath();
console.log('[Music] yt-dlp path:', YT_DLP || 'INTROUVABLE');

class MusicQueue {
  constructor(guildId, textChannel, voiceChannel, connection) {
    this.guildId = guildId;
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.connection = connection;
    this.player = createAudioPlayer();
    this.tracks = [];
    this.playing = false;
    this.paused = false;

    this.connection.subscribe(this.player);

    this.player.on(AudioPlayerStatus.Idle, () => {
      this.tracks.shift();
      if (this.tracks.length > 0) {
        this.playNext();
      } else {
        this.playing = false;
        this.textChannel.send('🎵 File d\'attente terminée ! Yoshi part se reposer... 💤');
        setTimeout(() => { if (!this.playing) try { this.connection.destroy(); } catch {} }, 30000);
      }
    });

    this.player.on('error', (err) => {
      console.error('Erreur lecteur:', err.message);
      this.tracks.shift();
      if (this.tracks.length > 0) this.playNext();
    });
  }

  async addTrack(track) {
    this.tracks.push(track);
    if (!this.playing) await this.playNext();
  }

  async playNext() {
    if (this.tracks.length === 0) return;
    const track = this.tracks[0];
    if (!YT_DLP) {
      this.textChannel.send('❌ yt-dlp non installé sur le serveur.');
      return;
    }
    try {
      const stream = await streamWithYtDlp(track.url);
      const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
      this.player.play(resource);
      this.playing = true;
      this.paused = false;
    } catch (err) {
      console.error('Erreur lecture:', err.message);
      this.textChannel.send(`❌ Impossible de lire **${track.title}**.\nErreur : \`${err.message}\``);
      this.tracks.shift();
      if (this.tracks.length > 0) this.playNext();
    }
  }

  pause()      { if (!this.paused)  { this.player.pause();   this.paused = true;  return true; } return false; }
  resume()     { if (this.paused)   { this.player.unpause(); this.paused = false; return true; } return false; }
  skip()       { this.player.stop(); }
  stop()       { this.tracks = []; this.player.stop(); this.playing = false; }
  nowPlaying() { return this.tracks[0] || null; }
  queue()      { return this.tracks; }
}

function streamWithYtDlp(url) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YT_DLP, [
      '-f', 'bestaudio',
      '--no-playlist',
      '-o', '-',
      '--quiet',
      '--no-warnings',
      url,
    ]);

    proc.on('error', err => reject(new Error(`yt-dlp erreur: ${err.message}`)));

    let hasData = false;
    proc.stdout.once('data', () => { hasData = true; resolve(proc.stdout); });
    proc.stderr.on('data', d => console.error('[yt-dlp]', d.toString().trim()));
    proc.on('close', code => { if (!hasData) reject(new Error(`yt-dlp code: ${code}`)); });
  });
}

function searchYoutube(query) {
  return new Promise((resolve, reject) => {
    if (!YT_DLP) return reject(new Error('yt-dlp introuvable'));

    // Si c'est déjà une URL YouTube, on récupère juste les infos
    const isUrl = query.startsWith('http');
    const searchQuery = isUrl ? query : `ytsearch1:${query}`;

    const proc = spawn(YT_DLP, [
      '--no-playlist',
      '--print', '%(title)s',
      '--print', '%(webpage_url)s',
      '--print', '%(duration_string)s',
      '--print', '%(thumbnail)s',
      '--no-warnings',
      '--quiet',
      searchQuery,
    ]);

    let output = '';
    proc.stdout.on('data', d => output += d.toString());
    proc.stderr.on('data', d => console.error('[yt-dlp search]', d.toString().trim()));
    proc.on('error', err => reject(new Error(`yt-dlp introuvable: ${err.message}`)));
    proc.on('close', () => {
      const lines = output.trim().split('\n');
      if (lines.length < 2) return reject(new Error('Aucun résultat trouvé'));
      resolve({
        title:     lines[0] || 'Titre inconnu',
        url:       lines[1] || query,
        duration:  lines[2] || '??:??',
        thumbnail: lines[3] || null,
      });
    });
  });
}

async function getOrCreateQueue(interaction, client) {
  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) return null;

  const guildId = interaction.guild.id;
  if (client.musicQueues.has(guildId)) return client.musicQueues.get(guildId);

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30000);
  } catch {
    try { connection.destroy(); } catch {}
    return null;
  }

  const queue = new MusicQueue(guildId, interaction.channel, voiceChannel, connection);
  client.musicQueues.set(guildId, queue);

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5000),
      ]);
    } catch {
      try { connection.destroy(); } catch {}
      client.musicQueues.delete(guildId);
    }
  });

  return queue;
}

module.exports = { getOrCreateQueue, searchYoutube };
