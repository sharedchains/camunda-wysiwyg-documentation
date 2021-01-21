import React, { Fragment, Component } from 'camunda-modeler-plugin-helpers/react';
import { Fill } from 'camunda-modeler-plugin-helpers/components';

import classNames from 'classnames';

import { find } from 'lodash';
import exporter from '../../utils/exporter/exporter';
import exportUtils from './exportUtils';

const defaultState = {
  modeler: null,
  tabModeler: [],
  tabId: null
};

class ExportButton extends Component {
  constructor(props) {
    super(props);

    this.state = defaultState;
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
        tabModeler: [...tabModeler, { tabId: tab.id, modeler: modeler }],
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
        this.setState({ modeler: activeTab.modeler, tabId: activeTabId });
      }
    });
  }

  exportDiagram = (modeler) => {
    const elementRegistry = modeler.get('elementRegistry');

    // Ottengo tutti gli elementi che presentano documentazione
    let utils = new exportUtils(elementRegistry);
    const elements = utils.getAllElements();

    // console.log(this.stringify({ elements: elements}, 2, null, 2));
    console.log(exporter(elements).export());
  };

  render() {
    const {
      tabModeler,
      tabId
    } = this.state;
    const activeTab = find(tabModeler, { tabId: tabId });

    return (
      <Fragment>
        <Fill slot="toolbar" group="9_n_exportDocumentation">
          <button type="button" className={classNames('toolbarBtn', 'exportBtn')} onClick={() => {
            this.exportDiagram(activeTab.modeler);
          }}/>
        </Fill>
      </Fragment>
    );
  }
}

export default ExportButton;