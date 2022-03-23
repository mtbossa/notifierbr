import { Product } from '@prisma/client';
import { Client } from 'discord.js';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import axios, { AxiosRequestConfig } from 'axios';
import { secToMs } from '../../../helpers/general';
import { SneakerData } from '../../../models/interfaces/SneakerDataInterface';
import { prismaClient } from '../../../prismaClient';
import {
  ListItem,
  NikeShoesPageDataLayerResponse,
} from '../../../requests/nike/interfaces/responses/NikeShoesPageDataLayerResponse';
import { Monitor } from '../../Monitor';
import { NikeLookUpResponse } from '../../../requests/nike/interfaces/responses/NikeLookUpResponse';

const puppeteerExtraPluginBlockResources = require('puppeteer-extra-plugin-block-resources');

export default class NikeFlashDropPageMonitor extends Monitor {
  protected minTimeout: number = secToMs(10);

  protected maxTimeout: number = secToMs(60);

  private browser?: Browser;

  private page?: Page;

  private lookUpRequest: AxiosRequestConfig = {
    method: 'get',
    url: 'https://www.nike.com.br/ProductLookup',
    headers: {
      authority: 'www.nike.com.br',
      'sec-ch-ua':
        '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
      accept: '*/*',
      'x-requested-with': 'XMLHttpRequest',
      'sec-ch-ua-mobile': '?0',
      'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36',
      'sec-ch-ua-platform': '"Linux"',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      referer: 'https://www.nike.com.br/masculino/calcados',
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      cookie:
        '_clck=1klvjvu|1|f00|0; _clsk=1mvdmd5|1648033206087|1|0|h.clarity.ms/collect; bm_sz=2CE3E5CD0D76D2E939750E64DB1F0D52~YAAQz9hHaLiI7LR/AQAAxw9vtg//Ms1lEPoLZSX7bl10rffjYcv/QJKGhqrwChlXQHv8N5FgYewe1V9DE1cVM7QEOaV2OYhjk61TFR4KITUWEUjWNel0vxkhe8xB9unw//0AgAYpNgUr2XSfStija+/tNxLCChsQ9Vp2spRxratymepaGGb2KQQlYifOFRncfqggFFU1MHOCt+aaJ8SllCwn3vzZbBYBenttDLOBplHpBWa+EorpXdgkifXXbETpbBajCUeGkXq4XKdRAqgIjvpJYxPTu86iAdWu+00hDnHqzlhx~4273971~4408643; ak_bmsc=47E50D6DF64F91BE3604F9E92039C746~000000000000000000000000000000~YAAQz9hHaOaI7LR/AQAA9R5vtg+qiQfAWnpDKNu7WvuSQH+dRCaf1ZTVtdhW+TFXjwKH6b017/L0m5MvpENiaUHFlMAC7CgbzRdU1kTZzU5nLA9zugPOKsFb43oXfY0Q7qEq0GvQeZD57YMtnAlcqHNspLoH3GkHR3EnD3hNiD8UetccU6DQGBuzFkNDv5A9EVsiZ9PkVHbQJv0em7NsjSy6kp7Rsq5pCEdZx6DoBxuUmLnUSFzFdmkQ4MjQcI/aMO3TEM6J2Dp+AqDfQn2P232XKAjbtg9tdpSlt5H7sFSz4UWioZIawep5skmOZbQi9K5bLOdMWePXKnq+fApCIbXGqo/wtkLYO3Ik9nH7JAxfm1BW+IUVw8rP5kxAgRzxBQjYjgJv6LnHW1s=; RT="z=1&dm=nike.com.br&si=a8b741ff-7787-49ba-bcac-dcffa852c7eb&ss=l13g02qu&sl=3&tt=uxy&bcn=%2F%2F17de4c1d.akstat.io%2F"; nikega=GA1.4.1973044651.1648033211; nikega_gid=GA1.4.581700808.1648033211; _ga=GA1.3.1973044651.1648033211; _gid=GA1.3.506774458.1648033211; _gat_gtag_UA_142883149_1=1; AMCVS_F0935E09512D2C270A490D4D%40AdobeOrg=1; gpv_v70=nikecombr%3Eproductgrid%3Astandardgrid; pv_templateName=Product%20Wall; gptype_v60=productgrid%3Astandard; Campanha=; Midia=; s_cc=true; _pin_unauth=dWlkPU1qWmhNalpoTjJJdFpEY3pNQzAwTWpSaUxUZ3dPVFl0WWpnNU1qZzBNVEk0Tm1ZeA; _gat_gtag_UA_101374395_1=1; _gat_nikelaunchga=1; IFCSHOPSESSID=vbuudtb8rjuam2lp1gstlq8kgi; _abck=452C6BA176C538F7668C5CF2766D1F7B~0~YAAQz9hHaASJ7LR/AQAAqyZvtgfse/b6WJVTsK4WnAsnFsmC5UGHK9KRnhb7rzzhFdH18qr0xxoANg3Q2dKQNafa/h5yiJwI7qhgW4CUBvgfv0wZKvgzEYDNWIln/imC84CJhtfjV4hBGuUEbZsTUKv13hM36WQo9dtMS0CKzUnKgbjxnX61OYi/D2bozp1PGOVNfaukW/jz+qiv+G5eAs2VCDm2LhrIuorLT6/4ck+5vbgDZjY1896t6/vjH8xYGt8uz+w9OLWRVKuQKmyYWveuNPtfIgq7FPJkRJSI/iWjFX7IoYvX1/aGhy5XyTfyntut41gT+900yim/xyQKiAmx+oz5dx9RFyEUxI9H4VKX+VXA2rfD84Qd2A+UT+gMXGPn3Zbnlav2h/ra928iWExaBDp28ZZI~-1~||1-SEpenfGQaQ-1-10-1000-2||~-1; CSRFtoken=80ea63c39f52e84c6a0c652b697aa993; bm_sv=7FF51574562DF35135F26F10EEC2ABB9~PIrPxLHY1ehQJ3k4SHiL3j2ryN9HSVfdAOk44bgVfFoiwo4d9IRu+MMaCbeQvqWOwLk/AOxXFuWIKi52f0sa+OdJ6VewdSTLEhqzLK3qKsoYDSl7SyCJudmAoXdPACwF8VVQtdNsjPZzqQEeTxjTLS7e2yujrh98s7nBtXEsinM=; chaordic_browserId=0-U6s6wEczKTuVCnyeD0GGIIjOsSh5eQxBjm0b16480332121741752; chaordic_anonymousUserId=anon-0-U6s6wEczKTuVCnyeD0GGIIjOsSh5eQxBjm0b16480332121741752; chaordic_session=1648033212411-0.1044129692875162; chaordic_testGroup=%7B%22experiment%22%3Anull%2C%22group%22%3Anull%2C%22testCode%22%3Anull%2C%22code%22%3Anull%2C%22session%22%3Anull%7D; lx_sales_channel=%5B%221%22%5D; __pr.cvh=vYpM1d9ajS; _uetsid=69c5f560aa9811ec945923eba0865378; _uetvid=69c66f10aa9811ecb7818d7f715f3e77; user_unic_ac_id=1b6aab4f-c894-ea19-b2af-11b586309122; advcake_trackid=0114dfc7-adc2-a3fa-75bb-762b791dfdcd; _gcl_au=1.1.461986837.1648033213; AMCV_F0935E09512D2C270A490D4D%40AdobeOrg=-1124106680%7CMCIDTS%7C19075%7CMCMID%7C52373504735016051583409228089157002320%7CMCAAMLH-1648638011%7C4%7CMCAAMB-1648638011%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1648040411s%7CNONE%7CMCSYNCSOP%7C411-19082%7CvVersion%7C5.2.0; CSRFtoken=6767d46b5afce137ef36ae8a736cba9a; _abck=452C6BA176C538F7668C5CF2766D1F7B~-1~YAAQz9hHaDmK7LR/AQAAmopvtgeIvZrUUpbOF7LLtxbnFk+hWSKUj1cOXMn7EaaC8jlFzACMvQjXA10DRoCvS94aXZGFWYWzFGA61f9XKBbWutEbnFfHs8aWAaXPtane3cdqy2xzTL6+vsrd+Goh0VVpucsi37jaVFfTMoEd6Fk7TZwgAkl/7l1JL97Y6Y2Zn7Kqt/yWrhe4OLw/9pV8zGEv8qDuVZDmkVKrUrL84dqHF9tGwoMSANurP+wO3yiPlrCKIJhVuJ/AalJnGtVHLzrO8/bZb22lqTrqlshPkiqEmrzTKVlL8crRXZj8KWohHi+bHdvZEH/LJ61mFxvdl/PrXcBrWZ1o3HUGvWuHtZAuAsYGE0Cxb6Y45SDpkpOfEy79EqOICCF2ezgCTKjJOtuclNv/xP6h~0~-1~-1; ak_bmsc=9D35D5F182D7015BD441DC060B779DD4~000000000000000000000000000000~YAAQz9hHaIOF7LR/AQAAsD5utg8bc3Sv84Y24mXFuaru0SZWpqZF4oZpvj3S2YgtyS4BvHfzfujRP1KyIQBWTk8eFRSB6saVJO7pGxMGZS7qBcINKGReSj2xeiNp15jqt11oKc9FNfdUa5yQH5Wv3f0UI7sCcujrZ6vtdQUQEDuy4VWx0HnsuPMZghOliX3dsAZx28cfYczCqiuMOaIAYl1rAXShf9s7VQNFilpkSq+V5ptvf1/cvEub2lT76KGwILGnfPNMlLXgtNY+yPkAqBV0fyBJI4kFP6/E9exVLvsgpZrXtaBq6UNWRWc5Nf5mCveghKTxolNMtJ3XDfjIcFl/sbHMk30HwGiFRo8MaOSge90IKfdQr+7LWSzX; bm_sv=7FF51574562DF35135F26F10EEC2ABB9~PIrPxLHY1ehQJ3k4SHiL3j2ryN9HSVfdAOk44bgVfFoiwo4d9IRu+MMaCbeQvqWOwLk/AOxXFuWIKi52f0sa+OdJ6VewdSTLEhqzLK3qKspkzoc6bwAlEcDcPqJNThGKJE759tX4IrCzyQPrfgMvoQ/HMGhKNYj+OkpePL3u2po=; bm_sz=A945D96D5D3DD29006CC3F805D50E25A~YAAQz9hHaISF7LR/AQAAsD5utg8e/M1Up6rdA5oZvDCAlfz/o0m8HkxHNdVNH2igeYTBpKDtOlVKSGoDU/ciI4GqVo+yH4u4aabnZy7ARaNu6v69h8lAxD7fr+31lQTZ8eqXGOD6qEbzgJzWvejMSGxOQLStSKF+sSfxxVZl5O7de1b4GyjzzIXAZ3u1M9WNRQwIgc6JvsrtsYWYyKH9id+W8BhQLPBWMCMifBLzPWmF9sNHs+ikEOBTqrRRNXhaeSId/57LLlrr0qxj8cun1XYUrJJf+i8xKPvmXN06pGv00FtE~3752262~4404788',
    },
  };

