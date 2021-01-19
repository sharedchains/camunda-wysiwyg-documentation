import inherits from 'inherits';

import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';

import {find} from 'lodash';
import wysiwygDecorator from '../WysiwygDecorator';

export default function WysiwygPropertiesProvider(eventBus, commandStack, bpmnFactory, translate, propertiesProvider) {
    PropertiesActivator.call(this, eventBus);

    let camundaGetTabs = propertiesProvider.getTabs;
    propertiesProvider.getTabs = function (element) {

        var array = camundaGetTabs(element);
        let generalTab = find(array, { id: 'general' });
        let documentationTab = find(generalTab.groups, { id: 'documentation' });
        if (documentationTab) {
            documentationTab.entries = documentationTab.entries.map(entry => {
                return wysiwygDecorator(translate, eventBus, commandStack, bpmnFactory, entry);
            });
        }
        return array;
    }
}

inherits(WysiwygPropertiesProvider, PropertiesActivator);

WysiwygPropertiesProvider.$inject = ['eventBus', 'commandStack', 'bpmnFactory', 'translate', 'propertiesProvider'];