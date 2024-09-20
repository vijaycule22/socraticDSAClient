'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X } from 'lucide-react'

type Message = {
    id: number
    text: string
    sender: 'user' | 'bot'
}

export default function ChatPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! How can I help you today?", sender: 'bot' }
    ])
    const [inputMessage, setInputMessage] = useState('')

    const toggleChat = () => setIsOpen(!isOpen)

    const sendMessage = () => {
        if (inputMessage.trim()) {
            const newMessage: Message = {
                id: messages.length + 1,
                text: inputMessage,
                sender: 'user'
            }
            setMessages([...messages, newMessage])
            setInputMessage('')

            // Simulate bot response
            setTimeout(() => {
                const botResponse: Message = {
                    id: messages.length + 2,
                    text: "Thank you for your message. How else can I assist you?",
                    sender: 'bot'
                }
                setMessages(prevMessages => [...prevMessages, botResponse])
            }, 1000)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen && (
                <Button onClick={toggleChat} className="rounded-full w-12 h-12 shadow-lg">
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}
            {isOpen && (
                <div className="bg-background border rounded-lg shadow-xl w-80 flex flex-col transition-all duration-300 ease-in-out">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-lg font-semibold text-foreground">Chat Support</h2>
                        <Button variant="ghost" size="icon" onClick={toggleChat}>
                            <X className="h-4 w-4 text-foreground" />
                        </Button>
                    </div>
                    <ScrollArea className="flex-grow p-4 h-96">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`mb-4 text-foreground ${message.sender === 'user' ? 'text-right' : 'text-left'
                                    }`}
                            >
                                <span
                                    className={`inline-block p-2 rounded-lg ${message.sender === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                        }`}
                                >
                                    {message.text}
                                </span>
                            </div>
                        ))}
                    </ScrollArea>
                    <div className="p-4 border-t flex">
                        <Input
                            type="text"
                            placeholder="Type a message..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            className="flex-grow mr-2 text-foreground"
                        />
                        <Button onClick={sendMessage}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}