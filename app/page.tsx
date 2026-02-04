/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

import { fetchPeople, fetchPeopleWithFilters } from "./lib/services/GraphqlService";

import { Person, RelationshipStatus } from "./lib/types/graphqlTypes";
import FiltersPanel, { FilterOptions } from "./components/FiltersModal";

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

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
        
        // Usar query general si no hay filtros, query con filtros si los hay
        const people: Person[] = hasActiveFilters
          ? await fetchPeopleWithFilters(filters)
          : await fetchPeople();
        // Transformar datos a formato de grafo
        const nodes: GraphNode[] = people.map((person) => ({
          id: person.id,
          label: person.name,
          size: person.relationshipsConnection?.totalCount,
        }));

        const links: GraphLink[] = [];
        people.forEach((person) => {
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
    <div className="flex w-screen h-screen bg-gray-900">
      {/* Gráfico Principal */}
      <div className="flex-1">
        <ForceGraph2D
          graphData={
            graphData.nodes.length > 0 ? graphData : { nodes: [], links: [] }
          }
          nodeAutoColorBy="id"
          width={dimensions.width}
          height={dimensions.height}
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
            ctx.lineWidth = (selectedPersonId === node.id ? 4 : 2) / globalScale;
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
          onNodeClick={(node: any) => {
            setSelectedPersonId(node.id);
          }}
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

      {/* Panel de Filtros Lateral */}
      <FiltersPanel onFiltersChange={handleFiltersChange} currentFilters={filters} />
    </div>
  );
}
