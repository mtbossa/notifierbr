import { Page, TimeoutError } from "puppeteer";
import UserAgent from "user-agents";
import logger from "../../../../logger";
import { DiscordSneakerData } from "../../../../discord-bot/models/interfaces/DiscordSneakerData";
import prismaClient from "../../../../prismaClient";
import { NikeRestockAPIRequestData } from "../../models/requests/NikeRestockAPIRequestData";
import NikeRestockMonitorService from "../../services/NikeRestockMonitorService";
import NikeRestockRepositoryInterface from "../NikeRestockRepositoryInterface";
import { DataLayerResponse } from "../../models/responses/DataLayerResponse";

export default class NikeRestockDataLayerRepository extends NikeRestockRepositoryInterface {
  constructor(
    private _nikeRestockMonitorService: NikeRestockMonitorService,
    private userAgent: UserAgent,
  ) {
    super();
  }

  async setSneakerAvailability(
    requestObject: NikeRestockAPIRequestData,
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

  async isCurrentlyAvailableOnStore(requestObject: NikeRestockAPIRequestData): Promise<boolean> {
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

  async getSneaker(requestObject: NikeRestockAPIRequestData): Promise<DiscordSneakerData> {
    const mappedDiscordSneakerData =
      this._nikeRestockMonitorService.mapNeededDiscordSneakerDataForDiscord({
        name: requestObject.sneakerName,
        url: requestObject.url,
        imgUrl: requestObject.imgUrl,
      });

    return mappedDiscordSneakerData;
  }

  public async isSneakerAvailable(
    sneaker: NikeRestockAPIRequestData,
    page: Page,
  ): Promise<boolean> {
    try {
      await page.setUserAgent(this.userAgent.random().toString());
      const wantedUrl = "https://www.nike.com.br/DataLayer/dataLayer";
      const [dataLayerRes] = await Promise.all([
        page.waitForResponse((res) => res.url() === wantedUrl, { timeout: 30000 }),
        page.goto(sneaker.url, { waitUntil: "domcontentloaded" }),
      ]);
      const dataLayerData: DataLayerResponse = await dataLayerRes.json();

      this.log.info(
        `[ ${sneaker.sneakerName} ] => dataLayerData.productInfo.availability = [ ${dataLayerData.productInfo.availability} ]`,
      );
      return dataLayerData.productInfo.availability === "yes";
    } catch (err) {
      this.log.error({ err });
      if (err instanceof TimeoutError) {
        throw new Error("Banned");
      }
      return false;
    }
  }
}
