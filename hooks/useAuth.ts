export { useAuth } from '@faustwp/core';

import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetFaustViewer {
    viewer {
      name
      username
      capabilities
      databaseId
      email
      firstName
      lastName
      id
      userId
    }
  }
`;
