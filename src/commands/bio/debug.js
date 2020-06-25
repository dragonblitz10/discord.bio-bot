const { Command } = require('klasa');
const centra = require('@aero/centra');
const { url } = require('../../../lib/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: language => language.get('COMMAND_DEBUG_DESCRIPTION'),
			requiredPermissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			extendedHelp: 'none available',
			autoAliases: true,
			aliases: ['test'],
			bucket: 1,
			cooldown: 30,
			cooldownLevel: 'author',
			usage: '<profile|top> [input:string] [...]',
			usageDelim: ' ',
			deletable: true
		});
	}

	async run(msg, [type, ...params]) {
		return this[type](msg, params);
	}

	async profile(msg, [...input]) {
		if (!input.length) return msg.send('Please enter something!');
		input = input.join('');
		const http = await centra(url.discord_bio).path('user').path('details').path(encodeURI(input)).query('pretty', true).send();
		const out = [];
		let req = [];
		if (http.statusCode == 200) {
			req = JSON.parse(http.body);
			req = req.details;
		}
		if (req) {
			if (!req.length) req = http.body.toString();
		}
		out.push(`**Request Path**: ${http.coreRes.req.path}\n**Request Status Code**: ${http.statusCode}\n**Ratelimit Remaining**: ${http.coreRes.headers['x-ratelimit-remaining']}\n**Ratelimit Limit**: ${http.coreRes.headers['x-ratelimit-limit']}\n**Request Body**:`);
		out.push('```JSON');
		out.push(http.body.toString());
		out.push('```');
		out.join('');
		const arrLength = out[0].length + out[1].length + out[2].length + out[3].length;
		if (arrLength > 2000) {
			return this.debug(msg, [http]);
		}
		return msg.send(out);
	}
	async top(msg) {
		const http = await centra(url.discord_bio).path('topLikes').query('pretty', true).send();
		let req = [];
		if (http.statusCode == 200) {
			req = JSON.parse(http.body);
			req = req.userConnections;
		}
		if (req) {
			if (!req.length) req = http.body.toString();
		}
		return this.debug(msg, [http]);
	}
	async debug(msg, [http, type]) {
		const out = [];
		const out2 = [];
		const out3 = [];

		out.push(`**Request Path**: ${http.coreRes.req.path}\n**Request Status Code**: ${http.statusCode}\n**Ratelimit Remaining**: ${http.coreRes.headers['x-ratelimit-remaining']}\n**Ratelimit Limit**: ${http.coreRes.headers['x-ratelimit-limit']}\n**Request Body**:\n`);
		out.push('```JSON');
		out.push(http.body.toString().slice(0, 1024));
		out.push('```');
		out.join(' ');

		out2.push('```JSON');
		out2.push(http.body.toString().slice(1024, 3000));
		out2.push('```');
		out.push(' ');
		out2.join(' ');

		out3.push('```JSON');
		out3.push(http.body.toString().slice(3000, 4000));
		out3.push('```');
		out3.join(' ');

		const arrLength = out3[0].length + out3[1].length + out3[2].length;
		await msg.channel.send(out);
		await msg.channel.send(out2);
		if (arrLength > 10) await msg.channel.send(out3);
		return true;
	}

};
