/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchFriendsWithCypher,
  fetchFamilyWithCypher,
  fetchInfluentialPeopleWithCypher,
  fetchMostConnectedPersonWithCypher,
  fetchMutualFriends,
} from "../lib/services/GraphqlService";
import { Person } from "../lib/types/graphqlTypes";

interface CypherReport {
  type: "friends" | "family" | "influential" | "mostConnected" | "mutualFriends";
  title: string;
  description: string;
}

const CYPHER_REPORTS: CypherReport[] = [
  {
    type: "friends",
    title: "Amigos (Cypher)",
    description: "Amigos de una persona usando consulta Cypher",
  },
  {
    type: "family",
    title: "Familiares (Cypher)",
    description: "Familiares de una persona usando consulta Cypher",
  },
  {
    type: "mutualFriends",
    title: "Amigos Comunes (Cypher)",
    description: "Amigos comunes entre dos personas",
  },
  {
    type: "influential",
    title: "Top Influyentes (Cypher)",
    description: "Personas más influyentes por promedio de importancia",
  },
  {
    type: "mostConnected",
    title: "Más Conectado (Cypher)",
    description: "Persona con más conexiones totales",
  },
];

interface CypherPanelState {
  results: Person[] | any[];
  selectedReport: CypherReport["type"] | null;
  selectedPerson: Person | null;
  secondPerson: Person | null;
  allPeople: Person[];
  loading: boolean;
  error: string | null;
}

