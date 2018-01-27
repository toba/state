import { State, StateStore, flux } from '../';

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

   handler(action: number, data?: any) {
      this.lastAction = action;
      this.lastData = data;
   }
}

export const makeTestStore = () => flux.subscribe(new TestStore());
