import React, { useState } from 'react';
import { useContextSelector } from 'use-context-selector';
import { OrgContext } from '../../contexts/organization/orgContext';
import { ActivityIndicator, Button, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const NoOrgPage = () => {
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
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
  const acceptInvite = useContextSelector(OrgContext, data => data.acceptInvite);
  const cancellOrgJoin = useContextSelector(OrgContext, data => data.cancellOrgJoin);
  const invitationNotSent = useContextSelector(OrgContext, data => data.invitationNotSent);
  const orgLoaded = useContextSelector(OrgContext, data => data.orgLoaded);
  const sendingInvitation = useContextSelector(OrgContext, data => data.sendingInvitation);
  const sendingOrgInfo = useContextSelector(OrgContext, data => data.sendingOrgInfo);
  const waitingResponse = useContextSelector(OrgContext, data => data.waitingResponse);
  const waitingForInvite = useContextSelector(OrgContext, data => data.waitingForInvite);
  const ReceivedInviteToJoinOrg = useContextSelector(OrgContext, data => data.ReceivedInviteToJoinOrg);
  const addingNewMember = useContextSelector(OrgContext, data => data.addingNewMember);
  const waitingOrgData = useContextSelector(OrgContext, data => data.waitingOrgData);
  const orgInfoNotSent = useContextSelector(OrgContext, data => data.orgInfoNotSent);

  const invitingMember = useContextSelector(OrgContext, data => data.invitingMember);
  const invitationCode = useContextSelector(OrgContext, data => data.invitationCode);

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
      {!sendingInvitation ? null : (
        <Text>{`Enviando convite`}</Text>
      )}
      {!orgLoaded ? null : (
        <View style={{ justifyContent: 'space-between', flex: 1, padding: 20 }}>
          <Text>{`Dentro da org`}</Text>
          <View style={{ width: '100%', gap: 20 }}>
            <Button title={'Delete org'} onPress={deleteOrg} />
            <Button title={'Add new member'} onPress={newMember} />
          </View>
        </View>
      )}
      {!waitingForInvite ? null : (
        <View style={{ justifyContent: 'space-between', alignItems: 'center' ,flex: 1, padding: 20 }}>
          <Text>{`Aguardando convite`}</Text>
          <View style={{ width: '100%' }}>
            <Button title={'Cencelar'} onPress={cancellOrgJoin} />
          </View>
        </View>
      )}
      {!ReceivedInviteToJoinOrg || !invitingMember ? null : (
        <View style={{ justifyContent: 'space-between', alignItems: 'center' ,flex: 1, padding: 20 }}>
          <Text>{`Chegou convite`}</Text>
          <View style={{ borderWidth: 1, borderRadius: 8, padding: 4, paddingHorizontal: 20 }}>
            <Text>{`Enviado por:`}</Text>
            <Text>{`${invitingMember.name}`}</Text>
            <Text>{`@${invitingMember.username}`}</Text>
          </View>
          <View style={{ gap: 20 }}>
            <TextInput style={{ borderWidth: 1, borderRadius: 12, paddingLeft: 15 }} placeholder='codigo de convite' onChangeText={setCode} onSubmitEditing={() => acceptInvite(+code)} />
            <View style={{ width: '100%', flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 20, backgroundColor: 'blue', borderRadius: 12 }} onPress={cancellOrgJoin}>
                <Text style={{ fontSize: 16, color: 'white', alignSelf: 'center' }}>Cencelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 20, backgroundColor: 'blue', borderRadius: 12 }} onPress={() => acceptInvite(+code)}>
                <Text style={{ fontSize: 16, color: 'white', alignSelf: 'center' }}>Aceitar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {!addingNewMember ? null : (
        <View style={{ justifyContent: 'space-between', flex: 1, padding: 20 }}>
          <Text>{`Informe o ip do novo membro`}</Text>
          <View style={{ borderRadius: 8, borderWidth: 1 }}>
            <TextInput
              placeholder='Ex: 192.168.0.1'
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => {
                addMember(query);
                setQuery('');
              }}
              style={{ paddingLeft: 15 }}
            />
          </View>
        </View>
      )}

      {/* Esperando as informações da organização */}
      {!waitingOrgData ? null : (
        <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
          <View>
            <Text>{`Aguardando dados da organização`}</Text>
          </View>
          <View style={{ width: '100%' }}>
            {/* <Text>{`Informe o ip do novo membro`}</Text> */}
            {/* <Box flexDirection="column" borderStyle={'round'}>
              <TextInput value={query} onChange={setQuery} onSubmit={() => {
                  addMember(query);
                  setQuery('');
                }}
              />
            </Box> */}
            <TouchableOpacity style={{ paddingVertical: 15, backgroundColor: 'red', borderWidth: 1, borderRadius: 10 }} onPress={cancellOrgJoin}>
              <Text style={{ fontSize: 16, color: 'white', alignSelf: 'center'}}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Esperando as informações da organização */}
      {!orgInfoNotSent ? null : (
        <View style={{ flex: 1, justifyContent: 'space-between', padding: 20  }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20 }}>{`Não foi possivel enviar informações da organização`}</Text>
          </View>
          <View style={{ width: '100%' }}>
            {/* <Text>{`Informe o ip do novo membro`}</Text> */}
            {/* <Box flexDirection="column" borderStyle={'round'}>
              <TextInput value={query} onChange={setQuery} onSubmit={() => {
                  addMember(query);
                  setQuery('');
                }}
              />
            </Box> */}
            <TouchableOpacity style={{ paddingVertical: 15, backgroundColor: 'red', borderRadius: 10 }} onPress={cancellOrgJoin}>
              <Text style={{ fontSize: 16, color: 'white', alignSelf: 'center' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {!waitingResponse ? null : (
        <View style={{ justifyContent: 'space-between', flex: 1, padding: 20 }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <View>
              <Text style={{ fontSize: 22 }}>{`Convite enviado`}</Text>
              <Text style={{ fontSize: 18 }}>{`Informe o código de convite ao usuáraio:`}</Text>
              <View style={{ padding: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 30, fontWeight: '900', color: 'black' }}>{invitationCode}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={{ paddingVertical: 15, backgroundColor: 'red', borderRadius: 10 }} onPress={cancellOrgJoin}>
            <Text style={{ fontSize: 16, color: 'white', alignSelf: 'center' }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
