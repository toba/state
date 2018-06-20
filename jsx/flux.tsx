import * as React from 'react';
import { is } from '@toba/tools';
import { State, StateStore, flux } from '../lib/';

/**
 * Implement Flux pattern with a component that automatically loads its state
 * from a single "store" and dispatches events to the store. This class only
 * satisfies components that render from a single state store. More complex
 * components may need to maintain private state amalgamated from multiple
 * state stores.
 *
 * Simpler components that with unique state may use `StateComponent` instead.
 *
 * @see https://github.com/facebook/flux/tree/master/examples/flux-concepts
 */
export class FluxComponent<P, S extends State> extends React.Component<P, S> {
   /** Subscribed stores keyed to the state field they should manage. */
   private stores: Map<string, StateStore<any>>;
   /** Change handlers keyed the same way as the `storeMap`. */
   private handlers: Map<string, any>;

   /**
    * Component is built with map of stores. For example, a cart component
    * might attach to both `user` and `order` state by receiving a `storeMap`
    * argument of `{ user: userStore, order: orderStore }`. This would cause
    * component state to include `user` and `order` fields managed by those
    * stores along with whatever other state the component manages internally.
    */
   constructor(
      props: P,
      storeMap: { [key: string]: StateStore<any> },
      initialState: S
   ) {
      super(props);
      this.stores = new Map();
      this.handlers = new Map();

      Object.keys(storeMap).forEach(key => {
         const s = storeMap[key];
         this.stores.set(key, s);
         initialState[key] = s.load();
      });

      this.state = initialState;
   }

   /**
    * Subscribe component to change events for each store. Whenever component
    * receives change event, it sets its state for that store's field to
    * whatever the current store state is.
    */
   componentDidMount() {
      this.stores.forEach((store, key) => {
         const fn = () => {
            // call `super` to avoid the key check in the override above
            super.setState({ [key]: store.state });
         };
         this.handlers.set(key, fn);
         store.subscribe(fn.bind(this));
      });
   }

   /**
    * Remove component handler from each store.
    */
   componentWillUnmount() {
      this.stores.forEach((store, key) => {
         store.remove(this.handlers.get(key));
      });
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
      newState:
         | ((prevState: Readonly<S>, props: P) => Pick<S, K> | S)
         | (Pick<S, K> | S),
      callback?: () => any
   ): void {
      this.stores.forEach((_store, key) => {
         if (is.defined(newState, key)) {
            throw new ReferenceError(
               `cannot set state for "${key}" because it is managed by a flux store`
            );
         }
      });
      super.setState(newState, callback);
   }

   /**
    * Emit an action to be processed by zero or more stores. If the action
    * triggers a change in the bound store then `onChange()` will be
    * called to update component state.
    */
   emit(action: number, payload?: any) {
      flux.emit(action, payload);
   }
}
