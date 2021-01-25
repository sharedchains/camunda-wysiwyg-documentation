import WysiwygPropertiesProvider from './propertiesProvider/WysiwygPropertiesProvider';
import DisableModeling from './disableModeling/DisableModeling';

/**
 * A bpmn-js module, defining all extension services and their dependencies.
 *
 */
export default {
  __init__: ['WysiwygPropertiesProvider', 'DisableModeling'],
  WysiwygPropertiesProvider: ['type', WysiwygPropertiesProvider],
  DisableModeling: ['type', DisableModeling]
};
