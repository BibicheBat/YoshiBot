const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
});

client.commands = new Collection();

<<<<<<< HEAD
=======
// Load all commands
>>>>>>> fe11b380456353e12a18841cfafa446d18f49089
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
const allCommands = [];

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', folder, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      allCommands.push(command.data.toJSON());
    }
  }
}

client.once('ready', async () => {
  console.log(`✅ Bot Yoshi connecté en tant que ${client.user.tag}`);

<<<<<<< HEAD
  // Init Lavalink
  try {
    const { getKazagumo } = require('./utils/musicManager');
    getKazagumo(client);
  } catch(e) {
    console.error('[Music] Erreur init:', e.message);
=======
  // Init discord-player
  try {
    const { getPlayer } = require('./utils/musicManager');
    const player = await getPlayer(client);

    player.events.on('error', (queue, err) => console.error('[Player] Erreur:', err.message));
    player.events.on('playerError', (queue, err) => {
      console.error('[Player] Erreur lecture:', err.message);
      queue.metadata?.channel?.send(`❌ Erreur de lecture : \`${err.message}\``);
    });
    player.events.on('playerStart', (queue, track) => {
      queue.metadata?.channel?.send(`▶️ Lecture de **${track.title}** !`);
    });
    player.events.on('emptyQueue', (queue) => {
      queue.metadata?.channel?.send('🎵 File d\'attente terminée ! Yoshi part se reposer... 💤');
    });
  } catch (e) {
    console.error('[Music] Erreur init discord-player:', e.message);
>>>>>>> fe11b380456353e12a18841cfafa446d18f49089
  }

  // Register slash commands
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: allCommands });
    console.log('✅ Slash commands enregistrées.');
  } catch (err) {
    console.error('Erreur enregistrement commandes:', err);
  }

<<<<<<< HEAD
  // Egg distribution loop
=======
  // Egg distribution loop (every hour)
>>>>>>> fe11b380456353e12a18841cfafa446d18f49089
  const { distributeEggs } = require('./utils/yoshiGame');
  setInterval(() => distributeEggs(client), 60 * 60 * 1000);

  client.user.setActivity('🥚 Adopte un Yoshi ! | /adopter', { type: 2 });
});

<<<<<<< HEAD
=======
// Handle interactions
>>>>>>> fe11b380456353e12a18841cfafa446d18f49089
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`Erreur commande ${interaction.commandName}:`, error);
      const msg = { content: '❌ Une erreur est survenue.', ephemeral: true };
      if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
      else await interaction.reply(msg);
    }
  }

  if (interaction.isButton()) {
    const { handleButton } = require('./utils/buttonHandler');
    await handleButton(interaction, client);
  }
});

<<<<<<< HEAD
=======
// Giveaway check loop
>>>>>>> fe11b380456353e12a18841cfafa446d18f49089
const { checkGiveaways } = require('./utils/giveaway');
setInterval(() => checkGiveaways(client), 10000);

client.login(process.env.TOKEN);
