import * as React from 'react';
import { State, StateStore, ViewHandler } from './state';
import { flux } from './hub';

/**
 * Map some state keys to a state store which will manage that part of the
 * state.
 */
export type StoreHash<S> = { [K in keyof Partial<S>]: StateStore<S[K]> };

export type StoreMap<S> = Map<keyof S, StateStore<S[keyof S]>>;

/**
 * Implement Flux pattern with a component that automatically loads its state
 * from a single "store" and dispatches events to the store. This class only
 * satisfies components that render from a single state store. More complex
 * components may need to maintain private state amalgamated from multiple
 * state stores.
 *
 * Simpler components with unique state may use `StateComponent` instead.
 *
 * @see https://github.com/facebook/flux/tree/master/examples/flux-concepts
 */
export class FluxComponent<P, S extends State> extends React.PureComponent<
   P,
   S
> {
   /** Subscribed stores keyed to the state field they should manage. */
   private stores: StoreMap<S>;
   /** Change handlers keyed the same way as the `storeMap`. */
   private handlers: Map<keyof S, ViewHandler>;

   /**
    * Component is built with map of stores. For example, a cart component
    * might attach to both `user` and `order` state by receiving a `storeMap`
    * argument of `{ user: userStore, order: orderStore }`. This would cause
    * component state to include `user` and `order` fields managed by those
    * stores along with whatever other state the component manages internally.
    */
   constructor(props: P, storeKeys: StoreHash<S>, initialState?: S) {
      super(props);
      this.stores = new Map();
      this.handlers = new Map();

      const state: Partial<S> = {};

      Object.keys(storeKeys).forEach(key => {
         const s = storeKeys[key];
         this.stores.set(key, s);
         state[key] = s.load();
      });

      this.state = (initialState === undefined
         ? state
         : { ...initialState, ...state }) as S;
   }

   /**
    * Subscribe component to change events for each store. Whenever component
    * receives change event, it sets its state for that store's field to
    * whatever the current store state is.
    *
    * Call `super.setState()` to avoid the key check in the `setState` override
    * below.
    */
   componentDidMount() {
      this.stores.forEach((store, key) => {
         const fn: ViewHandler = () => {
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
    * Set state on store so it's the authority on state and doesn't get out of
    * sync with component state.
    */
   setState<K extends keyof S>(
      newState: Pick<S, K>,
      callback?: () => any
   ): void {
      Object.keys(newState).forEach(key => {
         if (this.stores.has(key)) {
            throw new ReferenceError(
               `cannot set state for "${key}" because it is managed by a flux store`
            );
         }
      });
      super.setState(newState, callback);
   }

   /**
    * Curry the normal `emit()` function so it can be assigned to an event
    * handler.
    * @example
    * <button onClick={this.do(Action.Login)}>Login</button>
    */
   do = <T extends {}>(action: number, payload?: T): (() => void) => () =>
      this.emit(action, payload);

   /**
    * Emit an action to be processed by zero or more stores. If the action
    * triggers a change in the bound store then `onChange()` will be
    * called to update component state.
    */
   emit = <T extends {}>(action: number, payload?: T) =>
      flux.emit(action, payload);
}
