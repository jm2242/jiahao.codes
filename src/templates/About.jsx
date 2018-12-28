import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from "gatsby"
import { Head, About } from '../components'
import Layout from "../components/Layout"
import {
  markdownRemark as markdownRemarkPropType,
  site as sitePropType,
} from '../proptypes';

export default function AboutTemplate({
  data: {
    site,
    markdownRemark: {
      fields: { slug },
      frontmatter: {
        title,
        cover: { childImageSharp: { sizes: coverImageSizes } },
      },
      html,
    },
  },
}) {
  return (
    <Layout>
      <Head title={title} site={site} path={slug} />
      <About
        title={title}
        html={html}
        social={site.siteMetadata.social}
        coverImageSizes={coverImageSizes}
      />
    </Layout>
  );
}

AboutTemplate.propTypes = {
  data: PropTypes.shape({
    markdownRemark: markdownRemarkPropType,
    site: sitePropType.isRequired,
  }).isRequired,
};

export const pageQuery = graphql`
  query AboutPage($slug: String!) {
    ...SiteFragment
    markdownRemark(fields: { slug: { eq: $slug } }) {
      ...MarkdownMetadataFragment
      ...MarkdownFrontmatterWithCoverFragment
    }
  }
`;
