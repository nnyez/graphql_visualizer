# Guía Detallada: Cypher en GraphQL Visualizer

## 📖 Introducción a Cypher

**Cypher** es el lenguaje declarativo de Neo4j para consultar grafos. A diferencia de SQL que trabaja con tablas, Cypher piensa en términos de **nodos** (entidades) y **relaciones** (conexiones).

### Sintaxis Visual

La sintaxis de Cypher es intuitivamente visual:

```cypher
(juan)-[:FRIEND]->(maria)
  ↑         ↑        ↑
nodo   relación    nodo
```

---

## 🔧 Conceptos Fundamentales

### 1. Nodos

Representan entidades (personas, lugares, cosas):

```cypher
-- Nodo sin propiedades
(n)

-- Nodo con tipo
(n:Person)

-- Nodo con tipo y propiedades
(n:Person {name: "Juan", age: 30})

-- Múltiples tipos (etiquetas)
(n:Person:Developer)

-- Nodo con variable para acceso posterior
(juan:Person)
```

### 2. Relaciones

Conectan nodos y pueden tener propiedades:

```cypher
-- Relación sin dirección
(juan)---(maria)

-- Relación con dirección (outgoing)
(juan)-->[rel:FRIEND]->(maria)

-- Relación con dirección (incoming)
(juan)<--[rel:FRIEND]-(maria)

-- Relación sin especificar tipo (cualquier relación)
(juan)-->(maria)

-- Relación con propiedades
(juan)-[rel:HAS_RELATIONSHIP {importance: 8, status: "FRIEND"}]->(maria)

-- Relación sin propiedades específicas
(juan)-[:KNOWS]->(maria)
```

### 3. Propiedades

Atributos clave-valor en nodos y relaciones:

```cypher
-- En nodos
n.name
n.email
n.age

-- En relaciones
rel.importance
rel.frecuency
rel.status
```

---

## 🎯 Queries Básicas

### Pattern Matching - MATCH

La cláusula `MATCH` busca patrones en el grafo:

```cypher
-- Todos los nodos Person
MATCH (n:Person)
RETURN n

-- Todas las relaciones FRIEND
MATCH (n)-[rel:FRIEND]->(m)
RETURN n, m, rel

-- Caminos de 2 pasos
MATCH (a:Person)-->(b:Person)-->(c:Person)
RETURN a, b, c

-- Relaciones de cualquier tipo
MATCH (n1)-->(n2)
RETURN n1, n2
```

### Filtrado - WHERE

```cypher
-- Filtrar por propiedad de nodo
MATCH (n:Person)
WHERE n.importance > 5
RETURN n

-- Filtrar por propiedad de relación
MATCH (n1)-[rel:HAS_RELATIONSHIP]->(n2)
WHERE rel.importance > 7
RETURN n1, n2

-- Múltiples condiciones
WHERE rel.importance > 5 AND n.name CONTAINS "Juan"

-- Operadores lógicos
WHERE (n.age > 30 AND n.email LIKE "%.com") OR n.status = "VIP"
```

### Retorno - RETURN

```cypher
-- Retornar nodos completos
RETURN n

-- Retornar propiedades específicas
RETURN n.name, n.email, rel.importance

-- Usar alias
RETURN n.name AS nombre, rel.importance AS importancia

-- Distinto
RETURN DISTINCT n.type

-- Contar
RETURN COUNT(rel)

-- Suma/Promedio/Min/Max
RETURN SUM(rel.importance), AVG(rel.importance), MIN(rel.importance), MAX(rel.importance)
```

### Ordenamiento y Límite

```cypher
-- Ordenar ascendente (default)
ORDER BY rel.importance

-- Ordenar descendente
ORDER BY rel.importance DESC

-- Múltiples criterios
ORDER BY n.name ASC, rel.importance DESC

-- Limitar resultados
LIMIT 10

-- Skip (para paginación)
SKIP 20
LIMIT 10
```

---

## 🚀 Queries Usadas en el Proyecto

### 1. Promedio de Importancia por Persona

**Ubicación**: `Person.averageImportance` (Campo Cypher)

```cypher
MATCH (this)-[rel:HAS_RELATIONSHIP]->()
RETURN CASE 
  WHEN COUNT(rel) > 0 
    THEN toFloat(SUM(rel.importance)) / COUNT(rel) 
    ELSE 0.0 
END as result
```

**Desglose**:
- `MATCH (this)-[rel:HAS_RELATIONSHIP]->()`: Todas las relaciones salientes de la persona
- `SUM(rel.importance)`: Suma de importancias
- `COUNT(rel)`: Número de relaciones
- `CASE WHEN`: Prevenir división por cero
- `toFloat()`: Convertir a número decimal

**Resultado**: Número entre 0 y 10 (promedio)

---

### 2. Lista de Amigos

**Ubicación**: `Person.friends` (Campo Cypher)

```cypher
MATCH (this)-[rel:HAS_RELATIONSHIP {status: "FRIEND"}]->(friend:Person)
RETURN friend
```

