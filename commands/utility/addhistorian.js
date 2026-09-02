const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Keyv } = require('keyv');

const keyv = new Keyv('sqlite://db.sqlite');

keyv.on('error', (err) => console.error('Keyv connection error:', err));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-historian')
		.setDescription('Add New Historian')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addUserOption((option) => option.setName('user').setDescription('Historian\'s account.').setRequired(true)),
	async execute(interaction) {
		const historian = interaction.options.getUser('user');

		const existingHistorian = await keyv.get(`historians:${historian.id}`);
		if (existingHistorian) {
			await interaction.reply({content: `${historian.username} is already a historian.`, ephemeral: true, fetchReply: false});
			return;
		}

        await keyv.set(`historians:${historian.id}`, historian.username);
		await interaction.reply({content: `Added ${historian.username} to the historians list.`, fetchReply: false});
	},
};