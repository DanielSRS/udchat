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


  const createOrgResponse = (item: { value: boolean }) => {
		if (item.value) {
      createOrg();
    }
	};

	const createOrgOptions = [
		{
			label: 'Sim',
			value: true
		},
		{
			label: 'Não',
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
            <Text>{`Deseja criar nova organização?`}</Text>
            <SelectInput items={createOrgOptions} onSelect={createOrgResponse} />
          </Box>
        </Box>
      )}
      {!orgCreationErr ? null : (
        <Text>{`ERRRRRROUUUU, como pode?`}</Text>
      )}
    </Box>
  );
}
