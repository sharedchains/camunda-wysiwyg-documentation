import {
  registerBpmnJSPlugin, registerClientExtension
} from 'camunda-modeler-plugin-helpers';

import BpmnExtensionModule from './bpmn-js-extension';
import WysiwygFragment from './react/Documentation/WysiwygFragment';
import ExportButton from "./react/ExportButton/ExportButton";

registerBpmnJSPlugin(BpmnExtensionModule);

registerClientExtension(WysiwygFragment);
registerClientExtension(ExportButton);