  private sneakersNamesToMonitor = [
    'air jordan 1 ',
    'air jordan 4 ',
    'dunk low',
    'dunk high',
    'nike x sacai',
    'sb dunk',
  ];

  constructor(
    protected pages: string[],
    private userAgent: UserAgent,
    private discordClient: Client
  ) {
    super();
  }

  public async setUpPuppeteer() {
    puppeteer.use(StealthPlugin());
    puppeteer.use(
      puppeteerExtraPluginBlockResources()({
        blockedTypes: new Set(['image', 'stylesheet', 'media', 'font']),
      })
    );
    this.browser = await puppeteer.launch({});
    this.page = await this.browser.newPage();

    return this;
  }

  private async resetBrowser() {
    this.log.info('Got banned. Reseting browser');

    this.browser!.close();
    this.browser = await puppeteer.launch({});
    this.page = await this.browser.newPage();
    await this.page.reload();

    return this;
  }

  private async getPageDataLayerResponse(
    pageUrl: string
  ): Promise<NikeShoesPageDataLayerResponse> {
    const wantedUrl = 'https://www.nike.com.br/DataLayer/dataLayer';
    await this.page!.setUserAgent(this.userAgent.random().toString());
    const [res] = await Promise.all([
      this.page!.waitForResponse((httpRes) => httpRes.url() === wantedUrl, {
        timeout: 90000,
      }),
      this.page!.goto(pageUrl, { waitUntil: 'domcontentloaded' }),
    ]);
    return res.json();
  }

