import React from "react";
import { useContextSelector } from "use-context-selector"
import { UserContext } from "../contexts/user/userContext"
import { OrgContext } from "../contexts/organization/orgContext";
import { StatsPage } from "../pages/stats/statsPage";

export const Router = () => {
  const userLoaded = useContextSelector(UserContext, data => data.userLoaded);
  const orgLoaded = useContextSelector(OrgContext, data => data.orgLoaded);

  if (!userLoaded) {
    return null;
  }

  if (!orgLoaded) {
    return null;
  }

  return <StatsPage />;
}