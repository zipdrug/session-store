import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';

const RESET = 'zipdrug-session-state/session/RESET';
const SET_READY = 'zipdrug-session-state/session/SET_READY';
const SET_SESSION = 'zipdrug-session-state/session/SET_SESSION';

export const actionTypes = {
  SET_SESSION,
};

const initialState = {
  // True after the store is hydrated
  ready: false,
  token: null,
  user: null,
};

export const reducer = ({ onReset }) =>
  handleActions({
    [RESET]: (state) => {
      onReset();

      return update(state, {
        token: { $set: null },
        user: { $set: null },
      });
    },

    [SET_READY]: state => update(state, {
      ready: { $set: true },
    }),

    [SET_SESSION]: (state, { payload: { token, user } }) =>
      update(state, {
        token: { $set: token },
        user: { $set: user },
      }),
  }, initialState);

export const reset = createAction(RESET);

export const setReady = createAction(SET_READY);

export const setSession = createAction(SET_SESSION,
({ token, user }) => ({ token, user }));
