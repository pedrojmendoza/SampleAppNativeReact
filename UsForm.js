import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Text, Switch } from 'react-native';

var Buffer = require('buffer/').Buffer

export default class UsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      encode: true
    };
  }

  render() {
    return (
      <View style={{padding: 10}} accessibilityLabel="form_view_us">
        <Text style={{fontSize: 20}}>
          Base 64 encoder/decoder
        </Text>
        <TextInput
          style={{height: 40}}
          placeholder={this.state.encode ? "Type here to encode to BASE64" : "Type here to decode from BASE64"}
          onChangeText={(text) => this.setState({text: text})}
          value={this.state.text}
        />
        <Switch
          onValueChange={(value) => this.setState({text: '', encode: value})}
          value={this.state.encode}
        />
        <Text style={{fontSize: 20}}>
          {this.state.encode ? Buffer.from(this.state.text).toString('base64') : Buffer.from(this.state.text, 'base64').toString('ascii')}
        </Text>
      </View>
    );
  }
}
