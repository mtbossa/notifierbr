import { DiscordSneakerData } from '../../../discord-bot/models/interfaces/DiscordSneakerData';

export class NikeRestockMonitorService {
  public mapNeededDiscordSneakerDataForDiscord(DiscordSneakerData: {
    name: string;
    url: string;
    imgUrl: string;
  }): DiscordSneakerData {
    return {
      name: DiscordSneakerData.name,
      url: DiscordSneakerData.url,
      imgUrl: DiscordSneakerData.imgUrl,
    } as DiscordSneakerData;
  }
}
