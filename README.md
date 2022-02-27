# uTran

## Introduction

### This is a P2P website, can connect two users
That means you can use it without server (download html and use in LAN 😉)

### Actually
This website just use servers twice at the beginning
- first: get your location in the internet (Signal Server)
- second: exchange some essential message for connect (ICE Candidate)

And when the connection is established, it doesn't need servers anymore

### Function
- P2P transfer text, picture and file(under 1GB)
- all the transfer process is encrypt
- no speed limit

## Running the website locally

clone
```bash
git clone https://github.com/abcsml/uTran.git
cd uTran
```
npm
```bash
npm install
node app.js
```

## Demo

site:[https://abcs.ml:9999/test](https://abcs.ml:9999/test)
open it and send to your friend
or you can use it connect different device

environment require
- the two Peer need under WIFI
- the browser better is Chrome or with Chrome kernel

## Technology

- webRTC
- Nodejs
- koa


