import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';
import { iteData } from '../data/ite_data';
import { SpecializationCourse } from '../types';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 120;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'RL') => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      targetPosition: direction === 'LR' ? Position.Left : Position.Right,
      sourcePosition: direction === 'LR' ? Position.Right : Position.Left,
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const generateInitialElements = (selectedSpecialization: string | null) => {
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  Object.values(iteData.courses).forEach((course) => {
    initialNodes.push({
      id: course.code,
      type: 'courseNode',
      position: { x: 0, y: 0 },
      data: { course },
    });

    course.prereqs.forEach((prereq) => {
      initialEdges.push({
        id: `e-${prereq}-${course.code}`,
        source: prereq,
        target: course.code,
        type: 'smoothstep',
        animated: false,
      });
    });
  });

  if (selectedSpecialization) {
    const spec = iteData.specializations.find(s => s.id === selectedSpecialization);
    if (spec) {
      const specCourses = iteData.specialization_courses[selectedSpecialization as keyof typeof iteData.specialization_courses];
      if (specCourses) {
        Object.values(specCourses.tracks).forEach(track => {
          Object.values(track.courses).forEach(course => {
            const c = course as SpecializationCourse;
            initialNodes.push({
              id: c.code,
              type: 'courseNode',
              position: { x: 0, y: 0 },
              data: { course: c },
            });

            c.prereqs.forEach((prereq) => {
              initialEdges.push({
                id: `e-${prereq}-${c.code}`,
                source: prereq,
                target: c.code,
                type: 'smoothstep',
                animated: false,
              });
            });
          });
        });
      }
    }
  }

  return getLayoutedElements(initialNodes, initialEdges, 'RL');
};
