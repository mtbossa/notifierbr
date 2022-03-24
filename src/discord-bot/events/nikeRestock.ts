import { Client, MessageEmbed, TextChannel } from "discord.js";
import { DiscordSneakerData } from "../models/interfaces/DiscordSneakerData";

module.exports = {
  name: "nikeRestock",
  execute(client: Client, newDiscordSneakerData: DiscordSneakerData) {
    const channel = client.channels.cache.get(
      process.env.DISCORD_NIKE_RESTOCK_CHANNEL_ID!,
    ) as TextChannel;

    const exampleEmbed = new MessageEmbed()
      .setColor("#f58442")
      .setTitle(newDiscordSneakerData.name)
      .setURL(newDiscordSneakerData.url)
      .setDescription("Restock! :rocket:")
      .setThumbnail(newDiscordSneakerData.imgUrl)
      .setTimestamp();

    channel.send({ embeds: [exampleEmbed] });
  },
};
