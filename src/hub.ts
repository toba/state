import { removeItem } from '@toba/tools';
import { StateComponent } from './stateful';
import { StateStore, StateManager, ActionHandler } from './state';

/**
 * Dispatcher in the standard Flux pattern. It subscribes stores and stateful
 * components to receive events from components.
 *
 * @see https://github.com/facebook/flux/tree/master/examples/flux-concepts
 */
export const flux = {
   /**
    * Global registry of state stores or stateful components that should receive
    * component action messages.
    */
   handlers: [] as ActionHandler[],

   /**
    * Dispatch action to every subscribed state store or component.
    */
   emit<T>(action: number, data?: T) {
      this.handlers.forEach(fn => {
         fn<T>(action, data);
      });
   },

   /**
    * Subscribe store or component to receive actions from components or other
    * stores.
    */
   subscribe<T extends StateManager>(stateful: T): T {
      // bind creates a new function which must be reassigned if it's later to
      // be matched by remove()
      stateful.handler = stateful.handler.bind(stateful);
      this.handlers.push(stateful.handler);
      return stateful;
   },

   /**
    * Remove all state store subscriptions (usually for testing).
    */
   reset() {
      flux.handlers = [];
      return this;
   },

   /**
    * Remove store or component subscription. This will usually only be used by
    * dismounting components while stores remain active for the life of the
    * application.
    */
   remove(stateful: StateManager) {
      removeItem(this.handlers, stateful.handler);
      return this;
   }
};
