import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import Sidebar from './sidebar'
import ChatArea from './chat-area'

export default function WhatsAppLayout() {
  const [selectedUserId, setSelectedUserId] = useState<{ id: string } | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleUserSelect = (userId: string) => {
    setSelectedUserId({ id: userId })
    // Close the mobile menu when a user is selected
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="flex h-[100svh] bg-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-[320px] border-r bg-background">
        <Sidebar onSelectUser={handleUserSelect} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[320px] p-0">
          <Sidebar onSelectUser={handleUserSelect} />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden flex items-center h-14 px-4 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>

        {/* Chat Area */}
        {!selectedUserId && !isMobileMenuOpen ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a chat to start messaging
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
            <ChatArea selectedUser={selectedUserId} />
          </div>
        )}
      </div>
    </div>
  )
}

