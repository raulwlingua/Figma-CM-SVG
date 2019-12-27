import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'


type state = {
}

class App extends React.Component<{}, state> {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount(): void {
    window.addEventListener("message", this.onMessage, {});
  }
  componentWillUnmount(): void {
    window.removeEventListener("message", this.onMessage);
  }

  onMessage = (ev: MessageEvent) => {
  };



  render() {
    return null;
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'));
