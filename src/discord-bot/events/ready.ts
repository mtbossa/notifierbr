/* eslint import/no-import-module-exports: 0 */
import logger from "../../logger";

module.exports = {
  name: "ready",
  once: true,
  execute() {
    // Client is available
    logger.info("Discord Bot ready!");
  },
};
