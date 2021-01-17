# polka-1kv

Display of validators data from "Polkadot Thousand Validators Programme"

**polka-1kv** is a Node.js script which shows data from validators taking part
in the "Polkadot Thousand Validators Programme".

## Installation

This repo uses yarn package manager to organise the code.  
If you have not installed *yarn*, read on here:
<https://yarnpkg.com/getting-started/install>

``` bash
yarn install
```

## Configuration

The script uses the json configuration files in the config directory.
At the first start the config template \*.json.tpl is copied to \*.json.
The default configuration shows all validators participating in the program.
If you want to show only selected validators, you can define the list of
validators manually in the configuration (\*.json), e.g.:

``` json
{
  "url" : "https://polkadot.w3f.community/candidates",
  "names" : ["DrNo-sv-validator-1", "Ondin", "redpenguin"]
}
```

## Running the script

You can start the script with one of the following commands, depending on which
program you want to display the data from (polkadot or kusama):

``` bash
yarn polkadot
yarn kusama
```

## Authors

* GoldenEye

## Please support me

If you like my work, please consider to support me in the Polkadot/Kusama
networks and nominate my validators:

**Polkadot:**

1. [Validator GoldenEye](https://polkadot.subscan.io/account/14K71ECxvekU8BXGJmSQLed2XssM3HdBYQBuDUwHeUMUgBHk)
2. [Validator GoldenEye/GE2](https://polkadot.subscan.io/account/14gYRjn6fn5hu45zEAtXodPDbtaditK8twoWUXFi6DsLwd31)

**Kusama:**

1. [Validator GoldenEye](https://kusama.subscan.io/account/FiNuPk2iPirbKC7Spse3NuE9rWjzaQonZmk6wRvk1LcEU13)
2. [Validator GoldenEye/GE2](https://kusama.subscan.io/account/GcQXL1HgF1ZETZi3Tw3PoXGWeXbDpfsJrrgNgwxde4uoVaB)
3. [Validator GoldenEye/GE3](https://kusama.subscan.io/account/HjH4dvyPv2RQMA6XUQPqF37rZZ8seNjPQqYRSm3utdszsin)

## License

Apache 2.0 License  
Copyright © 2021 GoldenEye

**Disclaimer:
The tool is provided as-is. I cannot give a guarantee for accuracy and I assume NO LIABILITY.**
