// utils/musicManager.js - yt-dlp + FFmpeg
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, joinVoiceChannel, StreamType } = require('@discordjs/voice');
const { spawn, execSync } = require('child_process');
const fs = require('fs');

function findYtDlp() {
  const paths = ['yt-dlp', '/usr/bin/yt-dlp', '/usr/local/bin/yt-dlp', '/nix/var/nix/profiles/default/bin/yt-dlp'];
  for (const p of paths) {
    try { execSync(`${p} --version`, { stdio: 'ignore' }); return p; } catch {}
  }
  return null;
}

const YTDLP = findYtDlp();
console.log('[Music] yt-dlp:', YTDLP || 'INTROUVABLE');

// Cookies YouTube depuis variable d'env
function getCookieArgs() {
  const cookie = process.env.YOUTUBE_COOKIE;
  if (!cookie) return [];
  try {
    fs.writeFileSync('/tmp/yt-cookies.txt', cookie);
    console.log('[Music] Cookies YouTube chargés');
    return ['--cookies', '/tmp/yt-cookies.txt'];
  } catch { return []; }
}

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
      if (this.tracks.length > 0) this.playNext();
      else {
        this.playing = false;
        this.textChannel.send('🎵 File terminée ! Yoshi se repose... 💤');
        setTimeout(() => { if (!this.playing) try { this.connection.destroy(); } catch {} }, 30000);
      }
    });

    this.player.on('error', err => {
      console.error('[Player] Erreur:', err.message);
      this.tracks.shift();
      if (this.tracks.length > 0) this.playNext();
    });
  }

  async addTrack(track) {
    this.tracks.push(track);
    if (!this.playing) await this.playNext();
  }

  async playNext() {
    if (!this.tracks.length || !YTDLP) return;
    const track = this.tracks[0];
    try {
      const stream = await this.streamYtDlp(track.url);
      const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
      this.player.play(resource);
      this.playing = true;
      this.paused = false;
    } catch (err) {
      console.error('[Music] Erreur lecture:', err.message);
      this.textChannel.send(`Impossible de lire **${track.title}** : \`${err.message}\``);
      this.tracks.shift();
      if (this.tracks.length > 0) this.playNext();
    }
  }

  streamYtDlp(url) {
    return new Promise((resolve, reject) => {
      const args = [
        '--no-playlist',
        '-f', 'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio/best',
        '--source-address', '0.0.0.0',
        '--extractor-args', 'youtube:player_client=web,mweb',
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        '-o', '-',
        '--quiet',
        '--no-warnings',
        ...getCookieArgs(),
        url,
      ];

      const proc = spawn(YTDLP, args);

      proc.on('error', err => reject(new Error(`yt-dlp: ${err.message}`)));

      let started = false;
      proc.stdout.once('data', () => { if (!started) { started = true; resolve(proc.stdout); } });
      proc.stderr.on('data', d => { const msg = d.toString().trim(); if (msg) console.error('[yt-dlp]', msg); });
      proc.on('close', code => { if (!started) reject(new Error(`yt-dlp code ${code}`)); });
      setTimeout(() => { if (!started) { proc.kill(); reject(new Error('yt-dlp timeout')); } }, 30000);
    });
  }

  pause()      { if (!this.paused)  { this.player.pause();   this.paused = true;  return true; } return false; }
  resume()     { if (this.paused)   { this.player.unpause(); this.paused = false; return true; } return false; }
  skip()       { this.player.stop(); }
  stop()       { this.tracks = []; this.player.stop(); this.playing = false; }
  nowPlaying() { return this.tracks[0] || null; }
  queue()      { return this.tracks; }
}

function searchYoutube(query) {
  return new Promise((resolve, reject) => {
    if (!YTDLP) return reject(new Error('yt-dlp introuvable'));

    const isUrl = /^https?:\/\//.test(query);
    const searchQuery = isUrl ? query : `ytsearch1:${query}`;

    const proc = spawn(YTDLP, [
      '--no-playlist',
      '--skip-download',
      '--print', '%(title)s',
      '--print', '%(webpage_url)s',
      '--print', '%(duration_string)s',
      '--print', '%(thumbnail)s',
      '--source-address', '0.0.0.0',
      '--extractor-args', 'youtube:player_client=web,mweb',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      '--quiet',
      '--no-warnings',
      ...getCookieArgs(),
      searchQuery,
    ]);

    let out = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.stderr.on('data', d => console.error('[yt-dlp search]', d.toString().trim()));
    proc.on('error', err => reject(new Error(`yt-dlp: ${err.message}`)));
    proc.on('close', () => {
      const lines = out.trim().split('\n');
      if (lines.length < 2 || !lines[1]) return reject(new Error('Aucun résultat trouvé'));
      resolve({ title: lines[0] || 'Titre inconnu', url: lines[1], duration: lines[2] || '??:??', thumbnail: lines[3] || null });
    });

    setTimeout(() => { proc.kill(); reject(new Error('Recherche timeout')); }, 20000);
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

module.exports = { getOrCreateQueue, searchYoutube, YTDLP };