import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export function ShadcnTest() {
  const { toast } = useToast()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold">Shadcn UI 组件测试</h1>

        {/* Button 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>1. Button（按钮）</CardTitle>
            <CardDescription>测试不同变体的按钮</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </CardContent>
        </Card>

        {/* Card 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>2. Card（卡片）</CardTitle>
            <CardDescription>这是一个卡片组件示例</CardDescription>
          </CardHeader>
          <CardContent>
            <p>卡片内容区域，可以放置任何内容。</p>
          </CardContent>
          <CardFooter>
            <Button>卡片操作</Button>
          </CardFooter>
        </Card>

        {/* Dialog 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>3. Dialog（对话框）</CardTitle>
            <CardDescription>测试对话框组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button>打开对话框</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>对话框标题</DialogTitle>
                  <DialogDescription>
                    这是对话框的描述文字，可以放置说明信息。
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>对话框内容区域</p>
                </div>
                <DialogFooter>
                  <Button variant="outline">取消</Button>
                  <Button>确认</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Tabs 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>4. Tabs（标签页）</CardTitle>
            <CardDescription>测试标签页组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList>
                <TabsTrigger value="tab1">标签 1</TabsTrigger>
                <TabsTrigger value="tab2">标签 2</TabsTrigger>
                <TabsTrigger value="tab3">标签 3</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">
                <p className="py-4">这是标签 1 的内容</p>
              </TabsContent>
              <TabsContent value="tab2">
                <p className="py-4">这是标签 2 的内容</p>
              </TabsContent>
              <TabsContent value="tab3">
                <p className="py-4">这是标签 3 的内容</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Select 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>5. Select（选择器）</CardTitle>
            <CardDescription>测试下拉选择组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择一个选项" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">选项 1</SelectItem>
                <SelectItem value="option2">选项 2</SelectItem>
                <SelectItem value="option3">选项 3</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Dropdown Menu 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>6. Dropdown Menu（下拉菜单）</CardTitle>
            <CardDescription>测试下拉菜单组件</CardDescription>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">打开菜单</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>菜单标题</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>菜单项 1</DropdownMenuItem>
                <DropdownMenuItem>菜单项 2</DropdownMenuItem>
                <DropdownMenuItem>菜单项 3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        {/* Input 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>7. Input（输入框）</CardTitle>
            <CardDescription>测试输入框组件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="默认输入框" />
            <Input type="email" placeholder="邮箱输入框" />
            <Input type="password" placeholder="密码输入框" />
            <Input disabled placeholder="禁用输入框" />
          </CardContent>
        </Card>

        {/* Textarea 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>8. Textarea（文本域）</CardTitle>
            <CardDescription>测试多行文本输入组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="请输入多行文本..." rows={4} />
          </CardContent>
        </Card>

        {/* Popover 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>9. Popover（弹出层）</CardTitle>
            <CardDescription>测试弹出层组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">打开弹出层</Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-2">
                  <h4 className="font-medium">弹出层标题</h4>
                  <p className="text-sm text-muted-foreground">
                    这是弹出层的内容区域，可以放置任何内容。
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {/* Toast 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>10. Toast（通知）</CardTitle>
            <CardDescription>测试通知组件</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                toast({
                  title: "成功通知",
                  description: "这是一条成功消息",
                })
              }}
            >
              显示通知
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast({
                  title: "错误通知",
                  description: "这是一条错误消息",
                  variant: "destructive",
                })
              }}
            >
              显示错误
            </Button>
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  )
}