**Desglose**:
- `this`: Referencia a la persona actual en contexto GraphQL
- `{status: "FRIEND"}`: Filtrar solo relaciones de tipo FRIEND
- `->`: Dirección outgoing (salidas)
- `RETURN friend`: Retornar el nodo destino

**Resultado**: Array de Person nodes que son amigos

---

### 3. Lista de Familiares

**Ubicación**: `Person.familyMembers` (Campo Cypher)

```cypher
MATCH (this)-[rel:HAS_RELATIONSHIP {status: "FAMILY"}]->(family:Person)
RETURN family
```

**Idéntico a amigos pero filtrando por FAMILY**

---

### 4. Amigos en Común Entre Dos Personas

**Ubicación**: `Query.mutualFriendsQuery` (Query Cypher Global)

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

**Desglose**:
1. Primera `MATCH`: Amigos de persona 1
2. Segunda `MATCH`: Amigos de persona 2 (mismo `friend`)
   - Al repetir `friend`, Neo4j busca nodos que aparecen en ambas consultas
   - Esto es la **intersección** (amigos comunes)
3. `RETURN {...}`: Construir objeto con propiedades del amigo

**Parámetros**:
- `$personId1`: ID de primera persona
- `$personId2`: ID de segunda persona

**Resultado**: Array de objetos con amigos comunes

---

### 5. Top Personas Más Influyentes

**Ubicación**: `Query.influentialPeople` (Query Cypher Global)

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

**Desglose**:
1. `MATCH`: Todas las relaciones de todas las personas
2. `WITH`: Cláusula de transformación
   - Agrupar por persona (`p`)
   - Calcular promedio de importancia para cada una
3. `ORDER BY avgImportance DESC`: Mayor a menor
4. `LIMIT $limit`: Retornar solo top N

**Parámetros**:
- `$limit`: Número de personas (ej: 10)

**Resultado**: Array de Person nodes ordenados por influencia

**Acceso en GraphQL**:
```graphql
query {
  influentialPeople(limit: 10) {
    id
    name
    averageImportance  # Disponible gracias a campo Cypher
  }
}
```

---

### 6. Persona Más Conectada

**Ubicación**: `Query.mostConnectedPerson` (Query Cypher Global)

```cypher
MATCH (p:Person)-[rel:HAS_RELATIONSHIP]->()
WITH p, COUNT(rel) as connectionCount
ORDER BY connectionCount DESC
RETURN p
LIMIT 1
```

**Desglose**:
1. Contar relaciones por persona
2. Ordenar de mayor a menor
3. Retornar solo la primera (más conexiones)

**Resultado**: Single Person node

---

## 💡 Patrones Avanzados

### AND/OR en Relaciones

```cypher
-- Persona con amigos O familia
MATCH (n:Person)-[rel:HAS_RELATIONSHIP]-(m:Person)
WHERE rel.status = "FRIEND" OR rel.status = "FAMILY"
RETURN n, m

-- Persona con amigos Y mucha importancia
MATCH (n:Person)-[rel:HAS_RELATIONSHIP {status: "FRIEND"}]->(m:Person)
WHERE rel.importance > 7
RETURN n, m
```

### Agregaciones

```cypher
-- Contar amigos por persona
MATCH (p:Person)-[rel:HAS_RELATIONSHIP {status: "FRIEND"}]->(f:Person)
RETURN p.name, COUNT(f) as friendCount
ORDER BY friendCount DESC

-- Suma de importancias por tipo de relación
MATCH (p:Person)-[rel:HAS_RELATIONSHIP]->(m:Person)
RETURN rel.status, SUM(rel.importance) as totalImportance
GROUP BY rel.status
```

### Caminos (Paths)

```cypher
-- Encontrar camino de amistad entre dos personas
MATCH path = (juan:Person {name: "Juan"})-[:FRIEND*..3]->(maria:Person {name: "Maria"})
RETURN path
-- *..3 = hasta 3 hops de distancia

-- Todas las personas conectadas a Juan (cualquier distancia)
MATCH (juan:Person {name: "Juan"})-[*]->(others:Person)
RETURN DISTINCT others
```

### Colecciones

```cypher
-- Recolectar nombres en array
MATCH (p:Person)-[:FRIEND]->(f:Person)
RETURN p.name, collect(f.name) as friends

-- Filter con collect
MATCH (p:Person)-[rel:HAS_RELATIONSHIP]->(connected:Person)
WHERE rel.importance > 5
RETURN p.name, collect(connected.name) as importantConnections
```

---

## 🔄 Integración en GraphQL Schema

### Syntax Decorador @cypher

```graphql
fieldName: Type
  @cypher(
    statement: """
    CYPHER QUERY AQUI
    """
    columnName: "columnNameInCypher"
  )
```

### Campos Computados (En Nodo)

```graphql
type Person {
  id: ID!
  name: String!
  
  # Campo que ejecuta Cypher automáticamente
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
}
```

### Queries Personalizadas (Root Query)

