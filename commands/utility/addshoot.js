const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Keyv } = require('keyv');

const keyv = new Keyv('sqlite://db.sqlite');

keyv.on('error', (err) => console.error('Keyv connection error:', err));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-shoot')
		.setDescription('Add New Shoot')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addStringOption((option) => option.setName('shoot').setDescription('Enter movie name for shoot.').setRequired(true))
        .addStringOption((option) => option.setName('date').setDescription('Enter the date in MM-DD-YYYY format.').setRequired(true)),
	async execute(interaction) {
        const shoot = interaction.options.getString('shoot');
		const date = interaction.options.getString('date');
        const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/;  

        if (!dateRegex.test(dateString)) {
            await interaction.reply({content: 'Invalid date format! Please use MM-DD-YYYY.', ephemeral: true, fetchReply: false});
            return;
        }

        const existingShoot = await keyv.get(`shoots:${shoot}`);
		if (existingShoot) {
			await interaction.reply({content: `The shoot ${shoot} is already listed.`, ephemeral: true, fetchReply: false});
			return;
		}

        await keyv.set(`shoots:${shoot}`, date);
		await interaction.reply({content: `Added ${shoot} to the shoots list.`, fetchReply: false});
	},
};