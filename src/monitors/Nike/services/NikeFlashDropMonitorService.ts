import moment from 'moment';
import logger from '../../../logger';
import { DiscordSneakerData } from '../../../discord-bot/models/interfaces/DiscordSneakerData';
import { prismaClient } from '../../../prismaClient';
import { Product } from '../models/responses/NikeAPISearchResponse';

export class NikeFlashDropsMonitorService {
  private _sneakersNamesToMonitor = [
    'air jordan 1 ',
    'air jordan 4 ',
    'dunk low',
    'dunk high',
    'nike x sacai',
    'sb dunk',
  ];

  public filterOnlyDesiredSneakers(products: Product[]): Product[] {
    return products
      .filter((product) =>
        // Remove all that we don't want
        this._sneakersNamesToMonitor.some((nameToMonitor) =>
          product.name.toLowerCase().includes(nameToMonitor)
        )
      )
      .filter((product) => !product.name.toLowerCase().includes('infantil')) // Removes infantis
      .filter(
        (product) => product.isAvailable === 1 && product.skus.length > 0
      ); // Removes not availables
  }

  public mapNeededDiscordSneakerDataForDiscord(
    sneaker: Product
  ): DiscordSneakerData {
    const { url, imgUrl } = this._getUrls(sneaker);
    return {
      name: sneaker.name,
      url,
      imgUrl,
      price: `R$ ${sneaker.price}`,
      discount: sneaker.isDiscount
        ? `R$ ${sneaker.discountedPrice}`
        : undefined,
      styleCode: sneaker.extraAttributes.skuReference[0],
    } as DiscordSneakerData;
  }

  private _getUrls(sneaker: Product) {
    const { originalId } = sneaker;
    let url;
    let imgUrl;
    for (const sku of sneaker.skus) {
      const styleNumber = sku.specs.color.split('_')[1];
      const styleCode = `${originalId}-${styleNumber}`;
      if (styleCode !== sneaker.extraAttributes.skuReference[0]) {
        continue;
      }
      url = `https://${sku.properties.url}`;
      imgUrl = this.changeUrlSlashesToHttps(sku.properties.images['310-x-310']);
      break;
    }

    return { url, imgUrl };
  }

  public changeUrlSlashesToHttps(string: string) {
    return string.replace('//', 'https://');
  }
}
