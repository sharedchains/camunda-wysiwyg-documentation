let exportPrefix = 'exportDocumentation';

export const TOGGLE_MODE_EVENT = exportPrefix + '.toggleMode';
export const UPDATE_ELEMENT_EVENT = exportPrefix + '.updateElement';
export const SET_DOCUMENTATION_ORDER_EVENT = exportPrefix + '.setDocumentationOrder';
export const UNSET_DOCUMENTATION_ORDER_EVENT = exportPrefix + '.unsetDocumentationOrder';
export const REMOVE_DOCUMENTATION_ORDER_EVENT = exportPrefix + '.removeDocumentationOrder';

let wysiwygPrefix = 'wysiwygEditor';

export const OPEN_WYSIWYG_EDITOR = wysiwygPrefix + '.open';
export const SAVE_WYSIWYG_EDITOR = wysiwygPrefix + '.saveData';