import React, { Component } from 'react';
import Config from 'react-native-config';
import { View, Text } from 'react-native';
import FeatureToggle from './FeatureToggle';
import SpainForm from './SpainForm';
import UsForm from './UsForm';

export default class App extends Component {
  render() {
    return (
      <View>
        <Text>
          Country is {Config.COUNTRY}
        </Text>
        <FeatureToggle show={Config.COUNTRY === "ES"}>
          <SpainForm />
        </FeatureToggle>
        <FeatureToggle show={Config.COUNTRY === "US"}>
          <UsForm />
        </FeatureToggle>
      </View>
    );
  }
}
