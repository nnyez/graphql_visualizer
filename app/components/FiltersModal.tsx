"use client";

import { useState, useEffect } from "react";
import { RelationshipStatus } from "../lib/types/generated";


export interface FilterOptions {
  relationshipTypes: RelationshipStatus[];
  frequencyRange: [number, number];
  importanceRange: [number, number];
}

interface FiltersPanelProps {
  onFiltersChange: (filters: FilterOptions) => void;
  currentFilters?: FilterOptions;
}

const defaultFilters: FilterOptions = {
  relationshipTypes: [
    "COLLEAGUE",
    "FAMILY",
    "FRIEND",
  ],
  frequencyRange: [1, 10],
  importanceRange: [1, 10],
};

export default function FiltersPanel({
  onFiltersChange,
  currentFilters = defaultFilters,
}: FiltersPanelProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  // Sincronizar filtros cuando currentFilters cambia desde el padre
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const handleRelationshipTypeToggle = (type: RelationshipStatus) => {
    const updated = {
      ...filters,
      relationshipTypes: filters.relationshipTypes.includes(type)
        ? filters.relationshipTypes.filter((t) => t !== type)
        : [...filters.relationshipTypes, type],
    };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleFrequencyChange = (index: 0 | 1, value: number) => {
    const updated = {
      ...filters,
      frequencyRange: [
        index === 0 ? value : filters.frequencyRange[0],
        index === 1 ? value : filters.frequencyRange[1],
      ] as [number, number],
    };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleImportanceChange = (index: 0 | 1, value: number) => {
    const updated = {
      ...filters,
      importanceRange: [
        index === 0 ? value : filters.importanceRange[0],
        index === 1 ? value : filters.importanceRange[1],
      ] as [number, number],
    };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto fixed right-0 top-16 bottom-0 z-40">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Filtros</h2>
        <p className="text-xs text-gray-400 mt-1">
          Ajusta los filtros para refinar la búsqueda
        </p>
      </div>

      {/* Tipos de relación */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Tipos de Relación
        </label>
        <div className="space-y-2">
          {(["FRIEND", "FAMILY", "COLLEAGUE"] as RelationshipStatus[]).map(
            (type) => (
              <label key={type} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.relationshipTypes.includes(type)}
                  onChange={() => handleRelationshipTypeToggle(type)}
                  className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                />
                <span className="ml-2 text-gray-300 capitalize">
                  {type === "FRIEND"
                    ? "Amigo"
                    : type === "FAMILY"
                    ? "Familia"
                    : "Colega"}
                </span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Rango de Frecuencia */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Frecuencia: {filters.frequencyRange[0]} - {filters.frequencyRange[1]}
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-6">Min</span>
            <input
              type="range"
              min="1"
              max="10"
              value={filters.frequencyRange[0]}
              onChange={(e) =>
                handleFrequencyChange(0, parseInt(e.target.value))
              }
              className="flex-1"
            />
            <span className="text-sm text-gray-300 w-8">
              {filters.frequencyRange[0]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-6">Max</span>
            <input
              type="range"
              min="1"
              max="10"
              value={filters.frequencyRange[1]}
              onChange={(e) =>
                handleFrequencyChange(1, parseInt(e.target.value))
              }
              className="flex-1"
            />
            <span className="text-sm text-gray-300 w-8">
              {filters.frequencyRange[1]}
            </span>
          </div>
        </div>
      </div>

      {/* Rango de Importancia */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Importancia: {filters.importanceRange[0]} - {filters.importanceRange[1]}
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-6">Min</span>
            <input
              type="range"
              min="1"
              max="10"
              value={filters.importanceRange[0]}
              onChange={(e) =>
                handleImportanceChange(0, parseInt(e.target.value))
              }
              className="flex-1"
            />
            <span className="text-sm text-gray-300 w-8">
              {filters.importanceRange[0]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-6">Max</span>
            <input
              type="range"
              min="1"
              max="10"
              value={filters.importanceRange[1]}
              onChange={(e) =>
                handleImportanceChange(1, parseInt(e.target.value))
              }
              className="flex-1"
            />
            <span className="text-sm text-gray-300 w-8">
              {filters.importanceRange[1]}
            </span>
          </div>
        </div>
      </div>

      {/* Botón Limpiar */}
      <button
        onClick={handleReset}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors mt-8"
      >
        Limpiar Filtros
      </button>
    </div>
  );
}