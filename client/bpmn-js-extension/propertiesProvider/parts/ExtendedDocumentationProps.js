import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';

import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getCorrectBusinessObject } from '../utils';

import { OPEN_WYSIWYG_EDITOR, SAVE_WYSIWYG_EDITOR } from '../../../utils/EventHelper';

/**
 * Returns the extended documentation property field which opens the new documentation wysiwyg modal
 * @param translate
 * @param eventBus
 * @param bpmnFactory
 * @param commandStack
 * @param providerElement
 * @returns {*[]}
 */
export default function(translate, eventBus, bpmnFactory, commandStack, providerElement) {
  const entries = [];

  let getValue = function(businessObject) {
    let documentation = businessObject && businessObject.extendedDocumentation;

    return { extendedDocumentation: documentation };
  };

  let setValue = function(businessObject, elem, values) {
    return cmdHelper.updateBusinessObject(elem, businessObject, values);
  };

  entries.push(entryFactory.textField(translate, {
    label: translate('Element extended documentation'),
    id: 'extendedDocumentation',
    modelProperty: 'extendedDocumentation',
    buttonLabel: '\u{1F589}',
    disabled: function() {
      return true;
    },
    buttonAction: {
      name: 'openRichTextEditor',
      method: function(elem, inputNode) {
        let bo = getCorrectBusinessObject(elem, false);

        eventBus.once(SAVE_WYSIWYG_EDITOR, 10000, function(event) {
          const { element, data, isProcessDocumentation } = event;
          let updateElement = setValue(getCorrectBusinessObject(element, isProcessDocumentation), element, { extendedDocumentation: data });
          if (updateElement) {
            commandStack.execute(updateElement.cmd, updateElement.context);
          }
          return false;
        });

        eventBus.fire(OPEN_WYSIWYG_EDITOR, {
          element: elem,
          node: inputNode,
          data: getValue(bo).extendedDocumentation,
          isProcessDocumentation: false
        });

        return true;
      }
    },
    buttonShow: {
      name: 'showRichTextEditor',
      method: function() { return true; }
    },
    get: function(element) {
      return getValue(getCorrectBusinessObject(element, false));
    },
    set: function() {
      return null;
    }
  }));

  // Process Documentation when having a Collaboration Diagram
  if (is(providerElement, 'bpmn:Participant')) {
    entries.push(entryFactory.textField(translate, {
      label: translate('Process extended documentation'),
      id: 'process-extendedDocumentation',
      modelProperty: 'extendedDocumentation',
      buttonLabel: '\u{1F589}',
      disabled: function() {
        return true;
      },
      buttonAction: {
        name: 'openRichTextEditor',
        method: function(elem, inputNode) {
          let bo = getCorrectBusinessObject(elem, true);

          eventBus.once(SAVE_WYSIWYG_EDITOR, 10000, function(event) {
            const { element, data, isProcessDocumentation } = event;
            let updateElement = setValue(getCorrectBusinessObject(element, isProcessDocumentation), element, { extendedDocumentation: data });
            if (updateElement) {
              commandStack.execute(updateElement.cmd, updateElement.context);
            }
            return false;
          });

          eventBus.fire(OPEN_WYSIWYG_EDITOR, {
            element: elem,
            node: inputNode,
            data: getValue(bo).extendedDocumentation,
            isProcessDocumentation: true
          });

          return true;
        }
      },
      buttonShow: {
        name: 'showRichTextEditor',
        method: function() { return true; }
      },
      get: function(element) {
        return getValue(getCorrectBusinessObject(element, true));
      },
      set: function() {
        return null;
      }
    }));
  }

  return entries;
}