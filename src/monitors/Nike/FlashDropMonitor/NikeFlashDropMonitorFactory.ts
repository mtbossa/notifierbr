import { Client } from "discord.js";
import fs from "fs";
import NikeFlashDropsAPIRepository from "../repositories/implementations/NikeFlashDropsAPIRepository";
import { NikeAPISearchRequest } from "../models/requests/NikeAPISearchRequest";
import NikeFlashDropsMonitorService from "../services/NikeFlashDropMonitorService";
import NikeFlashDropsMonitor from "./NikeFlashDropMonitor";

export default function createNikeFlashDropMonitor(discordClient: Client) {
  const requestsObjects = fs.readFileSync(
    "../../../../scrape_data/monitors/Nike/searchs.json",
    "utf-8",
  ) as unknown as NikeAPISearchRequest[];

  const nikeFlashDropService = new NikeFlashDropsMonitorService();
  const flashDropRepository = new NikeFlashDropsAPIRepository(nikeFlashDropService);

  return new NikeFlashDropsMonitor(
    requestsObjects,
    flashDropRepository!,
    nikeFlashDropService,
    discordClient,
  );
}
