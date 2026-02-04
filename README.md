# GraphQL Visualizer

Un visualizador interactivo de redes GraphQL usando Neo4j y Next.js.

> 📘 **[Documentación Completa →](DOCUMENTATION_INDEX.md)** - Comienza aquí para entender la estructura

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- Neo4j database ejecutándose en `neo4j://127.0.0.1:7687`
- GraphQL API ejecutándose en `http://localhost:4000/graphql`

### Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar el servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📁 Estructura del Proyecto

```
app/lib/
├── types/          # Tipos TypeScript organizados
├── services/       # Servicios de API (GraphQL)
├── utils/          # Funciones de transformación
├── hooks/          # Hooks reutilizables
└── constants/      # Configuraciones centralizadas
```

**Para una visualización completa:** [Ver ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🎯 Características

✅ **Visualización Interactiva** - Grafo 2D con física realista  
✅ **Filtros Avanzados** - Búsqueda, tipo de relación, importancia, etc.  
✅ **Estructura Modular** - Código bien organizado y reutilizable  
✅ **Type-Safe** - 100% TypeScript  
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
