import * as React from 'react';
import renderer from 'react-test-renderer';
import { FluxComponent, StateStore } from '.';

interface MockState {
   text: string;
}
interface OneState {
   whatever: MockState;
}
interface TwoState {
   whocares: MockState;
}

class MockStore extends StateStore<MockState> {
   constructor() {
      super({ text: 'initial' });
   }
}

const store = new MockStore();

class MockComponent1 extends FluxComponent<any, OneState> {
   constructor(props) {
      super(props, { whatever: store });
   }
   render() {
      return <div id="c1">{this.state.whatever.text}</div>;
   }
}

class MockComponent2 extends FluxComponent<any, TwoState> {
   constructor(props) {
      super(props, { whocares: store });
   }
   render() {
      return <div id="c2">{this.state.whocares.text}</div>;
   }
}

test('can emit changes to multiple components', () => {
   const cx1 = renderer.create(<MockComponent1 />);
   const cx2 = renderer.create(<MockComponent2 />);
   const div1 = cx1.root.findByType('div');
   const div2 = cx2.root.findByType('div');

   expect(div1.children[0]).toBe('initial');
   expect(div2.children[0]).toBe('initial');

   store.setState({ text: 'updated' });

   expect(div1.children[0]).toBe('updated');
   expect(div2.children[0]).toBe('updated');
});

test('updating state does not change initial values', () => {
   store.reset();
   expect(store.state.text).toBe('initial');
   store.setState({ text: 'new value' });
   store.reset();
   expect(store.state.text).toBe('initial');
});

test('resetting only reverts known values', () => {
   store.setState({ text: 'new value', somethingNew: 'other' });
   store.reset();
   expect(store.state.text).toBe('initial');
   expect(store.state.somethingNew).toBe('other');
});
