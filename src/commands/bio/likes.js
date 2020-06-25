const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const centra = require('@aero/centra');
const { url } = require('../../../lib/constants');
module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: language => language.get('COMMAND_LIKES_DESCRIPTION'),
			requiredPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			runIn: ['text'],
			extendedHelp: 'none available',
			aliases: ['top', 'topLikes'],
			autoAliases: true,
			bucket: 3,
			cooldown: 30,
			cooldownLevel: 'author',
			deletable: true
		});
	}

	async run(msg) {
		const names = [];
		const likes = [];
		const rank = [];
		let i;
		let req = await centra(url.discord_bio).path('topLikes').send();
		if (req.statusCode === 429) return msg.send('Ratelimited');
		if (req.statusCode === 400) return msg.send('User cant be found');
		if (req.statusCode === 404) return msg.send('User cant be found');
		if (req.statusCode === 504) return msg.send(`Timed out`);
		if (req.statusCode === 401) return msg.send('This is a authed route?????');
		req = JSON.parse(req.body);
		req = req.payload;
		for (i = 0; i < req.length; i++) {
			names.push(req[i].user.slug);
			likes.push(req[i].user.likes);
			rank.push([i]);
		}
		const embed = new MessageEmbed()
			.setTitle('**Top Users**')
			.setDescription(`
1: [${names[0]}](https://dsc.bio/${names[0]}) with ${likes[0]} likes
2: [${names[1]}](https://dsc.bio/${names[1]}) with ${likes[1]} likes
3: [${names[2]}](https://dsc.bio/${names[2]}) with ${likes[2]} likes
4: [${names[3]}](https://dsc.bio/${names[3]}) with ${likes[3]} likes
5: [${names[4]}](https://dsc.bio/${names[4]}) with ${likes[4]} likes
6: [${names[5]}](https://dsc.bio/${names[5]}) with ${likes[5]} likes
7: [${names[6]}](https://dsc.bio/${names[6]}) with ${likes[6]} likes
8: [${names[7]}](https://dsc.bio/${names[7]}) with ${likes[7]} likes
9: [${names[8]}](https://dsc.bio/${names[8]}) with ${likes[8]} likes
10: [${names[9]}](https://dsc.bio/${names[9]}) with ${likes[9]} likes`)
			.setColor('#ec8777')
			.setThumbnail('https://pbs.twimg.com/profile_images/1216503550798450688/n-lPzdGI_400x400.jpg')
			.setFooter('likes are reset every month');
		return msg.send(embed);
	}

};
