# Classe Viva API (v2)

[![GitHub license](https://img.shields.io/github/license/alex-sandri/classeviva-api)](https://github.com/alex-sandri/classeviva-api/blob/master/LICENSE)

###### You can use this api to access your data on the Classe Viva's electronic register.

###### This is an unofficial api, and it is inspired on another github repository.

([Link](https://github.com/alex-sandri/classeviva-api))

## Installation

```js
npm i classeviva-apiv2 --save
```

## Usage

### Importing

```js
const ClasseViva = require("classeviva-apiv2").ClasseViva;
```

or

```js
const { ClasseViva } = require("classeviva-apiv2");
```

### Create session

```js
ClasseViva.establishSession("username", "password").then(async session => {
  ...
});
```

### Get profile informations

```js
const profile = await session.getProfile();
```

### Get student notes

```js
const notes = await session.getNotes();
```

### Get student marks

```js
const marks = await session.getMarks();
```

### Get today's topics

```js
const topics = await session.getToday();
```

###### You can even specify a date

<br/>

```js
const topics = await session.getToday(date);
```

### Get all assignments

```js
const assignments = await session.getAssignments();
```
