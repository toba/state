import { ViewHandler, flux } from "../";
import { makeTestStore } from "./testutil";

test("flux emit", () => {
   const testStore1 = makeTestStore();
   const testStore2 = makeTestStore();

   flux.emit(1);

   expect(testStore1.lastAction).toBe(1);
   expect(testStore1.lastData).toBeUndefined();
   expect(testStore2.lastAction).toBe(1);

   flux.emit(2, "data");

   expect(testStore1.lastAction).toBe(2);
   expect(testStore1.lastData).toBe("data");
   expect(testStore2.lastAction).toBe(2);

   // second store values shouldn't change after removal
   flux.remove(testStore2);
   flux.emit(3);

   expect(testStore1.lastAction).toBe(3);
   expect(testStore2.lastAction).toBe(2);
   expect(testStore2.lastData).toBe("data");
});

test("StateStore default state", () => {
   const testStore = makeTestStore();
   const state = testStore.load();

   expect(state).toBeDefined();
   expect(state.value).toBe(false);
   expect(state.text).toBeUndefined();
});

test("StateStore update state", () => {
   const testStore = makeTestStore();
   testStore.update({ text: "test" });
   const state = testStore.load();

   expect(state).toBeDefined();
   expect(state.value).toBe(false);
   expect(state.text).toBe("test");
});

test("StateStore view handler", () => {
   let called1 = false;
   let called2 = false;
   const testStore = makeTestStore();
   const handler1: ViewHandler = () => {
      called1 = true;
   };
   const handler2: ViewHandler = () => {
      called2 = true;
   };

   expect(called1).toBe(false);
   expect(called2).toBe(false);

   testStore.subscribe(handler1);
   testStore.subscribe(handler2);
   // manually emit change
   testStore.changed();

   expect(called1).toBe(true);
   expect(called2).toBe(true);

   called1 = false;
   called2 = false;

   // automatically emit change after update
   testStore.update({ value: true });
   expect(called1).toBe(true);
   expect(called2).toBe(true);
});
