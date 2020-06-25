// Copyright (c) 2019 KlasaCommunityPlugins, MIT License
// derived from https://github.com/KlasaCommunityPlugins/tags
const { Command, util } = require('klasa');
const { trimString } = require('../../../lib/util');
const { cleanCodeBlock } = require('../../../lib/clean');
const { Util: djsUtil, Permissions: { FLAGS } } = require('discord.js');
module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: language => language.get('COMMAND_TAG_DESCRIPTION'),
			permissionLevel: 1,
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|list|view|create|reset> [tag:string] [content:string] [...]',
			usageDelim: ' ',
			extendedHelp: 'No extended help available.',
			aliases: ['t', 'tags']
		});
		this.defaultPermissions = FLAGS.MANAGE_MESSAGES;
	}

	async add(msg, [tag, ...content]) {
		if (!tag || !content) return msg.send(`Please provide the tag content.`);
		content = content.join(this.usageDelim);
		await msg.guild.settings.update('tags', [[tag.toLowerCase(), content]], { action: 'add' });
		return msg.send(msg.language.get('COMMAND_TAG_ADDED', tag, cleanCodeBlock(content)));
	}
	async create(msg, [tag, ...content]) {
		return this.add(msg, [tag, ...content]);
	}
	async remove(msg, [tag]) {
		if (!tag) throw 'Please enter a tag to delete';
		const filtered = msg.guild.settings.get('tags').filter(([name]) => name === tag.toLowerCase());
		await msg.guild.settings.update('tags', filtered, { action: 'delete' });
		return msg.send(`**The tag** \`${tag}\` **has been deleted**`);
	}

	view(msg, [tag]) {
		if (!tag) throw msg.language.get('COMMAND_TAG_UNSPECIFIED');
		const emote = msg.guild.settings.get('tags').find(([name]) => name === tag.toLowerCase());
		if (!emote) throw msg.language.get('COMMAND_TAG_NOEXIST', tag);
		return msg.send(util.codeBlock('', cleanCodeBlock(emote[1])));
	}


	list(msg) {
		if (!msg.guild.settings.get('tags').length) {
			msg.language.get('COMMAND_TAG_NOTAGS');
		}
		const tags = msg.guild.settings.get('tags');
		const output = [`**${msg.guild.name} Tags** (Total ${tags.length})`, '```asciidoc'];
		for (const [index, [tag, value]] of tags.entries()) {
			output.push(`${index + 1}. ${tag} :: ${trimString(cleanCodeBlock(value), 30)}`);
		}
		output.push('```');
		return msg.send(output.join('\n'));
	}
	async reset(msg) {
		await msg.guild.settings.reset('tags');
		return msg.send('reset all tags');
	}

};
