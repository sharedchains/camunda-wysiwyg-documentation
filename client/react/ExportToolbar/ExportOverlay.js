import React from 'camunda-modeler-plugin-helpers/react';
import { Overlay, Section } from 'camunda-modeler-plugin-helpers/components';

import classNames from 'classnames';

const OFFSET = { right: 0 };

// we can even use hooks to render into the application
export default function ExportOverlay({ anchor, onClose, actions, exportMode }) {

  return (
    <Overlay anchor={anchor} onClose={onClose} offset={OFFSET}>
      <Section>
        <Section.Header>Export configuration</Section.Header>
        <Section.Body>
          <div className={classNames('export-documentation')}>
            <Section.Actions>
              <div
                className={classNames('export-button')}>
                <button
                  onClick={actions.exportFlow}
                  className={classNames('btn', 'btn-primary', 'export-documentation-flow')}>
                  Export documentation based on diagram flow
                </button>
              </div>
              <hr></hr>
              <div
                className={classNames('export-button')}>
                <button
                  onClick={actions.toggleExportMode}
                  className={classNames('btn', 'btn-secondary', { 'active': exportMode })}>
                  Toggle export mode to define a custom order
                </button>
              </div>
              <div
                className={classNames('export-button')}>
                <button
                  onClick={actions.exportOrdered}
                  className={classNames('btn', 'btn-primary', 'export-documentation-user-order')}>
                  Export documentation based on user order definition
                </button>
              </div>
            </Section.Actions>
          </div>
        </Section.Body>
      </Section>
    </Overlay>
  );
}