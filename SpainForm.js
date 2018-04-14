import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Text, Switch } from 'react-native';

var Buffer = require('buffer/').Buffer

export default class SpainForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      encode: true
    };
  }

  render() {
    return (
      <View style={{padding: 10}} accessibilityLabel="form_view_es">
        <Text>
          Codificador/decod de Base 64
        </Text>
        <TextInput
          style={{height: 40}}
          placeholder={this.state.encode ? "Introduzca lo que desea codificar a BASE64" : "Introduzca lo que desea decodificar de BASE64"}
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
