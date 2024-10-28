import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import useGraphStore from '../store/useGraphStore';
import NodeModal from './NodeModal';
import RelationshipModal from './RelationshipModal';
import { NodeType } from '../types';

interface LinkType {
  source: NodeType;
  target: NodeType;
  relationship: string;
}

const GraphVisualization: React.FC = () => {
  const nodes = useGraphStore((state) => state.nodes);
  const relationships = useGraphStore((state) => state.relationships);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [isNodeModalOpen, setNodeModalOpen] = useState(false);
  const [isRelationshipModalOpen, setRelationshipModalOpen] = useState(false);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!nodes.length || !relationships.length) return;

    // Map relationships correctly
    const links: LinkType[] = relationships.map((rel) => {
      const sourceNode = nodes.find((node) => node.id === rel.fromnode);
      const targetNode = nodes.find((node) => node.id === rel.tonode);
      console.log(sourceNode, "source node", targetNode, "target node");
      if (sourceNode && targetNode) {
        return {
          source: sourceNode,
          target: targetNode,
          relationship: rel.relationship,
        };
      }
      return null;
    }).filter((link): link is LinkType => link !== null);

    // Create D3 force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink<NodeType, LinkType>().id((d) => d.id).distance(50))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(400, 300));

    // Create links
    const link = svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .style('stroke', '#aaa')
      .style('stroke-width', 2);

    // Create link labels
    const linkLabels = svg
      .append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(links)
      .enter()
      .append('text')
      .attr('font-size', 12)
      .attr('dy', -10)
      .attr('text-anchor', 'middle')
      .style('fill', 'black')
      .text((d) => d.relationship);

    // Create nodes
    const node = svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 12)
      .style('fill', 'lightblue')
      .call(
        d3
          .drag<SVGCircleElement, NodeType>()
          .on('start', (event, d: NodeType) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d: NodeType) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d: NodeType) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Create node labels
    const labels = svg
      .append('g')
      .attr('class', 'node-labels')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text((d) => d.name)
      .attr('font-size', 12)
      .attr('dx', 14)
      .attr('dy', 4);

    // Update simulation on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: LinkType) => d.source.x || 0)
        .attr('y1', (d: LinkType) => d.source.y || 0)
        .attr('x2', (d: LinkType) => d.target.x || 0)
        .attr('y2', (d: LinkType) => d.target.y || 0);

      linkLabels
        .attr('x', (d: LinkType) => ((d.source.x || 0) + (d.target.x || 0)) / 2)
        .attr('y', (d: LinkType) => ((d.source.y || 0) + (d.target.y || 0)) / 2);

      node.attr('cx', (d: NodeType) => d.x || 0).attr('cy', (d: NodeType) => d.y || 0);
      labels.attr('x', (d: NodeType) => d.x || 0).attr('y', (d: NodeType) => d.y || 0);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, relationships]);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Knowledge Graph</h1>
      <div className="flex justify-between w-1/2 p-4">
        <button onClick={() => setNodeModalOpen(true)} className="mb-4 px-4 py-2 bg-green-500 text-white rounded">
          Add Node
        </button>
        <button onClick={() => setRelationshipModalOpen(true)} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
          Add Relationship
        </button>
      </div>
      <div className="graph-container">
        <svg ref={svgRef} width={1000} height={800}></svg>
      </div>
      <NodeModal isOpen={isNodeModalOpen} onClose={() => setNodeModalOpen(false)} />
      <RelationshipModal isOpen={isRelationshipModalOpen} onClose={() => setRelationshipModalOpen(false)} />
    </div>
  );
};

export default GraphVisualization;
