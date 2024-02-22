import { useContextSelector } from 'use-context-selector';
import { UserContext } from '../contexts/user/userContext';

export const useUser = () => {
  const user = useContextSelector(UserContext, data => data.user);

  return user;
};