  private filterOnlyDesiredSneakers(listItems: ListItem[]): ListItem[] {
    return listItems
      .filter((listItem) =>
        // Remove all that we don't want
        this.sneakersNamesToMonitor.some((nameToMonitor) =>
          listItem.name.toLowerCase().includes(nameToMonitor)
        )
      )
      .filter((listItem) => !listItem.name.toLowerCase().includes('infantil')) // Removes infantis
      .filter((listItem) => listItem.availability !== 'no'); // Removes not availables
  }

  public async filterUniqueSneakers(
    listItems: ListItem[]
  ): Promise<ListItem[]> {
    const newSneakers: (ListItem | null)[] = await Promise.all(
      listItems.map(async (listItem) => {
        const styleCode = listItem.productNikeId;
        const foundProduct = await this.findUniqueProduct(styleCode);

        if (!foundProduct) {
          this.log.info(
            { APIProductName: listItem.name },
            'Product name not found on database, Flash Drop!'
          );
          await this.createProduct({
            productName: listItem.name,
            styleCode,
            brand: 'Nike',
          });
          return listItem;
        }
        return null;
      })
    );

    const newSneakersWithoutNulls: ListItem[] = newSneakers.filter(
      (sneaker): sneaker is ListItem => sneaker !== null
    );

    return newSneakersWithoutNulls;
  }

