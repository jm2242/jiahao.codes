import React from 'react';
import PropTypes from 'prop-types';
import Link from 'gatsby-link';
import styled from 'styled-components';

const HeaderStyled = styled.header`
  margin-top: 1.2rem;
  border-bottom: 1px solid #d6d6d6;
`;

const NavLink = styled(Link)`
  background-image: none;

  &:hover {
    background-image: none;
  }
`;

const List = styled.ul`
  display: flex;
  list-style: none;
  margin-bottom: 0;

  /* So that it doesn't appear inlined with the bottom border */
  margin-left: 0.5rem;
  margin-right: 0.5rem;

  @media only screen and (max-width: 575.98px) {
    display: block;
    margin: 0;
  }
`;

const ListItem = styled.li`
  flex-grow: ${({ shouldGrow }) => (shouldGrow ? 1 : null)};
  padding-left: 1rem;

  &:first-child {
    padding-left: 0;
  }
`;

const SiteTitle = styled.h3`
  display: inline-block;
  font-size: 1.4rem;
  font-weight: 500;
  margin: 0;
  color: ${(props) => (props.active ? '#26418f' : '')};
  cursor: ${(props) => (props.active ? 'default' : '')};

  &:hover {
    color: #26418f;
  }
`;

const SiteLink = SiteTitle.extend`
  font-size: 1rem;
  opacity: 0.7;

  /* Always keep 5px + 2px of space for the block so that the bottom border does not
  shift when navigating */
  padding-bottom: ${(props) => (props.active ? '5px' : '7px')};
  border-bottom: ${(props) => (props.active ? '2px solid #26418f' : '')};
`;

export default function Header({ path }) {
  return (
    <HeaderStyled>
      <nav>
        <List>
          <ListItem shouldGrow>
            <NavLink to="/">
              <SiteTitle active={path === '/'}>Home</SiteTitle>
            </NavLink>
          </ListItem>
          <ListItem>
            <NavLink to="/about">
              <SiteLink active={path === '/about'}>About</SiteLink>
            </NavLink>
          </ListItem>
        </List>
      </nav>
    </HeaderStyled>
  );
}

Header.propTypes = {
  path: PropTypes.string.isRequired,
};
