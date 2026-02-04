/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLClient, gql } from "graphql-request";
import { Person } from "../types/graphqlTypes";

interface FilterOptions {
  relationshipTypes: string[];
  frequencyRange: [number, number];
  importanceRange: [number, number];
}

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

export const fetchPeopleWithFilters = async (filters: FilterOptions) => {
  const query = gql`
    query GetPeopleWithFilters(
      $frequencyMin: Int!
      $frequencyMax: Int!
      $importanceMin: Int!
      $importanceMax: Int!
      $statuses: [RelationshipStatus!]!
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
                { frecuency_GTE: $frequencyMin }
                { frecuency_LTE: $frequencyMax }
                { importance_GTE: $importanceMin }
                { importance_LTE: $importanceMax }
                { status_IN: $statuses }
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
    frequencyMin: filters.frequencyRange[0] || 1,
    frequencyMax: filters.frequencyRange[1] || 10,
    importanceMin: filters.importanceRange[0] || 1,
    importanceMax: filters.importanceRange[1] || 10,
    statuses: filters.relationshipTypes,
  };

  const data = await client.request<{ people: Person[] }>(query, variables);
  
  // Filtrar personas que no tengan relaciones después del filtrado en servidor
  const filteredPeople: Person[] = data.people.filter(
    person => (person.relationshipsConnection?.totalCount || 0) > 0
  );
  
  return filteredPeople;
  
  return filteredPeople;
};

export const fetchFriendsList = async (personId: string) => {
  const query = gql`
    query GetFriendsList($personId: ID!) {
      people(where: { id_EQ: $personId }) {
        relationshipsConnection(
          where: { edge: { status_EQ: FRIEND } }
        ) {
          edges {
            node {
              id
              name
              nickname
              email
              photoUrl
              relationshipsConnection {
                totalCount
              }
            }
          }
        }
      }
    }
  `;

  const variables = { personId };
  const data = await client.request<{ people: Person[] }>(query, variables);
  
  if (data.people[0]?.relationshipsConnection?.edges) {
    return data.people[0].relationshipsConnection.edges.map(
      (edge) => edge.node
    );
  }
  return [];
};

export const fetchFamilyList = async (personId: string) => {
  const query = gql`
    query GetFamilyList($personId: ID!) {
      people(where: { id_EQ: $personId }) {
        relationshipsConnection(
          where: { edge: { status_EQ: FAMILY } }
        ) {
          edges {
            node {
              id
              name
              nickname
              email
              photoUrl
              relationshipsConnection {
                totalCount
              }
            }
          }
        }
      }
    }
  `;

  const variables = { personId };
  const data = await client.request<{ people: Person[] }>(query, variables);
  
  if (data.people[0]?.relationshipsConnection?.edges) {
    return data.people[0].relationshipsConnection.edges.map(
      (edge) => edge.node
    );
  }
  return [];
};

export const fetchCommonFriends = async (personId1: string, personId2: string) => {
  const query = gql`
    query GetCommonFriends($personId1: ID!, $personId2: ID!) {
      person1: people(where: { id_EQ: $personId1 }) {
        relationshipsConnection(
          where: { edge: { status_EQ: FRIEND } }
        ) {
          edges {
            node {
              id
            }
          }
        }
      }
      person2: people(where: { id_EQ: $personId2 }) {
        relationshipsConnection(
          where: { edge: { status_EQ: FRIEND } }
        ) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  `;

  const variables = { personId1, personId2 };
  const data = await client.request<{
    person1: Person[];
    person2: Person[];
  }>(query, variables);

  const friends1 = data.person1[0]?.relationshipsConnection?.edges.map(
    (edge) => edge.node.id
  ) || [];
  const friends2 = data.person2[0]?.relationshipsConnection?.edges.map(
    (edge) => edge.node.id
  ) || [];

  const commonIds = friends1.filter((id) => friends2.includes(id));

  // Obtener detalles de amigos comunes
  if (commonIds.length === 0) return [];

  const detailsQuery = gql`
    query GetFriendsDetails {
      people(where: { id: { in: ${JSON.stringify(commonIds)} } }) {
        id
        name
        nickname
        email
        photoUrl
        relationshipsConnection {
          totalCount
        }
      }
    }
  `;

  const detailsData = await client.request<{ people: Person[] }>(detailsQuery);
  return detailsData.people;
};

export const fetchMostConnectedPerson = async () => {
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
              name
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
  
  // Encontrar la persona con más conexiones
  const mostConnected = data.people.reduce((prev, current) => 
    (prev.relationshipsConnection?.totalCount || 0) > (current.relationshipsConnection?.totalCount || 0) ? prev : current
  );
  
  return mostConnected ? [mostConnected] : [];
};

export const fetchInfluentialPerson = async () => {
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
              name
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
  
  // Encontrar la persona con mayor influencia (suma de importancia en sus relaciones)
  const mostInfluential = data.people.reduce((prev, current) => {
    const prevImportance = prev.relationshipsConnection?.edges.reduce((sum, edge) => sum + (edge.properties.importance || 0), 0) || 0;
    const currentImportance = current.relationshipsConnection?.edges.reduce((sum, edge) => sum + (edge.properties.importance || 0), 0) || 0;
    return currentImportance > prevImportance ? current : prev;
  });
  
  return mostInfluential ? [mostInfluential] : [];
};

// Nuevas queries que usan campos Cypher personalizados
export const fetchInfluentialPeopleWithCypher = async (limit: number = 10) => {
  const query = gql`
    query GetInfluentialPeople($limit: Int!) {
      influentialPeople(limit: $limit) {
        id
        name
        nickname
        email
        photoUrl
        averageImportance
        relationshipsConnection {
          totalCount
        }
      }
    }
  `;

  const variables = { limit };
  const data = await client.request<{ influentialPeople: any[] }>(query, variables);
  return data.influentialPeople;
};

export const fetchMostConnectedPersonWithCypher = async () => {
  const query = gql`
    query GetMostConnectedPerson {
      mostConnectedPerson {
        id
        name
        nickname
        email
        photoUrl
        relationshipsConnection {
          totalCount
        }
      }
    }
  `;

  const data = await client.request<{ mostConnectedPerson: any }>(query);
  return data.mostConnectedPerson;
};

export const fetchMutualFriends = async (personId1: string, personId2: string) => {
  const query = gql`
    query GetMutualFriends($personId1: ID!, $personId2: ID!) {
      mutualFriendsQuery(personId1: $personId1, personId2: $personId2) {
        id
        name
        nickname
        email
        mutualFriendsCount
      }
    }
  `;

  const variables = { personId1, personId2 };
  const data = await client.request<{ mutualFriendsQuery: any[] }>(query, variables);
  return data.mutualFriendsQuery;
};

export const fetchFriendsWithCypher = async (personId: string) => {
  const query = gql`
    query GetFriends($personId: ID!) {
      people(where: { id_EQ: $personId }) {
        friends {
          id
          name
          nickname
          email
          photoUrl
        }
      }
    }
  `;

  const variables = { personId };
  const data = await client.request<{ people: any[] }>(query, variables);
  return data.people[0]?.friends || [];
};

export const fetchFamilyWithCypher = async (personId: string) => {
  const query = gql`
    query GetFamily($personId: ID!) {
      people(where: { id_EQ: $personId }) {
        familyMembers {
          id
          name
          nickname
          email
          photoUrl
        }
      }
    }
  `;

  const variables = { personId };
  const data = await client.request<{ people: any[] }>(query, variables);
  return data.people[0]?.familyMembers || [];
};
