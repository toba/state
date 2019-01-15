import * as React from 'react';
import { flux } from './hub';
import { StateManager } from './state';

/**
 * StateComponent subscribes to Flux-style notifications without implementing a
 * separate state store. This is useful for very simple state that always
 * belongs to the same component such as the `router` component which has only
 * a path name for state.
 *
 * Use the `FluxComponent` for a separately managed state store that can be
 * incorporated into multiple components.
 */
export class StateComponent<P, S> extends React.PureComponent<P, S>
   implements StateManager {
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
    * Override to handle messages sent from other components.
    */
   handler<T>(_action: number, _data?: T) {
      return;
   }
}