```graphql
type Query {
  # Query que retorna array
  topInfluential(limit: Int!): [Person!]!
    @cypher(
      statement: """
      MATCH (p:Person)-[rel:HAS_RELATIONSHIP]->()
      WITH p, AVG(rel.importance) as avg
      ORDER BY avg DESC
      RETURN p
      LIMIT $limit
      """
      columnName: "p"
    )
  
  # Query que retorna single node
  mostConnected: Person
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

---

## 📊 Optimización de Queries Cypher

### 1. Usar Índices

```cypher
-- Crear índice en propiedad frecuente
CREATE INDEX ON :Person(id)
CREATE INDEX ON :Person(name)

-- Las queries automáticamente usan índices para WHERE clauses
MATCH (p:Person {id: "123"})  -- Usa índice
WHERE p.name = "Juan"         -- Usa índice si existe
```

### 2. Especificar Tipos

```cypher
-- Bueno: Neo4j sabe qué nodos buscar
MATCH (p:Person)-[:FRIEND]->(f:Person)

-- Menos eficiente: Neo4j busca cualquier relación
MATCH (p)-[:FRIEND]->(f)
```

### 3. Usar LIMIT Temprano

```cypher
-- Procesa todos, luego limita
MATCH (p:Person) RETURN p ORDER BY p.name DESC LIMIT 10

-- Mejor: Limita desde el inicio con índice
MATCH (p:Person {status: "active"}) LIMIT 10
```

### 4. Avoid Multiple MATCH

```cypher
-- Menos eficiente: Múltiples scans
MATCH (a:Person) RETURN a
MATCH (b:Person) WHERE b.age > 30 RETURN b

-- Mejor: Una sola query
MATCH (p:Person) WHERE p.age > 30 RETURN p
```

---

## 🧪 Testing Cypher Queries

### Neo4j Browser

1. Abre `http://localhost:7687` (o tu instancia Neo4j)
2. Escribe tu query directamente
3. Experimenta sin afectar la aplicación

### Ejemplo de Testing

```cypher
-- Verificar estructura
MATCH (p:Person) RETURN COUNT(p) as totalPeople

-- Verificar relaciones
MATCH (p1:Person)-[r:HAS_RELATIONSHIP]->(p2:Person)
RETURN COUNT(r) as totalRelationships, 
       r.status, 
       COUNT(r) as countByType
GROUP BY r.status

-- Verificar propiedades
MATCH (p:Person)-[r:HAS_RELATIONSHIP]->(other:Person)
WHERE r.importance > 7 AND r.frecuency > 5
RETURN p.name, other.name, r.importance, r.frecuency
LIMIT 20
```

---

## 🐛 Debugging

### Explicar Query (EXPLAIN)

```cypher
EXPLAIN MATCH (p:Person)-[:FRIEND]->(f:Person)
RETURN p, f
```

Muestra el plan de ejecución sin ejecutar

### Perfil Query (PROFILE)

```cypher
PROFILE MATCH (p:Person)-[:FRIEND]->(f:Person)
RETURN p, f
```

Ejecuta y muestra estadísticas detalladas

### Variables en GraphQL

```cypher
-- Los parámetros GraphQL se inyectan como $variables
MATCH (p:Person {id: $personId})
WHERE p.name CONTAINS $nameFilter
RETURN p
```

En GraphQL:
```graphql
query search($personId: ID!, $nameFilter: String!) {
  searchPerson(id: $personId, name: $nameFilter) {
    id
    name
  }
}
```

---

## 📋 Cheat Sheet

| Concepto | Cypher | Nota |
|----------|--------|------|
| **Nodo** | `(n:Label)` | Label opcional |
| **Relación** | `-[r:TYPE]->` | Dirección importante |
| **Propiedad** | `n.property` | Acceso con punto |
| **Parámetro** | `$varName` | Previene inyección |
| **Filtro** | `WHERE condición` | Múltiples con AND/OR |
| **Agregación** | `COUNT(), SUM(), AVG()` | Requiere GROUP BY |
| **Ordenar** | `ORDER BY propiedad ASC/DESC` | - |
| **Limitar** | `LIMIT n` | Siempre al final |
| **Transformar** | `WITH` | Intermedio entre MATCH |
| **Agrupar** | `GROUP BY` | Con agregaciones |
| **Retornar** | `RETURN expresión` | Puede ser AS alias |
| **Opcional** | `OPTIONAL MATCH` | Si no encuentra, NULL |
| **Distinto** | `DISTINCT` | Eliminar duplicados |
| **Coleccionar** | `collect()` | Agrupar en array |

---

## 🎓 Conclusión

Cypher es poderoso para:
- ✅ Análisis de grafos
- ✅ Encontrar relaciones complejas
- ✅ Cálculos sobre la red
- ✅ Queries que serían complejas en SQL

En este proyecto, Cypher se integra transparentemente en GraphQL, permitiendo acceso a campos calculados y queries personalizadas sin escribir SQL tradicional.
