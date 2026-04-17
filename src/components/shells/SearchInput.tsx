import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * SearchInput - 搜索输入框壳组件
 * 
 * 带搜索图标和清除按钮的输入框，用于各种搜索场景。
 * 基于 Shadcn UI Input 和 Button 组合而成，无业务逻辑。
 */
export function SearchInput({
  value,
  onChange,
  placeholder = '搜索...',
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => onChange('')}
        >
          <X size={14} />
        </Button>
      )}
    </div>
  )
}
