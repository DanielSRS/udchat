import { useContextSelector } from 'use-context-selector';
import { OrgContext } from '../contexts/organization/orgContext';

export const useOrg = () => {
  const org = useContextSelector(OrgContext, data => data.org);

  return org;
};
