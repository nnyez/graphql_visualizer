"use client";

import { useState } from "react";
import { Person, RelationshipStatus } from "../lib/types/graphqlTypes";

interface PeopleListProps {
  people: Person[];
  selectedPersonId?: string | null;
  onSelectPerson?: (personId: string) => void;
}

const statusColorMap: Record<string, string> = {
  FRIEND: "#fbbf24",
  FAMILY: "#f87171",
  COLLEAGUE: "#60a5fa",
};

const statusLabelMap: Record<string, string> = {
  FRIEND: "👥 Amigo",
  FAMILY: "👨‍👩‍👧‍👦 Familia",
  COLLEAGUE: "💼 Colega",
};

export default function PeopleList({
  people,
  selectedPersonId,
  onSelectPerson,
}: PeopleListProps) {
  const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPeople = people.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleExpanded = (personId: string) => {
    setExpandedPersonId(expandedPersonId === personId ? null : personId);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50">
      {/* Header con búsqueda */}
      <div className="bg-white border-b border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Personas</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, apodo o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
          <span className="absolute right-3 top-2.5 text-slate-400">🔍</span>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {filteredPeople.length} personas encontradas
        </p>
      </div>

      {/* Lista de personas */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredPeople.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No se encontraron personas
            </div>
          ) : (
            filteredPeople.map((person) => (
              <div
                key={person.id}
                className={`bg-white rounded-lg border transition-all cursor-pointer ${
                  selectedPersonId === person.id
                    ? "border-blue-500 shadow-md"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Card Header */}
                <div
                  onClick={() => {
                    toggleExpanded(person.id);
                    onSelectPerson?.(person.id);
                  }}
                  className="p-4 flex items-start gap-4"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {person.photoUrl ? (
                      <img
                        src={person.photoUrl}
                        alt={person.name}
                        className="w-12 h-12 rounded-full object-cover bg-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                        {(person.name || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {person.name}
                    </h3>
                    {person.nickname && (
                      <p className="text-sm text-slate-600 truncate">
                        &ldquo;{person.nickname}&rdquo;
                      </p>
                    )}
                    <p className="text-sm text-slate-500 truncate">
                      {person.email}
                    </p>
                  </div>

                  {/* Indicador de relaciones */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-slate-900">
                      {person.relationshipsConnection?.totalCount || 0}
                    </div>
                    <p className="text-xs text-slate-500">relaciones</p>
                  </div>

                  {/* Toggle arrow */}
                  <div
                    className={`flex-shrink-0 text-slate-400 transition-transform ${
                      expandedPersonId === person.id ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </div>
                </div>

                {/* Card Expandida - Relaciones */}
                {expandedPersonId === person.id &&
                  person.relationshipsConnection?.edges &&
                  person.relationshipsConnection.edges.length > 0 && (
                    <div className="border-t border-slate-200 bg-slate-50">
                      <div className="p-4">
                        <h4 className="font-semibold text-slate-800 mb-3">
                          Relaciones (
                          {person.relationshipsConnection.edges.length})
                        </h4>
                        <div className="space-y-2">
                          {person.relationshipsConnection.edges.map(
                            (edge, idx) => (
                              <div
                                key={idx}
                                className="bg-white rounded border border-slate-200 p-3"
                              >
                                <div className="flex items-start gap-3">
                                  {/* Avatar relación */}
                                  <div className="flex-shrink-0">
                                    {edge.node.photoUrl ? (
                                      <img
                                        src={edge.node.photoUrl}
                                        alt={edge.node.name}
                                        className="w-8 h-8 rounded-full object-cover bg-slate-200"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold">
                                        {(edge.node.name || "?").charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </div>

                                  {/* Info relación */}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 truncate">
                                      {edge.node.name}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                      {edge.node.email}
                                    </p>
                                  </div>

                                  {/* Status badge */}
                                  <div
                                    className="flex-shrink-0 px-2 py-1 rounded text-xs font-medium text-white"
                                    style={{
                                      backgroundColor:
                                        statusColorMap[
                                          edge.properties.status
                                        ] || "#94a3b8",
                                    }}
                                  >
                                    {statusLabelMap[edge.properties.status] ||
                                      edge.properties.status}
                                  </div>
                                </div>

                                {/* Métricas de relación */}
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-blue-50 rounded px-2 py-1">
                                    <span className="font-semibold text-blue-900">
                                      Frecuencia:
                                    </span>
                                    <span className="ml-1 text-blue-700">
                                      {edge.properties.frecuency}
                                    </span>
                                  </div>
                                  <div className="bg-purple-50 rounded px-2 py-1">
                                    <span className="font-semibold text-purple-900">
                                      Importancia:
                                    </span>
                                    <span className="ml-1 text-purple-700">
                                      {edge.properties.importance}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