  public async createProduct(productInfo: {
    productName: string;
    styleCode: string;
    brand: string;
    releaseDate?: string;
  }): Promise<void> {
    try {
      const productCreated = await prismaClient.product.create({
        data: {
          name: productInfo.productName,
          brand: productInfo.brand,
          style_code: productInfo.styleCode,
          release_date: productInfo.releaseDate,
        },
      });
      this.log.info(
        { ProductCreateName: productCreated.name },
        'Product create!'
      );
    } catch (e) {
      if (e instanceof Error) {
        this.log.error({
          err: e,
          errorMsg: e.message,
          method: 'NikeFlashDropAPIRespository.createProduct',
          productInfo,
        });
      }
    }
  }

  public async findUniqueProduct(styleCode: string): Promise<Product | null> {
    try {
      return await prismaClient.product.findUnique({
        where: { style_code: styleCode },
      });
    } catch (e) {
      if (e instanceof Error) {
        this.log.error({
          err: e,
          errorMsg: e.message,
          method: 'NikeFlashDropAPIRespository.findUniqueProduct',
          styleCode,
        });
      }
      return null;
    }
  }

  private handleNewUniqueSneakers(newUniqueSneakers: SneakerData[]) {
    this.log.warn({ newUniqueSneakers }, 'New Unique Sneakers found');
    this.discordClient.emit('flashDrop', this.discordClient, newUniqueSneakers);
  }

  private async getUrls(
    sneakers: ListItem[]
  ): Promise<{ styleCode: string; url: string; imgUrl: string }[]> {
    const styles: { style: string; color: string }[] = sneakers.map(
      (sneaker) => {
        const [style, color] = sneaker.productNikeId.split('-');
        return { style, color };
      }
    );
    const search = styles.map((style) => style.style).join(',');
    const url = `${this.lookUpRequest.url}/${search}`;

    const test = { url, ...this.lookUpRequest };
    this.log.info(test);

    const res = await axios({ url, ...this.lookUpRequest });
    const { data: nikeLookUpResponse } = <{ data: NikeLookUpResponse[] }>res;

    let mappedUrls: { styleCode: string; url: string; imgUrl: string }[] = [];

    styles.forEach((style) => {
      const thisSneakerData = nikeLookUpResponse.find(
        (sneakerData) => sneakerData.id === style.style
      );
      const thisColorSku = thisSneakerData!.skus.find(
        (sku) => sku.specs.color.split('_')[1] === style.color
      );

      const ob = {
        url: thisColorSku!.url,
        imgUrl: thisColorSku!.images['380-x-380'],
        styleCode: `${style.style}-${style.color}`,
      };

      mappedUrls = [...mappedUrls, ob];
    });

    return mappedUrls;
  }

  private async mapNeededSneakerDataForDiscord(
    sneakers: ListItem[]
  ): Promise<SneakerData[]> {
    const urlObjs = await this.getUrls(sneakers);

    const mappedSneakers = sneakers.map((sneaker) => {
      const currentSneakerUrls = urlObjs.find(
        (urlOb) => urlOb.styleCode === sneaker.productNikeId
      );
      return {
        name: sneaker.name,
        url: currentSneakerUrls?.url,
        imgUrl: currentSneakerUrls?.imgUrl,
        price: `R$ ${sneaker.salePrice}`,
        styleCode: sneaker.productNikeId,
      } as SneakerData;
    });

    return mappedSneakers;
  }

  async check(): Promise<void> {
    try {
      await Promise.all([
        this.pages.forEach(async (pageUrl) => {
          const dataLayerResponse: NikeShoesPageDataLayerResponse =
            await this.getPageDataLayerResponse(pageUrl);
          const { listItems } = dataLayerResponse.pageInfo;
          const filteredListItems = this.filterOnlyDesiredSneakers(listItems);
          const newUniqueSneakers = await this.filterUniqueSneakers(
            filteredListItems
          );

          if (newUniqueSneakers.length === 0) return;

          const discordMappedNewUniqueSneakers =
            await this.mapNeededSneakerDataForDiscord(newUniqueSneakers);

          this.handleNewUniqueSneakers(discordMappedNewUniqueSneakers);
        }),
      ]);
    } catch (e) {
      this.log.error({ err: e });
    } finally {
      this.reRunCheck();
    }
  }
}
