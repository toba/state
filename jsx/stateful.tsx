import * as React from "react";
import { flux } from "../lib/hub";

/**
 * StateComponent subscribes to Flux-style notifications without implementing a
 * separate state store. This is useful for very simple state that always
 * belongs to the same component such as the `router` component which has only
 * a path name for state.
 *
 * Use the `FluxComponent` for a separately managed state store that can be
 * incorporated into multiple components.
 */
export class StateComponent<P, S> extends React.Component<P, S> {
   constructor(props: P, initialState: S) {
      super(props);
      this.state = initialState;
   }

   componentDidMount() {
      flux.subscribe(this);
   }
   componentWillUnmount() {
      flux.remove(this);
   }

   /**
    * Handle messages sent from other components.
    */
   handler(_action: number, _data?: S) {
      return;
   }
}
