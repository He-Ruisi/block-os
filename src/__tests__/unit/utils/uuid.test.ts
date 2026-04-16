/**
 * UUID 工具函数单元测试
 * 
 * 这是一个示例测试文件，展示如何编写单元测试
 * 
 * 注意：Bun test 需要在运行时环境中执行，TypeScript 编译时会报错
 * 这是正常的，可以忽略 'bun:test' 的类型错误
 */

import { describe, it, expect } from 'bun:test'
import { generateUUID } from '@/utils/uuid'

describe('UUID Utils', () => {
  describe('generateUUID', () => {
    it('should generate UUID', () => {
      const uuid = generateUUID()
      expect(uuid).toBeDefined()
      expect(typeof uuid).toBe('string')
    })

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      expect(uuid1).not.toBe(uuid2)
    })

    it('should generate UUID with correct format', () => {
      const uuid = generateUUID()
      // UUID v4 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(uuid).toMatch(uuidRegex)
    })

    it('should generate UUID with correct length', () => {
      const uuid = generateUUID()
      expect(uuid.length).toBe(36) // 32 hex chars + 4 hyphens
    })
  })
})
