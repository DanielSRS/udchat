import React from "react";
import { useContextSelector } from "use-context-selector"
import { ConfigContext } from "../../contexts/config/configContext"
import { VersionBox } from "../versionBox/versionBox";
import { logger } from "../../services/log/logService";

export const AppVersion = () => {
  const version = useContextSelector(ConfigContext, data => data.appVersion);
  logger.info(`app version from context: ${version}`);

  return (
    <VersionBox version={`from context: ${version}`} />
  );
}
