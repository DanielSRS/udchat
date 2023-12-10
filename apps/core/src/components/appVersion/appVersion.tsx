import React from "react";
import { useContextSelector } from "use-context-selector"
import { ConfigContext } from "../../contexts/config/configContext"
import { VersionBox } from "../versionBox/versionBox";

export const AppVersion = () => {
  const version = useContextSelector(ConfigContext, data => data.appVersion);

  return (
    <VersionBox version={`from context: ${version}`} />
  );
}
