import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { notifyTextChannel } from '..';
import { DiscordSneakerData } from '../models/interfaces/DiscordSneakerData';

module.exports = {
  name: 'restock',
  execute(client: Client, newDiscordSneakerData: DiscordSneakerData) {
    const channel = client.channels.cache.find(
      (channel) => (channel as TextChannel).name === notifyTextChannel
    );

    const exampleEmbed = new MessageEmbed()
      .setColor('#f58442')
      .setTitle(newDiscordSneakerData.name)
      .setURL(newDiscordSneakerData.url)
      .setDescription('Restock! :rocket:')
      .setThumbnail(newDiscordSneakerData.imgUrl)
      .setTimestamp();

    (channel as TextChannel).send({ embeds: [exampleEmbed] });
  },
};
