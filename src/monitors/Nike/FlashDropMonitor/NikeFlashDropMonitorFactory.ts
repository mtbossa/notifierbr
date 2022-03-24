import { Client } from "discord.js";
import fs from "fs";
import path from "path";
import NikeFlashDropsAPIRepository from "../repositories/implementations/NikeFlashDropsAPIRepository";
import { NikeAPISearchRequest } from "../models/requests/NikeAPISearchRequest";
import NikeFlashDropsMonitorService from "../services/NikeFlashDropMonitorService";
import NikeFlashDropsMonitor from "./NikeFlashDropMonitor";

export default function createNikeFlashDropMonitor(discordClient: Client) {
  const requestsObjects = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../../../scrape_data/monitors/Nike/searchs.json"),
      "utf-8",
    ),
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
