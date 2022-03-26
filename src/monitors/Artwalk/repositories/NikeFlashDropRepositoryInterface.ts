import logger from "../../../logger";
import { DiscordSneakerData } from "../../../discord-bot/models/interfaces/DiscordSneakerData";
import { NikeAPISearchRequest } from "../models/requests/NikeAPISearchRequest";
import { Product } from "../models/responses/NikeAPISearchResponse";

export default abstract class NikeFlashDropRepositoryInterface {
  protected log = logger.child({ monitor: "<NikeFlashDropMonitor>" });

  abstract getNewSneakersOfThisSearch(
    requestObject: NikeAPISearchRequest,
  ): Promise<DiscordSneakerData[]>;

  abstract getCurrentSearchSneakersData(requestObject: NikeAPISearchRequest): Promise<Product[]>;

  abstract filterUniqueSneakers(products: Product[]): Promise<Product[]>;
}
