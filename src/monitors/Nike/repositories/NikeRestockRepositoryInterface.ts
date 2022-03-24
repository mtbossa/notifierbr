import { Page } from "puppeteer";
import logger from "../../../logger";
import { DiscordSneakerData } from "../../../discord-bot/models/interfaces/DiscordSneakerData";
import { NikeRestockAPIRequestData } from "../models/requests/NikeRestockAPIRequestData";

export abstract class NikeRestockRepositoryInterface {
  protected log = logger.child({ monitor: "[NikeRestockMonitor]" });

  abstract isSneakerAvailable(
    requestObject: NikeRestockAPIRequestData,
    page: Page,
  ): Promise<boolean>;

  abstract getSneaker(requestObject: NikeRestockAPIRequestData): Promise<DiscordSneakerData>;

  abstract isCurrentlyAvailableOnStore(requestObject: NikeRestockAPIRequestData): Promise<boolean>;

  abstract setSneakerAvailability(
    requestObject: NikeRestockAPIRequestData,
    availability: { available: boolean },
  ): Promise<void>;
}
