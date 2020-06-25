const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: language => language.get('COMMAND_REMINDME_DESCRIPTION'),
			aliases: ['reminder', 'remind'],
			usage: '<when:time> <text:str> [...]',
			extendedHelp: 'remindme 10h, I am epic!',
			usageDelim: ', '
		});
	}

	async run(msg, [when, ...text]) {
		const reminder = await this.client.schedule.create('reminder', when, {
			data: {
				channel: msg.channel.id,
				user: msg.author.id,
				text: text.join(', ')
			}
		});
		return msg.send(`Alright ${msg.author.username}, I have created you a reminder with the id: \`${reminder.id}\``);
	}

};
