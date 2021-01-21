import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

class exportUtils {

  constructor(elementRegistry) {
    this._elementRegistry = elementRegistry;
  }

  hasDocumentation = (element) => {
    let bo = getBusinessObject(element);
    const documentation = bo.get('documentation');
    return documentation.length > 0;
  };

  getStartEvents = () => {
    return this._elementRegistry.filter((element) =>
      is(element, 'bpmn:StartEvent') &&
      element.type !== 'label' &&
      !is(element.parent, 'bpmn:SubProcess'));
  };

  getAllElementsWithDocumentation = () => {
    return this._elementRegistry.filter(
      (element) => is(element, 'bpmn:FlowNode') && element.type !== 'label' && this.hasDocumentation(element)
    );
  };

  getAllElements = () => {
    return this._elementRegistry.filter(
      (element) => is(element, 'bpmn:FlowNode') && element.type !== 'label'
    );
  };

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

  stringify = function(val, depth, replacer, space) {
    depth = isNaN(+depth) ? 1 : depth;

    function _build(key, val, depth, o, a) { // (JSON.stringify() has it's own rules, which we respect here by using it for property iteration)
      return !val || typeof val != 'object' ? val : (a = Array.isArray(val), JSON.stringify(val, function(k, v) {
        if (a || depth > 0) {
          if (replacer) v = replacer(k, v);
          if (!k) return (a = Array.isArray(v), val = v);
          !o && (o = a ? [] : {});
          o[k] = _build(k, v, a ? depth : depth - 1);
        }
      }), o || (a ? [] : {}));
    }

    return JSON.stringify(_build('', val, depth), null, space);
  };
}

export default exportUtils;