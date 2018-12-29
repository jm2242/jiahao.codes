/* eslint-disable react/no-danger */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "gatsby"
import ReactDisqusComments from "react-disqus-comments"
import styled from 'styled-components'

import Image from './Image';
import { image as imagePropType } from '../proptypes';

const Title = styled.h1`
  @media only screen and (min-width: 740px) {
    font-size: 3.3rem;
  }
`;

const Date = styled.p`
  text-align: right;
  opacity: 0.7;
`;

const Excerpt = styled.p`
  opacity: 0.7;
  font-size: 1.1rem;
  margin-bottom: 0;
`;

export default function Post({
  coverImageSizes,
  date,
  excerpt,
  html,
  id,
  location: { href },
  title,
}) {
  return (
    <div>
      <Title>{title}</Title>
      <Excerpt dangerouslySetInnerHTML={{ __html: excerpt }} />
      <Date>
        <small>{date}</small>
      </Date>
      {coverImageSizes && <Image alt={title} sizes={coverImageSizes} />}
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <hr />
      <ReactDisqusComments
        shortname="jonathanmares"
        identifier={id}
        title={title}
        url={href}
        onNewComment={() => {}}
		  />
      <p>
        <Link to="/about">I’m</Link> Jonathan Mares, {"I'm"} a software engineer in Washington, DC. Follow me on{' '}
        <a href="https://twitter.com/jmares93" rel="noopener noreferrer">
          Twitter
        </a>!
      </p>
    </div>
  );
}

Post.propTypes = {
  coverImageSizes: imagePropType,
  date: PropTypes.string.isRequired,
  excerpt: PropTypes.string.isRequired,
  html: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string.isRequired,
};

Post.defaultProps = {
  coverImageSizes: null,
};
