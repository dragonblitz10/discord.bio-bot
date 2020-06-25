const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { url, regex, emotes } = require('../../../lib/constants');
const util = require('../../../lib/util');
const centra = require('@aero/centra');
const ColorThief = require('color-thief');
module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: language => language.get('COMMAND_PROFILE_DESCRIPTION'),
			requiredPermissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			aliases: ['p', 'bio'],
			bucket: 15,
			cooldown: 60,
			cooldownLevel: 'guild',
			usage: '[user:user|user:string]'
		});
		this.months = {
			null: 'Not set',
			0: 'January',
			1: 'February',
			2: 'March',
			3: 'April',
			4: 'May',
			5: 'June',
			6: 'July',
			7: 'August',
			8: 'September',
			9: 'October',
			10: 'November',
			11: 'December'
		};
		this.doubles = {
			0: '00',
			1: '01',
			2: '02',
			3: '03',
			4: '04',
			5: '05',
			6: '06',
			7: '07',
			8: '08',
			9: '09',
			10: '10'
		};
		this.suffix = {
			1: '1st',
			2: '2nd',
			3: '3rd',
			4: '4th',
			5: '5th',
			6: '6th',
			7: '7th',
			8: '8th',
			9: '9th',
			10: '10th',
			11: '11th',
			12: '12th',
			13: '13th',
			14: '14th',
			15: '15th',
			16: '16th',
			17: '17th',
			18: '18th',
			19: '19th',
			20: '20th',
			21: '21st',
			22: '22nd',
			23: '23rd',
			24: '24th',
			25: '25th',
			26: '26th',
			27: '27th',
			28: '28th',
			29: '29th',
			30: '30th',
			31: '31st'
		};
		this.gender = {
			null: 'Not set',
			0: 'Male',
			1: 'Female',
			2: 'Nonbinary'
		};
		this.premium = {
			false: '',
			true: ` ${emotes.premium}`
		};
		this.verify = {
			false: '',
			true: ` ${emotes.Verified}`
		};
		this.staff = {
			false: '',
			true: ` ${emotes.staff}`
		};
	}

	async run(msg, [user]) {
		let user2;
		// if no input or mentions user
		if (!user) user = msg.author.id;
		if (msg.mentions.users.first()) user = msg.mentions.users.first();
		if (msg.mentions.users.first()) user2 = msg.mentions.users.first().username;
		// replacing everything first rather constantly
		user = user.toString().replace(regex.replaceNonAlpha, '').replace(/\s/g, '').toLowerCase();
		if (!user) return msg.send(`Please enter a valid slug`);
		// send HTTP requests
		let req = await centra(url.discord_bio).path('user').path('details').path(user.id || encodeURI(user)).send();
		// embeds
		const noUser = new MessageEmbed().setDescription(`\`${user2 || user.username || user}\` does not have a profile at [discord.bio](https://dsc.bio)`);
		const ratelimited = new MessageEmbed().setDescription(`Currently ratelimited please try again later.`);
		// handle errors + define vars
		if (req.statusCode === 429) return msg.send(ratelimited);
		//		if (req.statusCode === 400) return msg.send(noUser);
		if (req.statusCode === 404) return msg.send(noUser);
		//		if (req.statusCode === 504) return msg.send('Timed out')
		//		if (req.statusCode === 401) return msg.send('This is a authed route?????')
		req = JSON.parse(req.body);
		const connections = req.payload.user.userConnections;
		const dconnections = req.payload.user.discordConnections;
		// if user exists
		const { discord } = req.payload;
		const bio = req.payload.user.details;
		// date objects
		const birthday = new Date(bio.birthday);
		const created_at = new Date(bio.created_at);
		let createMin = created_at.getUTCMinutes();
		let createHours = created_at.getUTCHours();
		if (this.doubles[createMin]) createMin = this.doubles[createMin];
		if (this.doubles[createHours]) createHours = this.doubles[createHours];
		const matched_created_at = `${this.suffix[created_at.getUTCDate()]} ${this.months[created_at.getUTCMonth()]} ${created_at.getFullYear()} at ${createHours}:${createMin}`;
		let matched_birthday = `${this.suffix[birthday.getUTCDate()]} ${this.months[birthday.getUTCMonth()]}`;
		if (!bio.birthday) matched_birthday = 'Not set';
		// create avatar and user
		let UserUrl = `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.gif`;
		const checkPfp = await centra(UserUrl).send();
		if (checkPfp.statusCode === 415) UserUrl = `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png`;
		// title with badges
		const title = `**${discord.username}#${discord.discriminator} (\`${bio.slug.trim()}\`)** ${this.verify[bio.verified] || ''}${this.premium[bio.premium] || ''}${this.staff[bio.staff] || ''}`;
		// banner
		let { banner } = req.payload.user.details;
		if (!banner) banner = 'https://i.imgur.com/x7hvOQZ.png';
		const sourceImage = await centra(banner).send();
		let bannerC;
		if (sourceImage.statusCode === 200) {
			try {
				const colorThief = new ColorThief();
				bannerC = colorThief.getColor(sourceImage.body);
				bannerC = util.fullColorHex(bannerC[0], bannerC[1], bannerC[2]);
			} catch (error) {
				bannerC = null;
			}
		}
		if (!bannerC) bannerC = '#0000ff';
		// connectiions
		var text = [];
		var Dtext = [];
		for (const [key, value] of Object.entries(dconnections)) {
			switch (value.connection_type) {
				case 'steam':
					Dtext.push(`[${emotes.steam}](${encodeURI(value.url)})`);
					break;
				case 'twitter':
					Dtext.push(`[${emotes.twitter}](${encodeURI(value.url)})`);
					break;
				case 'twitch':
					Dtext.push(`[${emotes.twitch}](${encodeURI(value.url)})`);
					break;
				case 'spotify':
					Dtext.push(`[${emotes.spotify}](${encodeURI(value.url)})`);
					break;
				case 'reddit':
					Dtext.push(`[${emotes.reddit}](https://reddit.com/u/${encodeURI(value.name)})`);
					break;
				case 'youtube':
					Dtext.push(`[${emotes.youtube}](${encodeURI(value.url)})`);
					break;
				case 'xbox':
					Dtext.push(`[${emotes.xbox}](https://account.xbox.com/en-gb/profile?gamertag=${encodeURI(value.name)})`);
					break;
			}
		}
		const { website } = connections;
		const { github } = connections;
		const { instagram } = connections;
		const { snapchat } = connections;
		const { linkedin } = connections;
		const { facebook } = connections;
		if (website) {
			if (!website.includes('http') && !website.includes('https') && !regex.invite.test(website)) text.push(`[${emotes.link}](http://${encodeURI(website)})`);
			if (website.includes('http') || website.includes('https')) {
				if (!regex.invite.test(website)) text.push(`[${emotes.link}](${encodeURI(website)})`);
			}
		}
		if (github) {
			text.push(`[${emotes.github}](https://github.com/${encodeURI(github)})`);
		}
		if (instagram) {
			text.push(`[${emotes.instagram}](https://instagram.com/${encodeURI(instagram)})`);
		}
		if (snapchat) {
			text.push(`[${emotes.snapchat}](https://snapchat.com/add/${encodeURI(snapchat)})`);
		}
		if (linkedin) {
			text.push(`[${emotes.linkedin}](https://linkedin.com/in/${encodeURI(linkedin)})`);
		}
		if (facebook) {
			text.push(`[${emotes.facebook}](https://www.facebook.com/${encodeURI(facebook)})`);
		}
		// logic checking since this isn't handled by the API
		if (bio.email) {
			if (bio.email.length == 1) bio.email = 'Not set';
			if (!bio.email.includes('@')) bio.email = 'Not set';
			if (bio.email.includes('https') || bio.email.includes('https') || bio.email.includes('http') || bio.email.includes('invite') || bio.email.includes('//')) bio.email = 'Not set';
		}
		if (!bio.description) bio.description = 'Not set';
		let likes = 'like';
		if (bio.likes > 1) likes = 'likes';
		if (bio.likes === 0) likes = 'likes';
		// final embed
		const embed = new MessageEmbed();
		embed.setColor(bannerC || '0000ff');
		embed.setTitle(title);
		embed.setDescription(`🗒️**About:** ${bio.description.replace(regex.escapeBrackets, '').replace(regex.invite, 'https://google.com') ? bio.description.replace(regex.escapeBrackets, '').replace(regex.invite, 'https://google.com').replace(/\s\s+/g, ' ') : 'No description'}\n​❤️ **${bio.likes} ${likes}**\n​`);
		embed.setThumbnail(UserUrl);
		embed.setAuthor(discord.username, UserUrl, `https://discord.bio/p/${bio.slug.trim()}/`);
		embed.addField('🆔 User ID', bio.user_id);
		embed.addField('🗺️ Location', bio.location ? bio.location : 'No location', true);
		embed.addField('🎂 Birthday', matched_birthday || 'No birthday', true);
		embed.addField('🚻 Gender', this.gender[bio.gender] ? this.gender[bio.gender] : 'No gender', true);
		embed.addField('✉️ Mail', bio.email ? bio.email : 'No email', true);
		embed.addField('🛠️ Occupation', bio.occupation ? bio.occupation : 'No occupation', true);
		embed.addField('🗓️ Account Created', matched_created_at || 'No creation date.', true);
		if (text.length > 0) {
			embed.addField('​\n🔗 Connections', text.join(' '), true);
		}
		if (Dtext.length > 0 && Dtext.length > 8) {
			Dtext.length = 10;
			embed.addField('​\n🔗 Discord Connections', Dtext.join(' '), true);
		}
		if (Dtext.length > 0 && Dtext.length < 8) {
			embed.addField('​\n🔗 Discord Connections', Dtext.join(' '), true);
		}
		return msg.send(embed);
	}

};
