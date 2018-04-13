// @flow

import * as React from "react";
import * as Immutable from "immutable";

import { selectors, actions, state as stateModule } from "@nteract/core";

import { JSONTransform, TextTransform } from "@nteract/transforms";
import CodeMirrorEditor from "@nteract/editor";

// Workaround flow limitation for getting these types
type ContentRef = stateModule.ContentRef;
type FileContentRecord = stateModule.FileContentRecord;

import { connect } from "react-redux";

type FileProps = {
  content: FileContentRecord
};

export class TextFile extends React.PureComponent<FileProps, null> {
  static handles(mimetype: string) {
    return (
      mimetype.startsWith("text/") ||
      mimetype.startsWith("application/javascript") ||
      mimetype.startsWith("application/json")
    );
  }
  render() {
    return (
      <CodeMirrorEditor
        cellFocused
        editorFocused
        theme="light"
        id="not-really-a-cell"
        options={{
          lineNumbers: true,
          extraKeys: {
            "Ctrl-Space": "autocomplete"
          },
          cursorBlinkRate: 0,
          mode: this.props.content.mimetype
        }}
        value={this.props.content.model.text}
      />
    );
  }
}

export class File extends React.PureComponent<FileProps, *> {
  render() {
    if (!this.props.content.mimetype) {
      // TODO: Redirect to /files/ endpoint for them to download the file or view
      //       as is
      return <pre>Can not render this file type</pre>;
    }

    const mimetype = this.props.content.mimetype;
    const text = this.props.content.model.text;

    if (JSONTransform.handles(mimetype)) {
      const data = JSON.parse(text);
      return <JSONTransform data={data} />;
    } else if (TextFile.handles(mimetype)) {
      return <TextFile content={this.props.content} />;
    }

    return <pre>Can not render this file type</pre>;
  }
}

export const ConnectedFile = connect(
  (state: Object, ownProps: { contentRef: ContentRef }): FileProps => {
    const content = selectors.content(state, ownProps);

    if (!content || content.type !== "file") {
      throw new Error(
        "The file component should only be used with file contents"
      );
    }

    return { content };
  }
)(File);

export default ConnectedFile;
