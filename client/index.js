import {
  registerBpmnJSModdleExtension,
  registerBpmnJSPlugin, registerClientExtension
} from 'camunda-modeler-plugin-helpers';

import BpmnExtensionModule from './bpmn-js-extension';
import WysiwygFragment from './react/Documentation/WysiwygFragment';
import ExportToolbar from './react/ExportToolbar/ExportToolbar';
import DocViewerModule from 'bpmn-js-documentation-viewer';

import DocumentationModal from 'bpmn-js-documentation-viewer/lib/modal/ReactModalFragment';

import documentationModdle from './bpmn-js-extension/propertiesProvider/moddle/documentation.json';

registerBpmnJSPlugin(BpmnExtensionModule);
registerBpmnJSPlugin(DocViewerModule);
registerBpmnJSModdleExtension(documentationModdle);

registerClientExtension(WysiwygFragment);
registerClientExtension(DocumentationModal);
registerClientExtension(ExportToolbar);
