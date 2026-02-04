# 🔍 Resumen Visual de Queries - GraphQL Visualizer

## 📊 Todas las Queries en una Página

### ✅ Queries Disponibles

| # | Nombre | Tipo | Entrada | Salida | Ubicación |
|---|--------|------|---------|--------|-----------|
| 1 | `fetchPeople` | GraphQL | - | Person[] | ReportsPanel |
| 2 | `fetchPeopleWithFilters` | GraphQL + Lógica | FilterOptions | Person[] | Grafo + Filtro |
| 3 | `fetchFriendsList` | GraphQL | personId | Person[] | ReportsPanel |
| 4 | `fetchFamilyList` | GraphQL | personId | Person[] | ReportsPanel |
| 5 | `fetchCommonFriends` | GraphQL | p1Id, p2Id | Person[] | ReportsPanel |
| 6 | `fetchMostConnectedPerson` | GraphQL | - | Person | ReportsPanel |
| 7 | `fetchInfluentialPerson` | GraphQL | - | Person | ReportsPanel |
| 8 | `fetchInfluentialPeopleWithCypher` | Cypher | limit | Person[] | AnalyticsPanel |
| 9 | `fetchMostConnectedPersonWithCypher` | Cypher | - | Person | AnalyticsPanel |
| 10 | `fetchMutualFriends` | Cypher | p1Id, p2Id | MutualFriend[] | CypherPanel |
| 11 | `fetchFriendsWithCypher` | Cypher | personId | Person[] | CypherPanel |
| 12 | `fetchFamilyWithCypher` | Cypher | personId | Person[] | CypherPanel |

---

## 🗂️ Agrupación por Funcionalidad

### Grupo 1: Datos Base
```
fetchPeople
└─ Obtiene: Todas las personas con todas sus relaciones
└─ Uso: Cargar grafo completo, datos de reportes
└─ Tipo: GraphQL Puro
```

### Grupo 2: Filtrado de Grafo
```
fetchPeopleWithFilters
└─ Obtiene: Personas con relaciones que cumplen criterios
└─ Usa: type, frequencyRange, importanceRange
└─ Tipo: GraphQL + Lógica Cliente
```

### Grupo 3: Reportes GraphQL
```
fetchFriendsList        → Amigos de persona
fetchFamilyList         → Familiares de persona
fetchCommonFriends      → Amigos comunes (2 personas)
fetchMostConnectedPerson → Persona más conectada
fetchInfluentialPerson  → Persona más influyente
└─ Tipo: GraphQL Puro
└─ Uso: ReportsPanel (lado izquierdo)
```

### Grupo 4: Reportes Cypher
```
fetchInfluentialPeopleWithCypher    → Top N personas influyentes
fetchMostConnectedPersonWithCypher  → Persona más conectada (Cypher)
fetchMutualFriends                  → Amigos comunes (Cypher)
fetchFriendsWithCypher              → Amigos (Cypher)
fetchFamilyWithCypher               → Familiares (Cypher)
└─ Tipo: Cypher Embebido
└─ Uso: CypherPanel (modal)
```

---

## 🎯 Matriz de Decisión: ¿Qué Query Usar?

```
¿Necesitas obtener datos?
│
├─ Todas las personas
│  └─ fetchPeople()
│
├─ Personas con filtros específicos
│  ├─ Por tipo de relación
│  ├─ Por frecuencia/importancia
│  └─ fetchPeopleWithFilters(filters)
│
├─ Relaciones específicas
│  ├─ Amigos de persona X
│  │  ├─ GraphQL: fetchFriendsList(personId)
│  │  └─ Cypher: fetchFriendsWithCypher(personId)
│  │
│  ├─ Familiares de persona X
│  │  ├─ GraphQL: fetchFamilyList(personId)
│  │  └─ Cypher: fetchFamilyWithCypher(personId)
│  │
│  └─ Amigos comunes X ↔ Y
│     ├─ GraphQL: fetchCommonFriends(p1Id, p2Id)
│     └─ Cypher: fetchMutualFriends(p1Id, p2Id)
│
└─ Análisis de red
   ├─ Persona más conectada
   │  ├─ GraphQL: fetchMostConnectedPerson()
   │  └─ Cypher: fetchMostConnectedPersonWithCypher()
   │
   └─ Personas más influyentes
      ├─ GraphQL: fetchInfluentialPerson() [solo 1]
      └─ Cypher: fetchInfluentialPeopleWithCypher(limit) [top N]
```

