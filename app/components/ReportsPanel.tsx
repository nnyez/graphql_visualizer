"use client";

import { useState, useEffect } from "react";
import {
  fetchFriendsList,
  fetchFamilyList,
  fetchCommonFriends,
  fetchMostConnectedPerson,
  fetchInfluentialPerson,
} from "../lib/services/GraphqlService";
import { Person } from "../lib/types/graphqlTypes";

interface Report {
  type:
    | "friends"
    | "family"
    | "commonFriends"
    | "mostConnected"
    | "influential";
  title: string;
  description: string;
}

const REPORTS: Report[] = [
  {
    type: "friends",
    title: "Lista de Amigos",
    description: "Amigos de una persona específica",
  },
  {
    type: "family",
    title: "Lista de Familiares",
    description: "Familiares de una persona específica",
  },
  {
    type: "commonFriends",
    title: "Amigos Comunes",
    description: "Amigos en común entre dos personas",
  },
  {
    type: "mostConnected",
    title: "Persona Más Conectada",
    description: "Persona con mayor número de relacionados",
  },
  {
    type: "influential",
    title: "Persona Influyente",
    description: "Persona con mayor influencia",
  },
];

interface ReportsPanelProps {
  people: Person[];
  selectedPersonId?: string | null;
  selectedPeopleForMutual?: string[];
}

