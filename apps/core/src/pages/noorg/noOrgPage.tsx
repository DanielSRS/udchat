import React from 'react';
import { Box, Text } from 'ink';
import { useContextSelector } from 'use-context-selector';
import { OrgContext } from '../../contexts/organization/orgContext';
import SelectInput from 'ink-select-input';


export const NoOrgPage = () => {
  const findingOrg = useContextSelector(OrgContext, data => data.findingOrg);
  const noOrgFound = useContextSelector(OrgContext, data => data.noOrgFound);
  const creatingOrg = useContextSelector(OrgContext, data => data.creatingOrg);
  const savingOrgFailure = useContextSelector(OrgContext, data => data.savingOrgFailure);
  const orgCreationErr = useContextSelector(OrgContext, data => data.orgCreationErr);
  const createOrg = useContextSelector(OrgContext, data => data.createOrg);

  const addMember = useContextSelector(OrgContext, data => data.addMember);
  const joinOrg = useContextSelector(OrgContext, data => data.joinOrg);
  const invitationNotSent = useContextSelector(OrgContext, data => data.invitationNotSent);
  const orgLoaded = useContextSelector(OrgContext, data => data.orgLoaded);
  const sendingInvitation = useContextSelector(OrgContext, data => data.sendingInvitation);
  const sendingOrgInfo = useContextSelector(OrgContext, data => data.sendingOrgInfo);
  const waitingResponse = useContextSelector(OrgContext, data => data.waitingResponse);
  const waitingForInvite = useContextSelector(OrgContext, data => data.waitingForInvite);


  const createOrgResponse = (item: { value: boolean }) => {
		if (item.value) {
      return createOrg();
    }
    return joinOrg();
	};

	const createOrgOptions = [
		{
			label: 'Criar nova organização',
			value: true
		},
		{
			label: 'Entrar numa organização',
			value: false
		},
	];

  return (
    <Box>
      {!creatingOrg ? null : (
        <Text>{`>>>`}</Text>
      )}
      {!findingOrg ? null : (
        <Text>{`🔎 Buscando organização`}</Text>
      )}
      {!(savingOrgFailure) ? null : (
        <Text>{`Falha ao salvar no storage`}</Text>
      )}
      {!noOrgFound ? null : (
        <Box flexDirection='column' justifyContent='space-between'>
          <Text>{`❌ Nenhuma organização, como pode?`}</Text>
          <Box flexDirection='column'>
            <Text>{`Crie uma organização ou entre na organização de outro usuário`}</Text>
            <SelectInput items={createOrgOptions} onSelect={createOrgResponse} />
          </Box>
        </Box>
      )}
      {!orgCreationErr ? null : (
        <Text>{`ERRRRRROUUUU, como pode?`}</Text>
      )}
      {!orgLoaded ? null : (
        <Text>{`Dentro da org`}</Text>
      )}
      {!waitingForInvite ? null : (
        <Text>{`Aguardando Convite`}</Text>
      )}
    </Box>
  );
}
