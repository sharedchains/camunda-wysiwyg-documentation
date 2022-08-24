import ExportUtils from '../../../utils/ExportUtils';

import { UPDATE_ELEMENT_EVENT, REMOVE_DOCUMENTATION_ORDER_EVENT } from '../../../utils/EventHelper';
import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

/**
 * Returns the new documentation order field
 * @param element
 * @returns {*}
 */
export default function(element) {
  return [
    {
      id: 'extended-documentation-order',
      element,
      component: DocumentationOrder,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function DocumentationOrder(props) {
  const { element, id } = props;

  const eventBus = useService('eventBus');
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const elementRegistry = useService('elementRegistry');

  const getValue = () => {
    return element.businessObject.order || '';
  };

  const setValue = value => {

    if (value !== undefined) {
      if (value) {
        eventBus.fire(UPDATE_ELEMENT_EVENT, {
          element: element,
          order: value
        });
      } else {
        eventBus.fire(REMOVE_DOCUMENTATION_ORDER_EVENT, {
          element: element
        });
      }
    }

    return modeling.updateProperties(element, {
      order: value
    });
  };

  const validate = value => {
    let utils = new ExportUtils(elementRegistry);
    if (value) {
      if (!/^(\d+\.)*(\d+)$/.test(value)) {
        return translate('Value must be a number, optionally split by dots');
      }
      if (!utils.notExistsDocOrder(element.id, value)) {
        return translate('Value already exists');
      }
    }
  };

  return TextFieldEntry({
    element,
    id,
    label: translate('Documentation order'),
    getValue,
    setValue,
    debounce,
    validate
  });

}
