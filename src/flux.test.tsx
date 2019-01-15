import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { FluxComponent, StateStore, flux } from './';

interface TestState {
   value: string;
}

interface State {
   test1: TestState;
   test2: TestState;
   whatever: string;
}

class TestStore1 extends StateStore<TestState> {
   constructor() {
      super({ value: 'initial-1' });
   }
   handler<T>(action: number, _payload: T) {
      if (action == 1) {
         this.setState({ value: 'update-1' });
      }
   }
}

class TestStore2 extends StateStore<TestState> {
   constructor() {
      super({ value: 'initial-2' });
   }
   handler<T>(action: number, _payload: T) {
      if (action == 1) {
         this.setState({ value: 'update-2' });
      }
   }
}

const store1 = flux.subscribe(new TestStore1());
const store2 = flux.subscribe(new TestStore2());

class TestComponent extends FluxComponent<{}, State> {
   constructor(props: any) {
      super(props, { test1: store1, test2: store2, whatever: 'TEST' });
   }
   render() {
      return (
         <div onClick={this.do(1)}>
            {this.state.whatever}:{this.state.test1.value}:
            {this.state.test2.value}
         </div>
      );
   }
}

beforeEach(() => {
   store1.reset();
   store2.reset();
});

test('flux component should trigger store handler', () => {
   const cx = renderer.create(<TestComponent />);
   const div = cx.root.findByType('div');

   expect(div).toBeDefined();
   expect(store1.state).toHaveProperty('value', 'initial-1');
   expect(store2.state).toHaveProperty('value', 'initial-2');

   div.props.onClick();

   expect(store1.state).toHaveProperty('value', 'update-1');
   expect(store2.state).toHaveProperty('value', 'update-2');
});

test('component should receive updates from multiple stores', () => {
   const cx = renderer.create(<TestComponent />);
   const div = cx.root.findByType('div');

   expect(div.children.join('')).toBe('TEST:initial-1:initial-2');

   div.props.onClick();

   expect(div.children.join('')).toBe('TEST:update-1:update-2');
});

test('does not allow setting state values that are managed by stores', () => {
   const cx = renderer
      .create(<TestComponent />)
      .getInstance() as renderer.ReactTestInstance & TestComponent;
   let err: Error;
   // no error setting unmanaged state value
   cx.setState({ whatever: 'CHANGED' });
   try {
      // setting store managed state field should error
      cx.setState({ test1: { value: 'something else' } });
   } catch (e) {
      err = e;
   }
   expect(err).toBeDefined();
   expect(err.message).toBe(
      'Cannot set state for "test1" because it is managed by a flux store'
   );
});

test('removes handler when component dismounts', async () => {
   const cx = renderer
      .create(<TestComponent />)
      .getInstance() as renderer.ReactTestInstance & TestComponent;
   const count = store1.handlerCount;

   await cx.componentDidMount();
   expect(store1.handlerCount).toBe(count + 1);

   cx.componentWillUnmount();
   expect(store1.handlerCount).toBe(count);
});
