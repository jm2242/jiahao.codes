import React from 'react';
import PropTypes from 'prop-types';
import Raven from 'raven-js';

import { Layout } from '../components';

// eslint-disable-next-line import/first
import 'prismjs/themes/prism.css';
import '../styles/globals.css';

if (process.env.NODE_ENV === 'production') {
  Raven.config('https://8df484a9c40c43e2bb15a2376c1248ae@sentry.io/1359490', {
    environment: 'production',
  }).install();
}

export default function LayoutTemplate({ location: { pathname }, children }) {
  return <Layout path={pathname}>{children}</Layout>;
}

LayoutTemplate.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.func.isRequired,
};
