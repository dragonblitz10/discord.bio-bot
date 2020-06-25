const util = require('./clean');
exports.cleanCodeBlock = function CleanMarkdown(text) {
	return text.replace(/```/g, '');
};

exports.cleanInlineCode = function cleanInlineCode(text) {
	return text.replace(/(?<=^|[^`])`(?=[^`]|$)/g, '');
};

exports.cleanItalic = function cleanItalic(text) {
	let i = 0;
	text = text.replace(/(?<=^|[^*])\*([^*]|\*\*|$)/g, (_, match) => {
		if (match === '**') return ++i % 2 ? `${match}` : `${match}`;
		return `${match}`;
	});
	i = 0;
	return text.replace(/(?<=^|[^_])_([^_]|__|$)/g, (_, match) => {
		if (match === '__') return ++i % 2 ? `${match}` : `${match}`;
		return `${match}`;
	});
};

exports.cleanBold = function cleanBold(text) {
	let i = 0;
	return text.replace(/\*\*(\*)?/g, (_, match) => {
		if (match) return ++i % 2 ? `${match}` : `${match}`;
		return '';
	});
};
exports.cleanUnderline = function cleanUnderline(text) {
	let i = 0;
	return text.replace(/__(_)?/g, (_, match) => {
		if (match) return ++i % 2 ? `${match}` : `${match}`;
		return '';
	});
};
exports.cleanStrikethrough = function scapeStrikethrough(text) {
	return text.replace(/~~/g, '');
};

exports.cleanSpoiler = function cleanSpoiler(text) {
	return text.replace(/\|\|/g, '');
};
exports.cleanMarkdown = function cleanMarkdown(text, {
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
			return this.cleanMarkdown(subString, {
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
			return this.cleanMarkdown(subString, {
				codeBlock,
				bold,
				italic,
				underline,
				strikethrough,
				spoiler
			});
		}).join(inlineCode ? '\\`' : '`');
	}
	if (inlineCode) text = util.cleanInlineCode(text);
	if (codeBlock) text = util.cleanCodeBlock(text);
	if (italic) text = util.cleanItalic(text);
	if (bold) text = util.cleanBold(text);
	if (underline) text = util.cleanUnderline(text);
	if (strikethrough) text = util.cleanStrikethrough(text);
	if (spoiler) text = util.cleanSpoiler(text);
	return text;
};

exports.cleanContent = function cleanContent(str, message) {
	if (!str) return 'No string found';
	if (!message) return 'add message';
	return str
		.replace(/@(everyone|here)/g, '@\u200b$1')
		.replace(/<@!?[0-9]+>/g, input => {
			const id = input.replace(/<|!|>|@/g, '');
			if (message.channel.type === 'dm') {
				const user = message.client.users.cache.get(id);
				return user ? `@${user.username}` : input;
			}

			const member = message.channel.guild.members.cache.get(id);
			if (member) {
				return `@${member.displayName}`;
			} else {
				const user = message.client.users.cache.get(id);
				return user ? `@${user.username}` : input;
			}
		})
		.replace(/<#[0-9]+>/g, input => {
			const channel = message.client.channels.cache.get(input.replace(/<|#|>/g, ''));
			return channel ? `#${channel.name}` : input;
		})
		.replace(/<@&[0-9]+>/g, input => {
			if (message.channel.type === 'dm') return input;
			const role = message.guild.roles.cache.get(input.replace(/[^0-9.]/g, ''));
			return role ? `@${role.name}` : input;
		});
};
exports.cleanMentions = function cleanMentions(str) {
	return str.replace(/@/g, '@\u200b');
};
