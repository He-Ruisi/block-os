export { blockStore } from './blockStore'
export { documentStore } from './documentStore'
export { projectStore } from './projectStore'
export { initDatabase, getDatabase, isDatabaseInitialized } from './database'

// 统一初始化所有 Store（只需调用一次）
export async function initStorage(): Promise<void> {
  const { initDatabase } = await import('./database')
  await initDatabase()
}
