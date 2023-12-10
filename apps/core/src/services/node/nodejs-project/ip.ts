// var os = require('os');

// var networkInterfaces = os.networkInterfaces();

// console.log(networkInterfaces);


import { networkInterfaces } from 'node:os';
import rn_bridge from '../nodeBridge';
// import fetch from 'fetch';

const getInterfaces = () => {
  const nets = networkInterfaces();
  const results: { [key: string]: string[] } = {}; //Object.create(null); // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
      const netName = nets[name];
      if (!netName) continue;
      for (const net of netName) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
          const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
          if (net.family === familyV4Value && !net.internal) {
              if (!results[name]) {
                  results[name] = [];
              }
              results[name]?.push(net.address);
          }
      }
  }

  return results;
}

export const ipHandler = () => {
  rn_bridge.channel.post('ip', {
    event: 'NETWORK_INTERFACES',
    interfaces: getInterfaces(),
  });
}


// fetch('https://api.ipify.org?format=json')
//   .then(response => response.json())
//   .then(data => {
//     console.log('apiv4_getIpAddressgetIpAddress', data);
//     // Alert.alert('apiv4', JSON.stringify(data));
//   });

// console.log(results);