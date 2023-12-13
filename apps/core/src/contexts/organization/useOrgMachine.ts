import { useState, useEffect } from 'react';
import { interpret, StateFrom } from "xstate";
import { orgMachine } from '../../machines';
import { createOrgService, getOrgService, saveOrgToStorageService } from './orgContextHelper';
import { Organization } from '../../models/organization';

type MachineState = Pick<StateFrom<typeof orgMachine>, 'matches' | 'context' | 'value'>;

export const useOrgMachine = () => {
  const [actor] = useState(interpret(orgMachine.withConfig({
    services: {
      createOrg: createOrgService,
      getOrg: getOrgService,
      saveOrgToStorage: saveOrgToStorageService,
    }
  }).withContext({ organization: {} as Organization, orgInvitationCode: 0 })));
  const [state, setState] = useState<MachineState>();

  useEffect(() => {
    actor.subscribe((s) => {
      setState(s as MachineState);
    });
    actor.start();

    return () => {
      console.log('useOrgMachine unmount');
    }
  }, [actor]);

  return {
    state,
    send: actor.send,
  };
}
