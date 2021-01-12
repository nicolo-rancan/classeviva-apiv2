# Classe Viva API (v2)

[![GitHub license](https://img.shields.io/github/license/alex-sandri/classeviva-api)](https://github.com/alex-sandri/classeviva-api/blob/master/LICENSE)

## Installation

`npm i classeviva-apiv2 --save`

## Usage

### Importing

`const ClasseViva = require("classeviva-apiv2");`

### Create session

```
ClasseViva.establishSession("username", "password").then(session => {
  ...
});
```
