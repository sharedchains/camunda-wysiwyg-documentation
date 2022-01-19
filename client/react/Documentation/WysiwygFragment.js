import React, { Fragment, Component } from 'camunda-modeler-plugin-helpers/react';

import EditorModal from '../UI/EditorModal';

import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

import { OPEN_WYSIWYG_EDITOR, SAVE_WYSIWYG_EDITOR } from '../../utils/EventHelper';

const defaultState = {
  modalOpen: false,
  element: null,
  node: null,
  editorState: EditorState.createEmpty(),
  modeler: null,
  tabModeler: []
};

/**
 * React component to implement the documentation modal
 */
export default class WysiwygFragment extends Component {

  constructor(props) {
    super(props);

    this.state = defaultState;

    this.closeModal = this.closeModal.bind(this);
    this.onEditorStateChange = this.onEditorStateChange.bind(this);
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
      subscribe,
      displayNotification,
      triggerAction
    } = this.props;

    const saveTab = ({ activeTab }) => {
      if (activeTab.file && activeTab.file.path) {

        // trigger a tab save operation
        triggerAction('save')
          .then(tab => {
            if (!tab) {
              return displayNotification({ title: 'Failed to save' });
            }
          });
      }
    };

    subscribe('bpmn.modeler.created', ({ modeler, tab }) => {
      this._eventBus = modeler.get('eventBus');

      const { tabModeler }
        = this.state;
      this.setState({
        modeler: modeler,
        tabModeler: [ ...tabModeler, { tabId: tab.id, modeler: modeler } ]
      });


      this._eventBus.on(OPEN_WYSIWYG_EDITOR, (event) => {

        // Received command to open the editorModal for documentation
        let editorState = EditorState.createEmpty();
        if (event.data) {
          const { contentBlocks, entityMap } = htmlToDraft(event.data);
          editorState = EditorState.createWithContent(ContentState.createFromBlockArray(contentBlocks, entityMap));
        }
        this.setState({
          modalOpen: true,
          element: event.element,
          node: event.node,
          editorState: editorState,
          isProcessDocumentation: event.isProcessDocumentation
        });
      });
    });

    subscribe('app.activeTabChanged', tab => {
      const {
        tabModeler
      } = this.state;
      let activeTabId = tab.activeTab.id;

      const activeModeler = find(tabModeler, { tabId: activeTabId });
      if (activeModeler) {
        this._eventBus = activeModeler.modeler.get('eventBus');
        this.setState({ modeler: activeModeler.modeler });
      }

      saveTab(tab);
    });

    subscribe('close-all-tabs', saveTab);
  }

  closeModal() {
    let currentState = { ...this.state };
    const { element, node, isProcessDocumentation, editorState, modeler, tabModeler } = currentState;

    let data = null;
    if (editorState.getCurrentContent().hasText()) {
      data = draftToHtml(convertToRaw(editorState.getCurrentContent()));
      data = data.replace(/(\r\n|\n|\r)/gm, '');
    }
    this._eventBus.fire(SAVE_WYSIWYG_EDITOR, { element, node, isProcessDocumentation, data: data });

    this.setState({
      ...defaultState, modeler, tabModeler
    });
  }

  onEditorStateChange(editorState) {
    this.setState({
      editorState
    });
  }

  render() {
    const { modalOpen, editorState } = this.state;

    return <Fragment>
      {modalOpen && (
        <EditorModal editorState={editorState} onEditorChange={this.onEditorStateChange}
          close={this.closeModal} title='Documentation'/>
      )}
    </Fragment>;
  }
}