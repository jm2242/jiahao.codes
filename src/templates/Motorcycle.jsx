import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from "gatsby"
import Layout from "../components/Layout"

import { Head, IndexPage } from '../components';
import {
  allMarkdownRemark as allMarkdownRemarkPropType,
  image as imagePropType,
} from '../proptypes';

export default function Motorcycle({
  data: { site, allMarkdownRemark: { edges: posts }, indexCover },
}) {
  return (
    <Layout>
      <Head site={site} title="Motorcycle" path="/motorcycle" />
      <IndexPage
        title="Motorcycle Posts"
        posts={posts && posts.map(
          ({
            node: {
              excerpt,
              fields,
              timeToRead,
              frontmatter: { excerpt: frontmatterExcerpt, title, date },
            },
          }) => ({
            date,
            fields,
            timeToRead,
            title,
            excerpt: frontmatterExcerpt || excerpt,
          }),
        )}
        // coverImageSizes={indexCover.sizes}
      />
    </Layout>
  );
}

Motorcycle.propTypes = {
  data: PropTypes.shape({
    allMarkdownRemark: allMarkdownRemarkPropType,
    indexCover: PropTypes.shape({
      sizes: imagePropType,
    }),
  }).isRequired,
};

export const pageQuery = graphql`
  query MotorcyclePostsQuery {
    ...SiteFragment
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: {
        fileAbsolutePath: {
          regex: "/src/pages/blog//"
        },
        frontmatter: {
            tags: { in: ["motorcycle"] }
            draft: { ne: true }
        }
      }
    ) {
      edges {
        node {
          ...MarkdownMetadataFragment
          ...MarkdownFrontmatterFragment
        }
      }
    }
  }
`;
