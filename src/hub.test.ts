import 'react';
import { StateStore, flux } from './';
import { State } from './state';

const mockHandler1 = jest.fn();
const mockHandler2 = jest.fn();

interface DumbState extends State {
   value: number;
}

class MockStore1 extends StateStore<DumbState> {
   constructor() {
      super({ value: 0 });
   }
   handler<T>(action: number, payload: T) {
      mockHandler1(action, payload);
   }
}

class MockStore2 extends StateStore<DumbState> {
   constructor() {
      super({ value: 0 });
   }
   handler(action, payload) {
      mockHandler2(action, payload);
   }
}

const store1 = new MockStore1();
const store2 = new MockStore2();

beforeEach(() => {
   flux.reset();
   mockHandler1.mockReset();
   mockHandler2.mockReset();
   expect(flux.handlers.length).toBe(0);
});

test('emits actions only to subscribed stores', () => {
   flux.subscribe(store1);
   expect(mockHandler1).toHaveBeenCalledTimes(0);
   expect(mockHandler2).toHaveBeenCalledTimes(0);
   flux.emit(99, { key: 'value' });
   expect(mockHandler1).toHaveBeenCalledTimes(1);
   expect(mockHandler1).toHaveBeenCalledWith(99, { key: 'value' });
   expect(mockHandler2).toHaveBeenCalledTimes(0);
});

test('emits actions to multiple stores', () => {
   flux.subscribe(store1);
   flux.subscribe(store2);
   expect(mockHandler1).toHaveBeenCalledTimes(0);
   expect(mockHandler2).toHaveBeenCalledTimes(0);
   flux.emit(33, { key: 'value' });
   expect(mockHandler1).toHaveBeenCalledTimes(1);
   expect(mockHandler2).toHaveBeenCalledTimes(1);
});
