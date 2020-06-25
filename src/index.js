require('dotenv').config();
const { Client } = require('klasa');
Client.defaultPermissionLevels
	.add(1, ({ guild, member }) => guild && member.permissions.has('MANAGE_MESSAGES'), { fetch: true });
Client.defaultGuildSchema
	.add('tags', 'any', { array: true, configurable: false });

new Client({
	fetchAllMembers: true,
	prefix: process.env.PREFIX,
	commandEditing: true,
	commandLogging: true,
	disableEveryone: true,
	disabledCorePieces: ['commands'],
	production: true,
	console: { useColor: true },
	consoleEvents: {
		debug: false,
		verbose: false
	},
	prefixCaseInsensitive: true,
	typing: false,
	readyMessage: (client) => `Logged in as ${client.user.tag} with Prefix ${process.env.PREFIX} with ${client.guilds.size} guilds ready!`
}).login(process.env.DISCORD_TOKEN);
