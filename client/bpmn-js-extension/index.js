import WysiwygPropertiesProvider from './propertiesProvider/WysiwygPropertiesProvider';
import DisableModelingDoc from './disableModeling/DisableModeling';
import ExportMode from './exportMode/ExportMode';
import DocumentationOverlays from './documentationOverlays/DocumentationOverlays';

/**
 * A bpmn-js module, defining all extension services and their dependencies.
 *
 */
export default {
  __init__: [ 'WysiwygPropertiesProvider', 'DisableModelingDoc', 'ExportMode', 'DocumentationOverlays' ],
  WysiwygPropertiesProvider: [ 'type', WysiwygPropertiesProvider ],
  DisableModelingDoc: [ 'type', DisableModelingDoc ],
  ExportMode: [ 'type', ExportMode ],
  DocumentationOverlays: [ 'type', DocumentationOverlays ]
};
