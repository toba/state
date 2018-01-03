[![npm package](https://img.shields.io/npm/v/@toba/state.svg)](https://www.npmjs.org/package/@toba/state)
[![Build Status](https://travis-ci.org/toba/state.svg?branch=master)](https://travis-ci.org/toba/state)
![Code style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)
[![Dependencies](https://img.shields.io/david/toba/state.svg)](https://david-dm.org/toba/state)
[![DevDependencies](https://img.shields.io/david/dev/toba/state.svg)](https://david-dm.org/toba/state#info=devDependencies&view=list)

# Usage

```
yarn add @toba/state
```

```
import * as React from "react";
import { State, StateStore, flux } from "@toba/state";

export interface UserState extends State {
   notifications: string[];
   signedIn: boolean;
   fullName?: string;
   photoURL?: string;
   status: Status;
}

class Store extends StateStore<UserState> {
   constructor() {
      super({
         notifications: [] as string[],
         signedIn: false,
         status: null
      });
   }
}

export const userStore = flux.subscribe(new Store());
```
