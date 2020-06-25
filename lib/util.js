const { Util } = require('discord.js');
exports.trimString = (str, max = 30) => {
	if (str.length > max) return `${str.substr(0, max)}...`;
	return str;
};

exports.random = (n1, n2) => Math.floor(Math.random() * (n2 - n1)) + n1;

exports.randomArray = array => array[this.random(0, array.length)];

exports.objectIsEmpty = obj => Object.entries(obj).length === 0;

exports.isUnicodeEmoji = str => /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c([\ud000-\udfff]){1,2}|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])$/.test(str);

exports.escapeMarkdown = function escapeMarkdown(text, {
	codeBlock = true,
	inlineCode = true,
	bold = true,
	italic = true,
	underline = true,
	strikethrough = true,
	spoiler = true,
	codeBlockContent = true,
	inlineCodeContent = true
} = {}) {
	if (!codeBlockContent) {
		return text.split('```').map((subString, index, array) => {
			if ((index % 2) && index !== array.length - 1) return subString;
			return Util.escapeMarkdown(subString, {
				inlineCode,
				bold,
				italic,
				underline,
				strikethrough,
				spoiler,
				inlineCodeContent
			});
		}).join(codeBlock ? '\\`\\`\\`' : '```');
	}
	if (!inlineCodeContent) {
		return text.split(/(?<=^|[^`])`(?=[^`]|$)/g).map((subString, index, array) => {
			if ((index % 2) && index !== array.length - 1) return subString;
			return Util.escapeMarkdown(subString, {
				codeBlock,
				bold,
				italic,
				underline,
				strikethrough,
				spoiler
			});
		}).join(inlineCode ? '\\`' : '`');
	}
	if (inlineCode) text = Util.escapeInlineCode(text);
	if (codeBlock) text = Util.escapeCodeBlock(text);
	if (italic) text = Util.escapeItalic(text);
	if (bold) text = Util.escapeBold(text);
	if (underline) text = Util.escapeUnderline(text);
	if (strikethrough) text = Util.escapeStrikethrough(text);
	if (spoiler) text = Util.escapeSpoiler(text);
	return text;
};
exports.rgbToHex = function rgbToHex(rgb) {
	let hex = Number(rgb).toString(16);
	if (hex.length < 2) {
		hex = `0${hex}`;
	}
	return hex;
};
exports.fullColorHex = function fullColorHex(r, g, b) {
	const red = this.rgbToHex(r);
	const green = this.rgbToHex(g);
	const blue = this.rgbToHex(b);
	return red + green + blue;
};
exports.cleanContent = function cleanContent(str, message) {
	return str
		.replace(/@(everyone|here)/g, '@\u200b$1')
		.replace(/<@!?[0-9]+>/g, input => {
			const id = input.replace(/<|!|>|@/g, '');
			if (message.channel.type === 'dm') {
				const user = message.client.users.cache.get(id);
				return user ? `@${user.username}` : input;
			}

			const member = message.channel.guild.members.get(id);
			if (member) {
				return `@${member.displayName}`;
			} else {
				const user = message.client.users.get(id);
				return user ? `@${user.username}` : input;
			}
		})
		.replace(/<#[0-9]+>/g, input => {
			const channel = message.client.channels.get(input.replace(/<|#|>/g, ''));
			return channel ? `#${channel.name}` : input;
		})
		.replace(/<@&[0-9]+>/g, input => {
			if (message.channel.type === 'dm') return input;
			const role = message.guild.roles.get(input.replace(/[^0-9.]/g, ''));
			return role ? `@${role.name}` : input;
		});
};
