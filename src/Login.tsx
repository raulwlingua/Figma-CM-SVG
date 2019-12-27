import * as React from 'react';
import axios from 'axios';
import {CM_URL} from "./config";

type props = {
  onLogin: () => void;
}

type state = {
  doingLogin: boolean;
  loginError: string;
  user: string;
  pass: string;
}

export default class Login extends React.Component<props, state> {

  constructor(props) {
    super(props);
    this.state = {
      doingLogin: false,
      loginError: '',
      user: '',
      pass: '',
    };
  }

  doLogin = async () => {
    this.setState({ doingLogin: true, loginError: '' });
    try {
      await axios.post(CM_URL + '/login', { login: this.state.user, password: this.state.pass });
      this.props.onLogin();
    } catch (e) {
      this.setState({ doingLogin: false, loginError: 'Login error' });
    }
  };

  render() {
    return (
    <>
      <input
        onChange={(user) => {
          this.setState({ user: user.currentTarget.value})
        }}
        value={this.state.user}
        placeholder={'user'}
        style={{
          width: '100%'
        }}
      />
      <input
        onChange={(pass) => {
          this.setState({ pass: pass.currentTarget.value})
        }}
        value={this.state.pass}
        placeholder={'pass'}
        type={'password'}
        style={{
          width: '100%'
        }}
      />
      {this.state.loginError !== '' &&
        <div style={{
          backgroundColor: "orangered",
          borderRadius: 4,
          padding: 10,
          margin: 5,
          textAlign: 'center',
          color: 'white',
        }}>
          {this.state.loginError}
        </div>
      }
      <button
        onClick={this.doLogin}
        disabled={this.state.doingLogin}
      >Login</button>
    </>
    );
  }
}
