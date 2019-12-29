import * as React from 'react'
import './ui.css'
import Import from "./Import";
import Export from "./Export";

enum ETabs {
  NONE = 'NONE',
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
}
type state = {
  tab: ETabs;
}

export default class Layout extends React.Component<{}, state> {

  constructor(props) {
    super(props);
    this.state = {
      tab: ETabs.NONE,
    };
  }

  onChangeTab = (tab:ETabs) => {
    this.setState({ tab: tab });
  };


  render() {
    switch (this.state.tab) {
      case ETabs.NONE:
        return (
          <>
            <div>
              <p>Import:</p>
              <button
                onClick={() => this.onChangeTab(ETabs.IMPORT)}
              >Import</button>
            </div>
            <div style={{ marginTop: 20 }}>
              <p>Export:</p>
              <button
                onClick={() => this.onChangeTab(ETabs.EXPORT)}
              >Export</button>
            </div>
          </>
        );
      case ETabs.IMPORT:
        return <Import />
      case ETabs.EXPORT:
        return <Export />
      default:
        return null;
    }
  }
}
