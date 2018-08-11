# inventorforge [![Build Status](https://travis-ci.org/InventorForgeMakerspace/inventorforge.svg?branch=master)](https://travis-ci.org/InventorForgeMakerspace/inventorforge)
InventorForge App

## To Build

1. Install dependencies

```bash
npm install -g ionic@beta
npm install -g typings
npm install -g gulp-cli
npm install
typings install
```

2. Build

```bash
ionic build
gulp compile-server
```

3. Serve

### Ionic client

```bash
ionic serve
```


### Node server

```bash
gulp server
```


## Running (non-development)

1. Start the server

```bash
node server/server.js
```

3. Access the page

(http://localhost:8080/index.html)

## Configuration

The main configuration is stored in the configuration files in the `config/` 
directory. Which file is used depends on the value of the `NODE_ENV` environment
variable. (i.e. setting `NODE_ENV` to "production" uses the `production.json` file.
The default environment is "development".

Configuration can also be specified via command line argument or environment 
variables.  See
[nconf](https://www.npmjs.com/package/nconf) for information on how these are
set.

Note: By default `serial:disable` is set to `true` in development.  To use on a 
sign locally, this must be set to false and `serial:port` and other options set 
appropriately.

# TODO
Remove refernces to door control
Simplify command structure
Replace serial with I2C
Add new modes
Investigate hold-down for updates