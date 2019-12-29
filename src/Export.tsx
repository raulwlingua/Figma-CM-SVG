import * as React from 'react'
import './ui.css'
import axios from "axios";
import {CM_URL} from "./config";

type state = {
  doing: string;
  exportedVoc: number;
  vocIds: number[];
}

export default class Export extends React.Component<{}, state> {

  constructor(props) {
    super(props);
    this.state = {
      doing: 'Loading voc to export.',
      vocIds: [],
      exportedVoc: -1,
    };
  }

  componentDidMount = async () => {
    window.addEventListener("message", this.onMessage, {});
    parent.postMessage({ pluginMessage: {
        type: 'get-export-vocIds',
      }}, '*');
  };

  componentWillUnmount(): void {
    window.removeEventListener("message", this.onMessage);
  }

  onMessage = (ev: MessageEvent) => {
    if (ev.data.pluginMessage.type === 'got-export-vocIds') {
      this.setState({ vocIds: ev.data.pluginMessage.vocIds});
      this.exportNextVoc();
    }

    if (ev.data.pluginMessage.type === 'got-vocId-svg') {
      const svg = ev.data.pluginMessage.svg;
      this.uploadSvg(this.state.vocIds[this.state.exportedVoc], svg);
    }
  };

  exportNextVoc = async () => {
    const exportedVoc = this.state.exportedVoc + 1;

    if (exportedVoc === this.state.vocIds.length) {
      this.setState({ doing: 'All exported' });
      return;
    }

    this.setState({
      exportedVoc,
      doing: `[${exportedVoc + 1}/${this.state.vocIds.length}] exporting`,
    });

    parent.postMessage({ pluginMessage: {
      type: 'get-vocId-svg',
      vocId: this.state.vocIds[this.state.exportedVoc],
    }}, '*');

  };

  uploadSvg = async (vocId: number, svg: string) => {
    console.log(vocId, svg);
    this.exportNextVoc();
  };

  render() {
    return(
      <>
        {this.state.doing}
      </>
    )
  }
}
