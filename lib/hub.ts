import { removeItem } from '@toba/tools';
import { StateComponent } from '../jsx/stateful';
import { StateStore } from './';

/**
 * Method for stores or simple components to handle actions dispatched from a
 * component.
 */
export type StateHandler = (action: number, data?: any) => void;

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
    * Dispatch action to every subscribed state store or component.
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
    * Remove all store subscriptions (usually for testing).
    */
   reset() {
      flux._handlers = [];
      return flux;
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
