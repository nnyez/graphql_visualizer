/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  fetchInfluentialPeopleWithCypher,
  fetchMostConnectedPersonWithCypher,
} from "../lib/services/GraphqlService";

interface Analytics {
  influentialPeople: any[];
  mostConnected: any;
  loading: boolean;
  error: string | null;
}

export default function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<Analytics>({
    influentialPeople: [],
    mostConnected: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setAnalytics((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [influentialPeople, mostConnected] = await Promise.all([
        fetchInfluentialPeopleWithCypher(10),
        fetchMostConnectedPersonWithCypher(),
      ]);

      setAnalytics({
        influentialPeople,
        mostConnected,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAnalytics((prev) => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }));
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-64 bg-gray-800 border-t border-gray-700 p-4 overflow-hidden z-40">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-3 pb-2 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">Análisis Avanzado</h2>
          <p className="text-xs text-gray-400">Estadísticas usando consultas Cypher</p>
        </div>

        {/* Content */}
        {analytics.loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Cargando análisis...
          </div>
        ) : analytics.error ? (
          <div className="flex-1 flex items-center justify-center text-red-400">
            Error: {analytics.error}
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-6 pb-2">
              {/* Panel: Persona Más Conectada */}
              <div className="flex-shrink-0 w-80 bg-gray-700 p-3 rounded">
                <h3 className="text-sm font-semibold text-yellow-400 mb-2">
                  👥 Persona Más Conectada
                </h3>
                {analytics.mostConnected ? (
                  <div className="space-y-1">
                    <p className="text-white font-bold">{analytics.mostConnected.name}</p>
                    <p className="text-xs text-gray-300">{analytics.mostConnected.email}</p>
                    <div className="mt-2 pt-2 border-t border-gray-600">
                      <p className="text-sm text-gray-200">
                        Conexiones:{" "}
                        <span className="text-yellow-400 font-bold">
                          {analytics.mostConnected.relationshipsConnection?.totalCount || 0}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs">Sin datos</p>
                )}
              </div>

              {/* Panel: Personas Influyentes */}
              <div className="flex-shrink-0 w-full">
                <h3 className="text-sm font-semibold text-green-400 mb-2">
                  ⭐ Top Personas Influyentes
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {analytics.influentialPeople.slice(0, 10).map((person, idx) => (
                    <div
                      key={person.id}
                      className="flex-shrink-0 w-64 bg-gray-700 p-2 rounded"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm">{person.name}</p>
                          <p className="text-xs text-gray-300">{person.email}</p>
                          <div className="mt-1 pt-1 border-t border-gray-600">
                            <p className="text-xs text-gray-200">
                              Influencia:{" "}
                              <span className="text-green-400 font-bold">
                                {(person.averageImportance || 0).toFixed(2)}
                              </span>
                            </p>
                            <p className="text-xs text-gray-400">
                              {person.relationshipsConnection?.totalCount || 0} conexiones
                            </p>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-400 min-w-fit">
                          #{idx + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botón de recarga */}
        <div className="mt-2 pt-2 border-t border-gray-700">
          <button
            onClick={loadAnalytics}
            disabled={analytics.loading}
            className="text-xs bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white px-3 py-1 rounded transition-colors"
          >
            {analytics.loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      </div>
    </div>
  );
}
