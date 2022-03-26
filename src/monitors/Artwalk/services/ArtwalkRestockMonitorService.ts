import { DiscordSneakerData } from "../../../discord-bot/models/interfaces/DiscordSneakerData";

export default class ArtwalkRestockMonitorService {
  public mapNeededDiscordSneakerDataForDiscord(discordSneakerData: {
    name: string;
    url: string;
    imgUrl: string;
  }): DiscordSneakerData {
    return {
      name: discordSneakerData.name,
      url: discordSneakerData.url,
      imgUrl: discordSneakerData.imgUrl,
    } as DiscordSneakerData;
  }
}
