import { SlashCommandBuilder } from "@discordjs/builders";
import { BaseCommandInteraction, CommandInteraction, TextChannel } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Excluí as últimas 100 mensagens!"),
  async execute(interaction: CommandInteraction) {
    if (interaction.channel?.isText()) {
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const channel = interaction.channel as TextChannel;

      await channel.bulkDelete(messages);

      await interaction.reply({
        content: "Últimas 100 mensagem apagadas",
        ephemeral: true,
      });
    }
  },
};
