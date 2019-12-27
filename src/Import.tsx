import * as React from 'react'
import './ui.css'
import axios from "axios";
import {CM_URL} from "./config";

type state = {
  doing: string;
}

export default class Import extends React.Component<{}, state> {

  constructor(props) {
    super(props);
    this.state = {
      doing: 'Loading categories.'
    };
  }

  componentDidMount = async () => {
    const categories: any[] = await axios.get(CM_URL + '/voc-categories/dialects/0');
    categories.map((cat, index) => {
      this.setState({ doing: `Importing category ${index} of ${categories.length}.`});
    });
    this.setState({ doing: 'Importing done.'});

  };

  render() {
    return(
      <>
        {this.state.doing}
      </>
    )
  }
}
