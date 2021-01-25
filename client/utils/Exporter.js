import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import css from '!!raw-loader!bpmn-font/dist/css/bpmn.css';

/*
* Expecting a hierarchy array already sorted in the order we want the documentation to be exported.
* Each element of the array is an object node from bpmn-js
* */
const Exporter = (hierarchy) => {
  let docIndexes = '<div class="documentationIndexes"><h1>INDEXES</h1>';
  let docHierarchy = '<div class="documentationContainer"><h1>ELEMENTS</h1>';

  hierarchy.forEach(element => {
    const bo = getBusinessObject(element);
    const elementId = element.id;
    const elementName = bo.get('name');
    const documentation = bo.get('documentation');
    const camel = bo.$type.substring(5);
    let dashed = 'bpmn-icon' + camel.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
    let icon = `<span class="${dashed}"></span>`;
    if (documentation.length > 0) {

      const anchorLink = `<a href="#${elementId}">${elementName || elementId}</a><br/>`;
      docIndexes += anchorLink;
      const docText = bo.get('documentation')[0].get('text');
      const anchoredText = `<div class="documentationElement" id="container-${elementId}"><h2><a name="${elementId}"></a>${icon}&nbsp;${elementName || elementId}</h2>${docText}</div>`;
      docHierarchy += anchoredText;
    }
  });

  let getDocumentation = function() {
    return docIndexes + '</div>' + docHierarchy + '</div>';
  };

  let exportDocumentation = function() {
    return `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Documentation</title>
    
    <style>${css}</style>
    <style>
        h1 {
            text-align: center;
        }
        
        .documentationIndexes {
            margin: 10px 10% auto;
        }
        
        .documentationElement {
            width: 80%;
            border: 1px solid #eee;
            box-shadow: 0 2px 3px #ccc;
            padding: 10px;
            margin: 10px auto;
            box-sizing: border-box;
        }
        
    </style>
</head>
<body>
    ${getDocumentation()}
</body>`;
  };

  return {
    'export': exportDocumentation
  };
};

export default Exporter;