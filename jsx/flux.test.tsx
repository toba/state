import * as React from "react";
import * as renderer from "react-test-renderer";
import { FluxComponent } from "../";
import { makeTestStore, TestState } from "../lib/testutil";

const testStore = makeTestStore();

class TestComponent extends FluxComponent<{}, TestState> {
   constructor(props: any) {
      super(props, testStore);
      // this.emit(Action.GetHostConfiguration);
      // this.selectTab = this.selectTab.bind(this);
   }
   render() {
      return <div />;
   }
}

test("something", () => {
   const component = renderer.create(<TestComponent />);
   const tree = component.toJSON();
   expect(tree).toMatchSnapshot();
   //expect(2).toBe(2);
});
