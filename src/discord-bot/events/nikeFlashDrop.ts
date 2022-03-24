/* eslint import/no-import-module-exports: 0 */
import { Client, MessageEmbed, TextChannel } from "discord.js";
import { DiscordSneakerData } from "../models/interfaces/DiscordSneakerData";

module.exports = {
  name: "nikeFlashDrop",
  execute(client: Client, newSneakers: DiscordSneakerData[]) {
    const channel = client.channels.cache.get(
      process.env.DISCORD_NIKE_FLASHDROP_CHANNEL_ID!,
    ) as TextChannel;
    newSneakers.forEach((discordSneakerData: DiscordSneakerData) => {
      const exampleEmbed = new MessageEmbed()
        .setColor("#f58442")
        .setTitle(discordSneakerData.name)
        .setURL(discordSneakerData.url)
        .setDescription(`Flash Drop! :rocket: ${discordSneakerData.styleCode}`)
        .setThumbnail(discordSneakerData.imgUrl)
        .setTimestamp();

      channel.send({ embeds: [exampleEmbed] });
    });
  },
};
