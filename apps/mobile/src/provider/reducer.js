import {db} from '../../App';
import {SideMenuEvent} from '../utils/utils';
import {ACTIONS} from './actions';

export const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.NOTES:
      let notes = db.notes.group();

      return {
        ...state,
        notes: [...notes],
        loading: false,
      };
    case ACTIONS.THEME: {
      return {
        ...state,
        colors: {...action.colors},
      };
    }
    case ACTIONS.NOTEBOOKS: {
      let notebooks = [...db.notebooks.all];
      return {
        ...state,
        notebooks: notebooks,
      };
    }
    case ACTIONS.TRASH: {
      let trash = db.trash.all;

      return {
        ...state,
        trash: trash,
      };
    }
    case ACTIONS.PINNED: {
      let pinned = [...db.notes.pinned];
      return {
        ...state,
        pinned: pinned,
      };
    }
    case ACTIONS.TAGS: {
      let tagList = db.notes.tags;
      return {
        ...state,
        tags: [...tagList],
      };
    }
    case ACTIONS.FAVORITES: {
      let favorites = [...db.notes.favorites];

      return {
        ...state,
        favorites: [...favorites],
      };
    }
    case ACTIONS.SELECTION_MODE: {
      if (action.enabled) {
        SideMenuEvent.disable();
      } else {
        SideMenuEvent.enable();
      }

      return {
        ...state,
        selectionMode: action.enabled,
        selectedItemsList: [],
      };
    }
    case ACTIONS.SELECTED_ITEMS: {
      let selectedItems = [...state.selectedItemsList];
      if (selectedItems.includes(action.item)) {
        selectedItems.splice(selectedItems.indexOf(action.item), 1);
      } else {
        selectedItems.push(action.item);
      }

      return {
        ...state,
        selectedItemsList: selectedItems,
      };
    }
    case ACTIONS.CLEAR_SELECTION: {
      return {
        ...state,
        selectedItemsList: [],
      };
    }
    case ACTIONS.MODAL_NAVIGATOR: {
      return {
        ...state,
        preventDefaultMargins: action.enabled,
      };
    }
    case ACTIONS.LOGIN_NAVIGATOR: {
      return {
        ...state,
        isLoginNavigator: action.enabled,
      };
    }
    case ACTIONS.CURRENT_EDITING_NOTE: {
      return {
        ...state,
        currentEditingNote: action.id,
      };
    }
    default:
      throw new Error('unknown action type');
  }
};
