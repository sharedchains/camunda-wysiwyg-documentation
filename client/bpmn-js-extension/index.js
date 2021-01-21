import WysiwygPropertiesProvider from './propertiesProvider/WysiwygPropertiesProvider';

/**
 * A bpmn-js module, defining all extension services and their dependencies.
 *
 */
export default {
  __init__: ['WysiwygPropertiesProvider'],
  WysiwygPropertiesProvider: ['type', WysiwygPropertiesProvider]
};
