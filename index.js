/*jshint esversion: 6 */

const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs');
const getPackageVersion = require('@jsbits/get-package-version');

//---------------------------------------------------------------------------------------------------------------------
// main program:

const ver = getPackageVersion();
console.log('\n---------------------------------------------------------------');
console.log(`polka-1kv: v${ver}  Copyright © 2021 GoldenEye`);
console.log('---------------------------------------------------------------');
console.log('Data shown from:', TimeStr(new Date()));
console.log();

let param = process.argv.length < 3 ? 'polkadot.json' : process.argv[2];
if (!param.endsWith('.json'))
  param += '.json';
const cfg = LoadConfigFile(param);


axios.get(cfg.url)
  .then(response => {
    const arr = response.data;
    const all = cfg.names.length == 0;

    arr.sort(sortInclusion);

    arr.forEach(elem => {
      if (all || cfg.names.includes(elem.name))
        outData(elem);
    });

  })
  .catch(error => {
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      console.error('Status:', error.response.statusText, '(' + error.response.status + ')');
    } else if (error.request) {
      // The request was made but no response was received, `error.request` is an instance of XMLHttpRequest in the browser 
      // and an instance of http.ClientRequest in Node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request and triggered an Error
      console.log('Error:\n', error);
    }
  });



// --------------------------------------------------------------
// loads config.json and return config object
function LoadConfigFile(fileName) {
  const configFile = './config/' + fileName;
  const configFile_tpl = configFile + '.tpl';

  // first copy config from template, if not there
  if (!fs.existsSync(configFile))
    fs.copyFileSync(configFile_tpl, configFile);

  return JSON.parse(fs.readFileSync(configFile, 'utf8'));
}

//---------------------------------------------------------------------------------------------------------------------
function outData(data) {
  const valid = data.invalidityReasons == '';

  out(valid, 'Name:', data.name);
  if (!valid)
    out(valid, 'Invalidity Reasons:', data.invalidityReasons);
  out(valid, 'Stash:', data.stash);

  if (Exist(data.version))
    out(valid, 'Version:', data.version);

  if (Exist(data.updated))
    out(valid, 'Updated:', data.updated);

  if (Exist(data.discoveredAt))
    out(valid, 'Discovered:', TimeStr(data.discoveredAt));

  if (Exist(data.nominatedAt))
    out(valid, 'Nominated:', TimeStr(data.nominatedAt));

  if (Exist(data.onlineSince))
    out(valid, 'Online Since:', TimeStr(data.onlineSince));

  if (Exist(data.offlineSince))
    out(valid, 'Offline Since:', TimeStr(data.offlineSince));

  if (Exist(data.offlineAccumulated))
    out(valid, 'Offline Accumulated:', data.offlineAccumulated);

  if (Exist(data.rank))
    out(valid, 'Rank:', data.rank);
  if (Array.isArray(data.rankEvents))
    data.rankEvents.forEach(elem => {
      out(valid, ' ', TimeStr(elem.when) + ', StartEra:' + elem.startEra + ', ActiveEra:' + elem.activeEra);
    });

  if (Exist(data.faults))
    out(valid, 'Faults:', data.faults);
  if (Array.isArray(data.faultEvents))
    data.faultEvents.forEach(elem => {
      out(valid, ' ', TimeStr(elem.when) + ', Reason:' + elem.reason);
    });

  if (Array.isArray(data.unclaimedEras)) {
    const len = data.unclaimedEras.length;
    out(valid, 'UnclaimedEras:', len);
    if (len)
      out(valid, ' ', RangeStr(data.unclaimedEras));
  }

  if (Exist(data.commission))
    out(valid, 'Commission:', data.commission + '%');

  if (Exist(data.identity))
    out(valid, 'Identity:', IdentityStr(data.identity));

  if (Exist(data.inclusion))
    out(valid, 'Inclusion:', data.inclusion);

  console.log();
}

//---------------------------------------------------------------------------------------------------------------------
function TimeStr(timestamp) {
  if (!timestamp)
    return '-';

  const d = new Date(timestamp);
  return d.toLocaleString();
}

//---------------------------------------------------------------------------------------------------------------------
function RangeStr(arr) {

  function addRange(s, from, to) {
    if (from > 0) { // existing previous range
      if (s.length)
        s = s + ',';
      s = s + from;
      if (to > from)
        s = s + '-' + to;
    }
    return s;
  }

  let s = '';
  let from = -1;
  let to = -1;
  arr.forEach(elem => {
    const n = Number(elem);
    if (n == to + 1) // extend range first-last
      to = n;
    else {
      s = addRange(s, from, to);
      from = to = n;
    }
  });
  return addRange(s, from, to);
}

//---------------------------------------------------------------------------------------------------------------------
function IdentityStr(identity) {
  let s = identity.name;
  if (identity.sub) {
    s = s + '/' + identity.sub;
  }
  if (identity.verified)
    s = s + ' (verified)';
  return s;
}

//---------------------------------------------------------------------------------------------------------------------
function Exist(value) {
  return typeof value !== 'undefined';
}

//---------------------------------------------------------------------------------------------------------------------
function out(valid, title, data) {
  if (valid)
    console.log(title + ' ' + data);
  else
    console.log(chalk.red(title + ' ' + data));
}

//---------------------------------------------------------------------------------------------------------------------
function sortInclusion(a, b) {
  const aIncl = isNaN(a.inclusion) ? -1 : a.inclusion;
  const bIncl = isNaN(b.inclusion) ? -1 : b.inclusion;
  return aIncl - bIncl;
}
