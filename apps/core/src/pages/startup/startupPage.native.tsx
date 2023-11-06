import { Button, Text, View } from 'react-native';
import { generateAssimetricKeys } from '../../cripto';
import { isRight } from 'fp-ts/lib/Either';

export const Startup = () => {
  return (
    <View>
      <Text>Startup page</Text>
      <Button title={'generate keys'} onPress={async () => {
        console.log('gerando chaves');
        const keys = await generateAssimetricKeys();
        console.log('terminado');

        if (isRight(keys)) {
          console.log('keys');
          console.log(keys.right.publicKey);
          console.log(keys.right.privateKey);
          console.log('keus end');
          return;
        }

        console.error('Error to generate keys');
      }} />
    </View>
  );
};
