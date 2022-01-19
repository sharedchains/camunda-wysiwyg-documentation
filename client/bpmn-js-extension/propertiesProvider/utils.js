import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

/**
 * Utility function to return the right business object for the documentation element
 * @param element
 * @param isProcessDocumentation
 * @returns {ModdleElement}
 */
export const getCorrectBusinessObject = function(element, isProcessDocumentation) {
  let businessObject = getBusinessObject(element);
  if (is(element, 'bpmn:Participant') && isProcessDocumentation) {
    businessObject = businessObject.processRef;
  }
  return businessObject;
};