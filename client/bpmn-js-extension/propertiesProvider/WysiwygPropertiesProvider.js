// TODO: remove lodash
// import { find } from 'lodash';

import { find } from 'min-dash';
import { TOGGLE_MODE_EVENT } from '../../utils/EventHelper';
import extendedDocumentationProps from './props/ExtendedDocumentationProps';
import documentationOrderProps from './props/DocumentationOrderProps';

const MEDIUM_PRIORITY = 5000;

/**
 * Our custom provider, which integrates the extended documentation property field and overrides properties in 'export mode'
 *
 * @param eventBus
 * @param commandStack
 * @param bpmnFactory
 * @param translate
 * @param selection
 * @param propertiesProvider
 * @param elementRegistry
 * @constructor
 */
export default class WysiwygPropertiesProvider {

  constructor(propertiesPanel, injector) {
    initEvents(injector);
    propertiesPanel.registerProvider(200, this);
  }

  /**
   * Return the groups provided for the given element.
   *
   * @param {DiagramElement} element
   *
   * @return {(Object[]) => (Object[])} groups middleware
   */
  getGroups(element) {
    return groups => {

      let documentationGroup = find(groups, entry => entry.id === 'documentation');
      if (documentationGroup) {
        documentationGroup.entries.push(...extendedDocumentationProps(element), ...documentationOrderProps(element));
      }

      return groups;
    };
  }
}

WysiwygPropertiesProvider.$inject = [ 'propertiesPanel', 'injector' ];

function initEvents(injector) {
  let eventBus = injector.get('eventBus');
  let selection = injector.get('selection');

  eventBus.on(TOGGLE_MODE_EVENT, MEDIUM_PRIORITY, function() {

    eventBus.fire('selection.changed', { oldSelection: [], newSelection: selection.get() });
  });
}