export default function ReportsPanel({ people, selectedPersonId, selectedPeopleForMutual = [] }: ReportsPanelProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string>(selectedPersonId || "");
  const [secondPerson, setSecondPerson] = useState<string>("");
  const [reportData, setReportData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  // Actualizar selectedPerson cuando cambia selectedPersonId
  useEffect(() => {
    if (selectedPersonId) {
      setSelectedPerson(selectedPersonId);
    }
  }, [selectedPersonId]);

  // Sincronizar selectedPeopleForMutual con selectedPerson y secondPerson
  useEffect(() => {
    if (selectedPeopleForMutual && selectedPeopleForMutual.length >= 1) {
      setSelectedPerson(selectedPeopleForMutual[0]);
      if (selectedPeopleForMutual.length >= 2) {
        setSecondPerson(selectedPeopleForMutual[1]);
      }
    }
  }, [selectedPeopleForMutual]);

  const handleRunReport = async () => {
    if (!selectedReport) return;

    setLoading(true);
    try {
      let result: Person[] = [];

      switch (selectedReport.type) {
        case "friends":
          if (!selectedPerson) {
            alert("Selecciona una persona");
            return;
          }
          result = await fetchFriendsList(selectedPerson);
          break;

        case "family":
          if (!selectedPerson) {
            alert("Selecciona una persona");
            return;
          }
          result = await fetchFamilyList(selectedPerson);
          break;

        case "commonFriends":
          if (!selectedPerson || !secondPerson) {
            alert("Selecciona dos personas");
            return;
          }
          result = await fetchCommonFriends(selectedPerson, secondPerson);
          break;

        case "mostConnected":
          result = await fetchMostConnectedPerson();
          break;

        case "influential":
          result = await fetchInfluentialPerson();
          break;
      }

      setReportData(result);
    } catch (error) {
      console.error("Error running report:", error);
      alert("Error al ejecutar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto fixed left-0 top-16 bottom-0 z-40">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Reportes</h2>
        <p className="text-xs text-gray-400 mt-1">
          Consultas y análisis sobre personas y relaciones
        </p>
      </div>

      {/* Reports List */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Selecciona un Reporte
        </label>
        <div className="space-y-2">
          {REPORTS.map((report) => (
            <button
              key={report.type}
              onClick={() => {
                setSelectedReport(report);
                setReportData([]);
              }}
              className={`w-full text-left p-3 rounded transition-colors ${
                selectedReport?.type === report.type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <div className="font-semibold text-sm">{report.title}</div>
              <div className="text-xs text-gray-400 mt-1">
                {report.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Parameters */}
      {selectedReport && (
        <div className="mb-6 bg-gray-700 p-4 rounded">
          {(selectedReport.type === "friends" ||
            selectedReport.type === "family") && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Selecciona una Persona
              </label>
              <select
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Elige una persona...</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedReport.type === "commonFriends" && (
            <>
              {selectedPeopleForMutual.length > 0 && (
                <div className="mb-4 p-2 bg-green-900/30 border border-green-700 rounded">
                  <p className="text-xs text-green-400 mb-1">✓ Seleccionadas desde el grafo:</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedPeopleForMutual.map((personId) => {
                      const person = people.find(p => p.id === personId);
                      return (
                        <span key={personId} className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                          {person?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Primera Persona
                </label>
                <select
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Elige una persona...</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Segunda Persona
                </label>
                <select
                  value={secondPerson}
                  onChange={(e) => setSecondPerson(e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Elige una persona...</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            onClick={handleRunReport}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {loading ? "Cargando..." : "Ejecutar Reporte"}
          </button>
        </div>
      )}

      {/* Results */}
      {reportData.length > 0 && (
        <div className="bg-gray-700 p-4 rounded">
          <h3 className="text-sm font-bold text-white mb-3">
            Resultados ({reportData.length})
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reportData.map((person) => (
              <div key={person.id} className="bg-gray-600 p-3 rounded">
                <p className="text-sm font-semibold text-white">
                  {person.name}
                </p>
                <p className="text-xs text-gray-300">{person.email}</p>
                
                {/* Mostrar información de conexiones */}
                {person.relationshipsConnection && (
                  <div className="mt-2 pt-2 border-t border-gray-500">
                    <p className="text-xs text-gray-400 font-semibold">
                      Total de Conexiones: {person.relationshipsConnection.totalCount || 0}
                    </p>
                    
                    {/* Mostrar desglose por tipo si hay relaciones */}
                    {person.relationshipsConnection.edges && person.relationshipsConnection.edges.length > 0 && (
                      <div className="mt-2 text-xs">
                        {/* Desglose por tipo de relación */}
                        {(() => {
                          const statusCounts: Record<string, number> = {};
                          person.relationshipsConnection.edges.forEach(edge => {
                            statusCounts[edge.properties.status] = (statusCounts[edge.properties.status] || 0) + 1;
                          });
                          return (
                            <div className="space-y-1 text-gray-300">
                              {Object.entries(statusCounts).map(([status, count]) => (
                                <p key={status}>
                                  {status}: <span className="text-white font-semibold">{count}</span>
                                </p>
                              ))}
                            </div>
                          );
                        })()}
                        
                        {/* Para Persona Influyente, mostrar suma de importancia */}
                        {selectedReport?.type === "influential" && (
                          <div className="mt-2 pt-2 border-t border-gray-500">
                            <p className="text-gray-300">
                              Influencia Total: 
                              <span className="text-yellow-400 font-bold ml-1">
                                {person.relationshipsConnection.edges.reduce((sum, edge) => sum + (edge.properties.importance || 0), 0)}
                              </span>
                            </p>
                          </div>
                        )}
                        
                        {/* Lista de relaciones principales */}
                        {["mostConnected", "influential"].includes(selectedReport?.type || "") && (
                          <div className="mt-2 pt-2 border-t border-gray-500">
                            <p className="text-gray-400 font-semibold mb-1">Relaciones:</p>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {person.relationshipsConnection.edges
                                .sort((a, b) => (b.properties.importance || 0) - (a.properties.importance || 0))
                                .slice(0, 5)
                                .map((edge, idx) => (
                                  <div key={idx} className="bg-gray-700 p-1 rounded text-gray-300 text-xs">
                                    <p className="font-semibold">{edge.node.name}</p>
                                    <p className="text-gray-400">
                                      {edge.properties.status} • Importancia: {edge.properties.importance} • Frecuencia: {edge.properties.frecuency}
                                    </p>
                                  </div>
                                ))}
                              {person.relationshipsConnection.edges.length > 5 && (
                                <p className="text-gray-400 text-xs italic">
                                  +{person.relationshipsConnection.edges.length - 5} más...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedReport && reportData.length === 0 && !loading && (
        <div className="bg-gray-700 p-4 rounded text-center">
          <p className="text-xs text-gray-400">
            No hay resultados. Ejecuta el reporte para ver datos.
          </p>
        </div>
      )}
    </div>
  );
}
