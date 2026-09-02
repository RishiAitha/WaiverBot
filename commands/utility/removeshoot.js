const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Keyv } = require('keyv');

const keyv = new Keyv('sqlite://db.sqlite');

keyv.on('error', (err) => console.error('Keyv connection error:', err));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove-shoot')
		.setDescription('Remove Existing Shoot')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addStringOption((option) => option.setName('shoot').setDescription('Enter movie name for shoot.').setRequired(true)),
	async execute(interaction) {
		const shoot = interaction.options.getString('shoot');
        const successful = await keyv.delete(`shoots:${shoot}`);
		if (successful) {
			await interaction.reply({content: `Removed ${shoot} from the shoots list.`, fetchReply: false});
		} else {
			await interaction.reply({content: `There was an error removing ${shoot} or it did not exist.`, fetchReply: false});
		}
	},
};