// var os = require('os');

// var networkInterfaces = os.networkInterfaces();

// console.log(networkInterfaces);

import { rn_bridge, networkInterfaces } from './libs';
// import fetch from 'fetch';

export const getInterfaces = () => {
  const nets = networkInterfaces();
  const results: { [key: string]: string[] } = {}; //Object.create(null); // Or just '{}', an empty object

  const l = nets['']?.[0];
  type iv4 = { family: 'IPv4' };
  type b = NonNullable<typeof l>;
  type C = b & iv4;
  const v4NonInternal: { [key: string]: C[] } = {};
  const list: C[] = [];

  for (const name of Object.keys(nets)) {
    const netName = nets[name];
    if (!netName) {
      continue;
    }
    for (const net of netName) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
      if (net.family === familyV4Value && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        if (!v4NonInternal[name]) {
          v4NonInternal[name] = [];
        }
        results[name]?.push(net.address);
        v4NonInternal[name]?.push(net);
        list.push(net);
      }
    }
  }

  return {
    results,
    v4NonInternal,
    list,
  };
};

export const ipHandler = () => {
  rn_bridge.channel.post('ip', {
    event: 'NETWORK_INTERFACES',
    interfaces: getInterfaces().results,
  });
};

// fetch('https://api.ipify.org?format=json')
//   .then(response => response.json())
//   .then(data => {
//     console.log('apiv4_getIpAddressgetIpAddress', data);
//     // Alert.alert('apiv4', JSON.stringify(data));
//   });

// console.log(results);
