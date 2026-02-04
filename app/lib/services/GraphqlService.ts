import { GraphQLClient, gql } from "graphql-request";
import { Person } from "../types/graphqlTypes";

const client = new GraphQLClient("http://localhost:4000/graphql");

export const fetchPeople = async () => {
  const query = gql`
    query {
      people {
        id
        name
        nickname
        email
        photoUrl
        relationshipsConnection {
          edges {
            node {
              id
            }
            properties {
              status
              importance
              frecuency
            }
          }
          totalCount
        }
      }
    }
  `;

  const data = await client.request<{ people: Person[] }>(query);
  return data.people;
};

export const fetchPeopleWithFilters = async (filters: any) => {
  const query = gql`
    query GetPeopleWithFilters(
      $statusFilters: [RelationshipStatus!]!
      $frequencyMin: Int!
      $frequencyMax: Int!
      $importanceMin: Int!
      $importanceMax: Int!
    ) {
      people {
        id
        name
        nickname
        email
        photoUrl
        relationshipsConnection(
          where: {
            edge: {
              AND: [
                { status: { in: $statusFilters } }
                { frecuency: { gte: $frequencyMin, lte: $frequencyMax } }
                { importance: { gte: $importanceMin, lte: $importanceMax } }
              ]
            }
          }
        ) {
          edges {
            node {
              id
            }
            properties {
              status
              importance
              frecuency
            }
          }
          totalCount
        }
      }
    }
  `;

  const variables = {
    statusFilters: filters.relationshipTypes && filters.relationshipTypes.length > 0 
      ? filters.relationshipTypes 
      : ["FRIEND", "FAMILY", "COLLEAGUE"],
    frequencyMin: filters.frequencyRange[0] || 1,
    frequencyMax: filters.frequencyRange[1] || 10,
    importanceMin: filters.importanceRange[0] || 1,
    importanceMax: filters.importanceRange[1] || 10,
  };

  const data = await client.request<{ people: Person[] }>(query, variables);
  return data.people;
};
