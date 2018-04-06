import React, { Component } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import t from 'tcomb-form-native'; // 0.6.9

const Form = t.form.Form;

const User = t.struct({
  correo: t.String,
  contraseña: t.String
});

const formStyles = {
  ...Form.stylesheet,
  formGroup: {
    normal: {
      marginBottom: 10
    },
  },
  controlLabel: {
    normal: {
      color: 'blue',
      fontSize: 18,
      marginBottom: 7,
      fontWeight: '600'
    },
    // the style applied when a validation error occours
    error: {
      color: 'black',
      fontSize: 18,
      marginBottom: 7,
      fontWeight: '600'
    }
  }
}

const options = {
  fields: {
    correo: {
      error: 'Necesitas un email!'
    },
    contraseña: {
      error: 'Necesitas una contraseña'
    },
  },
  stylesheet: formStyles,
};

export default class SpainForm extends Component {
  handleSubmit = () => {
    const value = this._form.getValue();
    console.log('value: ', value);
  }

  render() {
    return (
      <View style={styles.container} accessibilityLabel="form_view_es">
        <Form
          ref={c => this._form = c}
          type={User}
          options={options}
        />
        <Button
          title="Inscribirte!"
          onPress={this.handleSubmit}
          accessibilityLabel="submit_button_es"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#aaffff',
  },
});
