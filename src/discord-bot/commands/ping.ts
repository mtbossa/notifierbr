/* eslint import/no-import-module-exports: 0 */
import { SlashCommandBuilder } from "@discordjs/builders";

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
  async execute(interaction: any) {
    await interaction.reply("Pong!");
  },
};
