import { merge, is, removeItem } from '@toba/utility';
import { StateComponent } from '../jsx/stateful';
//import { statusPrefix } from "lib/i18n/language";
//import text from "lib/i18n/localize";
//import log from "lib/logger";

/**
 * Method for stores or simple components to handle actions dispatched from a
 * component.
 */
export type StateHandler = (action: number, data?: any) => void;

/**
 * Method for components to handle update dispatched from store.
 */
export type ViewHandler = () => void;

export interface State {
   [key: string]: any;
}

/**
 * Dispatcher in the standard Flux pattern. It subscribes stores and stateful
 * components to receive events from components.
 *
 * https://github.com/facebook/flux/tree/master/examples/flux-concepts
 */
export const flux = {
   /**
    * Global registry of state stores or stateful components that should receive
    * component action messages.
    */
   _handlers: [] as StateHandler[],

   /**
    * Dispatch action to every subscribed state store or component. If `data`
    * will be relayed to a service call then the service must define a matching
    * `struct` to unmarshall the JSON.
    */
   emit(action: number, data?: any) {
      this._handlers.forEach(fn => {
         fn(action, data);
      });
   },

   /**
    * Subscribe store or component to receive actions from components or other
    * stores.
    */
   subscribe<S extends StateStore<any> | StateComponent<any, any>>(
      stateful: S
   ): S {
      // bind creates a new function which must be reassigned if it's later to
      // be matched by remove()
      stateful.handler = stateful.handler.bind(stateful);
      this._handlers.push(stateful.handler);
      return stateful;
   },

   /**
    * Remove store or component subscription. This will usually only be used by
    * dismounting components while stores remain active for the life of the
    * application.
    */
   remove<S extends StateStore<any> | StateComponent<any, any>>(stateful: S) {
      removeItem(this._handlers, stateful.handler);
      return this;
   }
};

/**
 * State stores maintain and modify state based on dispatched action messages
 * then notify subscribed components when state has changed. Stores may call
 * services with Service IDs to update their state.
 *
 * Create as many state stores as are useful for avoiding duplicity and
 * complexity.
 */
export class StateStore<S extends State> {
   state: S;
   _initial: S;
   _handlers: ViewHandler[] = [];

   /**
    * Construct store with its initial state. If `reset()` is called, it will
    * return to this state.
    */
   constructor(initial: S) {
      this._initial = initial;
      this.state = merge(this._initial);
   }

   /**
    * Revert to initial state.
    */
   reset(): S {
      this.state = merge(this._initial);
      return this.state;
   }

   /**
    * Merge new with existing state and optionally emit change event.
    */
   update<K extends keyof S, P>(
      values:
         | ((prevState: Readonly<S>, props: P) => Pick<S, K> | S)
         | (Pick<S, K> | S),
      emitChange = true
   ) {
      this.state = merge(this.state, values);
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
   subscribe(fn: ViewHandler) {
      if (fn != null) {
         this._handlers.push(fn);
      }
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
   remove(fn: ViewHandler) {
      removeItem(this._handlers, fn);
      return this;
   }

   /**
    * Display server error code as a console message.
    */
   // error(msg: string): (errCode: number) => void {
   //    return function(errCode: number) {
   //       //const key = statusPrefix + errCode;
   //       //const err = is.defined(text, key) ? text[key] : errCode;
   //       //log.error(msg + ":", err);
   //    };
   // }

   /**
    * Invoke every view handler.
    */
   changed() {
      this._handlers.forEach(fn => {
         fn();
      });
   }
}
