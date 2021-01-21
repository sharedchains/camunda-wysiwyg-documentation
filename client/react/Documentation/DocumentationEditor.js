import React from 'camunda-modeler-plugin-helpers/react';

import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const documentationEditor = (props) => {

  function uploadImageCallBack(file) {
    return new Promise(
      (resolve, reject) => {
        const reader = new FileReader();
        let img = new Image();

        // let url = ''
        reader.onload = function(e) {
          img.src = reader.result;
          resolve({
            data: {
              link: img.src
            }
          });
        };
        reader.onerror = function(event) {
          reader.abort();
          reject('Failed to read file!\n\n' + reader.error);
        };

        reader.readAsDataURL(file);
      });
  }

  return (<div>
    <Editor
      editorState={props.editorState}
      wrapperClassName="docEditor-wrapper"
      editorClassName="docEditor"
      toolbarClassName="docEditor-toolbar"
      onEditorStateChange={props.onChange}
      localization={{
        locale: 'it',
      }}
      toolbar={{
        image: {
          uploadCallback: uploadImageCallBack,
          alt: { present: true, mandatory: false },
        },
      }}
    />
  </div>);
};

export default documentationEditor;