# Classe Viva API (v2)

[![GitHub license](https://img.shields.io/github/license/alex-sandri/classeviva-api)](https://github.com/alex-sandri/classeviva-api/blob/master/LICENSE)

## Installation

```js
npm i classeviva-apiv2 --save
```

## Usage

### Importing

```js
const ClasseViva = require("classeviva-apiv2");
```

### Create session

```js
ClasseViva.establishSession("username", "password").then(session => {
  ...
});
```
