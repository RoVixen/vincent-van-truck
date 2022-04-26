var PORT = process.env.PORT || 8080;

const { Client, Intents, Permissions } = require('discord.js');
const client = new Client({ intents: [
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	Intents.FLAGS.DIRECT_MESSAGES,
	Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
]});

const { token,clientId } = require('./config.json');

client.on('ready', () => {
	//console.log(Intents.FLAGS);
	//console.log(Permissions.FLAGS);
	const link = client.generateInvite({
		permissions: [
			Permissions.FLAGS.SEND_MESSAGES,
			Permissions.FLAGS.MANAGE_GUILD,
			Permissions.FLAGS.MENTION_EVERYONE,
			Permissions.FLAGS.READ_MESSAGE_HISTORY
		],
		scopes: ['bot'],
	});
	console.log(`Generated bot invite link: ${link}`);
	//console.log(Permissions);
});
