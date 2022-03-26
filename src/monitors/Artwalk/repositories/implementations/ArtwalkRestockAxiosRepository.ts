import UserAgent from "user-agents";
import axios from "axios";
import logger from "../../../../logger";
import { DiscordSneakerData } from "../../../../discord-bot/models/interfaces/DiscordSneakerData";
import prismaClient from "../../../../prismaClient";
import { ArtwalkRestockAPIRequestData } from "../../models/requests/ArtwalkRestockAPIRequestData";
import NikeRestockMonitorService from "../../services/ArtwalkRestockMonitorService";
import ArtwalkRestockRepositoryInterface from "../ArtwalkRestockRepositoryInterface";
import { ArtwalkAPISearchResponse } from "../../models/responses/ArtwalkAPISearchResponse";

export default class ArtwalkRestockAxiosRepositoryRepository extends ArtwalkRestockRepositoryInterface {
  constructor(
    private _nikeRestockMonitorService: NikeRestockMonitorService,
    private userAgent: UserAgent,
  ) {
    super();
  }

  async setSneakerAvailability(
    requestObject: ArtwalkRestockAPIRequestData,
    availability: { available: boolean },
  ) {
    try {
      await prismaClient.productsOnStore.update({
        where: { product_url: requestObject.url },
        data: {
          available: availability.available,
        },
      });
    } catch (e) {
      logger.error({ err: e });
    }
  }

  async isCurrentlyAvailableOnStore(requestObject: ArtwalkRestockAPIRequestData): Promise<boolean> {
    try {
      const productOnStore = await prismaClient.productsOnStore.findUnique({
        where: { product_url: requestObject.url },
      });

      return productOnStore!.available;
    } catch (e) {
      logger.error({ err: e });
      return false;
    }
  }

  async getSneaker(requestObject: ArtwalkRestockAPIRequestData): Promise<DiscordSneakerData> {
    const mappedDiscordSneakerData =
      this._nikeRestockMonitorService.mapNeededDiscordSneakerDataForDiscord({
        name: requestObject.sneakerName,
        url: requestObject.url,
        imgUrl: requestObject.imgUrl,
      });

    return mappedDiscordSneakerData;
  }

  public async isSneakerAvailable(sneaker: ArtwalkRestockAPIRequestData): Promise<boolean> {
    try {
      const reqWithNewUserAgent = {
        ...sneaker.request,
        "user-agent": this.userAgent.random().toString(),
      };
      const res = await axios(reqWithNewUserAgent);
      const { data } = res;
      const sneakerInfo: ArtwalkAPISearchResponse = data[0];

      const hasAnySizeAvailable = sneakerInfo.items.some((item) => {
        return item.sellers.some((seller) => seller.commertialOffer.IsAvailable);
      });

      return hasAnySizeAvailable; // if has class .hidden (true), means its available
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.log.error({ err: e });
        if (e.message === "Banned") {
          throw e;
        }
      }
      return false;
    }
  }
}
