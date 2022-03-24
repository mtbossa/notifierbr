import { Client } from 'discord.js';
import _ from 'lodash';
import { secToMs, waitTimeout } from '../../../helpers/general';
import { NikeFlashDropRepositoryInterface } from '../repositories/NikeFlashDropRepositoryInterface';
import { NikeAPISearchRequest } from '../models/requests/NikeAPISearchRequest';
import { NikeFlashDropsMonitorService } from '../services/NikeFlashDropMonitorService';
import { Monitor } from '../Monitor';
import { Product } from '../models/responses/NikeAPISearchResponse';

export class NikeFlashDropsMonitor extends Monitor {
  protected minTimeout: number = secToMs(10);

  protected maxTimeout: number = secToMs(60);

  constructor(
    private _requestsObjects: NikeAPISearchRequest[],
    protected _flashDropRepository: NikeFlashDropRepositoryInterface,
    private _nikeFlashDropMonitorService: NikeFlashDropsMonitorService,
    private _discordClient: Client
  ) {
    super();
  }

  private _handleNewUniqueSneakers(newUniqueSneakers: Product[]) {
    if (newUniqueSneakers.length > 0) {
      this.log.warn({ newUniqueSneakers }, 'New Unique Sneakers found');
      this._discordClient.emit(
        'nikeFlashDrop',
        this._discordClient,
        newUniqueSneakers.map((product) =>
          this._nikeFlashDropMonitorService.mapNeededDiscordSneakerDataForDiscord(
            product
          )
        )
      );
    }
  }

  async check(): Promise<void> {
    try {
      for (const requestObject of this._requestsObjects) {
        await waitTimeout({ min: secToMs(3), max: secToMs(10) });
        this.log.info(`Getting search sneakers: ${requestObject.search}`);

        const sneakers =
          await this._flashDropRepository.getCurrentSearchSneakersData(
            requestObject
          );
        const filteredSneakers =
          this._nikeFlashDropMonitorService.filterOnlyDesiredSneakers(sneakers);
        const newUniqueSneakers =
          await this._flashDropRepository.filterUniqueSneakers(
            filteredSneakers
          );

        this._handleNewUniqueSneakers(newUniqueSneakers);
      }
    } catch (err) {
      this.log.error({ err });
    } finally {
      this.reRunCheck();
    }
  }
}
