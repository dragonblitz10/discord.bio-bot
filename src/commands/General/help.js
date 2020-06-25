const { Command, util: { isFunction } } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { code } = require('discord-md-tags');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['commands', 'h'],
			guarded: true,
			runIn: ['text'],
			description: language => language.get('COMMAND_HELP_DESCRIPTION'),
			requiredPermissions: ['EMBED_LINKS'],
			extendedHelp: 'No extended help available.',
			usage: '(Command:command|usage)'
		});

		this.createCustomResolver('command', (arg, possible, msg) => {
			if (!arg) return undefined;
			return this.client.arguments.get('command').run(arg, possible, msg);
		});
	}

	async run(msg, [command]) {
		const embed = new MessageEmbed()
			.setColor(msg.guild.me.displayColor ? msg.guild.me.displayColor : 'RANDOM');

		if (command) {
			if (command === 'usage') {
				return msg.sendEmbed(embed
					.setDescription(msg.language.get('COMMAND_HELP_USAGE', msg.guild.settings.get('prefix'))));
			}
			return msg.sendEmbed(embed
				.addField(`${command.name} ${command.aliases.length ? `(${command.aliases.join(', ')})` : ''}`,
					isFunction(command.description)
						? command.description(msg.language)
						: command.description)
				.addField(`• Usage${command.runIn.includes('dm') ? '' : ` (${msg.language.get('COMMAND_HELP_SERVERONLY')})`}`, this.buildUsage(command, msg.guild.settings.get('prefix'))));
		}

		const categories = this.buildHelp();
		for (const category in categories) {
			embed.addField(category, categories[category].sort().map(cmd => code`${cmd}`).join(', '));
		}
		embed.setFooter(`${msg.language.get('COMMAND_HELP_FOOTER', msg.guild.settings.get('prefix'))}\nCredit goes to ravy#0001 for supplying help command.`);
		return msg.sendEmbed(embed);
	}

	buildHelp() {
		return this.client.commands
			.filter(command => command.permissionLevel < 14)
			.filter(command => command.hidden === !true)
			.reduce((categories, command) => {
				if (!(command.category in categories)) categories[command.category] = [command.name];
				else categories[command.category].push(command.name);
				return categories;
			}, {});
	}

	buildUsage(command, prefix) {
		const usage = command.usage.parsedUsage;

		return `${prefix}${command.name}${usage.map(tag => {
			const brackets = tag.required > 1
				? '{}'
				: '[]';
			const options = tag.possibles.map(possible => possible.name).join(' | ');
			return `  ${brackets[0]} ${options} ${brackets[1]}`;
		}).join('')}`;
	}

};
