import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { domify } from 'min-dom';
import { filter, sortBy } from 'lodash';

import {
  REMOVE_DOCUMENTATION_ORDER_EVENT,
  SET_DOCUMENTATION_ORDER_EVENT,
  TOGGLE_MODE_EVENT,
  UNSET_DOCUMENTATION_ORDER_EVENT,
  UPDATE_ELEMENT_EVENT
} from '../../utils/EventHelper';
import ExportUtils from '../../utils/ExportUtils';

const OFFSET_BOTTOM = 10,
      OFFSET_RIGHT = 15;

/**
 * Implementing documentation overlays to show element export order count in 'export mode'
 * @param eventBus
 * @param overlays
 * @param elementRegistry
 * @param injector
 * @constructor
 */
export default function DocumentationOverlays(eventBus, overlays, elementRegistry, injector) {
  const self = this;

  this._eventBus = eventBus;
  this._overlays = overlays;
  this._elementRegistry = elementRegistry;
  this._injector = injector;

  this.overlayIds = {};
  this.exportMode = false;

  function updateOverlays() {
    self.overlayIds = {};
    self.counter = 1;

    let utils = new ExportUtils(self._elementRegistry);
    let allNodes = utils.getAllElementsWithDocumentationOrder();

    allNodes.forEach((element) => {
      let elementBo = getBusinessObject(element);
      addNewOverlay(element, elementBo.order);

      let split = elementBo.order.split('.');

      if (self.counter < +split[0]) {
        self.counter = +split[0];
      }
    });
  }

  function clearOverlays() {
    self.overlayIds = {};
    self.counter = 1;

    self._overlays.remove({ type: 'docOrder-badge' });
  }

  function newOverlayBadgeForDocOrder(element, counter) {
    const overlayHtml = domify(`<div class="documentation-order order-count" title="Documentation Order">${counter}</div>`);
    const position = { bottom: OFFSET_BOTTOM, right: OFFSET_RIGHT };
    return self._overlays.add(element, 'docOrder-badge', {
      position: position,
      html: overlayHtml,
      scale: { min: 1 }
    });
  }

  function addNewOverlay(element, counter) {
    const overlayId = newOverlayBadgeForDocOrder(element, counter);
    self.overlayIds[element.id] = {
      element: element,
      overlayId: overlayId,
      order: '' + counter
    };
  }

  function getNextDocOrder(counter) {
    let utils = new ExportUtils(self._elementRegistry);
    if (!utils.notExistsDocOrder(undefined, counter)) {
      return getNextDocOrder(counter + 1);
    }
    return counter;
  }

  eventBus.on(TOGGLE_MODE_EVENT, 100, function(context) {
    self.exportMode = context.exportMode;

    if (context.exportMode) {
      updateOverlays();
    } else {
      clearOverlays();
    }
  });
  eventBus.on(UPDATE_ELEMENT_EVENT, function(context) {
    self._overlays.remove({ element: context.element, type: 'docOrder-badge' });

    if (self.exportMode) {
      addNewOverlay(context.element, context.order);
    }
  });
  eventBus.on(REMOVE_DOCUMENTATION_ORDER_EVENT, function(context) {
    let element = context.element;

    const overlayHistory = self.overlayIds[element.id];
    if (overlayHistory) {
      const overlayId = overlayHistory.overlayId;

      // Updating counter
      const removedCounter = overlayHistory.order.split('.');
      self.counter = +removedCounter[0] + 1;

      // Removing the overlay
      self._overlays.remove(overlayId);
      delete self.overlayIds[element.id];

      const commandStack = self._injector.get('commandStack');
      commandStack.execute('element.updateProperties', { element, properties: { order: undefined } });
    }
  });

  eventBus.on(SET_DOCUMENTATION_ORDER_EVENT, function(context) {
    const element = context.element;
    const bo = getBusinessObject(element);

    if (!bo.get('order') && is(element, 'bpmn:FlowNode')) {
      let nextCounterValue = getNextDocOrder(self.counter);

      const commandStack = self._injector.get('commandStack');
      commandStack.execute('element.updateProperties', { element, properties: { order: '' + nextCounterValue } });

      addNewOverlay(element, nextCounterValue);
      self.counter = nextCounterValue;
    }
  });

  eventBus.on(UNSET_DOCUMENTATION_ORDER_EVENT, function(context) {
    const element = context.element;
    const bo = getBusinessObject(element);

    if (bo.get('order') && is(element, 'bpmn:FlowNode')) {
      const overlayHistory = self.overlayIds[element.id];
      if (!overlayHistory) {
        return;
      }

      const commandStack = self._injector.get('commandStack');

      const commands = [];

      commands.push({
        cmd: 'element.updateProperties',
        context: { element, properties: { order: undefined } }
      });

      const overlayId = overlayHistory.overlayId;
      const removedCounter = overlayHistory.order;

      // Removing the overlay
      self._overlays.remove(overlayId);
      delete self.overlayIds[element.id];
      if (self.counter > 1) {
        self.counter--;
      }

      // Getting all the overlays with order > removedCounter and update them
      const toUpdate = sortBy(filter(self.overlayIds, (overlay) => {
        let split = overlay.order.split('.');
        return +split[0] >= removedCounter;
      }), [ 'order' ]);
      toUpdate.forEach((overlayIdObject) => {

        let split = overlayIdObject.order.split('.');
        split[0] = +split[0] - 1;
        let newOrder = split.join('.');

        commands.push({
          cmd: 'element.updateProperties',
          context: { element: overlayIdObject.element, properties: { order: newOrder } }
        });

        self._overlays.remove(overlayIdObject.overlayId);
        overlayIdObject.overlayId = newOverlayBadgeForDocOrder(overlayIdObject.element, newOrder);
        overlayIdObject.order = newOrder;
      });

      commands.forEach((command) => {
        commandStack.execute(command.cmd, command.context);
      });
    }
  });
}

DocumentationOverlays.$inject = [ 'eventBus', 'overlays', 'elementRegistry', 'injector' ];