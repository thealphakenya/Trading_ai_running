const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const url = 'https://ip.decodo.com/json';
const proxyAgent = new HttpsProxyAgent(
  'http://sp0npcay87:9cFY6Cw83~xtybuzVo@isp.decodo.com:10001');

axios
  .get(url, {
    httpsAgent: proxyAgent,
  })
  .then((response) => {
    console.log(response.data);
  });