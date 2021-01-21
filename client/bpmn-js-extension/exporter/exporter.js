import {getBusinessObject} from "bpmn-js/lib/util/ModelUtil";

/*
* Expecting a hierarchy array already sorted in the order we want the documentation to be exported.
* Each element of the array is an object node from bpmn-js
* */
const exporter = (hierarchy) => {
    let docIndexes = '';
    let docHierarchy = '';

    hierarchy.forEach(element => {
        const bo = getBusinessObject(element);
        const elementId = element.id;
        const elementName = bo.get('name');
        const documentation = bo.get('documentation');
        if (documentation.length > 0) {
            const anchorLink = `<a href="#${elementId}">${elementName || elementId}</a><br/>`;
            docIndexes += anchorLink;
            const docText = bo.get('documentation')[0].get('text');
            const anchoredText = `<h1><a name=${elementId}></a>${elementName || elementId}</h1>${docText}<br/>`;
            docHierarchy += anchoredText;
        }
    })

    let getDocumentation = function () {
        return docIndexes + docHierarchy;
    }

    let exportDocumentation = function() {
        return `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Documentation</title>
</head>
<body>
    ${getDocumentation()}
</body>`;
    }

    return {
        'export' : exportDocumentation
    }
}

export default exporter;