---

## 📋 Quick Reference por Componente

### ReportsPanel.tsx
```typescript
Amigos (GraphQL)         → fetchFriendsList(personId)
Familiares (GraphQL)     → fetchFamilyList(personId)
Amigos Comunes (GraphQL) → fetchCommonFriends(p1Id, p2Id)
Más Conectado (GraphQL)  → fetchMostConnectedPerson()
Influyente (GraphQL)     → fetchInfluentialPerson()
```

### CypherPanel.tsx
```typescript
Amigos (Cypher)          → fetchFriendsWithCypher(personId)
Familiares (Cypher)      → fetchFamilyWithCypher(personId)
Amigos Comunes (Cypher)  → fetchMutualFriends(p1Id, p2Id)
Top Influyentes (Cypher) → fetchInfluentialPeopleWithCypher(limit)
Más Conectado (Cypher)   → fetchMostConnectedPersonWithCypher()
```

### AnalyticsPanel.tsx
```typescript
Top Influyentes → fetchInfluentialPeopleWithCypher(10)
Más Conectado   → fetchMostConnectedPersonWithCypher()
```

### page.tsx (Grafo)
```typescript
Al cargar      → fetchPeople()
Al filtrar     → fetchPeopleWithFilters(filters)
Al seleccionar → setSelectedPersonId(nodeId)
```

---

## 🔄 Flujo de Selección de Personas

```
Usuario hace click en nodo
    ↓
handleNodeClick(node) en page.tsx
    ↓
setSelectedPersonId(node.id)
setSelectedPeopleForMutual([...])
    ↓
┌─────────────┬─────────────┬─────────────┐
│             │             │             │
▼             ▼             ▼             ▼
ReportsPanel  CypherPanel  Graph         Filtered
   Sync         Sync       Visual      By Type/Freq
```

---

## 📊 Queries por Performance

### ⚡ Más Rápidas (Menos Datos)
```
1. fetchMostConnectedPerson()          → 1 nodo
2. fetchInfluentialPerson()            → 1 nodo
3. fetchMostConnectedPersonWithCypher() → 1 nodo
4. fetchFriendsList(personId)          → Relaciones de 1 persona
```

### 🚀 Medio (Datos Moderados)
```
5. fetchFamilyList(personId)           → Relaciones de 1 persona
6. fetchCommonFriends(p1, p2)          → Intersección de amigos
7. fetchFriendsWithCypher(personId)    → Relaciones de 1 persona
8. fetchFamilyWithCypher(personId)     → Relaciones de 1 persona
```

### 🔥 Más Lentas (Datos Amplios)
```
9. fetchPeople()                       → Todas las personas
10. fetchPeopleWithFilters(filters)    → Personas filtradas
11. fetchInfluentialPeopleWithCypher(limit) → Top N personas
12. fetchMutualFriends(p1, p2)         → Con cálculos
```

---

## 🎯 Casos de Uso Típicos

### "Quiero ver amigos de Juan"
```
1. Usuario selecciona tipo de reporte: "Amigos"
2. Usuario selecciona persona: "Juan"
3. Sistema ejecuta: fetchFriendsList("juan_id")
4. Resultado: Lista de amigos
```

### "Quiero analizar amigos en común entre Juan y María"
```
1. Usuario selecciona "Amigos Comunes"
2. Usuario selecciona Juan y María (2 clicks)
3. Sistema ejecuta: fetchCommonFriends("juan_id", "maria_id")
4. Resultado: Lista de amigos comunes
```

