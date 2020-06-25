const { Command } = require('klasa');
module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			description: language => language.get('COMMAND_PREFIX_DESCRIPTION'),
			extendedHelp: 'prefix !!',
			usage: '[prefix:str]'

		});
	}

	async run(msg, [prefix]) {
		if (!prefix) return msg.send(msg.language.get('COMMAND_PREFIX_REMINDER', msg.guild.settings.get('prefix')));
		if (msg.member.permissions.has('MANAGE_GUILD')) {
			await msg.guild.settings.update('prefix', prefix);
			return msg.send(msg.language.get('COMMAND_PREFIX_SUCCESS', prefix));
		}
	}

};
