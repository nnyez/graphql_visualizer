# GraphQL Visualizer - Análisis de Redes con Neo4j

Un visualizador interactivo de redes relacionales usando **Next.js**, **GraphQL**, **Cypher** y **Neo4j**.

> 📘 **[Documentación Completa →](docs/)** - Todas las guías y referencias

---

## 🎯 ¿Qué es este Proyecto?

Este proyecto visualiza e interactúa con redes de personas y sus relaciones almacenadas en Neo4j:

- **Visualización 2D**: Grafo interactivo con física realista
- **Queries Avanzadas**: Usando GraphQL y Cypher
- **Análisis**: Amigos, familiares, personas influyentes, etc.
- **Filtrado Inteligente**: Por tipo de relación, importancia y frecuencia

### Tecnologías Principales

| Tecnología | Uso |
|-----------|-----|
| **Neo4j** | Base de datos de grafos |
| **Cypher** | Lenguaje de queries para grafos |
| **GraphQL** | API moderna y type-safe |
| **Next.js 16** | Framework React fullstack |
| **Tailwind CSS** | Estilos responsive |
| **react-force-graph-2d** | Visualización interactiva |

---

## 🚀 Inicio Rápido

### Prerrequisitos
```bash
Node.js 18+
Neo4j 4.4+ (local o remoto)
pnpm o npm
```

### Instalación (3 pasos)

**1. Instalar dependencias**
```bash
pnpm install
```

**2. Configurar Neo4j**
- Neo4j debe estar corriendo en `neo4j://127.0.0.1:7687`
- Usuario: `neo4j` (por defecto)

**3. Cargar datos y ejecutar**
```bash
# Terminal 1: Backend
cd backend
node seedData.js      # Cargar datos de prueba
node server.js        # Apollo Server en puerto 4000

# Terminal 2: Frontend
pnpm dev              # Next.js en puerto 3000
```

