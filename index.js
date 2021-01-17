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
console.log('---------------------------------------------------------------\n');

let param = process.argv.length < 3 ? 'polkadot.json' : process.argv[2];
if (!param.endsWith('.json'))
  param += '.json';
const cfg = LoadConfigFile(param);


axios.get(cfg.url)
  .then(response => {
    const arr = response.data;
    const all = cfg.names.length == 0;

    arr.forEach(elem => {
      if (all || cfg.names.includes(elem.name))
        outData(elem);
    });

  })
  .catch(error => {
    console.log(error);
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
  out(valid, 'Version:', data.version);
  out(valid, 'Updated:', data.updated);
  out(valid, 'Discovered:', TimeStr(data.discoveredAt));
  out(valid, 'Nominated:', TimeStr(data.nominatedAt));
  out(valid, 'Online Since:', TimeStr(data.onlineSince));
  out(valid, 'Offline Since:', TimeStr(data.offlineSince));
  out(valid, 'Offline Accumulated:', data.offlineAccumulated);
  out(valid, 'Rank:', data.rank);
  data.rankEvents.forEach(elem => {
    out(valid, ' ', TimeStr(elem.when) + ', StartEra:' + elem.startEra + ', ActiveEra:' + elem.activeEra);
  });
  out(valid, 'Faults:', data.faults);
  data.faultEvents.forEach(elem => {
    out(valid, ' ', TimeStr(elem.when) + ', Reason:' + elem.reason);
  });
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
function out(valid, title, data) {
  if (valid)
    console.log(title + ' ' + data);
  else
    console.log(chalk.red(title + ' ' + data));
}