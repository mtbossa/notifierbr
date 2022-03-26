import logger from "../../../logger";
import { DiscordSneakerData } from "../../../discord-bot/models/interfaces/DiscordSneakerData";
import { ArtwalkRestockAPIRequestData } from "../models/requests/ArtwalkRestockAPIRequestData";

export default abstract class ArtwalkRestockRepositoryInterface {
  protected log = logger.child({ monitor: "<NikeRestockMonitor>" });

  abstract isSneakerAvailable(requestObject: ArtwalkRestockAPIRequestData): Promise<boolean>;

  abstract getSneaker(requestObject: ArtwalkRestockAPIRequestData): Promise<DiscordSneakerData>;

  abstract isCurrentlyAvailableOnStore(
    requestObject: ArtwalkRestockAPIRequestData,
  ): Promise<boolean>;

  abstract setSneakerAvailability(
    requestObject: ArtwalkRestockAPIRequestData,
    availability: { available: boolean },
  ): Promise<void>;
}
