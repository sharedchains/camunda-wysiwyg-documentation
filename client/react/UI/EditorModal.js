import React from 'camunda-modeler-plugin-helpers/react';
import { Modal } from 'camunda-modeler-plugin-helpers/components';

import DocumentationEditor from '../Documentation/DocumentationEditor';

// polyfill upcoming structural components
const Title = Modal.Title || (({ children }) => <h2>{children}</h2>);
const Body = Modal.Body || (({ children }) => <div>{children}</div>);
const Footer = Modal.Footer || (({ children }) => <div>{children}</div>);

/**
 * Functional component for the editor modal
 * @param props
 * @returns {JSX.Element}
 */
const editorModal = (props) => {

  return <Modal onClose={props.close} className="editorModal">
    <Title>{props.title}</Title>
    <Body>
      <form id="editorForm" onSubmit={props.close}>
        <DocumentationEditor editorState={props.editorState} onChange={props.onEditorChange}/>
      </form>
    </Body>
    <Footer>
      <div id="editorModalButtons">
        <button type="submit" className="btn btn-secondary" form="editorForm">Close</button>
      </div>
    </Footer>
  </Modal>;
};

export default editorModal;