Abre [http://localhost:3000](http://localhost:3000) 🎉

---

## 📚 Documentación

Toda la documentación está en los siguientes archivos:

### 📘 [README_FINAL.md](README_FINAL.md)
Documentación completa y detallada del proyecto.
- Arquitectura
- Neo4j y funcionamiento
- GraphQL queries y filtros
- Cypher queries
- API Reference
- Ejemplos completos

**Comienza aquí** ↑

### 🔗 [GRAPHQL_CYPHER_INTEGRATION.md](GRAPHQL_CYPHER_INTEGRATION.md)
Cómo funcionan juntos GraphQL y Cypher.
- Arquitectura de integración
- Flujo de ejecución paso a paso
- Schema GraphQL
- Seguridad
- Performance
- Debugging

**Lee si necesitas debuggear o optimizar** ↑

### 🧭 [CYPHER_GUIDE.md](CYPHER_GUIDE.md)
Guía completa de Cypher.
- Conceptos fundamentales
- Queries básicas
- Queries del proyecto (detalladas)
- Patrones avanzados
- Testing
- Cheat sheet

**Lee si trabajas con Cypher** ↑

### 📖 [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
Índice y guía de navegación de la documentación.
- Búsqueda rápida por tópico
- Guías por rol
- Matriz de contenido
- Flujos comunes

**Navega la documentación** ↑

---

## 🏗️ Estructura del Proyecto

```
graphql_visualizer/
├── app/                          # Frontend Next.js (React)
│   ├── page.tsx                  # Componente principal (grafo)
│   ├── components/
│   │   ├── ReportsPanel.tsx      # Panel izquierdo: reportes
│   │   ├── FiltersModal.tsx      # Panel derecho: filtros
│   │   ├── CypherPanel.tsx       # Modal: queries Cypher
│   │   └── AnalyticsPanel.tsx    # Panel: análisis
│   └── lib/
│       ├── services/
│       │   └── GraphqlService.ts # Queries GraphQL
│       └── types/
│           └── graphqlTypes.ts   # Tipos TypeScript
│
├── backend/                      # Backend Apollo Server
│   ├── server.js                 # Servidor Apollo
│   ├── seedData.js               # Datos de prueba
│   └── lib/types/
│       └── graphql_definitions.graphql  # Schema + Cypher
│
└── Documentación
    ├── README_FINAL.md           # 📘 Documentación completa
    ├── GRAPHQL_CYPHER_INTEGRATION.md  # 🔗 Integración
    ├── CYPHER_GUIDE.md           # 🧭 Guía Cypher
    └── DOCUMENTATION_INDEX.md    # 📖 Índice
```

---

## 🎨 Características

✅ **Visualización Interactiva** - Grafo 2D con física
✅ **Filtros Avanzados** - Tipo, frecuencia, importancia
✅ **Reportes Múltiples** - Amigos, familiares, influyentes, etc.
✅ **Queries Cypher** - Acceso directo a análisis complejos
✅ **Type-Safe** - 100% TypeScript
✅ **Responsive** - Diseño moderno con Tailwind
✅ **Performance** - Queries optimizadas en servidor

---

## 📊 Paneles Principales

### ReportsPanel (Izquierda)
Cinco tipos de reportes:
- **Amigos**: Lista de amigos (status = FRIEND)
- **Familiares**: Lista de familiares (status = FAMILY)
- **Amigos Comunes**: Amigos entre dos personas
- **Más Conectado**: Persona con más conexiones
- **Influyente**: Persona con mayor promedio de importancia

### FiltersPanel (Derecha)
Filtros dinámicos:
- Seleccionar tipos de relación (FRIEND, FAMILY, COLLEAGUE)
- Range sliders para frecuencia (1-10)
- Range sliders para importancia (1-10)

### CypherPanel (Modal)
Queries avanzadas:
- Amigos (Cypher)
- Familiares (Cypher)
- Amigos Comunes (Cypher)
- Top Personas Influyentes (Cypher)
- Más Conectado (Cypher)

---

## 🔄 Flujo de Datos

```
Usuario Hace Click
    ↓
selectedPersonId + selectedPeopleForMutual cambian
    ↓
ReportsPanel y CypherPanel reciben props
    ↓
useEffect dispara GraphQL/Cypher query
    ↓
GraphqlService → Apollo Server → Neo4j
    ↓
Neo4j ejecuta Cypher
    ↓
Resultados retornan al Frontend
    ↓
Componentes renderizan resultados
```

---

## 💻 Ejemplos de Uso

### Obtener Amigos de una Persona

```typescript
import { fetchFriendsList } from './lib/services/GraphqlService';

const friends = await fetchFriendsList(personId);
// Retorna: Person[] con status = FRIEND
```

### Obtener Top 10 Personas Influyentes

```typescript
import { fetchInfluentialPeopleWithCypher } from './lib/services/GraphqlService';

const topInfluential = await fetchInfluentialPeopleWithCypher(10);
// Retorna: Person[] ordenadas por averageImportance DESC
```

### Filtrar por Frecuencia e Importancia

```typescript
import { fetchPeopleWithFilters } from './lib/services/GraphqlService';

const filtered = await fetchPeopleWithFilters({
  relationshipTypes: ['FRIEND'],
  frequencyRange: [5, 10],
  importanceRange: [7, 10]
});
// Retorna: Personas con relaciones FRIEND de alta freq/importancia
```

---

## 🧭 Próximos Pasos

1. **Nuevo en el proyecto?** → Lee [README_FINAL.md](README_FINAL.md)
2. **Necesitas debuggear?** → Usa [GRAPHQL_CYPHER_INTEGRATION.md](GRAPHQL_CYPHER_INTEGRATION.md)
3. **Trabajas con Cypher?** → Consulta [CYPHER_GUIDE.md](CYPHER_GUIDE.md)
4. **Perdido?** → Revisa [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## 📞 Recursos

- **Neo4j**: https://neo4j.com/docs/
- **Cypher**: https://neo4j.com/docs/cypher-manual/
- **GraphQL**: https://graphql.org/
- **Apollo Server**: https://www.apollographql.com/

---

## 📝 Notas

⚠️ **Filtrado en Servidor**: Neo4j filtra relaciones, no cliente

⚠️ **Cypher es Poderoso**: Para queries complejas, usa @cypher queries

⚠️ **Parámetros Seguros**: Siempre usa `$variables`, nunca interpolación

---

## 🎓 Conceptos Clave

- **Neo4j**: Base de datos de grafos (nodos + relaciones)
- **Cypher**: Lenguaje de Neo4j para queries (específico para grafos)
- **GraphQL**: API layer que expone queries Cypher
- **@cypher**: Decorador que embebe Cypher en schema GraphQL
- **relationshipsConnection**: Formato GraphQL para relaciones

---

## 🚀 Tecnologías en el Stack

```
Frontend Layer
├── React 18
├── Next.js 16
├── Tailwind CSS
└── react-force-graph-2d

API Layer
├── GraphQL (graphql-request)
└── Apollo Server

Database Layer
├── Neo4j (Cypher Engine)
├── Cypher Language
└── GraphQL Library para Neo4j
```

---

## ✅ Checklist para Empezar

- [ ] Tengo Neo4j corriendo
- [ ] Instalé dependencias con `pnpm install`
- [ ] Ejecuté `seedData.js`
- [ ] Apollo Server está en puerto 4000
- [ ] Frontend está en puerto 3000
- [ ] Puedo ver el grafo
- [ ] Leí [README_FINAL.md](README_FINAL.md)
- [ ] Entiendo cómo Neo4j almacena datos
- [ ] Entiendo cómo GraphQL y Cypher interactúan

---

**Creado**: 2024
**Última actualización**: Febrero 4, 2026
**Versión**: 1.0.0

**Documentación Completa**: [→ DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)  
✅ **Bien Documentado** - Documentación completa  

---

## 📚 Documentación

### 🎯 Para Empezar Rápido
- **[FINAL_SUMMARY.txt](FINAL_SUMMARY.txt)** - Resumen ejecutivo (3 min)
- **[EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)** - Qué cambió (5 min)

### 📖 Para Usar el Código
- **[USAGE_GUIDE.md](USAGE_GUIDE.md)** - Cómo usar servicios, hooks, etc.
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Estructura del proyecto

### 🔍 Para Entender Mejor
- **[PROBLEMS_AND_SOLUTIONS.md](PROBLEMS_AND_SOLUTIONS.md)** - Por qué cambió
- **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** - Resumen de cambios
- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Índice de documentación

---

## 🔧 Tecnologías

- **Next.js 14** - Framework React
- **TypeScript** - Type safety
- **React Force Graph 2D** - Visualización de grafos
- **Neo4j** - Base de datos de grafos
- **Apollo GraphQL** - Cliente/Servidor GraphQL

---

## 💻 Comandos Disponibles

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo

# Build
pnpm build            # Compilar para producción
pnpm start            # Ejecutar compilación

# Linting
pnpm lint             # Verificar código

# Backend
pnpm backend:dev      # Servidor GraphQL en desarrollo
```

---

## 🏗️ Arquitectura

```
Frontend (Next.js)
    ↓
Services (getPeople())
    ↓
GraphQL API (Backend)
    ↓
Neo4j Database
```

**Flujo de Datos:**
```
getPeople() → transformToGraphData() → filterGraphData() → Visualization
```

---

## 🎮 Uso

### Obtener Datos
```tsx
import { useGraphData } from "@/app/lib/hooks";

const { graphData, loading, error } = useGraphData();
```

### Filtrar
```tsx
import { filterGraphData } from "@/app/lib/utils";

const filtered = filterGraphData(graphData, filters);
```

### Usar Servicios
```tsx
import { getPeople } from "@/app/lib/services";

const response = await getPeople();
```

**Para más ejemplos:** [Ver USAGE_GUIDE.md](USAGE_GUIDE.md)

---

## 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| Archivos de Tipos | 6 |
| Servicios | 3 |
| Hooks Reutilizables | 2 |
| Funciones Puras | 5+ |
| Líneas de Documentación | 2000+ |
| Type Safety | 100% |

---

## 🛠️ Desarrollo

### Agregar Nuevo Servicio

1. Crea el archivo en `app/lib/services/`
2. Exporta desde `app/lib/services/index.ts`
3. Usa en componentes

### Agregar Nuevo Hook

1. Crea el archivo en `app/lib/hooks/`
2. Exporta desde `app/lib/hooks/index.ts`
3. Usa en componentes

### Agregar Nueva Constante

1. Agrega a `app/lib/constants/graphConstants.ts`
2. Exporta desde `app/lib/constants/index.ts`
3. Importa donde la necesites

---

## 📞 Soporte

- 📘 [Documentación Completa](DOCUMENTATION_INDEX.md)
- 📖 [Guía de Uso](USAGE_GUIDE.md)
- 🏗️ [Arquitectura](ARCHITECTURE.md)
- ❓ [Preguntas Frecuentes](PROBLEMS_AND_SOLUTIONS.md)

---

## 📝 Recientes Cambios

### ✨ Refactorización Completada (Feb 3, 2026)

Se realizó una refactorización completa para mejorar:
- ✅ Organización del código
- ✅ Reutilización de componentes
- ✅ Type safety
- ✅ Mantenibilidad

**Ver:** [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)

---

## 📄 Licencia

[Tu licencia aquí]

---

## 👤 Autor

Proyecto de visualización de redes GraphQL

---

**Última actualización:** 3 de febrero de 2026  
**Versión:** 2.0 (Refactorizada)  
**Estado:** ✅ Producción lista
