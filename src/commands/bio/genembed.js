const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { url } = require('../../../lib/constants');
const centra = require('@aero/centra');
module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: language => language.get('COMMAND_GENEMBED_DESCRIPTION'),
			requiredPermissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			bucket: 20,
			cooldown: 60,
			extendedHelp: 'genembed v --meta',
			cooldownLevel: 'guild',
			usage: '[slug:str]'
		});
	}

	async run(msg, [slug]) {
		if (!slug) {
			let req = await centra(url.discord_bio).path('user').path('details').path(msg.author.id).send();
			if (req.statusCode === 429) return msg.send(`Ratelimited!`);
			if (req.statusCode === 400) return msg.send(`${slug} does not exist!`);
			if (req.statusCode === 404) return msg.send(`${slug} does not exist!`);
			req = JSON.parse(req.body);
			slug = req.payload.user.details.slug;
		}
		if (msg.flagArgs.meta) return this.meta(msg, [slug]);
		let out = [];
		out.push('```html\n');
		out.push(`<iframe src="https://discord.bio/p/${slug}" width="400" height="870" allowtransparency="true" frameborder="0"></iframe>`);
		out.push('```');
		out = out.join('');
		return msg.send(out);
	}
	async meta(msg, [slug]) {
		const out = [];
		const noUser = new MessageEmbed().setDescription(`\`${slug}\` does not have a profile at [discord.bio](https://dsc.bio)`);
		let req = await centra(`https://api.discord.bio/v1/user/details/${slug}`).send();
		if (req.statusCode === 429) return msg.send('Ratelimited!');
		//    if(req.statusCode === 400) return msg.send(noUser)
		if (req.statusCode === 404) return msg.send(noUser);
		req = JSON.parse(req.body);
		const settings = req.payload.user.details;
		const { discord } = req.payload;
		out.push('```html\n');
		out.push(`<!-- Primary Meta Tags -->
<title>${settings.slug}'s discord bio</title>
<meta http-equiv="refresh" content="0; url=https://discord.bio/p/${settings.slug}" />
<meta name="title" content="${settings.slug}'s discord bio">
<meta name="description" content="${settings.description}">
<meta http-equiv="refresh" content="0; url=https://discord.bio/p/${settings.slug}" />
<!-- Open Graph / Facebook -->
<meta property="og:type" content="profile">
<meta property="og:url" content="https://dsc.bio/${settings.slug}">
<meta property="og:title" content="${settings.slug}'s discord.bio">
<meta property="og:description" content="${settings.description}">
<meta property="og:image" content="https://cdn.discordapp.com/avatars/${settings.user_id}/${discord.avatar}.png">`);
		out.push(`
<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://dsc.bio/${settings.slug}">
<meta property="twitter:title" content="${settings.slug}'s discord bio">
<meta property="twitter:description" content="${settings.description}">
<meta property="twitter:image" content="https://cdn.discordapp.com/avatars/${settings.user_id}/${discord.avatar}.png">`);
		out.push('```');
		return msg.send(out.join(''));
	}

};
