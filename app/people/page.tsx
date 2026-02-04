"use client";

import { useState, useEffect } from "react";
import { fetchPeople } from "../lib/services/GraphqlService";
import { Person } from "../lib/types/graphqlTypes";
import PeopleList from "../components/PeopleList";
import CypherPanel from "../components/CypherPanel";

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedPeopleForMutual, setSelectedPeopleForMutual] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const loadPeople = async () => {
      try {
        setLoading(true);
        const data = await fetchPeople();
        setPeople(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar personas");
        console.error("Error fetching people:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPeople();
  }, []);

  const handleSelectPerson = (personId: string) => {
    setSelectedPersonId(personId);

    // Lógica para seleccionar personas para amigos comunes (hasta 2)
    setSelectedPeopleForMutual((prev) => {
      const newSelection = [...prev];

      // Si ya existe en la selección, removerlo
      if (newSelection.includes(personId)) {
        return newSelection.filter((id) => id !== personId);
      }

      // Si hay menos de 2, agregarlo
      if (newSelection.length < 2) {
        return [...newSelection, personId];
      }

      // Si hay 2, remover el primero y agregar el nuevo
      newSelection.shift();
      return [...newSelection, personId];
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando personas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error al cargar</p>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <PeopleList
        people={people}
        selectedPersonId={selectedPersonId}
        onSelectPerson={handleSelectPerson}
      />

      {/* Botón toggle para Análisis - Cypher */}
      <button
        onClick={() => setShowAnalytics(!showAnalytics)}
        className="fixed bottom-8 right-8 z-[9999] bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-lg"
      >
        {showAnalytics ? "Cerrar Cypher" : "📊 Cypher"}
      </button>

      {/* Panel de Análisis Modal Cypher */}
      {showAnalytics && (
        <div className="fixed top-32 left-1/2 transform -translate-x-1/2 w-11/12 max-w-6xl bg-gray-800 border-2 border-gray-700 rounded-lg shadow-2xl z-[9998] overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="flex justify-between items-center sticky top-0 bg-gray-800 border-b border-gray-700 p-3 z-10">
            <h2 className="font-bold text-green-400">Consultas Cypher</h2>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-400 hover:text-white text-xl font-bold"
            >
              ✕
            </button>
          </div>
          <CypherPanel
            people={people}
            selectedPersonId={selectedPersonId}
            selectedPeopleForMutual={selectedPeopleForMutual}
          />
        </div>
      )}
    </div>
  );
}
