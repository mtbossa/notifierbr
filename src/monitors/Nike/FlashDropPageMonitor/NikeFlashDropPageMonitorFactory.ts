import { Client } from 'discord.js';
import UserAgent from 'user-agents';
import NikeFlashDropPageMonitor from './NikeFlashDropPageMonitor';

export default async function createFlashDropPageMonitor(discordClient: Client) {
  const userAgent = new UserAgent({ deviceCategory: 'desktop' });
  const pages = [
    'https://www.nike.com.br/masculino/calcados',
    'https://www.nike.com.br/feminino/calcados',
  ];

  const nikeFlashDropPageMonitor = await new NikeFlashDropPageMonitor(
    pages,
    userAgent,
    discordClient
  ).setUpPuppeteer();

  return nikeFlashDropPageMonitor;
}
