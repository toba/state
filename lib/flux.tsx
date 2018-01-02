import * as React from "react";
import { State, StateStore, flux } from "./hub";

/**
 * Implement Flux pattern with a component that automatically loads its state
 * from a single "store" and dispatches events to the store. This class only
 * satisfies components that render from a single state store. More complex
 * components may need to maintain private state amalgamated from multiple
 * state stores.
 *
 * Simpler components that with unique state may use `StateComponent` instead.
 *
 * https://github.com/facebook/flux/tree/master/examples/flux-concepts
 */
export class FluxComponent<P, S extends State> extends React.Component<P, S> {
   store: StateStore<S>;

   constructor(props: P, store: StateStore<S>) {
      super(props);
      this.store = store;
      this.state = store.load();
   }

   /**
    * Subscribe component to all store changes.
    */
   componentDidMount() {
      this.store.subscribe(this.onChange.bind(this));
   }
   componentWillUnmount() {
      this.store.remove(this.onChange);
   }

   /**
    * Update component state whenever store signals a change.
    */
   onChange() {
      super.setState(this.store.state);
   }

   /**
    * Set state on store so it's the authority on state and doesn't get out of
    * sync with component state.
    */
   setState<K extends keyof S>(
      state:
         | ((prevState: Readonly<S>, props: P) => Pick<S, K> | S)
         | (Pick<S, K> | S),
      _callback?: () => any
   ): void {
      this.store.update(state);
      this.onChange();
   }

   /**
    * Emit an action to be processed by zero or more stores. If the action
    * triggers a change in the bound store then `onChange()` will be
    * called to update component state.
    *
    * If `data` will be relayed to a service call then the service must define
    * a matching `struct` to unmarshall the JSON.
    */
   emit(action: number, data?: any) {
      flux.emit(action, data);
   }
}
