import { supabase } from '../lib/supabase'
import type { Block } from '../types/block'
import type { Project } from '../types/project'
import type { Document } from '../types/document'

// ============ Projects ============

export async function syncProjectToSupabase(project: Project, userId: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .upsert({
      id: project.id,
      user_id: userId,
      name: project.name,
      description: project.description || null,
      documents: project.documents,
      color: project.metadata.color || null,
      icon: project.metadata.icon || null,
      created_at: new Date(project.metadata.createdAt).toISOString(),
      updated_at: new Date(project.metadata.updatedAt).toISOString(),
    })

  if (error) {
    console.error('[Sync] Failed to sync project:', error)
    throw error
  }
}

export async function fetchProjectsFromSupabase(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[Sync] Failed to fetch projects:', error)
    throw error
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    documents: row.documents || [],
    metadata: {
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      color: row.color || undefined,
      icon: row.icon || undefined,
    },
  }))
}

export async function deleteProjectFromSupabase(projectId: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  if (error) {
    console.error('[Sync] Failed to delete project:', error)
    throw error
  }
}

// ============ Documents ============

export async function syncDocumentToSupabase(doc: Document, userId: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .upsert({
      id: doc.id,
      user_id: userId,
      title: doc.title,
      content: doc.content,
      project_id: doc.projectId || null,
      created_at: new Date(doc.metadata.createdAt).toISOString(),
      updated_at: new Date(doc.metadata.updatedAt).toISOString(),
    })

  if (error) {
    console.error('[Sync] Failed to sync document:', error)
    throw error
  }
}

export async function fetchDocumentsFromSupabase(userId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[Sync] Failed to fetch documents:', error)
    throw error
  }

  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    content: row.content || '',
    blocks: [], // blocks 从本地 IndexedDB 加载
    projectId: row.project_id || undefined,
    metadata: {
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    },
  }))
}

export async function deleteDocumentFromSupabase(documentId: string): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', documentId)
  if (error) {
    console.error('[Sync] Failed to delete document:', error)
    throw error
  }
}

// ============ Blocks (显式 Block / 卡片) ============

export async function syncBlockToSupabase(block: Block, userId: string): Promise<void> {
  const { error } = await supabase
    .from('blocks')
    .upsert({
      id: block.id,
      user_id: userId,
      content: block.content,
      type: block.type,
      implicit: block.implicit || false,
      source_type: block.source.type,
      source_document_id: block.source.documentId || null,
      source_ai_message_id: block.source.aiMessageId || null,
      captured_at: new Date(block.source.capturedAt).toISOString(),
      title: block.metadata.title || null,
      tags: block.metadata.tags,
      outgoing_links: block.links?.outgoing || [],
      incoming_links: block.links?.incoming || [],
      is_derivative: block.derivation?.isDerivative || false,
      source_block_id: block.derivation?.sourceBlockId || null,
      created_at: new Date(block.metadata.createdAt).toISOString(),
      updated_at: new Date(block.metadata.updatedAt).toISOString(),
    })

  if (error) {
    console.error('[Sync] Failed to sync block:', error)
    throw error
  }
}

export async function fetchBlocksFromSupabase(userId: string): Promise<Block[]> {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Sync] Failed to fetch blocks:', error)
    throw error
  }

  return (data || []).map(row => ({
    id: row.id,
    content: row.content,
    type: row.type,
    implicit: row.implicit || false,
    source: {
      type: row.source_type,
      documentId: row.source_document_id || undefined,
      aiMessageId: row.source_ai_message_id || undefined,
      capturedAt: new Date(row.captured_at),
    },
    metadata: {
      title: row.title || undefined,
      tags: row.tags || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    },
    links: {
      outgoing: row.outgoing_links || [],
      incoming: row.incoming_links || [],
    },
    derivation: row.is_derivative ? {
      isDerivative: true,
      sourceBlockId: row.source_block_id || undefined,
    } : undefined,
  }))
}

export async function deleteBlockFromSupabase(blockId: string): Promise<void> {
  const { error } = await supabase.from('blocks').delete().eq('id', blockId)
  if (error) {
    console.error('[Sync] Failed to delete block:', error)
    throw error
  }
}
