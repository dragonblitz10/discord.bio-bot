const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const centra = require('@aero/centra');
const { url, regex } = require('../../../lib/constants');
module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: language => language.get('COMMAND_CHECK_DESCRIPTION'),
			requiredPermissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			extendedHelp: 'check v',
			autoAliases: true,
			bucket: 15,
			cooldown: 60,
			cooldownLevel: 'guild',
			deletable: true,
			usage: '<slug:str> [...]'
		});
	}

	async run(msg, [slug]) {
		const { author } = msg;
		if (msg.mentions.users.first()) slug = msg.mentions.users.first().username;
		slug = slug.replace(regex.replaceNonAlpha, '').replace(/\s/g, '').toLowerCase();
		const ratelimited = new MessageEmbed().setDescription(`Currently ratelimited, please try again later.`).setFooter(`Requested by ${author.username}#${author.discriminator}`, author.displayAvatarURL({ format: 'png' }));
		const tooLong = new MessageEmbed().setDescription(`\`​${slug}\` is too long, the max length of a slug 16 characters!`).setFooter(`Requested by ${author.username}#${author.discriminator}`, author.displayAvatarURL({ format: 'png' }));
		const user_free = new MessageEmbed().setDescription(`\`​${slug}\` is available [claim it](https://discord.bio/)`).setFooter(`Requested by ${author.username}#${author.discriminator}`, author.displayAvatarURL({ format: 'png' }));
		if (!slug) return msg.send(`please enter a valid slug`);
		if (slug.length >= 17) return msg.send(tooLong);
		let req = await centra(url.discord_bio).path('user').path('details').path(encodeURI(slug)).send();
		//		if (req.statusCode === 400) return msg.send('Malformed Request?');
		//		if (req.statusCode === 401) return msg.send('When did this become an Authed route?');
		if (req.statusCode === 404) return msg.send(user_free);
		if (req.statusCode === 429) return msg.send(ratelimited);
		req = JSON.parse(req.body);
		const { discord } = req.payload;
		const user_exists = new MessageEmbed().setDescription(`\`​${req.payload.user.details.slug}\` is taken by ${discord.username}#${discord.discriminator}!`).setFooter(`Requested by ${author.username}#${author.discriminator}`, author.displayAvatarURL({ format: 'png' }));
		return msg.send(user_exists);
	}

};
