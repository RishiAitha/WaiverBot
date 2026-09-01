// 0 - Waiting for Waiver
// 1 - Completed Waiver
// 2 - Opted-Out of Shoot

// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');
const { Keyv } = require('keyv');
const { token } = require('./config.json');

const keyv = new Keyv('sqlite://db.sqlite');

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
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
	
	// check if user has other reactions on this message

	if (!hasOtherReactions) {
		const userKey = `users:${user.id}`;
		await keyv.delete(userKey);
		console.log(`User ${user.username} has no remaining reactions and have been opted out.`);
	}
});

// Log in to Discord with your client's token
client.login(token);