import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useContextSelector } from 'use-context-selector';
import { OrgContext } from '../../contexts/organization/orgContext';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';

export const NoOrgPage = () => {
  const [query, setQuery] = useState('');
  const findingOrg = useContextSelector(OrgContext, data => data.findingOrg);
  const noOrgFound = useContextSelector(OrgContext, data => data.noOrgFound);
  const creatingOrg = useContextSelector(OrgContext, data => data.creatingOrg);
  const savingOrgFailure = useContextSelector(OrgContext, data => data.savingOrgFailure);
  const orgCreationErr = useContextSelector(OrgContext, data => data.orgCreationErr);
  const createOrg = useContextSelector(OrgContext, data => data.createOrg);

  const addMember = useContextSelector(OrgContext, data => data.addMember);
  const newMember = useContextSelector(OrgContext, data => data.newMember);
  const joinOrg = useContextSelector(OrgContext, data => data.joinOrg);
  const deleteOrg = useContextSelector(OrgContext, data => data.deleteOrg);
  const cancellOrgJoin = useContextSelector(OrgContext, data => data.cancellOrgJoin);
  const invitationNotSent = useContextSelector(OrgContext, data => data.invitationNotSent);
  const orgLoaded = useContextSelector(OrgContext, data => data.orgLoaded);
  const sendingInvitation = useContextSelector(OrgContext, data => data.sendingInvitation);
  const sendingOrgInfo = useContextSelector(OrgContext, data => data.sendingOrgInfo);
  const waitingResponse = useContextSelector(OrgContext, data => data.waitingResponse);
  const waitingForInvite = useContextSelector(OrgContext, data => data.waitingForInvite);
  const ReceivedInviteToJoinOrg = useContextSelector(OrgContext, data => data.ReceivedInviteToJoinOrg);
  const addingNewMember = useContextSelector(OrgContext, data => data.addingNewMember);
  
  const invitingMember = useContextSelector(OrgContext, data => data.invitingMember);
  const invitationCode = useContextSelector(OrgContext, data => data.invitationCode);

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
			value: 1,
		},
		{
			label: 'Adicionar membro',
			value: 2,
		},
		{
			label: 'Deletar organização',
			value: 3,
		},
	];

  const onDeleteOrgResponse = (item: { value: number }) => {
    switch (item.value) {
      case 1:
        break;

      case 2:
        newMember();
        break;

      case 3:
        deleteOrg();
        break;
    
      default:
        break;
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
      {!sendingInvitation ? null : (
        <Text>{`Enviando convite`}</Text>
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
      {!ReceivedInviteToJoinOrg || !invitingMember ? null : (
        <Box justifyContent='space-between' alignItems='center' height={'100%'} width={'100%'} flexDirection='column'>
          <Text>{`Chegou convite`}</Text>
          <Box paddingLeft={2} paddingRight={2} padding={1} borderStyle={'round'}>
            <Text>{`Enviado por:`}</Text>
            <Text>{`${invitingMember.name}`}</Text>
            <Text>{`@${invitingMember.username}`}</Text>
          </Box>
          <Box width={'100%'}>
            <SelectInput
              items={[{ label: 'Cencelar', value: true }]}
              onSelect={({value}: { value: boolean }) => {
                if (value) cancellOrgJoin();
              }}
            />
          </Box>
        </Box>
      )}
      {!addingNewMember ? null : (
        <Box flexDirection='column' justifyContent='space-between'>
          <Text>{`Informe o ip do novo membro`}</Text>
          <Box
            flexDirection="column"
            borderStyle={'round'}
          >
            <TextInput value={query} onChange={setQuery} onSubmit={() => {
                addMember(query);
                setQuery('');
              }}
            />
          </Box>
        </Box>
      )}
      {!waitingResponse ? null : (
        <Box flexDirection='column' justifyContent='space-between'>
          <Box flexDirection='column'>
            <Text>{`Convite enviado`}</Text>
            <Text>{`Informe o código de convite ao usuáraio:`}</Text>
            <Box paddingLeft={2} paddingRight={2} borderStyle={'round'}>
              <Text>{invitationCode}</Text>
            </Box>
          </Box>
          {/* <SelectInput items={[{ label: 'Cencelar', value: true }]} onSelect={onCancellOrgJoining} /> */}
        </Box>
      )}
    </Box>
  );
}
