# GraphQL Visualizer - Documentación Completa

## 📋 Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Neo4j y su Funcionamiento](#neo4j-y-su-funcionamiento)
4. [GraphQL - Queries y Filtros](#graphql---queries-y-filtros)
5. [Cypher - Consultas Avanzadas](#cypher---consultas-avanzadas)
6. [Instalación y Configuración](#instalación-y-configuración)
7. [API Reference](#api-reference)

---

## 📌 Descripción General

**GraphQL Visualizer** es una aplicación web interactiva que visualiza redes de relaciones almacenadas en Neo4j. Permite explorar conexiones entre personas usando:

- **Frontend**: Next.js 16 + React 18 + Tailwind CSS
- **Backend**: Apollo Server + Neo4j GraphQL Library
- **Base de Datos**: Neo4j (Base de datos de grafos)
- **Visualización**: react-force-graph-2d (Física en 2D)

### Características Principales
- 📊 Visualización interactiva de grafos
- 🔍 Filtros avanzados (tipo relación, frecuencia, importancia)
- 📈 Reportes múltiples (amigos, familiares, influyentes, etc.)
- 🎯 Panel de análisis con queries Cypher
- ⚡ Sincronización automática entre selecciones de grafo y paneles

---

## 🏗️ Arquitectura del Proyecto

```
graphql_visualizer/
│
├── app/                              # Frontend Next.js
│   ├── page.tsx                      # Componente principal (grafo + paneles)
│   ├── components/
│   │   ├── ReportsPanel.tsx          # Panel izquierdo: reportes estándar
│   │   ├── FiltersModal.tsx          # Panel derecho: filtros
│   │   ├── CypherPanel.tsx           # Modal: reportes con Cypher
│   │   └── AnalyticsPanel.tsx        # Panel: análisis avanzado
│   └── lib/
│       ├── services/
│       │   └── GraphqlService.ts     # Cliente GraphQL + queries
│       └── types/
│           └── graphqlTypes.ts       # Tipos TypeScript
│
├── backend/                          # Backend Apollo + Neo4j
│   ├── server.js                     # Servidor Apollo
│   ├── seedData.js                   # Script de datos de prueba
│   └── lib/types/
│       └── graphql_definitions.graphql  # Schema GraphQL + Cypher
│
├── public/                           # Assets estáticos
└── package.json                      # Dependencias
```

---

## 🗄️ Neo4j y su Funcionamiento

### ¿Qué es Neo4j?

Neo4j es una **base de datos de grafos** altamente optimizada para:
- Almacenar nodos (entidades) y relaciones entre ellos
- Ejecutar queries que navegan relaciones de forma eficiente
- Realizar análisis complejos de redes

### Estructura de Datos

```
┌─────────────────┐         HAS_RELATIONSHIP          ┌─────────────────┐
│    Person       │◄────────────────────────────────►│    Person       │
│  (Node Type)    │  {status, importance, frecuency} │  (Node Type)    │
└─────────────────┘                                   └─────────────────┘
  id: String                                             id: String
  name: String                                          name: String
  email: String                                         email: String
  nickname: String                                      nickname: String
  photoUrl: String                                      photoUrl: String
```

### Tipos de Relaciones

Cada relación `HAS_RELATIONSHIP` contiene propiedades:

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| **status** | Enum | FRIEND, FAMILY, COLLEAGUE |
| **importance** | Int | Escala 1-10 (relevancia de la relación) |
| **frecuency** | Int | Escala 1-10 (frecuencia de contacto) |

### Ventajas de Neo4j para este Proyecto

✅ **Queries de Relaciones Rápidas** - Navegar múltiples hops sin joins complejos
✅ **Análisis de Grafos** - Encontrar caminos, comunidades, influyentes
✅ **Escalabilidad** - Millones de nodos y relaciones
✅ **Cypher Language** - Lenguaje específico para grafos (similar a SQL)

---

## 🔌 GraphQL - Queries y Filtros

### Setup

El frontend se conecta a través de `graphql-request` a `http://localhost:4000/graphql`

```typescript
// GraphqlService.ts
const client = new GraphQLClient("http://localhost:4000/graphql");
```

### Queries Principales

#### 1. **fetchPeople** - Obtener Todas las Personas

```graphql
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
```

**Uso**: Cargar todo el grafo sin filtros
**Retorna**: Array de personas con todas sus relaciones

---

#### 2. **fetchPeopleWithFilters** - Personas Con Filtros

```graphql
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
```

**Parámetros**:
- `frequencyMin/Max`: Rango de frecuencia (1-10)
- `importanceMin/Max`: Rango de importancia (1-10)
- `statuses`: Array de tipos (FRIEND, FAMILY, COLLEAGUE)

**Lógica de Filtrado**:
1. Servidor filtra relaciones por frecuencia, importancia Y estado
2. Solo retorna personas con al menos 1 relación que cumple criterios
3. Cliente solo necesita mostrar datos devueltos

---

#### 3. **fetchFriendsList** - Amigos de Una Persona

```graphql
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
      totalCount
    }
  }
}
```

---

#### 4. **fetchFamilyList** - Familiares de Una Persona

```graphql
query GetFamilyList($personId: ID!) {
  people(where: { id_EQ: $personId }) {
    relationshipsConnection(
      where: { edge: { status_EQ: FAMILY } }
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
      totalCount
    }
  }
}
```

---

#### 5. **fetchCommonFriends** - Amigos en Común

```graphql
query MutualFriendsQuery($personId1: ID!, $personId2: ID!) {
  mutualFriendsQuery(personId1: $personId1, personId2: $personId2) {
    id
    name
    email
    mutualFriendsCount
  }
}
```

**Nota**: Usa una query Cypher personalizada (ver sección Cypher)

---

### Sintaxis Neo4j GraphQL

| Operador | Significado | Ejemplo |
|----------|------------|---------|
| `_EQ` | Igual | `id_EQ: "123"` |
| `_NEQ` | No igual | `status_NEQ: COLLEAGUE` |
| `_GT` | Mayor que | `importance_GT: 5` |
| `_GTE` | Mayor o igual | `frecuency_GTE: 3` |
| `_LT` | Menor que | `importance_LT: 8` |
| `_LTE` | Menor o igual | `frecuency_LTE: 7` |
| `_IN` | Está en array | `status_IN: [FRIEND, FAMILY]` |
| `AND` | Todas las condiciones | `AND: [{...}, {...}]` |
| `OR` | Alguna condición | `OR: [{...}, {...}]` |

---

## 🔍 Cypher - Consultas Avanzadas

### ¿Qué es Cypher?

**Cypher** es el lenguaje de queries nativo de Neo4j:
- Diseñado específicamente para grafos
- Sintaxis intuitiva (visualmente representa el grafo)
- Más poderoso que GraphQL para análisis complejos

### Estructura de Cypher

```cypher
MATCH (n:Person) -[rel:HAS_RELATIONSHIP]-> (m:Person)
WHERE rel.importance > 5
RETURN n.name, m.name, rel.importance
ORDER BY rel.importance DESC
```

**Componentes**:
- `MATCH`: Patrón de nodos y relaciones a buscar
- `WHERE`: Condiciones de filtrado
- `RETURN`: Qué retornar
- `ORDER BY`: Ordenamiento
- `LIMIT`: Límite de resultados

---

### Cypher Queries Implementadas en el Schema

#### 1. **averageImportance** - Campo Personalizado en Person

```cypher
MATCH (this)-[rel:HAS_RELATIONSHIP]->()
RETURN CASE WHEN COUNT(rel) > 0 
  THEN toFloat(SUM(rel.importance)) / COUNT(rel) 
  ELSE 0.0 
END as result
```

**Qué hace**: Calcula el promedio de importancia de todas las relaciones salientes

**Acceso en GraphQL**:
```graphql
query {
  people {
    id
    name
    averageImportance  # Campo Cypher
  }
}
```

---

#### 2. **friends** - Campo Personalizado en Person

```cypher
MATCH (this)-[rel:HAS_RELATIONSHIP {status: "FRIEND"}]->(friend:Person)
RETURN friend
```

**Qué hace**: Retorna todos los amigos (relaciones con status FRIEND)

**Acceso en GraphQL**:
```graphql
query {
  people {
    id
    name
    friends {
      id
      name
      email
    }
  }
}
```

---

#### 3. **familyMembers** - Campo Personalizado en Person

```cypher
MATCH (this)-[rel:HAS_RELATIONSHIP {status: "FAMILY"}]->(family:Person)
RETURN family
```

**Qué hace**: Retorna todos los familiares

---

#### 4. **mutualFriendsQuery** - Query Personalizada Global

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

**Qué hace**: Encuentra amigos en común entre dos personas
- Busca amigos de persona 1
- Busca amigos de persona 2
- Retorna solo los que aparecen en ambas listas

**Variables**: `$personId1`, `$personId2`

---

#### 5. **influentialPeople** - Query Personalizada Global

```cypher
MATCH (p:Person)-[rel:HAS_RELATIONSHIP]->()
WITH p, CASE WHEN COUNT(rel) > 0 
  THEN toFloat(SUM(rel.importance)) / COUNT(rel) 
  ELSE 0.0 
END as avgImportance
ORDER BY avgImportance DESC
RETURN p
LIMIT $limit
```

**Qué hace**: Ranking de personas más influyentes
- Calcula importancia promedio para cada persona
- Ordena de mayor a menor
- Retorna top N personas
- Cada persona tiene `averageImportance` accesible

**Variables**: `$limit` (ej: 10)

---

#### 6. **mostConnectedPerson** - Query Personalizada Global

```cypher
MATCH (p:Person)-[rel:HAS_RELATIONSHIP]->()
WITH p, COUNT(rel) as connectionCount
ORDER BY connectionCount DESC
RETURN p
LIMIT 1
```

**Qué hace**: Encuentra la persona con más conexiones totales

**Retorna**: Un single Person con su `relationshipsConnection.totalCount`

---

### Definición en Schema GraphQL

```graphql
type Person @node {
  id: ID!
  name: String!
  nickname: String
  email: String!
  photoUrl: String
  
  # Campo calculado con Cypher
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
  
  # Relaciones filtradas con Cypher
  friends: [Person!]!
    @cypher(
      statement: """
      MATCH (this)-[rel:HAS_RELATIONSHIP {status: "FRIEND"}]->(friend:Person)
      RETURN friend
      """
      columnName: "friend"
    )
  
  familyMembers: [Person!]!
    @cypher(
      statement: """
      MATCH (this)-[rel:HAS_RELATIONSHIP {status: "FAMILY"}]->(family:Person)
      RETURN family
      """
      columnName: "family"
    )
}

type Query {
  mutualFriendsQuery(personId1: ID!, personId2: ID!): [MutualFriend!]!
    @cypher(statement: "..." columnName: "result")
  
  influentialPeople(limit: Int = 10): [Person!]!
    @cypher(statement: "..." columnName: "p")
  
  mostConnectedPerson: Person
    @cypher(statement: "..." columnName: "p")
}
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

```bash
Node.js 18+
Neo4j 4.4+ (local o remoto)
pnpm o npm
```

### Pasos de Instalación

1. **Clonar y instalar dependencias**
```bash
cd graphql_visualizer
pnpm install
```

2. **Configurar Neo4j**
```bash
# Neo4j debe estar corriendo en:
# neo4j://127.0.0.1:7687
# Usuario: neo4j
# Contraseña: password (o la que hayas configurado)
```

3. **Cargar datos de prueba**
```bash
cd backend
node seedData.js
```

4. **Iniciar servidor Apollo (backend)**
```bash
node server.js
# Escucha en http://localhost:4000/graphql
```

5. **Iniciar frontend (en otra terminal)**
```bash
pnpm dev
# Abre http://localhost:3000
```

---

## 📚 API Reference

### Interfaz FilterOptions

```typescript
interface FilterOptions {
  relationshipTypes: RelationshipStatus[];  // FRIEND | FAMILY | COLLEAGUE
  frequencyRange: [number, number];        // [min, max] - 1-10
  importanceRange: [number, number];       // [min, max] - 1-10
}
```

### Interfaz Person (GraphQL)

```typescript
interface Person {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  photoUrl?: string;
  relationshipsConnection?: {
    edges: Array<{
      node: Person;
      properties: {
        status: RelationshipStatus;
        importance: number;
        frecuency: number;
      };
    }>;
    totalCount: number;
  };
  averageImportance?: number;  // Campo Cypher
  friends?: Person[];           // Campo Cypher
  familyMembers?: Person[];     // Campo Cypher
}
```

### Funciones GraphqlService

| Función | Parámetros | Retorna |
|---------|-----------|---------|
| `fetchPeople()` | - | Person[] |
| `fetchPeopleWithFilters(filters)` | FilterOptions | Person[] |
| `fetchFriendsList(personId)` | string | Person[] |
| `fetchFamilyList(personId)` | string | Person[] |
| `fetchCommonFriends(p1Id, p2Id)` | string, string | MutualFriend[] |
| `fetchMostConnectedPerson()` | - | Person |
| `fetchInfluentialPerson()` | - | Person |
| `fetchInfluentialPeopleWithCypher(limit)` | number | Person[] |
| `fetchMostConnectedPersonWithCypher()` | - | Person |
| `fetchMutualFriends(p1Id, p2Id)` | string, string | MutualFriend[] |
| `fetchFriendsWithCypher(personId)` | string | Person[] |
| `fetchFamilyWithCypher(personId)` | string | Person[] |

---

## 🎨 Paneles y Componentes

### 1. ReportsPanel (Izquierda)
- Reportes estándar usando GraphQL
- 5 tipos: amigos, familiares, amigos comunes, más conectado, influyente
- Sincroniza con clicks en el grafo

### 2. FiltersPanel (Derecha)
- Selección de tipos de relación
- Range sliders para frecuencia e importancia
- Actualiza grafo en tiempo real

### 3. CypherPanel (Modal)
- Reportes usando queries Cypher
- Acceso directo a campos calculados
- Panel flotante con scroll

### 4. AnalyticsPanel (Antiguo)
- Análisis rápido de influencia y conexiones
- Ya no se usa (reemplazado por CypherPanel)

---

## 🔄 Flujo de Datos

```
Usuario Hace Click en Nodo
    ↓
handleNodeClick() en page.tsx
    ↓
setSelectedPersonId()  + setSelectedPeopleForMutual()
    ↓
ReportsPanel y CypherPanel reciben props
    ↓
useEffect dispara consultas GraphQL/Cypher
    ↓
GraphqlService ejecuta query en Apollo Server
    ↓
Neo4j procesa Cypher → devuelve resultados
    ↓
Frontend renderiza resultados en paneles
```

---

## 🔧 Desarrollo

### Agregar Nueva Query

1. **Definir en schema** (`graphql_definitions.graphql`)
```graphql
query miConsulta(...): Tipo @cypher(statement: "...")
```

2. **Crear función en GraphqlService.ts**
```typescript
export const miConsulta = async (params) => {
  const query = gql`query { ... }`;
  const data = await client.request(query, variables);
  return data.miConsulta;
};
```

3. **Usar en componentes**
```typescript
const resultado = await miConsulta(params);
```

---

## 📊 Ejemplo de Flujo Completo

**Objetivo**: Encontrar todos los amigos de Juan que tienen importancia > 7

### Paso 1: GraphQL Query
```graphql
query {
  people(where: { name_CONTAINS: "Juan" }) {
    relationshipsConnection(
      where: { 
        edge: { 
          AND: [
            { status_EQ: FRIEND }
            { importance_GTE: 7 }
          ]
        }
      }
    ) {
      edges {
        node {
          name
          email
        }
        properties {
          importance
        }
      }
    }
  }
}
```

### Paso 2: Cypher Equivalente
```cypher
MATCH (juan:Person {name: "Juan"})-[rel:HAS_RELATIONSHIP {status: "FRIEND"}]->(friend:Person)
WHERE rel.importance > 7
RETURN friend.name, friend.email, rel.importance
```

### Paso 3: Código TypeScript
```typescript
const amigosInfluyentes = await fetchPeopleWithFilters({
  relationshipTypes: ['FRIEND'],
  frequencyRange: [1, 10],
  importanceRange: [7, 10]
});
```

---

## 📖 Recursos Adicionales

- [Neo4j Documentation](https://neo4j.com/docs/)
- [Cypher Manual](https://neo4j.com/docs/cypher-manual/)
- [GraphQL Best Practices](https://graphql.org/learn/)
- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/)

---

## 📝 Notas Importantes

⚠️ **Filtrado en Servidor**: Los filtros se aplican en Neo4j, no en cliente, para máxima eficiencia

⚠️ **Cypher vs GraphQL**: 
- GraphQL es ideal para queries estándar y filtradas
- Cypher es mejor para análisis y traversals complejos

⚠️ **Performance**: Las queries se cachean implícitamente por el cliente HTTP. Para datos que cambian frecuentemente, considera agregar cache TTL

---

## 🎯 Conclusión

Este proyecto demuestra:
- ✅ Uso avanzado de Neo4j para análisis de grafos
- ✅ Integración Neo4j ↔ GraphQL ↔ Frontend
- ✅ Queries Cypher embebidas en schema GraphQL
- ✅ Visualización interactiva de datos relacionales
- ✅ Filtrado lógico eficiente en servidor

**Cualquier consulta o mejora bienvenida** 🚀
