const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Keyv } = require('keyv');

const keyv = new Keyv('sqlite://db.sqlite');

keyv.on('error', (err) => console.error('Keyv connection error:', err));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('view-shoots')
		.setDescription('View Shoots')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
	async execute(interaction) {
        const shoots = [];

        for await (const [key, value] of keyv.iterator()) {
            if (key.startsWith('shoots:')) {
                shoots.push(key.replace('shoots:', '') + ": " + value);
            }
        }

        if (shoots.length === 0) {
            return interaction.reply({content: 'There are no shoots currently listed.', ephemeral: true, fetchReply: false});
        }

        const list = shoots.map(shoot => `${shoot}`).join('\n');
        return interaction.reply({content: `**Current Shoots:**\n${list}`, ephemeral: true, fetchReply: false});
	},
};