// 0 - Waiting for Waiver
// 1 - Completed Waiver
// 2 - Opted-Out of Shoot

// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');
const { Keyv } = require('keyv');
const { token } = require('./config.json');

const keyv = new Keyv('sqlite://db.sqlite');

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
	if (user.bot) return;

	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			return;
		}
	}

	const initMessageID = await keyv.get('config:initMessageID');
    if (reaction.message.id !== initMessageID) return;

	const userKey = `users:${user.id}`;
	const exists = await keyv.get(userKey);

	if (exists === undefined) {
		await keyv.set(userKey, 0);
	} else {
		try {
			await reaction.users.remove(user.id);
			console.log(`Removed ${user.username}'s reaction as they have already reacted once.`);
		} catch (error) {
			console.error('Something went wrong when removing duplicate reaction: ', error);
		}
	}
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
	if (user.bot) return;

	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			return;
		}
	}
	
	const initMessageID = await keyv.get('config:initMessageID');
    if (reaction.message.id !== initMessageID) return;

	let hasOtherReactions = false;
	
	const message = reaction.message;
	if (message.partial) await message.fetch();

	for (const r of message.reactions.cache.values()) {
		if (r.emoji.identifier === reaction.emoji.identifier) continue;
		
		const users = await r.users.fetch();
		if (users.has(user.id)) {
			hasOtherReactions = true;
			break;
		}
	}

	if (!hasOtherReactions) {
		const userKey = `users:${user.id}`;
		await keyv.delete(userKey);
		console.log(`User ${user.username} has no remaining reactions and have been opted out.`);
	}
});

// Log in to Discord with your client's token
client.login(token);