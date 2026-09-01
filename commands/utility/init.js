const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Keyv } = require('keyv');

const keyv = new Keyv('sqlite://db.sqlite');

keyv.on('error', (err) => console.error('Keyv connection error:', err));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('init')
		.setDescription('Initialize WaiverBot')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
	async execute(interaction) {
		const message = await interaction.reply({content: 'React to this message to join the list!', fetchReply: true});
        await keyv.set('config:initMessageID', message.id);
	},
};