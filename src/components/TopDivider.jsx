import React from "react"
import styled from 'styled-components'

const FlexDiv = styled.div `
  display: flex;
  justify-content: center;
`
const Separator = styled.div `
  width: 50%;
  height: 1px;
  background-color: #ccc;
  margin-top: 2rem;
  margin-bottom: 1.45rem;
`;


const TopDivider = () => (
    <FlexDiv>
      <Separator />
    </FlexDiv>
)

export default TopDivider
