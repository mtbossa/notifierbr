import { SlashCommandBuilder } from '@discordjs/builders';
import {
	BaseCommandInteraction,
	CommandInteraction,
	TextChannel,
} from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clears the chat!'),
	async execute(interaction: CommandInteraction) {
		if (interaction.channel?.isText()) {
			const messages = await interaction.channel.messages.fetch({ limit: 100 });
			if (interaction.channel.isText()) {
				const channel = interaction.channel as TextChannel;
				await channel.bulkDelete(messages);
			}
			await interaction.reply({ content: 'Messages deleted', ephemeral: true });
		}
	},
};