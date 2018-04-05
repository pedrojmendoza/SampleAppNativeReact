import { Component } from 'react';
import PropTypes from 'prop-types';

class FeatureToggle extends Component {
  render() {
    return this.props.show ? this.props.children : null;
  }
}

FeatureToggle.propTypes = {
  show: PropTypes.bool,
  children: PropTypes.node,
};

FeatureToggle.defaultProps = {
  show: false,
  children: [],
};

export default FeatureToggle;
