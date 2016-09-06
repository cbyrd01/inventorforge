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

http://localhost:8080/index.html
