import React from "react"
import PropTypes from 'prop-types';
import styled from 'styled-components'
import Link from 'gatsby-link';

const PostContent = styled.div `
  color: hsla(0, 0%, 0%, 0.8);
  opacity: 0.8;
`;

const PostTitle = styled.h3 `
  margin-top: 1rem;
`;

const PostDate = styled.small `
  display: block;
  margin-bottom: 0.5rem;
`;

const PostExcerpt = styled.p `
  margin-bottom: 0.5rem;
`;

const TimeToRead = styled.p `
  color: hsla(0, 0%, 0%, 0.8);
  text-align: right;
  opacity: 0.6;
`;

const PostLink = styled(Link)
`
  display: inline-block;
  background-image: none;
  border-bottom: 1px solid #eee;
  padding-left: 1rem;
  padding-right: 1rem;

  /* Make the block slightly larger than the container but still aligned to elements outside.
   * It's sufficient to add the offset on the left side, and the +2rem will take care of the right
   * side */
  margin-left: -1rem;
  width: calc(100% + 2rem);

  &:hover {
    background-color: #f8f8f7;
    background-image: none;
  }
`;


const PostList = ({ posts }) => (
    <React.Fragment>
        {posts && posts.map(({ title, path, date, excerpt, tags, timeToRead }) => (
          <PostLink key={path} to={path}>
            <PostTitle>{title}</PostTitle>
            <PostContent>
              <PostDate>{date}</PostDate>
              <PostExcerpt dangerouslySetInnerHTML={{ __html: excerpt }} />
            </PostContent>
            <TimeToRead>
              <small>{`${timeToRead} min read`}</small>
            </TimeToRead>
          </PostLink>
        ))}
    </React.Fragment>
)

PostList.propTypes = {
    posts: PropTypes.shape({
        date: PropTypes.string.isRequired,
        excerpt: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        timeToRead: PropTypes.number.isRequired,
    }).isRequired,
}

export default PostList