export default function CypherPanel({
  people = [],
  selectedPersonId,
  selectedPeopleForMutual = [],
}: {
  people?: Person[];
  selectedPersonId?: string | null;
  selectedPeopleForMutual?: string[];
}) {
  const [state, setState] = useState<CypherPanelState>({
    results: [],
    selectedReport: null,
    selectedPerson: null,
    secondPerson: null,
    allPeople: people,
    loading: false,
    error: null,
  });

  useEffect(() => {
    setState((prev) => ({ ...prev, allPeople: people }));
  }, [people]);

  // Auto-sync selectedPersonId to selectedPerson
  useEffect(() => {
    if (selectedPersonId) {
      const person = state.allPeople.find((p) => p.id === selectedPersonId);
      if (person) {
        setState((prev) => ({ ...prev, selectedPerson: person }));
      }
    }
  }, [selectedPersonId, state.allPeople]);

  // Auto-sync selectedPeopleForMutual a selectedPerson y secondPerson
  useEffect(() => {
    if (selectedPeopleForMutual && selectedPeopleForMutual.length >= 1) {
      const firstPerson = state.allPeople.find((p) => p.id === selectedPeopleForMutual[0]);
      const secondPerson = selectedPeopleForMutual.length >= 2 
        ? state.allPeople.find((p) => p.id === selectedPeopleForMutual[1])
        : null;
      
      setState((prev) => ({
        ...prev,
        selectedPerson: firstPerson || prev.selectedPerson,
        secondPerson: secondPerson || null,
      }));
    }
  }, [selectedPeopleForMutual, state.allPeople]);

  const executeReport = useCallback(async (reportType: CypherReport["type"]) => {
    setState((prev) => ({
      ...prev,
      selectedReport: reportType,
      loading: true,
      error: null,
    }));

    try {
      let results: any = [];

      switch (reportType) {
        case "friends":
          if (!state.selectedPerson) {
            throw new Error("Selecciona una persona primero");
          }
          results = await fetchFriendsWithCypher(state.selectedPerson.id);
          break;

        case "family":
          if (!state.selectedPerson) {
            throw new Error("Selecciona una persona primero");
          }
          results = await fetchFamilyWithCypher(state.selectedPerson.id);
          break;

        case "mutualFriends":
          if (!state.selectedPerson || !state.secondPerson) {
            throw new Error("Selecciona dos personas");
          }
          results = await fetchMutualFriends(
            state.selectedPerson.id,
            state.secondPerson.id
          );
          break;

        case "influential":
          results = await fetchInfluentialPeopleWithCypher(10);
          break;

        case "mostConnected":
          const mostConnected = await fetchMostConnectedPersonWithCypher();
          results = mostConnected ? [mostConnected] : [];
          break;
      }

      setState((prev) => ({
        ...prev,
        results,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }));
    }
  }, [state.selectedPerson, state.secondPerson]);

  // Auto-ejecutar reporte cuando se selecciona una persona y hay reporte seleccionado
  useEffect(() => {
    if (state.selectedReport && state.selectedPerson && 
        ["friends", "family", "mutualFriends"].includes(state.selectedReport)) {
      if (state.selectedReport === "mutualFriends" && !state.secondPerson) {
        return; // Esperar a que se seleccione la segunda persona
      }
      executeReport(state.selectedReport);
    }
  }, [state.selectedPerson, state.secondPerson, state.selectedReport, executeReport]);

  return (
    <div className="w-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <p className="text-sm text-gray-400">
          Consultas avanzadas usando Cypher en el backend
        </p>
      </div>

      {/* Contenido Principal */}
      <div className="p-4 space-y-4">
        {/* Seleccionar Reporte */}
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <h3 className="font-semibold mb-3 text-green-400">Tipo de Reporte</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {CYPHER_REPORTS.map((report) => (
              <button
                key={report.type}
                onClick={() => executeReport(report.type)}
                disabled={state.loading}
                className={`p-2 rounded text-left text-sm transition-colors ${
                  state.selectedReport === report.type
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                } ${state.loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="font-semibold">{report.title}</div>
                <div className="text-xs text-gray-400">{report.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Seleccionar Personas para consultas que las necesitan */}
        {state.selectedReport &&
          ["friends", "family", "mutualFriends"].includes(
            state.selectedReport
          ) && (
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h3 className="font-semibold mb-3 text-green-400">
                {state.selectedReport === "mutualFriends" 
                  ? `Seleccionar Personas (Haz click en 2 nodos del grafo)` 
                  : "Seleccionar Personas"}
              </h3>
              {state.selectedReport === "mutualFriends" && selectedPeopleForMutual.length > 0 && (
                <div className="mb-3 p-2 bg-green-900/30 border border-green-700 rounded">
                  <p className="text-xs text-green-400 mb-1">✓ Seleccionadas desde el grafo:</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedPeopleForMutual.map((personId) => {
                      const person = state.allPeople.find(p => p.id === personId);
                      return (
                        <span key={personId} className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                          {person?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">
                    {state.selectedReport === "mutualFriends"
                      ? "Primera Persona"
                      : "Persona"}
                  </label>
                  <select
                    value={state.selectedPerson?.id || ""}
                    onChange={(e) => {
                      const person = state.allPeople.find(
                        (p) => p.id === e.target.value
                      );
                      setState((prev) => ({ ...prev, selectedPerson: person || null }));
                    }}
                    className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="" style={{ color: "#9ca3af" }}>Seleccionar...</option>
                    {state.allPeople.map((p) => (
                      <option key={p.id} value={p.id} style={{ color: "white", backgroundColor: "#374151" }}>
                        {p.name} {p.nickname ? `(${p.nickname})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {state.selectedReport === "mutualFriends" && (
                  <div>
                    <label className="text-sm text-gray-400">
                      Segunda Persona
                    </label>
                    <select
                      value={state.secondPerson?.id || ""}
                      onChange={(e) => {
                        const person = state.allPeople.find(
                          (p) => p.id === e.target.value
                        );
                        setState((prev) => ({
                          ...prev,
                          secondPerson: person || null,
                        }));
                      }}
                      className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="" style={{ color: "#9ca3af" }}>Seleccionar...</option>
                      {state.allPeople.map((p) => (
                        <option key={p.id} value={p.id} style={{ color: "white", backgroundColor: "#374151" }}>
                          {p.name} {p.nickname ? `(${p.nickname})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Estado de Carga */}
        {state.loading && (
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-400">Cargando resultados...</p>
          </div>
        )}

        {/* Errores */}
        {state.error && (
          <div className="bg-red-900/20 border border-red-700 rounded p-3">
            <p className="text-red-300 text-sm">{state.error}</p>
          </div>
        )}

        {/* Resultados */}
        {!state.loading && state.results.length > 0 && (
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <h3 className="font-semibold mb-3 text-green-400">
              {state.selectedReport === "influential"
                ? "Top 10 Personas Influyentes"
                : state.selectedReport === "mostConnected"
                ? "Persona Más Conectada"
                : "Resultados"}
              ({state.results.length})
            </h3>

            {state.selectedReport === "influential" ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {state.results.map((person: any, idx: number) => (
                  <div
                    key={person.id}
                    className="p-2 bg-gray-700 rounded text-sm border-l-4 border-yellow-500"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">
                          #{idx + 1} {person.name}
                        </p>
                        <p className="text-gray-400 text-xs">{person.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold">
                          {person.averageImportance?.toFixed(2) || "0"}
                        </p>
                        <p className="text-gray-400 text-xs">influencia</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : state.selectedReport === "mostConnected" ? (
              <div className="p-3 bg-gray-700 rounded border-l-4 border-blue-500">
                <p className="font-semibold text-white">{state.results[0].name}</p>
                <p className="text-gray-400 text-sm">{state.results[0].email}</p>
                <p className="text-blue-400 text-sm mt-2">
                  Conexiones totales:{" "}
                  {state.results[0].relationshipsConnection?.totalCount || 0}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {state.results.map((person: any) => (
                  <div
                    key={person.id}
                    className="p-2 bg-gray-700 rounded text-sm border-l-4 border-cyan-500"
                  >
                    <p className="font-semibold text-white">{person.name}</p>
                    <p className="text-gray-400 text-xs">{person.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!state.loading &&
          state.selectedReport &&
          state.results.length === 0 &&
          !state.error && (
            <div className="text-center py-6 text-gray-400">
              <p>No hay resultados para esta consulta</p>
            </div>
          )}
      </div>
    </div>
  );
}
