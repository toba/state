import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { FluxComponent } from './flux';
import { makeTestStore, TestState } from './__mocks__';

const testStore = makeTestStore();

interface State {
   test: TestState;
   whatever: string;
}

class TestComponent extends FluxComponent<{}, State> {
   constructor(props: any) {
      super(props, { test: testStore });
   }
   render = () => <h1>Test</h1>;
}

test('something', () => {
   const component = renderer.create(<TestComponent />);
   const tree = component.toJSON();
   expect(tree).toMatchSnapshot();
});
