import React from "react"
import PropTypes from "prop-types"
import { IndexPage } from "../components/IndexPage"

import {
    allMarkdownRemark as allMarkdownRemarkPropType,
    image as imagePropType,
} from '../proptypes';


const PostListTemplate = ({
    data: {
      allMarkdownRemark: {
          edges: posts
      },
      indexCover
  },

}) => (
    <IndexPage
        posts={posts && posts.map(
            ({
                node: {
                    excerpt,
                    timeToRead,
                    frontmatter: { excerpt: frontmatterExcerpt, title, path, date },
                },
            }) => ({
                title,
                path,
                date,
                timeToRead,
                excerpt: frontmatterExcerpt || excerpt,
            }),
        )}
        coverImageSizes={indexCover.sizes}
    />

)

PostListTemplate.propTypes = {
    data: PropTypes.shape({
        allMarkdownRemark: allMarkdownRemarkPropType,
        indexCover: PropTypes.shape({
            sizes: imagePropType,
        }),
    }).isRequired,
};


export const pageQuery = graphql `
  query PostListTemplateQuery {
    ...SiteFragment
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: {
        fileAbsolutePath: {
          regex: "/src/pages/blog//"
        },
        frontmatter: { draft: { ne: true } }
      }
    ) {
      edges {
        node {
          ...MarkdownMetadataFragment
          ...MarkdownFrontmatterFragment
        }
      }
    }
    indexCover: imageSharp(id: { regex: "/indexCover/" }) {
      sizes(maxWidth: 2560) {
        ...GatsbyImageSharpSizes
      }
    }
  }
`

export default PostListTemplate
