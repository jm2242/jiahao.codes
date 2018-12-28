/* eslint-disable react/no-danger */

import React from 'react';
import PropTypes from 'prop-types'
import styled from 'styled-components'
import PostList from "./PostList"
import TopDivider from "./TopDivider"
import { image as imagePropType } from '../proptypes'


const Title = styled.h1`
  margin-bottom: 2.175rem;
`;

const Text = styled.p`
  margin-bottom: 1.175rem;
`;

const IndexPage = ({ posts, title, text }) => (
    <div>
        <Title>{title}</Title>
        <Text>{text}</Text>
        <TopDivider />
        <div>
            <PostList posts={posts} />
        </div>
    </div>
)

IndexPage.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      excerpt: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      timeToRead: PropTypes.number.isRequired,
    }),
  ).isRequired,
  coverImageSizes: imagePropType.isRequired,
};

export default IndexPage
