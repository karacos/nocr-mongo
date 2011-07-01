# KaraCos NoCR using MongoDB

## Getting started

KaraCos-NoCR-MongoDB is a content repository implementing the  NoCR API, a JCR close, but asynchronous content repository API.

### Requirements

* mongodb

```
npm install mongodb
```

### Grab submodules

karacos-nocr-mongodb depends on [NoCR](https://github.com/NoCR/NoCR/), as a submodule:

```
git submodule init
git submodule  update
```

### Launching test suite

The testing framework is vows, install and run commands :

```
npm install vows
vows test/testSuite.js --spec ## This will show the actual features covered
```
