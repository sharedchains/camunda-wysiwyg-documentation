import { is } from 'bpmn-js/lib/util/ModelUtil';

import { getCorrectBusinessObject } from '../utils';
import { jsxs } from '@bpmn-io/properties-panel/preact/jsx-runtime';
import { useService } from 'bpmn-js-properties-panel';
import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import { OPEN_WYSIWYG_EDITOR, SAVE_WYSIWYG_EDITOR } from '../../../utils/EventHelper';

/**
 * Returns the extended documentation property field which opens the new documentation wysiwyg modal
 * @param element
 * @returns {*[]}
 */
export default function(element) {
  let entries = [
    {
      id: 'extended-documentation',
      element,
      component: ExtendedDocumentation,
      isEdited: isTextFieldEntryEdited
    }
  ];

  // Process Documentation when having a Collaboration Diagram
  if (is(element, 'bpmn:Participant')) {
    entries.push(
      {
        id: 'process-extended-documentation',
        element,
        component: ExtendedDocumentation, // TODO: Changes something
        isEdited: isTextFieldEntryEdited
      }
    );
  }

  return entries;
}

function ExtendedDocumentation(props) {
  const { element, id } = props;
  const isProcessDocumentation = id === 'process-extended-documentation';

  const eventBus = useService('eventBus');
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return isProcessDocumentation ? element.businessObject.processRef.extendedDocumentation : element.businessObject.extendedDocumentation || '';
  };

  const setValue = value => {
    return modeling.updateProperties(element, {
      extendedDocumentation: value
    });
  };

  return jsxs('div', {
    onClick: () => {

      eventBus.once(SAVE_WYSIWYG_EDITOR, 10000, function(event) {
        const { element: elem, data } = event;

        modeling.updateModdleProperties(elem, getCorrectBusinessObject(elem, isProcessDocumentation), { extendedDocumentation: data });

        return false;
      });

      eventBus.fire(OPEN_WYSIWYG_EDITOR, {
        element: element,
        data: getValue()
      });

      return true;
    },
    children: [
      TextFieldEntry({
        element,
        id,
        label: id === 'process-extended-documentation' ? translate('Process extended documentation') : translate('Element extended documentation'),
        getValue,
        setValue,
        debounce,
        disabled: true,
        description: translate('Click to edit documentation')
      })
    ]

  });

}