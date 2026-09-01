const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Keyv } = require('keyv');

const keyv = new Keyv('sqlite://db.sqlite');

keyv.on('error', (err) => console.error('Keyv connection error:', err));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove-historian')
		.setDescription('Remove Existing Historian')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addUserOption((option) => option.setName('user').setDescription('Historian\'s account.').setRequired(true)),
	async execute(interaction) {
		const historian = interaction.options.getUser('user');
        const successful = await keyv.delete(`historians:${historian.id}`);
		if (successful) {
			await interaction.reply({content: `Removed ${historian.username} to the historians list.`, fetchReply: false});
		} else {
			await interaction.reply({content: `There was an error removing ${historian.username} or they were not a historian.`, fetchReply: false});
		}
	},
};