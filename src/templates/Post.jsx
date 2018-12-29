import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from "gatsby"
import { Head, Post } from '../components';
import Layout from "../components/Layout"

import {
  markdownRemark as markdownRemarkPropType,
  site as sitePropType,
} from '../proptypes';

export default function PostTemplate({
  data: {
    site,
    markdownRemark: {
      excerpt,
      id,
      fields: { slug },
      frontmatter: { title, date, excerpt: frontmatterExcerpt, cover },
      html,
    },
  },
  location,
}) {
  const imageSizes = cover && cover.childImageSharp.sizes;
  const imageSrc = imageSizes && imageSizes.src;
  return (
    <Layout>
      <Head
        title={title}
        excerpt={frontmatterExcerpt || excerpt}
        path={slug}
        site={site}
        image={imageSrc}
      />
      <Post
        coverImageSizes={imageSizes}
        date={date}
        excerpt={frontmatterExcerpt}
        html={html}
        id={id}
        location={location}
        title={title}
      />
    </Layout>
  );
}

PostTemplate.propTypes = {
  data: PropTypes.shape({
    markdownRemark: markdownRemarkPropType,
    site: sitePropType.isRequired,
  }).isRequired,
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export const pageQuery = graphql`
  query PostByPath($slug: String!) {
    ...SiteFragment
    markdownRemark(fields: { slug: { eq: $slug } }) {
      ...MarkdownMetadataFragment
      ...MarkdownFrontmatterWithCoverFragment
    }
  }
`;
