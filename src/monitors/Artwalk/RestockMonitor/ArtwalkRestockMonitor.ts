/* eslint global-require: 0 */
import { Client } from "discord.js";
import { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { secToMs, waitTimeout } from "../../../helpers/general";
import { ArtwalkRestockAPIRequestData } from "../models/requests/ArtwalkRestockAPIRequestData";
import Monitor from "../../Monitor";
import ArtwalkRestockRepositoryInterface from "../repositories/ArtwalkRestockRepositoryInterface";

export default class ArtwalkRestockMonitor extends Monitor {
  protected minTimeout: number = secToMs(10);

  protected maxTimeout: number = secToMs(30);

  private _browser?: Browser;

  private _currentRequest?: ArtwalkRestockAPIRequestData;

  private _currentRequestIndex: number = 0;

  private _amountOfRequests?: number;

  private _page?: Page;

  private _storeUrl: string = "https://www.artwalk.com.br";

  constructor(
    protected requestsObjects: ArtwalkRestockAPIRequestData[],
    protected nikeRestockRepository: ArtwalkRestockRepositoryInterface,
    private _discordClient: Client,
  ) {
    super();
    this._amountOfRequests = this.requestsObjects.length;
  }

  public async setUpPuppeteer() {
    puppeteer.use(StealthPlugin());
    puppeteer.use(
      require("puppeteer-extra-plugin-block-resources")({
        blockedTypes: new Set(["image", "stylesheet", "media", "font"]),
      }),
    );

    return this;
  }

  private async _startBrowser() {
    if (this._browser) this._browser.close();
    this._browser = await puppeteer.launch({ args: ["--incognito"] });
    [this._page] = await this._browser.pages();
    await this._page.reload();

    return this;
  }

  private _setCurrentIndexToFirstRequest() {
    this._currentRequestIndex = 0;
  }

  private _notPassedThroughAllRequests() {
    return this._currentRequestIndex! <= this._amountOfRequests! - 1;
  }

  private _setCurrentRequest() {
    this._currentRequest = this.requestsObjects[this._currentRequestIndex];
  }

  private async _handleRestock() {
    const sneaker = await this.nikeRestockRepository.getSneaker(this._currentRequest!);
    await this.nikeRestockRepository.setSneakerAvailability(this._currentRequest!, {
      available: true,
    });

    this._discordClient.emit("nikeRestock", this._discordClient, sneaker);
  }

  async check(): Promise<void> {
    try {
      do {
        await waitTimeout({ min: secToMs(10), max: secToMs(30) });
        this._setCurrentRequest();
        this.log.info(`Checking stock => [ ${this._currentRequest!.sneakerName} ]`);

        const isSneakerAvailable = await this.nikeRestockRepository.isSneakerAvailable(
          this._currentRequest!,
        );
        this._currentRequestIndex += 1;

        if (!isSneakerAvailable) {
          if (await this.nikeRestockRepository.isCurrentlyAvailableOnStore(this._currentRequest!)) {
            await this.nikeRestockRepository.setSneakerAvailability(this._currentRequest!, {
              available: false,
            });
          }
          continue;
        }
        if (await this.nikeRestockRepository.isCurrentlyAvailableOnStore(this._currentRequest!))
          continue;

        await this._handleRestock();
      } while (this._notPassedThroughAllRequests());

      this._setCurrentIndexToFirstRequest();
    } catch (err) {
      this.log.error({ err, currentRequest: this._currentRequest! });
      if (err instanceof Error) {
        if (err.message === "Banned") {
          this.log.warn(
            { err },
            `Got banned, stopped on index ${this._currentRequestIndex} on request ${
              this.requestsObjects[this._currentRequestIndex].sneakerName
            }.`,
          );
        }
      }
    } finally {
      this.reRunCheck();
    }
  }
}
