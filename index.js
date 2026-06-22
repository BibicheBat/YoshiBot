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
client.musicQueues = new Map();

const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
const allCommands = [];

for (const folder of commandFolders) {
  const files = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const cmd = require(path.join(__dirname, 'commands', folder, file));
    if (cmd.data && cmd.execute) {
      client.commands.set(cmd.data.name, cmd);
      allCommands.push(cmd.data.toJSON());
    }
  }
}

client.once('ready', async () => {
  console.log(`✅ Bot Yoshi connecté en tant que ${client.user.tag}`);

  try {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: allCommands });
    console.log('✅ Slash commands enregistrées.');
  } catch (err) {
    console.error('Erreur commandes:', err);
  }

  const { distributeEggs } = require('./utils/yoshiGame');
  setInterval(() => distributeEggs(client), 60 * 60 * 1000);

  client.user.setActivity('🥚 Adopte un Yoshi ! | /adopter', { type: 2 });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`Erreur ${interaction.commandName}:`, error);
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

const { checkGiveaways } = require('./utils/giveaway');
setInterval(() => checkGiveaways(client), 10000);

client.login(process.env.TOKEN);