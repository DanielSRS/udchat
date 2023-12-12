// @ts-nocheck

const { networkInterfaces } = require('os');
const rn_bridge = require('rn-bridge');

const getInterfaces = () => {
  const nets = networkInterfaces();
  const results = {}; //Object.create(null); // Or just '{}', an empty object

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

const ipHandler = () => {
  rn_bridge.channel.post('ip', {
    event: 'NETWORK_INTERFACES',
    interfaces: getInterfaces(),
  });
}

module.exports = {
  ipHandler,
}
