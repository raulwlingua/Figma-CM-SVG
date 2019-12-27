import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'
import Login from "./Login";
import Layout from "./Layout";


type state = {
  logged: boolean;
}

class App extends React.Component<{}, state> {

  constructor(props) {
    super(props);
    this.state = {
      logged: false,
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

  onLogin = () => {
    this.setState({ logged: true });
  };


  render() {
    if (!this.state.logged) {
      return <Login onLogin={this.onLogin} />;
    } else {
      return <Layout />;
    }
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'));
