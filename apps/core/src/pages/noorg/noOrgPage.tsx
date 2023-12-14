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
  const deleteOrg = useContextSelector(OrgContext, data => data.deleteOrg);
  const cancellOrgJoin = useContextSelector(OrgContext, data => data.cancellOrgJoin);
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

	const DeleteOrgOptions = [
    {
			label: 'Não fazer nada',
			value: false
		},
		{
			label: 'Deletar organização',
			value: true
		}
	];

  const onDeleteOrgResponse = (item: { value: boolean }) => {
		if (item.value) {
      return deleteOrg();
    }
	};

  const onCancellOrgJoining = (item: { value: boolean }) => {
		if (item.value) {
      return cancellOrgJoin();
    }
	};

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
        <Box flexDirection='column' justifyContent='space-between'>
          <Text>{`Dentro da org`}</Text>
          <SelectInput items={DeleteOrgOptions} onSelect={onDeleteOrgResponse} />
        </Box>
      )}
      {!waitingForInvite ? null : (
        <Box flexDirection='column' justifyContent='space-between'>
          <Text>{`Aguardando Convite`}</Text>
          <SelectInput items={[{ label: 'Cencelar', value: true }]} onSelect={onCancellOrgJoining} />
        </Box>
      )}
    </Box>
  );
}
