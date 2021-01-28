import inherits from 'inherits';

import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';

import { find } from 'lodash';
import wysiwygDecorator from './wysiwygDecorator';
import { TOGGLE_MODE_EVENT } from '../../utils/EventHelper';
import documentationOrderProps from './parts/DocumentationOrderProps';

const MEDIUM_PRIORITY = 5000;

export default function WysiwygPropertiesProvider(eventBus, commandStack, bpmnFactory, translate, selection, propertiesProvider, elementRegistry) {
  PropertiesActivator.call(this, eventBus);

  const self = this;

  eventBus.on(TOGGLE_MODE_EVENT, MEDIUM_PRIORITY, function(context) {
    self.exportMode = context.exportMode;

    eventBus.fire('selection.changed', { oldSelection: [], newSelection: selection.get() });
  });

  let camundaGetTabs = propertiesProvider.getTabs;
  propertiesProvider.getTabs = function(element) {

    const array = camundaGetTabs(element);
    let generalTab = find(array, { id: 'general' });
    let documentationTab = find(generalTab.groups, { id: 'documentation' });
    if (documentationTab) {
      documentationTab.entries = documentationTab.entries.map(entry => {
        return wysiwygDecorator(translate, eventBus, commandStack, bpmnFactory, entry);
      });

      // Adding documentation order field
      documentationTab.entries.push(documentationOrderProps(translate, elementRegistry, eventBus, element));
    }
    if (self.exportMode) {
      generalTab.groups = [documentationTab];
      return [generalTab];
    }
    return array;
  };
}

inherits(WysiwygPropertiesProvider, PropertiesActivator);

WysiwygPropertiesProvider.$inject = ['eventBus', 'commandStack', 'bpmnFactory', 'translate', 'selection', 'propertiesProvider', 'elementRegistry'];