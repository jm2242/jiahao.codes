import React from 'react';
import Raven from 'raven-js';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import 'prismjs/themes/prism.css'
import '../styles/globals.css'

import Header from './Header';
import Footer from './Footer';



const LayoutDiv = styled.div`
  padding-left: 1rem;
  padding-right: 1rem;
`;

const ContentDiv = styled.div`
  margin: 3rem auto;
  max-width: 900px;
`;

if (process.env.NODE_ENV === 'production') {
  Raven.config('https://8df484a9c40c43e2bb15a2376c1248ae@sentry.io/1359490', {
    environment: 'production',
  }).install();
}

export default function Layout({ path, children }) {
  return (
    <LayoutDiv>
      <Header path={path} />
      <ContentDiv>{children}</ContentDiv>
      <Footer />
    </LayoutDiv>
  );
}

Layout.propTypes = {
  path: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
};
