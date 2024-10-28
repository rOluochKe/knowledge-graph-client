import { create } from 'zustand';
import { NodeType, RelationshipType } from '../types';

type GraphState = {
  nodes: NodeType[];
  relationships: RelationshipType[];
  addNode: (node: NodeType) => void;
  addRelationship: (relationship: RelationshipType) => void;
  setGraphData: (nodes: NodeType[], relationships: RelationshipType[]) => void;
};

const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  relationships: [],
  addNode: (node) =>
    set((state) => ({
      nodes: state.nodes.some((n) => n.id === node.id) ? state.nodes : [...state.nodes, node],
    })),
  addRelationship: (relationship) =>
    set((state) => ({
      relationships: state.relationships.some(
        (rel) => rel.fromnode === relationship.fromnode && rel.tonode === relationship.tonode
      )
        ? state.relationships
        : [...state.relationships, relationship],
    })),
  setGraphData: (nodes, relationships) => set({ nodes, relationships }),
}));

export default useGraphStore;