### "Quiero los top 10 más influyentes"
```
1. Usuario abre CypherPanel (botón verde)
2. Usuario selecciona "Top Influyentes (Cypher)"
3. Sistema ejecuta: fetchInfluentialPeopleWithCypher(10)
4. Resultado: Top 10 con score de influencia
```

### "Quiero filtrar solo amigos con mucha importancia"
```
1. Usuario abre FiltersPanel (derecha)
2. Usuario selecciona solo "FRIEND"
3. Usuario ajusta importanceRange a [8, 10]
4. Sistema ejecuta: fetchPeopleWithFilters(filters)
5. Grafo se actualiza mostrando solo esas relaciones
```

---

## 📈 Datos Retornados

### Person Object
```typescript
{
  id: string;
  name: string;
  email: string;
  nickname?: string;
  photoUrl?: string;
  averageImportance?: number;       // Cypher
  relationshipsConnection?: {
    edges: Array<{
      node: Person;
      properties: {
        status: "FRIEND" | "FAMILY" | "COLLEAGUE";
        importance: number;          // 1-10
        frecuency: number;           // 1-10
      };
    }>;
    totalCount: number;
  };
}
```

### MutualFriend Object (Cypher)
```typescript
{
  id: string;
  name: string;
  email: string;
  nickname?: string;
  mutualFriendsCount: number;
}
```

---

## 🛠️ Parámetros Disponibles

| Query | Parámetro | Tipo | Descripción |
|-------|-----------|------|-------------|
| `fetchPeopleWithFilters` | filters | FilterOptions | Tipo, frecuencia, importancia |
| `fetchFriendsList` | personId | string | ID de la persona |
| `fetchFamilyList` | personId | string | ID de la persona |
| `fetchCommonFriends` | personId1, personId2 | string, string | IDs de 2 personas |
| `fetchMutualFriends` | personId1, personId2 | string, string | IDs de 2 personas |
| `fetchFriendsWithCypher` | personId | string | ID de la persona |
| `fetchFamilyWithCypher` | personId | string | ID de la persona |
| `fetchInfluentialPeopleWithCypher` | limit | number | Número de personas |

---

## 🔐 Seguridad

✅ Todas las queries usan `$variables` (parámetros seguros)
✅ No hay interpolación de strings
✅ Neo4j valida tipos
✅ Inyección de código no es posible

---

## 🚀 Performance Tips

1. **Usa fetchPeopleWithFilters** en lugar de fetchPeople + filtrar cliente
2. **Usa fetchInfluentialPeopleWithCypher(10)** en lugar de fetchInfluentialPeople (solo retorna 1)
3. **Cachea resultados** si la data no cambia frecuentemente
4. **Usa LIMIT** en queries que no necesitan todos los resultados

---

## 📝 Notas Importantes

⚠️ **GraphQL vs Cypher**:
- GraphQL: Para queries estándar, filtradas, bien estructuradas
- Cypher: Para análisis complejos, aggregaciones, traversals

⚠️ **fetchPeople vs fetchPeopleWithFilters**:
- fetchPeople: Retorna TODAS las relaciones
- fetchPeopleWithFilters: Retorna solo relaciones que cumplen criterios

⚠️ **Cypher Queries**:
- Son más poderosas pero menos standardizadas
- Cada query @cypher se ejecuta en Neo4j
- Excelentes para cálculos complejos

---

## 📚 Ver También

- [README_FINAL.md](README_FINAL.md) - API Reference completo
- [CYPHER_GUIDE.md](CYPHER_GUIDE.md) - Detalles de cada query
- [GRAPHQL_CYPHER_INTEGRATION.md](GRAPHQL_CYPHER_INTEGRATION.md) - Cómo funcionan juntas
- [GraphqlService.ts](app/lib/services/GraphqlService.ts) - Código fuente

---

**Última actualización**: Febrero 4, 2026
