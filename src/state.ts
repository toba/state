import { mergeAll, clone, is, removeItem } from '@toba/tools';

export interface State {
   [key: string]: any;
}

export const empty: State = {};

/**
 * Method for state stores or simple components to handle actions dispatched
 * from a component.
 */
export type ActionHandler = <T>(action: number, data?: T) => void;

export interface StateManager {
   handler: ActionHandler;
}

/**
 * Method for components to handle update dispatched from store.
 */
export type ViewHandler = () => void;

/**
 * State stores maintain and modify state based on dispatched action messages
 * then notify subscribed components when state has changed. Stores may call
 * services with Service IDs to update their state.
 *
 * Create as many state stores as are useful for avoiding duplicity and
 * complexity.
 */
export class StateStore<S extends State> implements StateManager {
   /** Current state. */
   state: S;
   private initial: S;
   private handlers: ViewHandler[] = [];

   /**
    * Construct store with its initial state. If `reset()` is called, it will
    * return to this state.
    */
   constructor(initial: S) {
      this.initial = initial;
      this.state = clone(this.initial);
   }

   /**
    * Revert to initial state. Any values defined in current state but not set
    * in the initial state will remain as is. They won't be "unset".
    */
   reset(): S {
      this.state = clone(this.initial);
      return this.state;
   }

   /**
    * Merge new with existing state and optionally emit change event.
    * @param emitChange Whether to emit change after state is set (default `true`)
    */
   setState<K extends keyof S, P>(
      values:
         | ((prevState: Readonly<S>, props: P) => Pick<S, K> | S)
         | (Pick<S, K> | S),
      emitChange = true
   ) {
      this.state = mergeAll(this.state, values);
      if (emitChange) {
         this.changed();
      }
   }

   /**
    * Return current state, optionally resetting to initial value.
    */
   load(force = false): S {
      return force || is.empty(this.state) ? this.reset() : this.state;
   }

   /**
    * Add a view handler to be notified when state changes.
    */
   subscribe(fn: ViewHandler): this {
      if (is.callable(fn)) {
         this.handlers.push(fn);
      }
      return this;
   }

   /**
    * Override to handle messages sent from components.
    */
   handler<T>(_action: number, _data?: T) {
      return;
   }

   /**
    * Remove a view handler.
    */
   remove(fn?: ViewHandler): this {
      removeItem(this.handlers, fn);
      return this;
   }

   /**
    * Invoke every view handler.
    */
   changed() {
      this.handlers.forEach(fn => {
         fn();
      });
   }
}
