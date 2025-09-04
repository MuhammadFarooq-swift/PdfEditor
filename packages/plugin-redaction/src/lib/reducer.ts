import { RedactionState } from './types';
import {
  RedactionAction,
  ADD_PENDING,
  CLEAR_PENDING,
  END_REDACTION,
  REMOVE_PENDING,
  START_REDACTION,
  SELECT_PENDING,
  DESELECT_PENDING,
} from './actions';

export const initialState: RedactionState = {
  isRedacting: false,
  pending: {},
  selected: null,
};

export const redactionReducer = (state = initialState, action: RedactionAction): RedactionState => {
  switch (action.type) {
    case ADD_PENDING: {
      const next = { ...state.pending };
      for (const item of action.payload) {
        next[item.page] = (next[item.page] ?? []).concat(item);
      }
      return { ...state, pending: next };
    }

    case REMOVE_PENDING: {
      const { page, id } = action.payload;
      const list = state.pending[page] ?? [];
      const filtered = list.filter((it) => it.id !== id);
      const next = { ...state.pending, [page]: filtered };

      // if the removed one was selected → clear selection
      const stillSelected =
        state.selected && !(state.selected.page === page && state.selected.id === id);

      return { ...state, pending: next, selected: stillSelected ? state.selected : null };
    }

    case CLEAR_PENDING:
      return { ...state, pending: {}, selected: null };

    case SELECT_PENDING:
      return { ...state, selected: { page: action.payload.page, id: action.payload.id } };

    case DESELECT_PENDING:
      return { ...state, selected: null };

    case START_REDACTION:
      return { ...state, isRedacting: true };
    case END_REDACTION:
      return { ...state, pending: {}, selected: null, isRedacting: false };
    default:
      return state;
  }
};
