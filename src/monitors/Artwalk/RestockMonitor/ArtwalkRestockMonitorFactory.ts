import { Client } from "discord.js";
import UserAgent from "user-agents";
import fs from "fs";
import path from "path";
import { ArtwalkRestockAPIRequestData } from "../models/requests/ArtwalkRestockAPIRequestData";
import ArtwalkRestockMonitorService from "../services/ArtwalkRestockMonitorService";
import ArtwalkRestockAxiosRepository from "../repositories/implementations/ArtwalkRestockAxiosRepository";
import ArtwalkRestockMonitor from "./ArtwalkRestockMonitor";

export default async function createArtwalkRestockMonitor(discordClient: Client) {
  const requestsObjects = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../../../scrape_data/monitors/Artwalk/restocks.json"),
      "utf-8",
    ),
  ) as unknown as ArtwalkRestockAPIRequestData[];
  const userAgent = new UserAgent({ deviceCategory: "desktop" });
  const nikeRestockMonitorService = new ArtwalkRestockMonitorService();
  const restockRepository = new ArtwalkRestockAxiosRepository(nikeRestockMonitorService, userAgent);
  const artwalkRestockMonitor = await new ArtwalkRestockMonitor(
    requestsObjects,
    restockRepository!,
    discordClient,
  ).setUpPuppeteer();

  return artwalkRestockMonitor;
}
