const { Command, util: { exec, codeBlock } } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['execute'],
			description: 'Execute commands in the terminal, use with EXTREME CAUTION.',
			guarded: true,
			permissionLevel: 10,
			extendedHelp: 'No extended help available.',
			hidden: true,
			usage: '<expression:string>'
		});
	}

	async run(msg, [input]) {
		const result = await exec(input, { timeout: 'timeout' in msg.flags ? Number(msg.flags.timeout) : 60000 })
			.catch(error => ({ stdout: null, stderr: error }));
		const output = result.stdout ? `**\`OUTPUT\`**${codeBlock('prolog', result.stdout)}` : `**\`ERROR\`**${codeBlock('prolog', 'Empty response')}`;
		const outerr = result.stderr ? `**\`ERROR\`**${codeBlock('prolog', result.stderr)}` : `**\`ERROR\`**${codeBlock('prolog', 'Empty response')}`;
		return msg.sendMessage([output, outerr].join('\n'));
	}

};
