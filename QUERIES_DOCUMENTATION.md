# GraphQL Queries Documentation

## Resumen de Capabilities

Con **Neo4j GraphQL**, es **totalmente posible** ingresar código **Cypher** personalizado mediante la directiva `@cypher`. Esta directiva permite:

- Ejecutar consultas Cypher complejas directamente desde GraphQL
- Acceder a variables globales como `this`, `$variables`, y `auth`
- Devolver tipos escalares, objetos o listas de nodos
- Combinar lógica personalizada con el schema generado automáticamente

---

## Queries Implementadas

### 1. **GetFriends** - Lista de Amigos
Obtiene todos los amigos de una persona específica (relaciones con status `FRIEND`).

```graphql
query GetFriends($personId: ID!) {
  people(where: { id: $personId }) {
    id
    name
    friends: relationshipsConnection(
      where: {
        edge: { status: { eq: FRIEND } }
      }
    ) {
      edges {
        node {
          id
          name
          nickname
          email
        }
        properties {
          status
          frecuency
          importance
        }
      }
      totalCount
    }
  }
}
```

**Variables de ejemplo:**
```json
{
  "personId": "person-id-1"
}
```

---

### 2. **GetFamilyMembers** - Lista de Familiares
Obtiene todos los familiares de una persona específica (relaciones con status `FAMILY`).

```graphql
query GetFamilyMembers($personId: ID!) {
  people(where: { id: $personId }) {
    id
    name
    familyMembers: relationshipsConnection(
      where: {
        edge: { status: { eq: FAMILY } }
      }
    ) {
      edges {
        node {
          id
          name
          nickname
          email
        }
        properties {
          status
          frecuency
          importance
        }
      }
      totalCount
    }
  }
}
```

**Variables de ejemplo:**
```json
{
  "personId": "person-id-1"
}
```

---

### 3. **GetMutualFriends** - Amigos Comunes
Obtiene los amigos comunes entre dos personas específicas. **Utiliza código Cypher personalizado**.

```graphql
query GetMutualFriends($personId1: ID!, $personId2: ID!) {
  mutualFriendsQuery(personId1: $personId1, personId2: $personId2) {
    id
    name
    nickname
    email
    mutualFriendsCount
  }
}
```

**Variables de ejemplo:**
```json
{
  "personId1": "person-id-1",
  "personId2": "person-id-2"
}
```

**Código Cypher subyacente:**
```cypher
MATCH (p1:Person {id: $personId1})-[rel1:HAS_RELATIONSHIP {status: "FRIEND"}]->(friend:Person)
MATCH (p2:Person {id: $personId2})-[rel2:HAS_RELATIONSHIP {status: "FRIEND"}]->(friend)
RETURN {
  id: friend.id,
  name: friend.name,
  nickname: friend.nickname,
  email: friend.email,
  mutualFriendsCount: 1
} as result
```

---

### 4. **GetMostConnectedPerson** - Persona con Mayor Número de Relacionados
Obtiene la persona con el mayor número de relaciones.

```graphql
query GetMostConnectedPerson {
  people(options: { limit: 1, sort: [{ relationshipsConnection: { totalCount: DESC } }] }) {
    id
    name
    nickname
    email
    totalRelationships: relationshipsConnection {
      totalCount
    }
  }
}
```

**Alternativa con Cypher personalizado:**
```graphql
query {
  mostConnectedPerson {
    id
    name
    nickname
    email
  }
}
```

**Código Cypher subyacente:**
```cypher
MATCH (p:Person)-[rel:HAS_RELATIONSHIP]->()
WITH p, COUNT(rel) as connectionCount
ORDER BY connectionCount DESC
RETURN p
LIMIT 1
```

---

### 5. **GetInfluentialPeople** - Personas Influyentes
Obtiene las personas más influyentes ordenadas por promedio de importancia en sus relaciones. **Utiliza código Cypher personalizado**.

```graphql
query GetInfluentialPeople($limit: Int = 10) {
  influentialPeople(limit: $limit) {
    id
    name
    nickname
    email
    averageImportance
  }
}
```

**Variables de ejemplo:**
```json
{
  "limit": 10
}
```

**Código Cypher subyacente:**
```cypher
MATCH (p:Person)-[rel:HAS_RELATIONSHIP]->()
WITH p, CASE WHEN COUNT(rel) > 0 THEN toFloat(SUM(rel.importance)) / COUNT(rel) ELSE 0.0 END as avgImportance
ORDER BY avgImportance DESC
RETURN p
LIMIT $limit
```

---

## Campos Personalizados (Custom Fields)

### `averageImportance` - Campo en el tipo Person
Calcula el promedio de importancia en todas las relaciones de una persona.

```graphql
{
  people {
    id
    name
    averageImportance
  }
}
```

**Código Cypher subyacente:**
```cypher
MATCH (this)-[rel:HAS_RELATIONSHIP]->()
RETURN CASE WHEN COUNT(rel) > 0 THEN toFloat(SUM(rel.importance)) / COUNT(rel) ELSE 0.0 END as result
```

---

### `friends` - Campo en el tipo Person
Lista todos los amigos de una persona.

```graphql
{
  people {
    id
    name
    friends {
      id
      name
      nickname
    }
  }
}
```

**Código Cypher subyacente:**
```cypher
MATCH (this)-[rel:HAS_RELATIONSHIP {status: "FRIEND"}]->(friend:Person)
RETURN friend
```

---

### `familyMembers` - Campo en el tipo Person
Lista todos los familiares de una persona.

```graphql
{
  people {
    id
    name
    familyMembers {
      id
      name
      nickname
    }
  }
}
```

**Código Cypher subyacente:**
```cypher
MATCH (this)-[rel:HAS_RELATIONSHIP {status: "FAMILY"}]->(family:Person)
RETURN family
```

---

## Ventajas de Usar @cypher

1. **Consultas complejas**: Ejecuta lógica Cypher sofisticada que sería difícil de expresar en GraphQL puro
2. **Rendimiento**: Neo4j genera una única consulta Cypher optimizada, evitando el problema N+1
3. **Acceso a variables**: Usa `this` para referirse al nodo actual, `$variables` para parámetros y `$auth` para información de autenticación
4. **Flexibilidad**: Combina lo mejor de GraphQL y Cypher

---

## Cómo Usar en el Cliente

```javascript
import { gql } from 'graphql-request';

const GET_INFLUENTIAL_PEOPLE = gql`
  query GetInfluentialPeople($limit: Int = 10) {
    influentialPeople(limit: $limit) {
      id
      name
      nickname
      email
      averageImportance
    }
  }
`;

// En tu componente React
const { data } = await client.request(GET_INFLUENTIAL_PEOPLE, { limit: 5 });
```

---

## Referencias Oficiales

- [Neo4j GraphQL Library Documentation](https://neo4j.com/docs/graphql-manual/current/)
- [@cypher Directive Documentation](https://neo4j.com/docs/graphql-manual/current/directives/custom-logic/#_cypher)
- [Cypher Manual](https://neo4j.com/docs/cypher-manual/current/)
