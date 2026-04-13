import { supabase, isSupabaseEnabled } from '../lib/supabase'
import type { Block } from '../types/block'
import type { Project } from '../types/project'
import type { Document } from '../types/document'

// ============ Projects ============

export async function syncProjectToSupabase(project: Project, userId: string): Promise<void> {
  if (!isSupabaseEnabled) {
    console.warn('[Sync] Supabase 未启用，跳过同步')
    return
  }
  
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
  if (!isSupabaseEnabled) {
    return []
  }
  
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
  if (!isSupabaseEnabled) return
  
  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  if (error) {
    console.error('[Sync] Failed to delete project:', error)
    throw error
  }
}

// ============ Documents ============

export async function syncDocumentToSupabase(doc: Document, userId: string): Promise<void> {
  if (!isSupabaseEnabled) {
    console.warn('[Sync] Supabase 未启用，跳过同步')
    return
  }
  
  const { error } = await supabase
    .from('documents')
    .upsert({
      id: doc.id,
      user_id: userId,
      title: doc.title,
      content: doc.content,
      blocks: doc.blocks || [],  // 新增：同步隐式 Block
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
  if (!isSupabaseEnabled) {
    return []
  }
  
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
    blocks: row.blocks || [],  // 新增：加载隐式 Block
    projectId: row.project_id || undefined,
    metadata: {
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    },
  }))
}

export async function deleteDocumentFromSupabase(documentId: string): Promise<void> {
  if (!isSupabaseEnabled) return
  
  const { error } = await supabase.from('documents').delete().eq('id', documentId)
  if (error) {
    console.error('[Sync] Failed to delete document:', error)
    throw error
  }
}

// ============ Blocks (显式 Block / 卡片) ============

export async function syncBlockToSupabase(block: Block, userId: string): Promise<void> {
  if (!isSupabaseEnabled) {
    console.warn('[Sync] Supabase 未启用，跳过同步')
    return
  }
  
  const { error } = await supabase
    .from('blocks')
    .upsert({
      id: block.id,
      user_id: userId,
      content: block.content,
      type: block.type,
      implicit: block.implicit || false,
      
      // 新结构：source 作为 JSONB
      source: block.source,
      
      // 新增字段
      edit_history: block.editHistory || [],
      style: block.style || null,
      template: block.template || null,
      releases: block.releases || [],
      annotations: block.annotations || {},
      
      // 元数据
      title: block.metadata.title || null,
      tags: block.metadata.tags,
      created_at: new Date(block.metadata.createdAt).toISOString(),
      updated_at: new Date(block.metadata.updatedAt).toISOString(),
      
      // 关系
      outgoing_links: block.links?.outgoing || [],
      incoming_links: block.links?.incoming || [],
      
      // 版本派生
      is_derivative: block.derivation?.isDerivative || false,
      source_block_id: block.derivation?.sourceBlockId || null,
      derived_from: block.derivation?.derivedFrom || null,
      context_document_id: block.derivation?.contextDocumentId || null,
      context_title: block.derivation?.contextTitle || null,
      modifications: block.derivation?.modifications || null,
    })

  if (error) {
    console.error('[Sync] Failed to sync block:', error)
    throw error
  }
}

export async function fetchBlocksFromSupabase(userId: string): Promise<Block[]> {
  if (!isSupabaseEnabled) {
    return []
  }
  
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
    
    // 新结构：source 从 JSONB 读取
    source: row.source || {
      type: 'editor',
      capturedAt: new Date(row.created_at),
    },
    
    // 新增字段
    editHistory: row.edit_history || [],
    style: row.style || undefined,
    template: row.template || undefined,
    releases: row.releases || [],
    annotations: row.annotations || {},
    
    // 元数据
    metadata: {
      title: row.title || undefined,
      tags: row.tags || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    },
    
    // 关系
    links: {
      outgoing: row.outgoing_links || [],
      incoming: row.incoming_links || [],
    },
    
    // 版本派生
    derivation: row.is_derivative ? {
      isDerivative: true,
      sourceBlockId: row.source_block_id || undefined,
      derivedFrom: row.derived_from || undefined,
      contextDocumentId: row.context_document_id || undefined,
      contextTitle: row.context_title || undefined,
      modifications: row.modifications || undefined,
    } : undefined,
  }))
}

export async function deleteBlockFromSupabase(blockId: string): Promise<void> {
  if (!isSupabaseEnabled) return
  
  const { error } = await supabase.from('blocks').delete().eq('id', blockId)
  if (error) {
    console.error('[Sync] Failed to delete block:', error)
    throw error
  }
}
