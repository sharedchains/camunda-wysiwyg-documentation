import {
  registerBpmnJSPlugin, registerClientExtension
} from 'camunda-modeler-plugin-helpers';

import BpmnExtensionModule from './bpmn-js-extension';
import WysiwygFragment from './react/Documentation/WysiwygFragment';
import ExportToolbar from './react/ExportToolbar/ExportToolbar';

registerBpmnJSPlugin(BpmnExtensionModule);

registerClientExtension(WysiwygFragment);
registerClientExtension(ExportToolbar);
