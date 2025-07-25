import type { Edge, Node } from '@xyflow/react';
import { z } from 'zod/v4';

import { zClassification, zProgressImage } from './common';
import { zFieldInputInstance, zFieldInputTemplate, zFieldOutputTemplate } from './field';
import { zSemVer } from './semver';

// #region InvocationTemplate
const zInvocationTemplate = z.object({
  type: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string().min(1)),
  inputs: z.record(z.string(), zFieldInputTemplate),
  outputs: z.record(z.string(), zFieldOutputTemplate),
  outputType: z.string().min(1),
  version: zSemVer,
  useCache: z.boolean(),
  nodePack: z.string().min(1).default('invokeai'),
  classification: zClassification,
});
export type InvocationTemplate = z.infer<typeof zInvocationTemplate>;
// #endregion

// #region NodeData
export const zInvocationNodeData = z.object({
  id: z.string().trim().min(1),
  version: zSemVer,
  nodePack: z.string().min(1).default('invokeai'),
  label: z.string(),
  notes: z.string(),
  type: z.string().trim().min(1),
  inputs: z.record(z.string(), zFieldInputInstance),
  isOpen: z.boolean(),
  isIntermediate: z.boolean(),
  useCache: z.boolean(),
});

export const zNotesNodeData = z.object({
  id: z.string().trim().min(1),
  type: z.literal('notes'),
  label: z.string(),
  isOpen: z.boolean(),
  notes: z.string(),
});
const zCurrentImageNodeData = z.object({
  id: z.string().trim().min(1),
  type: z.literal('current_image'),
  label: z.string(),
  isOpen: z.boolean(),
});

export type NotesNodeData = z.infer<typeof zNotesNodeData>;
export type InvocationNodeData = z.infer<typeof zInvocationNodeData>;
type CurrentImageNodeData = z.infer<typeof zCurrentImageNodeData>;

export type InvocationNode = Node<InvocationNodeData, 'invocation'>;
export type NotesNode = Node<NotesNodeData, 'notes'>;
export type CurrentImageNode = Node<CurrentImageNodeData, 'current_image'>;
export type AnyNode = InvocationNode | NotesNode | CurrentImageNode;

export const isInvocationNode = (node?: AnyNode | null): node is InvocationNode =>
  Boolean(node && node.type === 'invocation');
export const isNotesNode = (node?: AnyNode | null): node is NotesNode => Boolean(node && node.type === 'notes');
// #endregion

// #region NodeExecutionState
export const zNodeStatus = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']);
const zNodeError = z.object({
  error_type: z.string(),
  error_message: z.string(),
  error_traceback: z.string(),
});
const zNodeExecutionState = z.object({
  nodeId: z.string().trim().min(1),
  status: zNodeStatus,
  progress: z.number().nullable(),
  progressImage: zProgressImage.nullable(),
  outputs: z.array(z.any()),
  error: zNodeError.nullable(),
});
export type NodeExecutionState = z.infer<typeof zNodeExecutionState>;
// #endregion

// #region Edges
const zInvocationNodeEdgeCollapsedData = z.object({
  count: z.number().int().min(1),
});
type InvocationNodeEdgeCollapsedData = z.infer<typeof zInvocationNodeEdgeCollapsedData>;
export type DefaultInvocationNodeEdge = Edge<Record<string, never>, 'default'>;
export type CollapsedInvocationNodeEdge = Edge<InvocationNodeEdgeCollapsedData, 'collapsed'>;
export type AnyEdge = DefaultInvocationNodeEdge | CollapsedInvocationNodeEdge;
// #endregion

export const isBatchNodeType = (type: string) =>
  ['image_batch', 'string_batch', 'integer_batch', 'float_batch'].includes(type);

export const isGeneratorNodeType = (type: string) =>
  ['image_generator', 'string_generator', 'integer_generator', 'float_generator'].includes(type);

export const isBatchNode = (node: InvocationNode) => isBatchNodeType(node.data.type);

export const isGeneratorNode = (node: InvocationNode) => isGeneratorNodeType(node.data.type);

export const isExecutableNode = (node: InvocationNode) => {
  return !isBatchNode(node) && !isGeneratorNode(node);
};
