/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

import {
  fetchPeople,
  fetchPeopleWithFilters,
} from "./lib/services/GraphqlService";

import { Person, RelationshipStatus } from "./lib/types/graphqlTypes";
import FiltersPanel, { FilterOptions } from "./components/FiltersModal";
import ReportsPanel from "./components/ReportsPanel";
import CypherPanel from "./components/CypherPanel";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

// Valores por defecto de filtros
const DEFAULT_FILTERS: FilterOptions = {
  relationshipTypes: ["FRIEND", "FAMILY", "COLLEAGUE"] as RelationshipStatus[],
  frequencyRange: [1, 10],
  importanceRange: [1, 10],
};

// Mapeo de colores según el tipo de relación
const statusColorMap: Record<string, string> = {
  FRIEND: "#fbbf24", // Amarillo
  FAMILY: "#f87171", // Rojo
  COLLEAGUE: "#60a5fa", // Azul
};

// Función para determinar si un color es claro u oscuro
const isLightColor = (hexColor: string): boolean => {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Fórmula de luminancia relativa (WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5;
};

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
interface GraphNode {
  id: string;
  label: string;
  color?: string;
  size?: number; // Número de relaciones
}

/**
 * Represents a link/connection between two nodes in a GraphQL visualization.
 * @interface GraphLink
 * @property {string} source - The identifier of the source node where the link originates
 * @property {string} target - The identifier of the destination node where the link points to
 * @property {number} value - The weight or strength of the connection between nodes
 * @property {string} status - The current state of the link (e.g., 'friend', 'family', 'collegue')
 * @property {number} importance - A numeric score indicating the relevance or priority of this link (0-1 or 0-100)
 * @property {number} frecuency - The frequency or number of times this connection occurs or is accessed
 */
interface GraphLink {
  source: string;
  target: string;
  value: number;
  status: string;
  importance: number;
  frecuency: number;
}

export default function Home() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedPeopleForMutual, setSelectedPeopleForMutual] = useState<
    string[]
  >([]); // Array de hasta 2 personas
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Manejador de click en nodos para amigos comunes
  const handleNodeClick = (node: any) => {
    setSelectedPersonId(node.id);

    // Lógica para seleccionar personas para amigos comunes
    setSelectedPeopleForMutual((prev) => {
      const newSelection = [...prev];

      // Si ya existe en la selección, removerlo
      if (newSelection.includes(node.id)) {
        return newSelection.filter((id) => id !== node.id);
      }

      // Si hay menos de 2, agregarlo
      if (newSelection.length < 2) {
        return [...newSelection, node.id];
      }

      // Si hay 2, remover el primero y agregar el nuevo
      newSelection.shift();
      return [...newSelection, node.id];
    });
  };

  // Función para detectar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return (
      filters.relationshipTypes.length < 3 ||
      filters.frequencyRange[0] !== 1 ||
      filters.frequencyRange[1] !== 10 ||
      filters.importanceRange[0] !== 1 ||
      filters.importanceRange[1] !== 10
    );
  }, [filters]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Siempre cargar todas las personas para los reportes
        const people: Person[] = await fetchPeople();
        setAllPeople(people);

        // Usar query general si no hay filtros, query con filtros si los hay
        const displayPeople: Person[] = hasActiveFilters
          ? await fetchPeopleWithFilters(filters)
          : people;

        // Transformar datos a formato de grafo
        const nodes: GraphNode[] = displayPeople
          .filter(
            (person) => (person.relationshipsConnection?.totalCount || 0) > 0,
          )
          .map((person) => ({
            id: person.id,
            label: person.name,
            size: person.relationshipsConnection?.totalCount,
          }));

        const links: GraphLink[] = [];
        displayPeople.forEach((person) => {
          person.relationshipsConnection?.edges.forEach((edge) => {
            links.push({
              source: person.id,
              target: edge.node.id,
              value: edge.properties.importance,
              status: edge.properties.status,
              importance: edge.properties.importance,
              frecuency: edge.properties.frecuency,
            });
          });
        });

        setGraphData({ nodes, links });
        setLoading(false);
      } catch (error) {
        setError("Error loading data: " + (error as Error).message);
        setLoading(false);
      }
    };

    loadData();
  }, [hasActiveFilters, filters]); // Re-ejecutar cuando los filtros cambian

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
        {error}
      </div>
    );
  }

  return (
    <div className="flex w-full " style={{ height: "100vh" }}>
      {/* Panel de Reportes Lateral Izquierdo */}
      <ReportsPanel
        people={allPeople}
        selectedPersonId={selectedPersonId}
        selectedPeopleForMutual={selectedPeopleForMutual}
      />

      {/* Gráfico Principal */}
      <div
        className="flex-1 relative"
        style={{
          marginRight: "320px",
          zIndex: 1,
        }}
      >
        <ForceGraph2D
          graphData={
            graphData.nodes.length > 0 ? graphData : { nodes: [], links: [] }
          }
          nodeAutoColorBy="id"
          width={dimensions.width}
          height={dimensions.height - 64}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const graphNode = node as GraphNode;
            const label = (graphNode.label || node.id || "").toString();
            const fontSize = 17 / globalScale;

            // Calcular el radio del círculo basado en el número de relaciones
            // Base de 8 + 2 píxeles por cada relación, escalable con zoom
            const baseRadius = 8;
            const relationshipBonus = (graphNode.size || 0) * 2;
            const radius = (baseRadius + relationshipBonus) / globalScale;

            // Determinar color basado en selección
            let fillColor = graphNode.color || "#888888";
            if (selectedPersonId === node.id) {
              fillColor = "#fbbf24"; // Color amarillo para nodo seleccionado
            }

            // Dibujar el círculo del nodo
            ctx.beginPath();
            ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI);
            ctx.fillStyle = fillColor;
            ctx.fill();

            // Dibujar el borde del círculo - más visible si está seleccionado
            ctx.strokeStyle =
              selectedPersonId === node.id ? "#fbbf24" : "#ffffff";
            ctx.lineWidth =
              (selectedPersonId === node.id ? 4 : 2) / globalScale;
            ctx.stroke();

            // Dibujar el texto
            ctx.font = `bold ${fontSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            // Cambiar color del texto según si el fondo es claro u oscuro
            ctx.fillStyle = isLightColor(fillColor) ? "#000000" : "#ffffff";
            ctx.fillText(label, node.x || 0, node.y || 0);

            (node as any).__bckgDimensions = [radius * 2, radius * 2]; // para el hit detection
          }}
          nodeVal={(node: any) => {
            const graphNode = node as GraphNode;
            return Math.max(1 + (graphNode.size || 0) * 0.5, 1);
          }}
          nodeRelSize={4}
          // Configuración de links
          linkColor={(link: any) =>
            statusColorMap[link.status || "COLLEAGUE"] || "#60a5fa"
          }
          linkWidth={(link: any) => Math.max((link.importance || 1) * 0.3, 0.1)}
          onNodeClick={handleNodeClick}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={(link: any) =>
            0.0005 * (link.frecuency || 1)
          }
          linkDirectionalParticleWidth={(link: any) =>
            Math.max((link.importance || 1) * 0.5, 0.1)
          }
          // Física de la simulación - Optimizado para mejor espaciado
          warmupTicks={500}
          cooldownTicks={5000}
          cooldownTime={60000}
          d3AlphaMin={0.00001}
          d3AlphaDecay={0.015}
          d3VelocityDecay={0.8}
          onBackgroundClick={() => setSelectedPersonId(null)}
          onLinkClick={() => setSelectedPersonId(null)}
        />
      </div>

      {/* Panel de Filtros Lateral Derecho */}
      <FiltersPanel
        onFiltersChange={handleFiltersChange}
        currentFilters={filters}
      />

      {/* Botón toggle para Análisis - Centrado arriba */}
      <button
        onClick={() => setShowAnalytics(!showAnalytics)}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-lg"
      >
        {showAnalytics ? "Cerrar Análisis" : "📊 Análisis"}
      </button>

      {/* Panel de Análisis Modal Centrado - Arriba */}
      {showAnalytics && (
        <div className="fixed top-32 left-1/2 transform -translate-x-1/2 w-11/12 max-w-6xl bg-gray-800 border-2 border-gray-700 rounded-lg shadow-2xl z-[9998] overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="flex justify-between items-center sticky top-0 bg-gray-800 border-b border-gray-700 p-3 z-10">
            <h2 className="font-bold text-green-400">Reportes Cypher</h2>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-400 hover:text-white text-xl font-bold"
            >
              ✕
            </button>
          </div>
          <CypherPanel
            people={allPeople}
            selectedPersonId={selectedPersonId}
            selectedPeopleForMutual={selectedPeopleForMutual}
          />
        </div>
      )}
    </div>
  );
}
