const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Keyv } = require('keyv');

const keyv = new Keyv('sqlite://db.sqlite');

keyv.on('error', (err) => console.error('Keyv connection error:', err));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('view-historians')
		.setDescription('View Historians')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
	async execute(interaction) {
        const historians = [];

        for await (const [key, value] of keyv.iterator()) {
            if (key.startsWith('historians:')) {
                historians.push(value);
            }
        }

        if (historians.length === 0) {
            return interaction.reply({content: 'There are no historians currently registered.', ephemeral: true, fetchReply: false});
        }

        const list = historians.map(username => `${username}`).join('\n');
        return interaction.reply({content: `**Current Historians:**\n${list}`, ephemeral: true, fetchReply: false});
	},
};