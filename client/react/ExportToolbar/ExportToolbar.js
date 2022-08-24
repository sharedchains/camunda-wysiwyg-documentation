import React, { Fragment, Component } from 'camunda-modeler-plugin-helpers/react';
import { Fill } from 'camunda-modeler-plugin-helpers/components';
import classNames from 'classnames';
import { find } from 'lodash';

import exporter from '../../utils/exporter';
import ExportUtils, { DIAGRAM_FLOW, DOCUMENTATION_ORDER_FLOW } from '../../utils/ExportUtils';

import { TOGGLE_MODE_EVENT } from '../../utils/EventHelper';

import FileExportIcon from '../../../resources/file-export-solid.svg';
import ExportOverlay from './ExportOverlay';

const defaultState = {
  modeler: null,
  tabModeler: [],
  tabId: null,
  exportMode: false,
  configOpen: false
};

/**
 * New export toolbar for Camunda Modeler default toolbar
 */
class ExportToolbar extends Component {
  constructor(props) {
    super(props);

    this.state = defaultState;

    this._exportButtonRef = React.createRef();

    this.handleConfigClosed = this.handleConfigClosed.bind(this);
  }

  componentDidMount() {

    /**
     * The component props include everything the Application offers plugins,
     * which includes:
     * - config: save and retrieve information to the local configuration
     * - subscribe: hook into application events, like <tab.saved>, <app.activeTabChanged> ...
     * - triggerAction: execute editor actions, like <save>, <open-diagram> ...
     * - log: log information into the Log panel
     * - displayNotification: show notifications inside the application
     */
    const {
      // eslint-disable-next-line react/prop-types
      subscribe
    } = this.props;

    subscribe('bpmn.modeler.created', ({ modeler, tab }) => {
      const { tabModeler } = this.state;
      this.setState({
        modeler: modeler,
        tabModeler: [ ...tabModeler, { tabId: tab.id, modeler: modeler, exportMode: false } ],
        tabId: tab.id
      });
    });

    subscribe('app.activeTabChanged', (tab) => {
      const {
        tabModeler
      } = this.state;
      let activeTabId = tab.activeTab.id;
      const activeTab = find(tabModeler, { tabId: activeTabId });
      if (activeTab) {
        this.setState({ modeler: activeTab.modeler, tabId: activeTabId, exportMode: activeTab.exportMode });
      }
    });
  }

  handleConfigClosed = () => {
    this.setState({ configOpen: false });
  };

  exportDiagram = async (modeler, flowType) => {
    const {
      config
    } = this.props;
    const elementRegistry = modeler.get('elementRegistry');
    const canvas = modeler.get('canvas');

    // Ottengo tutti gli elementi che presentano documentazione
    let utils = new ExportUtils(elementRegistry);
    let elementsToExport = [];

    switch (flowType) {
    case DIAGRAM_FLOW: {
      let startEvents = utils.getStartEvents();
      startEvents.forEach((startEvent) => {
        elementsToExport = elementsToExport.concat(utils.navigateFromStartEvent(startEvent));
      });
      break;
    }
    case DOCUMENTATION_ORDER_FLOW:
      elementsToExport = utils.getAllElementsWithDocumentationOrder();
      break;
    }

    if (elementsToExport.length > 0) {

      let svgImage;
      let errorSvg;

      try {
        const { svg } = await modeler.saveSVG();
        svgImage = svg;
      } catch (err) {
        errorSvg = err;
      }

      if (!errorSvg) {
        let file = {
          contents: exporter(elementsToExport, flowType, canvas, svgImage).export(),
          name: 'documentation.html',
          fileType: 'html'
        };
        let savePath = await config.backend.send('dialog:save-file', {
          title: 'Export Documentation',
          saveAs: true,
          filters: [ { name: 'HTML', extensions: [ 'html' ] } ],
          file: file
        });

        if (savePath) {
          config.backend.send('file:write', savePath, file, { encoding: 'utf8', fileType: 'html' }).then((resolve) => {
            if (resolve) {
              config.backend.send('dialog:show', {
                message: 'Documentation was exported correctly!',
                title: 'Exported documentation',
                type: 'info'
              });
            }
          }).catch(error => {
            this.props.log.error(error);
            config.backend.send('dialog:show', {
              message: 'Unexpected failure exporting documentation!',
              title: 'Error exporting documentation',
              type: 'error'
            });
          });
        }
      } else {
        this.props.log.error(errorSvg);
        config.backend.send('dialog:show', {
          message: 'Unexpected failure getting bpmn image!',
          title: 'Error exporting documentation',
          type: 'error'
        });
      }
    } else {
      config.backend.send('dialog:show', {
        message: 'No elements to export!',
        title: 'Error exporting documentation',
        type: 'error'
      });
    }
  };

  toggleExportMode = (tabId) => {
    const {
      tabModeler
    } = this.state;
    const activeTab = find(tabModeler, { tabId: tabId });
    this.setState(prevState => {
      let eventBus = activeTab.modeler.get('eventBus');
      let exportMode = !prevState.exportMode;
      eventBus.fire(TOGGLE_MODE_EVENT, {
        exportMode: exportMode
      });
      return {
        exportMode: exportMode,
        tabModeler: prevState.tabModeler.filter(tab => tab.tabId !== tabId).concat({ modeler: activeTab.modeler, tabId: tabId, exportMode: exportMode })
      };
    });
  };

  render() {
    const {
      configOpen,
      tabModeler,
      tabId,
      exportMode
    } = this.state;

    const activeTab = find(tabModeler, { tabId: tabId });
    let actions = {};
    if (activeTab) {
      actions = {
        toggleExportMode: () => this.toggleExportMode(tabId),
        exportFlow: () => this.exportDiagram(activeTab.modeler, DIAGRAM_FLOW),
        exportOrdered: () => this.exportDiagram(activeTab.modeler, DOCUMENTATION_ORDER_FLOW)
      };
    }

    return (
      <Fragment>
        <Fill slot="status-bar__app" group="2_wysiwyg_documentation">
          <button title="Export mode" type="button"
            ref={this._exportButtonRef}
            onClick={() => this.setState({ configOpen: !configOpen })}
            className={classNames('btn', { 'btn--active': configOpen })}>
            <FileExportIcon/>
          </button>
        </Fill>
        {
          this.state.configOpen && (
            <ExportOverlay
              anchor={this._exportButtonRef.current}
              onClose={this.handleConfigClosed}
              actions={actions}
              exportMode={exportMode}
            />
          )
        }
      </Fragment>
    );
  }
}

export default ExportToolbar;