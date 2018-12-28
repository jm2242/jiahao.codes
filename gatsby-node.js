const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');


exports.onCreateNode = ({ node, actions, getNode }) => {
    const { createNodeField } = actions;

    if (node.internal.type === 'MarkdownRemark') {
        const value = createFilePath({ node, getNode, basePath: `pages` });
        createNodeField({
            name: `slug`,
            node,
            value,
        });
    }
};



/**
 * Helper to create pages
 * @name createPages
 * @function
 * @param {Object} props - a destructured object of props
 * @param {String} filter - a relative path to filter out markdown pages
 * @param {String} componentPath - The relative path of a component to apply to a set of pages
 * @returns {Promise}
 */
const createPages = (
  { graphql, actions: { createPage } },
  filter,
  componentPath,
) =>
  new Promise((resolve, reject) => {

    // grab the template
    const template = path.resolve(componentPath);
    resolve(
      graphql(`
        {
          allMarkdownRemark(
            filter: { fileAbsolutePath: { regex: "${filter}" } }
          ) {
            edges {
              node {
                fields {
                    slug
                }
                frontmatter {
                    title
                }
              }
            }
          }
        }
      `).then((result) => {
        if (result.errors) {
            console.log("Errors in querrying files")
          reject(result.errors);
          return;
        }

        result.data.allMarkdownRemark.edges.forEach(
          ({ node: { fields: { slug } } }) => {
            createPage({
              path: slug,
              component: template,
              context: {
                slug,
              },
            });
          },
        );
      }),
    );
  });

exports.createPages = async (props) => {
  await createPages(props, '/src/pages/blog/', './src/templates/Post.jsx');
  await createPages(props, '/src/pages/about/', './src/templates/About.jsx');
  await createPages(props, '/src/pages/motorcycle/', './src/templates/Motorcycle.jsx');
  await createPages(props, '/src/pages/tech/', './src/templates/Tech.jsx');
};

// Allow me to use something like: import { X } from 'directory' instead of '../../folder/directory'
exports.onCreateWebpackConfig = ({ stage, actions }) => {
  actions.setWebpackConfig({
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },
  })
}
