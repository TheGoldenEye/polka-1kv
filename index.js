/*jshint esversion: 6 */

const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs');
const getPackageVersion = require('@jsbits/get-package-version');
const {
  isNullOrUndefined
} = require('util');

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

    arr.sort(sortTotal);
    const maxIdx = arr.length;
    arr.forEach((elem, idx) => {
      if (all || cfg.names.includes(elem.name))
        outData(elem, idx + 1, maxIdx);
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
function outData(data, idx, maxIdx) {
  const valid = data.valid;

  out(valid, 'Index:        ', idx + '/' + maxIdx);
  out(valid, 'Name:         ', data.name);

  //  out(valid, 'Valid:', valid);
  if (!valid) {
    out(valid, 'Invalidity Reasons:', data.invalidityReasons);

    if (Array.isArray(data.validity))
      data.validity.forEach(elem => {
        if (!elem.valid)
          out(elem.valid, ' ' + elem.type + ':', elem.details == '' ? 'ok' : elem.details);
      });
  }

  out(valid, 'Stash:        ', data.stash);

  if (Exist(data.version))
    out(valid, 'Version:      ', data.version);

  if (Exist(data.updated))
    out(valid, 'Updated:      ', data.updated);

  if (Exist(data.discoveredAt))
    out(valid, 'Discovered:   ', TimeStr(data.discoveredAt));

  if (Exist(data.nominatedAt))
    out(valid, 'Nominated:    ', TimeStr(data.nominatedAt));

  if (Exist(data.onlineSince))
    out(valid, 'Online Since:', TimeStr(data.onlineSince));

  if (Exist(data.offlineSince))
    out(valid, 'Offline Since:', TimeStr(data.offlineSince));

  if (Exist(data.offlineAccumulated))
    out(valid, 'Offline Accum:', data.offlineAccumulated);

  if (Exist(data.rank))
    out(valid, 'Rank:         ', data.rank);
  if (Array.isArray(data.rankEvents))
    data.rankEvents.forEach(elem => {
      out(valid, ' ', TimeStr(elem.when) + ', StartEra:' + elem.startEra + ', ActiveEra:' + elem.activeEra);
    });

  if (Exist(data.location))
    out(valid, 'Location:     ', data.location);

  if (Exist(data.faults))
    out(valid, 'Faults:       ', data.faults);
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
    out(valid, 'Commission:   ', data.commission + '%');

  if (Exist(data.identity))
    out(valid, 'Identity:     ', IdentityStr(data.identity));

  if (Exist(data.inclusion))
    out(valid, 'Inclusion:    ', round(data.inclusion));

  if (Exist(data.score)) {
    out(valid, 'Score:', '');
    out(valid, ' Total:       ', round(data.score.total));
    out(valid, ' 28 Era Incl: ', round(data.score.spanInclusion) + '/60');
    out(valid, ' 84 Era Incl: ', round(data.score.inclusion) + '/40');
    out(valid, ' Discovered:  ', round(data.score.discovered) + '/5');
    out(valid, ' Nominated:   ', round(data.score.nominated) + '/10');
    out(valid, ' Rank:        ', round(data.score.rank) + '/5');
    out(valid, ' Self-Bonded: ', round(data.score.bonded) + '/50');
    out(valid, ' Faults:      ', round(data.score.faults) + '/5');
    out(valid, ' Offline:     ', round(data.score.offline) + '/2');
    out(valid, ' Location:    ', round(data.score.location) + '/40');
    out(valid, ' CouncilStake:', round(data.score.councilStake) + '/50');
    out(valid, ' Democracy:   ', round(data.score.democracy));
    out(valid, ' Unclaimed:   ', round(data.score.unclaimed));
  }

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
  return value !== undefined && value !== null;
}

//---------------------------------------------------------------------------------------------------------------------
function out(valid, title, data) {
  if (valid)
    console.log(title + ' ' + data);
  else
    console.log(chalk.red(title + ' ' + data));
}

//---------------------------------------------------------------------------------------------------------------------
// round v with n decimals
function round(v, n) {
  if (!n)
    n = 2;
  const p = Math.pow(10, n);
  return Math.round(v * p) / p;
}

//---------------------------------------------------------------------------------------------------------------------
// sort function by "total" value
// invalid records at the end
function sortTotal(a, b) {
  let aTotal = isNaN(a.total) ? -1 : a.total;
  let bTotal = isNaN(b.total) ? -1 : b.total;
  if (!a.valid)
    aTotal -= 200;
  if (!b.valid)
    bTotal -= 200;
  return bTotal - aTotal;
}