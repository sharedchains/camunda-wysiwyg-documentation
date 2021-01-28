import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import { domify } from 'min-dom';
import { filter, sortBy } from 'lodash';

import { SET_DOCUMENTATION_ORDER_EVENT, UNSET_DOCUMENTATION_ORDER_EVENT } from '../../utils/EventHelper';


const OFFSET_BOTTOM = 10,
      OFFSET_RIGHT = 15;

export default function DocumentationOverlays(eventBus, overlays, commandStack) {
  const self = this;

  this._eventBus = eventBus;
  this._overlays = overlays;

  this.overlayIds = {};
  this.counter = 1;

  eventBus.on('import.done', function() {

    // TODO: Needs to update overlays
  });

  eventBus.on(SET_DOCUMENTATION_ORDER_EVENT, function(context) {
    const element = context.element;
    const bo = getBusinessObject(element);

    if (!bo.get('order')) {
      let command = cmdHelper.updateBusinessObject(element, bo, { order: self.counter });
      commandStack.execute(command.cmd, command.context);

      const overlayHtml = domify(`<div class="documentation-order order-count" title="Documentation Order">${self.counter}</div>`);
      const position = { bottom: OFFSET_BOTTOM, right: OFFSET_RIGHT };
      const overlayId = self._overlays.add(element, 'docOrder-badge', {
        position: position,
        html: overlayHtml,
        scale: { min: 1 }
      });
      self.overlayIds[element.id] = {
        id: element.id,
        overlayId : overlayId,
        order: self.counter
      };
      self.counter++;
    }
  });

  eventBus.on(UNSET_DOCUMENTATION_ORDER_EVENT, function(context) {
    const element = context.element;
    const bo = getBusinessObject(element);

    if (bo.get('order')) {
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

      // Getting all the overlays with order > removedCounter and update them
      // https://stackoverflow.com/questions/32349838/lodash-sorting-object-by-values-without-losing-the-key

      const toUpdate = sortBy(filter(self.overlayIds, (overlay) => overlay.order > removedCounter), ['order']);
      toUpdate.forEach((overlay) => {
        console.log(overlay);
      });

      commands.forEach((command) => {
        commandStack.execute(command.cmd, command.context);
      });
    }
  });
}

DocumentationOverlays.$inject = ['eventBus', 'overlays', 'commandStack'];