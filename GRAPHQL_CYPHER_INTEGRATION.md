# Integración: GraphQL + Cypher + Neo4j

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ ReportsPanel│  │FiltersPanel │  │CypherPanel  │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         └────────────────┼────────────────┘                │
│                          │ GraphQL Client                   │
│                   graphql-request                           │
│                          │                                  │
├──────────────────────────┼──────────────────────────────────┤
│                          ▼                                  │
│  Apollo Server (http://localhost:4000/graphql)             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Schema con Campos @cypher                           │   │
│  │ - Campos computados (averageImportance, etc.)       │   │
│  │ - Queries personalizadas (influentialPeople, etc.)  │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                  │
├─────────────────────────┼──────────────────────────────────┤
│                         ▼                                  │
│     Neo4j GraphQL Library (Traductor)                      │
│     ┌──────────────────────────────────────────────┐      │
│     │ Convierte GraphQL Query → Cypher Query       │      │
│     │ Ejecuta Cypher en Neo4j                      │      │
│     │ Retorna resultados                           │      │
│     └──────────────────────┬───────────────────────┘      │
│                            │                              │
├────────────────────────────┼──────────────────────────────┤
│                            ▼                              │
│  Neo4j Database (bolt://127.0.0.1:7687)                  │
│  ┌────────────────────────────────────────────────┐      │
│  │ Nodos Person + Relaciones HAS_RELATIONSHIP    │      │
│  │ Índices para optimización                     │      │
│  │ Cypher Engine para ejecución                  │      │
│  └────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Ejecución de una Query

### Ejemplo: Obtener Amigos de una Persona

#### Paso 1: Frontend Ejecuta Consulta GraphQL

```typescript
// ReportsPanel.tsx o CypherPanel.tsx
const friends = await fetchFriendsList(personId);
```

#### Paso 2: GraphqlService Prepara Query

```typescript
// GraphqlService.ts
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
            email
          }
          properties {
            importance
            frecuency
          }
        }
      }
    }
  }
`;
```

#### Paso 3: Apollo Server Recibe Request

```bash
POST /graphql
Content-Type: application/json

{
  "query": "...",
  "variables": { "personId": "123" }
}
```

#### Paso 4: Neo4j GraphQL Library Traduce

```
GraphQL Query ──────────────────────► Cypher Query
                (Neo4j GraphQL Library)

people(where: { id_EQ: $personId })
    ▼
MATCH (n:Person {id: $personId})

relationshipsConnection(where: { edge: { status_EQ: FRIEND } })
    ▼
MATCH (n)-[rel:HAS_RELATIONSHIP {status: "FRIEND"}]->(friend:Person)

edges { node { id } }
    ▼
RETURN friend.id, friend.name, friend.email, rel.importance, rel.frecuency
```

#### Paso 5: Neo4j Ejecuta Cypher

```cypher
MATCH (n:Person {id: "123"})-[rel:HAS_RELATIONSHIP {status: "FRIEND"}]->(friend:Person)
RETURN friend.id, friend.name, friend.email, rel.importance, rel.frecuency
```

Neo4j Engine:
1. Usa índice para encontrar Person con id="123"
2. Busca relaciones HAS_RELATIONSHIP con status="FRIEND"
3. Retorna nodos destino (friends) y propiedades

#### Paso 6: Apollo Server Formatea Respuesta

```json
{
  "data": {
    "people": [
      {
        "relationshipsConnection": {
          "edges": [
            {
              "node": {
                "id": "456",
                "name": "Maria",
                "email": "maria@example.com"
              },
              "properties": {
                "importance": 8,
                "frecuency": 7
              }
            },
            {
              "node": {
                "id": "789",
                "name": "Pedro",
                "email": "pedro@example.com"
              },
              "properties": {
                "importance": 6,
                "frecuency": 5
              }
            }
          ]
        }
      }
    ]
  }
}
```

#### Paso 7: Frontend Recibe y Renderiza

```typescript
setReportData([
  { id: "456", name: "Maria", ... },
  { id: "789", name: "Pedro", ... }
]);

// Renderiza en ReportsPanel
```

---

## 🎯 Campos @cypher vs Queries Normales

### Diferencia 1: Campos Computados

```graphql
type Person {
  id: ID!
  name: String!
  
  # Campo normal - almacenado en Neo4j
  email: String!
  
  # Campo @cypher - calculado dinámicamente
  averageImportance: Float
    @cypher(statement: "...")
  
  # Relación normal - definida en schema
  relationships: [Person!]!
    @relationship(...)
  
  # Relación @cypher - filtrada con Cypher
  friends: [Person!]!
    @cypher(statement: "...")
}
```

### Diferencia 2: En Ejecución

```
Campo Normal:
GraphQL → Neo4j retorna propiedad → Frontend

Campo @cypher:
GraphQL → Neo4j ejecuta Cypher en MATCH → calcula valor → retorna → Frontend
```

### Ejemplo Práctico

**Query GraphQL**:
```graphql
query {
  people {
    id
    name
    email                    # Propiedad simple
    averageImportance        # Campo @cypher (calculado)
    friends {                # Relación @cypher (filtrada)
      id
      name
    }
  }
}
```

**Detrás de escenas**:
1. Neo4j obtiene `id`, `name`, `email` directamente
2. Para cada Person, ejecuta Cypher para calcular `averageImportance`
3. Para cada Person, ejecuta Cypher para obtener `friends` (solo FRIEND status)

---

## 🔍 Comparativa: GraphQL vs Cypher

### Escenario: Obtener Top 5 Personas por Influencia

#### Opción 1: GraphQL Puro

```graphql
query {
  people(orderBy: [{averageImportance: DESC}], limit: 5) {
    id
    name
    averageImportance
  }
}
```

✅ **Ventajas**: Simple, sintaxis consistente
❌ **Desventajas**: Depende de que GraphQL soporte ORDER BY y LIMIT en todas las entidades

#### Opción 2: Cypher como Query

```graphql
query {
  influentialPeople(limit: 5) {    # Query @cypher
    id
    name
    averageImportance
  }
}
```

✅ **Ventajas**: Control total, optimizado
❌ **Desventajas**: Requiere escribir Cypher

**Ambas retornan lo mismo**, la diferencia es poder y flexibilidad.

---

## 🛠️ Definición del Schema

### Ubicación: `backend/lib/types/graphql_definitions.graphql`

```graphql
type Person @node {
  # Propiedades normales (almacenadas en Neo4j)
  id: ID!
  name: String!
  nickname: String
  email: String!
  photoUrl: String
  
  # Relación normal (definida con @relationship)
  relationships: [Person!]!
    @relationship(
      type: "HAS_RELATIONSHIP"
      direction: OUT
      properties: "RelationshipProperties"
    )
  
  # Campo computado con @cypher
  averageImportance: Float
    @cypher(
      statement: """
      MATCH (this)-[rel:HAS_RELATIONSHIP]->()
      RETURN CASE WHEN COUNT(rel) > 0 
        THEN toFloat(SUM(rel.importance)) / COUNT(rel) 
        ELSE 0.0 
      END as result
      """
      columnName: "result"
    )
  
  # Relación filtrada con @cypher
  friends: [Person!]!
    @cypher(
      statement: """
      MATCH (this)-[rel:HAS_RELATIONSHIP {status: "FRIEND"}]->(friend:Person)
      RETURN friend
      """
      columnName: "friend"
    )
}

# Propiedades que acompañan a relaciones
type RelationshipProperties @relationshipProperties {
  status: RelationshipStatus!
  frecuency: Int!
  importance: Int!
}

# Enum para tipos de relación
enum RelationshipStatus {
  FRIEND
  FAMILY
  COLLEAGUE
}

# Queries personalizadas con @cypher
type Query {
  influentialPeople(limit: Int = 10): [Person!]!
    @cypher(
      statement: """
      MATCH (p:Person)-[rel:HAS_RELATIONSHIP]->()
      WITH p, CASE WHEN COUNT(rel) > 0 
        THEN toFloat(SUM(rel.importance)) / COUNT(rel) 
        ELSE 0.0 
      END as avgImportance
      ORDER BY avgImportance DESC
      RETURN p
      LIMIT $limit
      """
      columnName: "p"
    )
  
  mostConnectedPerson: Person
    @cypher(
      statement: """
      MATCH (p:Person)-[rel:HAS_RELATIONSHIP]->()
      WITH p, COUNT(rel) as count
      ORDER BY count DESC
      RETURN p
      LIMIT 1
      """
      columnName: "p"
    )
}
```

### Sintaxis Clave

| Elemento | Significado |
|----------|------------|
| `@node` | Define que es un nodo Neo4j |
| `@relationship` | Define relaciones entre nodos |
| `@relationshipProperties` | Define propiedades de relaciones |
| `@cypher` | Ejecuta Cypher query para el campo |
| `statement: """..."""` | Código Cypher |
| `columnName: "result"` | Columna Cypher a retornar |
| `this` | Referencia a nodo actual (en campos) |
| `$limit`, `$personId` | Parámetros dinámicos |

---

## 📊 Tipos de Queries en el Proyecto

### 1. Queries Simples (GraphQL directo)

```typescript
// GraphqlService.ts
export const fetchPeople = async () => {
  const query = gql`query { people { id name } }`;
  return client.request(query);
};
```

✅ Sin lógica de negocio
✅ Retorna datos almacenados directamente

### 2. Queries con Filtros (GraphQL + Lógica)

```typescript
export const fetchPeopleWithFilters = async (filters) => {
  const query = gql`
    query GetPeopleWithFilters(...) {
      people {
        relationshipsConnection(where: { ... }) { ... }
      }
    }
  `;
  // Variables parametrizadas
  const data = await client.request(query, variables);
  // Filtrado en cliente si es necesario
  return filterPeople(data);
};
```

✅ Filtrado robusto
✅ Combinación servidor/cliente

### 3. Queries Cypher (GraphQL + Cypher)

```typescript
export const fetchInfluentialPeopleWithCypher = async (limit) => {
  const query = gql`
    query {
      influentialPeople(limit: $limit) {
        id
        name
        averageImportance  # Calculado con Cypher
      }
    }
  `;
  return client.request(query, { limit });
};
```

✅ Lógica compleja ejecutada en Neo4j
✅ Máxima eficiencia

---

## 🔐 Seguridad: Parámetros vs Interpolación

### ❌ INCORRECTO - Vulnerable a inyección

```typescript
const personId = "123\"; DROP TABLE Person; --";

const query = gql`
  query {
    people(where: { id_EQ: "${personId}" })  // ¡INSEGURO!
  }
`;
```

### ✅ CORRECTO - Usar parámetros

```typescript
const personId = "123\"; DROP TABLE Person; --";

const query = gql`
  query GetPerson($personId: ID!) {
    people(where: { id_EQ: $personId })
  }
`;

const data = await client.request(query, { personId });
// Neo4j trata personId como VALOR, no como código
```

**Todos los queries en el proyecto usan parámetros** ✅

---

## 📈 Performance y Optimización

### Índices en Neo4j

```cypher
-- Crear índices para propiedades frecuentes
CREATE INDEX ON :Person(id)
CREATE INDEX ON :Person(name)
CREATE INDEX ON :Person(email)
```

Neo4j automáticamente usa índices en:
- WHERE clauses
- MATCH con propiedades específicas
- ORDER BY

### Queries Optimizados vs No Optimizados

```cypher
-- ❌ Procesa todos los nodos
MATCH (p:Person)
RETURN p
ORDER BY p.name DESC
LIMIT 10

-- ✅ Usa índice primero
MATCH (p:Person)
WHERE p.active = true    -- Filtra temprano
RETURN p
ORDER BY p.name DESC
LIMIT 10
```

---

## 🐛 Debugging Queries

### 1. Ver Query Generada

En Apollo Server logs:

```
POST /graphql
{ "query": "query GetPeople { ... }" }

↓ Convierte a Cypher ↓

MATCH (p:Person) RETURN p
```

### 2. EXPLAIN Plan

```cypher
EXPLAIN MATCH (p:Person)-[:FRIEND]->(f:Person) RETURN p, f
```

Muestra el plan sin ejecutar

### 3. PROFILE Statistics

```cypher
PROFILE MATCH (p:Person)-[:FRIEND]->(f:Person) RETURN p, f
```

Ejecuta y muestra:
- Nodos procesados
- Relaciones examinadas
- Índices usados
- Tiempo total

---

## 🚀 Mejores Prácticas

### 1. Usar Campos @cypher Para Cálculos

```graphql
# En lugar de:
# Obtener person, después calcular manualmente en cliente

# Usar:
query {
  people {
    averageImportance  # Calculado en Neo4j
  }
}
```

### 2. Usar Queries @cypher Para Lógica Compleja

```graphql
# En lugar de:
# Obtener todas las personas y filtrar en cliente

# Usar:
query {
  influentialPeople(limit: 10)  # Filtra en Neo4j
}
```

### 3. Especificar Tipos de Nodos

```cypher
# ✅ Bueno
MATCH (p:Person)-[:FRIEND]->(f:Person)

# ❌ Menos eficiente
MATCH (p)-[:FRIEND]->(f)
```

### 4. Limitar Resultados Temprano

```cypher
# ✅ Con LIMIT
MATCH (p:Person) RETURN p LIMIT 100

# Considerar: ¿Necesito 1 millón de resultados?
```

### 5. Documentar Queries Complejas

```cypher
// Obtiene amigos comunes entre dos personas
// Parámetros: $personId1, $personId2
// Retorna: Array de Person nodes
MATCH (p1:Person {id: $personId1})-[:FRIEND]->(friend:Person)
MATCH (p2:Person {id: $personId2})-[:FRIEND]->(friend)
RETURN friend
```

---

## 📚 Recursos

- **Neo4j Official**: https://neo4j.com/docs/
- **Cypher Manual**: https://neo4j.com/docs/cypher-manual/
- **GraphQL Spec**: https://spec.graphql.org/
- **Apollo Server**: https://www.apollographql.com/
- **Neo4j GraphQL Library**: https://neo4j.com/docs/graphql-manual/

---

## 🎓 Conclusión

La integración GraphQL + Cypher + Neo4j proporciona:

✅ **Desarrollador Frontend**: API GraphQL simple y consistente
✅ **Desarrollador Backend**: Poder de Cypher para lógica compleja
✅ **Arquitectura**: Separación clara de responsabilidades
✅ **Performance**: Queries optimizadas en servidor
✅ **Escalabilidad**: Neo4j maneja millones de nodos/relaciones

Este proyecto demuestra cómo estas tecnologías trabajan juntas de forma armoniosa para crear aplicaciones modernas y eficientes de análisis de grafos.
