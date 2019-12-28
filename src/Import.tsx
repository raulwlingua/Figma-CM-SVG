import * as React from 'react'
import './ui.css'
import axios from "axios";
import {CM_URL} from "./config";

type state = {
  doing: string;
  importedCat: number;
  cats: ICategoryApi[];
  importedVoc: number;
  vocs: IVocApi[];
  pageVocIds: number[];
}

interface ICategoryApi {
  fullPath: string;
  id: number;
}

interface IVocApi {
  id: number;
  position: number;
  svg: string;
  title: string;
  type: string;
}

export default class Import extends React.Component<{}, state> {

  constructor(props) {
    super(props);
    this.state = {
      doing: 'Loading categories.',
      importedCat: -1,
      cats: [],
      importedVoc: -1,
      vocs: [],
      pageVocIds: [],
    };
  }

  componentDidMount = async () => {
    window.addEventListener("message", this.onMessage, {});
    const response = await axios.get(CM_URL + '/voc-categories/dialects/0');
    let categories: ICategoryApi[] = response.data;
    categories = categories.sort( (a, b) => a.fullPath < b.fullPath ? -1 : 1);
    this.setState( {cats: categories });
    this.importNextCat();
  };

  componentWillUnmount(): void {
    window.removeEventListener("message", this.onMessage);
  }

  onMessage = (ev: MessageEvent) => {
    if (ev.data.pluginMessage.type === 'created-cat') {
      this.setState({ pageVocIds: ev.data.pluginMessage.pageVocIds});
      this.importNextVoc();
    }
    if (ev.data.pluginMessage.type === 'created-voc') {
      this.importNextVoc();
    }
  };

  importNextCat = async () => {
    const importCat = this.state.importedCat + 1;

    if (importCat === this.state.cats.length) {
      this.setState({ doing: 'All imported' });
      return;
    }

    const cat = this.state.cats[importCat];
    const response = await axios.get(CM_URL + `/figma/voc-categories/${cat.id}/voc`);
    const vocs: any[] = response.data;
    this.setState({
      importedCat: importCat,
      doing: `[${importCat + 1}/${this.state.cats.length}] -  ${cat.fullPath}`,
      importedVoc: -1,
      vocs: vocs,
    });
    if (vocs.length === 0) {
      this.importNextCat();
    } else {
      parent.postMessage({ pluginMessage: {
        type: 'create-cat',
        catId: cat.id,
        catName: cat.fullPath,
      }}, '*');
    }
  };

  importNextVoc = async () => {
    const importVoc = this.state.importedVoc + 1;

    if (importVoc === this.state.vocs.length) {
      this.importNextCat();
      return;
    }
    this.setState({ importedVoc: importVoc })
    const voc = this.state.vocs[importVoc];
    if (this.state.pageVocIds.indexOf(voc.id) !== -1) {
      this.importNextVoc();
    } else {
      const response = await axios.get(voc.svg);
      const svg = response.data;
      console.log(svg);
      parent.postMessage({ pluginMessage: {
          type: 'create-voc',
          vocId: voc.id,
          position: voc.position,
          svg: svg,
          title: voc.title,
          wordClass: voc.type,
        }}, '*');
    }
  };


  render() {
    return(
      <>
        {this.state.doing}
      </>
    )
  }
}
