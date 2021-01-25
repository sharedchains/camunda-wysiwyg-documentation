import WysiwygPropertiesProvider from './propertiesProvider/WysiwygPropertiesProvider';
import DisableModeling from './disableModeling/DisableModeling';
import ExportMode from './exportMode/ExportMode';

/**
 * A bpmn-js module, defining all extension services and their dependencies.
 *
 */
export default {
  __init__: ['WysiwygPropertiesProvider', 'DisableModeling', 'ExportMode'],
  WysiwygPropertiesProvider: ['type', WysiwygPropertiesProvider],
  DisableModeling: ['type', DisableModeling],
  ExportMode: ['type', ExportMode]
};
