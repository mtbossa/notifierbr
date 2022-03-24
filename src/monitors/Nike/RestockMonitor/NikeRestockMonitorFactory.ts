import { Client } from "discord.js";
import UserAgent from "user-agents";
import fs from "fs";
import path from "path";
import { NikeRestockAPIRequestData } from "../models/requests/NikeRestockAPIRequestData";
import NikeRestockMonitorService from "../services/NikeRestockMonitorService";
import NikeRestockMonitor from "./NikeRestockMonitor";
import NikeRestockDataLayerRepository from "../repositories/implementations/NikeRestockDataLayerRepository";

export default async function createRestockDropMonitor(discordClient: Client) {
  const requestsObjects = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../../../scrape_data/monitors/Nike/restocks.json"),
      "utf-8",
    ),
  ) as unknown as NikeRestockAPIRequestData[];
  const userAgent = new UserAgent({ deviceCategory: "desktop" });
  const nikeRestockMonitorService = new NikeRestockMonitorService();
  const restockRepository = new NikeRestockDataLayerRepository(
    nikeRestockMonitorService,
    userAgent,
  );
  const nikeRestockMonitor = await new NikeRestockMonitor(
    requestsObjects,
    restockRepository!,
    discordClient,
  ).setUpPuppeteer();

  return nikeRestockMonitor;
}
