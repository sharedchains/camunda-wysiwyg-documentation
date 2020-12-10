import {
  registerBpmnJSPlugin, registerClientExtension
} from 'camunda-modeler-plugin-helpers';

import BpmnExtensionModule from './bpmn-js-extension';
import WysiwygFragment from './react/WysiwygFragment';

registerBpmnJSPlugin(BpmnExtensionModule);

registerClientExtension(WysiwygFragment);
