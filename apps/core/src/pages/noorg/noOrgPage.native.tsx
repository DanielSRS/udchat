import React from 'react';
import { useContextSelector } from 'use-context-selector';
import { OrgContext } from '../../contexts/organization/orgContext';
import { ActivityIndicator, Button, Text, View } from 'react-native';

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
  const invitationNotSent = useContextSelector(OrgContext, data => data.invitationNotSent);
  const orgLoaded = useContextSelector(OrgContext, data => data.orgLoaded);
  const sendingInvitation = useContextSelector(OrgContext, data => data.sendingInvitation);
  const sendingOrgInfo = useContextSelector(OrgContext, data => data.sendingOrgInfo);
  const waitingResponse = useContextSelector(OrgContext, data => data.waitingResponse);

  return (
    <View style={{ flex: 1 }}>
      {!creatingOrg ? null : (
        <View>
          <Text>Criando organization</Text>
          <ActivityIndicator />
        </View>
      )}
      {!findingOrg ? null : (
        <Text>{`🔎 Buscando organização`}</Text>
      )}
      {!(savingOrgFailure) ? null : (
        <Text>{`Falha ao salvar no storage`}</Text>
      )}
      {!noOrgFound ? null : (
        <View style={{ justifyContent: 'space-between', flex: 1, padding: 20 }}>
          <Text>{`❌ Nenhuma organização, como pode?`}</Text>
          <View style={{ gap: 20 }}>
            <Button title={'Create organization'} onPress={createOrg} />
            <Button title={'Join organization'} onPress={joinOrg} />
          </View>
        </View>
      )}
      {!orgCreationErr ? null : (
        <Text>{`ERRRRRROUUUU, como pode?`}</Text>
      )}
      {!orgLoaded ? null : (
        <View style={{ justifyContent: 'space-between', flex: 1, padding: 20 }}>
          <Text>{`Dentro da org`}</Text>
          <Button title={'Delete org'} onPress={deleteOrg} />
        </View>
      )}
    </View>
  );
}
