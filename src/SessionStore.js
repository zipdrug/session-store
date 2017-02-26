import { combineReducers, compose, createStore, applyMiddleware } from 'redux';
import { autoRehydrate, persistStore } from 'redux-persist';
import * as session from './session.js';

export default class SessionStore {
  constructor({
    enhancers = [],
    middleware = [],
    onReset,
    persist = true,
    persistOptions = {},
    reducers = {},
  }) {
    this.enhancers = enhancers;
    this.middleware = middleware;
    this.onReset = onReset;
    this.reducers = reducers;

    if (persist) {
      this.enhancers.unshift(autoRehydrate());
    }

    this._createStore();

    if (persist) {
      this._persist(persistOptions);
    }
  }

  _createReducer = () =>
    combineReducers({
      ...this.reducers,
      session: session.reducer({
        // Reset the store after "reset"" is dispatched.
        // Wrap in a setTimeout to prevent redux from complaining
        // that we dispatched within a reducer.
        onReset: () => setTimeout(this.reset, 0),
      }),
    })

  _createStore() {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    this.store = createStore(
      this._createReducer(),
      composeEnhancers(
        applyMiddleware(...this.middleware),
        ...this.enhancers,
      ),
    );
  }

  _handleHydrate = () => {
    this.getStore().dispatch(session.setReady());
  }

  _persist(options) {
    this._persistApi = persistStore(
      this.store,
      options,
      this._handleHydrate,
    );
  }

  _reset = () => {
    if (this.onReset) {
      this.onReset();
    }

    if (this._persistApi) {
      this._persistApi.purge();
    }
  }

  getToken() {
    const state = this.store.getState() || {};
    const { token } = state.session || {};
    return token || null;
  }

  getStore() {
    return this.store;
  }
}
