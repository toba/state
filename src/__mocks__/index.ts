import { State, StateStore, flux } from '../index';

export interface TestState extends State {
   value: boolean;
   text?: string;
}

export class TestStore extends StateStore<TestState> {
   lastAction: number;
   lastData: any;

   constructor() {
      super({
         value: false
      });
   }

   handler<T>(action: number, data?: T) {
      this.lastAction = action;
      this.lastData = data;
   }
}

export const makeTestStore = () => flux.subscribe(new TestStore());
