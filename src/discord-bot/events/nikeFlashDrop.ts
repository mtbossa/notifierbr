import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { DiscordSneakerData } from '../models/interfaces/DiscordSneakerData';

module.exports = {
  name: 'nikeFlashDrop',
  execute(client: Client, newSneakers: DiscordSneakerData[]) {
    const channel = client.channels.cache.get(
      process.env.DISCORD_NIKE_FLASHDROP_CHANNEL_ID!
    ) as TextChannel;
    newSneakers.forEach((DiscordSneakerData: DiscordSneakerData) => {
      const exampleEmbed = new MessageEmbed()
        .setColor('#f58442')
        .setTitle(DiscordSneakerData.name)
        .setURL(DiscordSneakerData.url)
        .setDescription(`Flash Drop! :rocket: ${DiscordSneakerData.styleCode}`)
        .setThumbnail(DiscordSneakerData.imgUrl)
        .setTimestamp();

      channel.send({ embeds: [exampleEmbed] });
    });
  },
};
