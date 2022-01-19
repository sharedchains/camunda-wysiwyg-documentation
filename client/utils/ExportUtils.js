import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

import { orderBy } from 'lodash';

/**
 * Utility class to get documentation from the element, in the right order
 */
class ExportUtils {

  constructor(elementRegistry) {
    this._elementRegistry = elementRegistry;
  }

  hasDocumentationOrder = (element) => {
    let bo = getBusinessObject(element);
    const docOrder = bo.get('order');
    return !!docOrder;
  };

  getStartEvents = () => {
    return orderBy(this._elementRegistry.filter((element) =>
      is(element, 'bpmn:StartEvent') &&
      element.type !== 'label' &&
      !is(element.parent, 'bpmn:SubProcess')), [ 'y', 'x' ], [ 'asc', 'asc' ]);
  };

  getAllElementsWithDocumentationOrder = () => {
    let elements = this._elementRegistry.filter(
      (element) => is(element, 'bpmn:FlowNode') && element.type !== 'label' && this.hasDocumentationOrder(element)
    );
    return orderBy(elements,[ function(element) {
      let bo = getBusinessObject(element);
      return bo.get('order');
    } ], [ 'asc' ]);
  };

  notExistsDocOrder = (id, newDocOrder) => {
    let array = this.getAllElementsWithDocumentationOrder();
    return array.every((element) => {
      let bo = getBusinessObject(element);
      let newDocOrderString = '' + newDocOrder;
      if (id) {
        return bo.order !== newDocOrderString || element.id === id;
      } else {
        return bo.order !== newDocOrderString;
      }
    });
  };

  /**
   * Navigates the process tree using dfs algorithm, returning the array of visited elements
   * @param startEvent
   * @returns {*[]}
   */
  navigateFromStartEvent = (startEvent) => {
    if (!startEvent) {
      return [];
    }

    function getElementOutgoings(element) {
      let outgoingSequenceFlows = element.outgoing.filter(outgoing => is(outgoing, 'bpmn:SequenceFlow'));
      return outgoingSequenceFlows.map(outgoing => outgoing.target);
    }

    const elementsArray = [];
    const visited = {};

    (function dfs(element) {
      if (!element) return null;
      visited[element.id] = true;
      elementsArray.push(element);
      if (is(element, 'bpmn:SubProcess')) {
        let subStartEvent = element.children.filter(function(child) {
          return is(child, 'bpmn:StartEvent');
        })[0];
        let subProcessElements = dfs(subStartEvent);
        elementsArray.concat(subProcessElements);
      }
      if (element.attachers && element.attachers.length > 0) {
        element.attachers.forEach(attached => {
          let boundaryElements = dfs(attached);
          elementsArray.concat(boundaryElements);
        });
      }
      getElementOutgoings(element).forEach(neighbour => {
        if (!visited[neighbour.id]) {
          return dfs(neighbour);
        }
      });
    })(startEvent);

    return elementsArray;
  };
}

export default ExportUtils;

export const DIAGRAM_FLOW = 'DIAGRAM_FLOW';
export const DOCUMENTATION_ORDER_FLOW = 'DOCUMENTATION_ORDER_FLOW';