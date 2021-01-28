import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import { domify } from 'min-dom';
import { filter, sortBy } from 'lodash';

import { SET_DOCUMENTATION_ORDER_EVENT, UNSET_DOCUMENTATION_ORDER_EVENT } from '../../utils/EventHelper';
import exportUtils from '../../utils/exportUtils';

const OFFSET_BOTTOM = 10,
      OFFSET_RIGHT = 15;

export default function DocumentationOverlays(eventBus, overlays, commandStack, elementRegistry) {
  const self = this;

  this._eventBus = eventBus;
  this._overlays = overlays;
  this._elementRegistry = elementRegistry;

  eventBus.on('import.done', function() {
    self.overlayIds = {};

    let utils = new exportUtils(self._elementRegistry);
    let allNodes = utils.getAllElementsWithDocumentationOrder();
    allNodes.forEach((element) => {
      let elementBo = getBusinessObject(element);
      addNewOverlay(element, elementBo.order);
    });
    self.counter = allNodes.length + 1;
  });

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
      order: counter
    };
  }

  eventBus.on(SET_DOCUMENTATION_ORDER_EVENT, function(context) {
    const element = context.element;
    const bo = getBusinessObject(element);

    if (!bo.get('order') && is(element, 'bpmn:FlowNode')) {
      let command = cmdHelper.updateBusinessObject(element, bo, { order: self.counter });
      commandStack.execute(command.cmd, command.context);

      addNewOverlay(element, self.counter);
      self.counter++;
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

      const commands = [];
      commands.push(cmdHelper.updateBusinessObject(element, bo, { order: undefined }));

      const overlayId = overlayHistory.overlayId;
      const removedCounter = overlayHistory.order;

      // Removing the overlay
      self._overlays.remove(overlayId);
      delete self.overlayIds[element.id];
      if (self.counter > 0) {
        self.counter--;
      }

      // Getting all the overlays with order > removedCounter and update them
      const toUpdate = sortBy(filter(self.overlayIds, (overlay) => overlay.order > removedCounter), ['order']);
      toUpdate.forEach((overlayIdObject) => {
        let updateBo = getBusinessObject(overlayIdObject.element);
        let decreasedOrder = overlayIdObject.order - 1;
        commands.push(cmdHelper.updateBusinessObject(overlayIdObject.element, updateBo, { order: decreasedOrder }));

        self._overlays.remove(overlayIdObject.overlayId);
        overlayIdObject.overlayId = newOverlayBadgeForDocOrder(overlayIdObject.element, decreasedOrder);
        overlayIdObject.order = decreasedOrder;
      });

      commands.forEach((command) => {
        commandStack.execute(command.cmd, command.context);
      });
    }
  });
}

DocumentationOverlays.$inject = ['eventBus', 'overlays', 'commandStack', 'elementRegistry'];