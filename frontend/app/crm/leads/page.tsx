"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  DragDropContext,
  Draggable,
  Droppable,
} from "@hello-pangea/dnd";

type Lead = {
  id: string;
  nome: string;
  status: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([
    { id: "1", nome: "João Silva", status: "Novo" },
    { id: "2", nome: "Maria Souza", status: "Contato" },
    { id: "3", nome: "Empresa XPTO", status: "Qualificado" },
  ]);

  const colunas = [
    { nome: "Novo", cor: "#3b82f6" },
    { nome: "Contato", cor: "#f59e0b" },
    { nome: "Qualificado", cor: "#10b981" },
  ];

  function onDragEnd(result: {
    destination?: { droppableId: string } | null;
    draggableId: string;
  }) {
    if (!result.destination) return;

    const novosLeads = leads.map((lead) =>
      lead.id === result.draggableId
        ? { ...lead, status: result.destination!.droppableId }
        : lead
    );

    setLeads(novosLeads);
  }

  function adicionarLead(coluna: string) {
    const nome = prompt("Nome do Lead:");
    if (!nome) return;

    setLeads((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        nome,
        status: coluna,
      },
    ]);
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Leads</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={kanbanContainer}>
          {colunas.map((coluna) => {
            const total = leads.filter((lead) => lead.status === coluna.nome).length;

            return (
              <Droppable droppableId={coluna.nome} key={coluna.nome}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      ...columnWrapper,
                      background: snapshot.isDraggingOver
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(255,255,255,0.05)",
                      boxShadow: snapshot.isDraggingOver
                        ? `0 0 0 2px ${coluna.cor} inset`
                        : "none",
                      zIndex: snapshot.draggingFromThisWith
                        ? 30
                        : snapshot.isDraggingOver
                          ? 5
                          : 1,
                      transition: "background 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <div
                      style={{
                        ...columnHeader,
                        background: coluna.cor,
                      }}
                    >
                      {coluna.nome} ({total})
                    </div>

                    <div style={columnBody}>
                      {leads
                        .filter((lead) => lead.status === coluna.nome)
                        .map((lead, index) => (
                          <Draggable
                            key={lead.id}
                            draggableId={lead.id}
                            index={index}
                          >
                            {(provided, snapshot) => {
                              const draggableCard = (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...cardStyle,
                                    width: snapshot.isDragging ? undefined : "100%",
                                    ...provided.draggableProps.style,
                                    boxSizing: "border-box",

                                    // efeitos visuais separados sem quebrar o transform do dnd
                                    boxShadow: snapshot.isDragging
                                      ? "0 20px 40px rgba(0,0,0,0.5)"
                                      : "0 5px 15px rgba(0,0,0,0.2)",
                                    background: snapshot.isDragging ? "#f9fafb" : "#fff",
                                    zIndex: snapshot.isDragging ? 1000 : "auto",
                                  }}
                                >
                                  <div
                                    style={{
                                      transform: snapshot.isDragging ? "scale(1.08)" : "scale(1)",
                                      transition: "transform 0.2s",
                                    }}
                                  >
                                    {lead.nome}
                                  </div>
                                </div>
                              );

                              if (
                                snapshot.isDragging &&
                                typeof document !== "undefined"
                              ) {
                                return createPortal(draggableCard, document.body);
                              }

                              return draggableCard;
                            }}
                          </Draggable>
                        ))}

                      {provided.placeholder}

                      <button
                        style={addButton}
                        onClick={() => adicionarLead(coluna.nome)}
                      >
                        + Adicionar Lead
                      </button>
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}

const titleStyle: React.CSSProperties = {
  fontSize: "28px",
  marginBottom: "20px",
};

const pageStyle: React.CSSProperties = {
  height: "100%",
  overflow: "hidden",
};

const kanbanContainer: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  height: "calc(100% - 54px)",
  overflow: "visible",
};

const columnWrapper: React.CSSProperties = {
  flex: 1,
  position: "relative",
  borderRadius: "12px",
  overflow: "visible",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)",
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
};

const columnHeader: React.CSSProperties = {
  padding: "12px",
  fontWeight: "600",
  color: "#fff",
  textAlign: "center",
};

const columnBody: React.CSSProperties = {
  padding: "10px",
  minHeight: "150px",
  display: "flex",
  flexDirection: "column",
  overflow: "visible",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  color: "#000",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "10px",
  cursor: "grab",
  fontSize: "14px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
};

const addButton: React.CSSProperties = {
  marginTop: "10px",
  padding: "8px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
};
