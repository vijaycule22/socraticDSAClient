import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendIcon, UserIcon, BotIcon, XIcon, MessageCircleIcon, AlertCircle, Brain } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { CodeBlock } from './CodeBlock'

interface Message {
    role: 'user' | 'system' | 'Assistant'
    content: string
    read: boolean
}

interface AIHelpPopupProps {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
    onSendMessage: (message: string) => void
    messages: Message[]
    recentResponseFromAi?: string
    isLoading?: boolean
}

export default function ChatMenu({ isOpen, onOpen, onClose, onSendMessage, messages = [], recentResponseFromAi, isLoading }: AIHelpPopupProps) {
    const [inputMessage, setInputMessage] = useState('')
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null)
    const [unreadCount, setUnreadCount] = useState(0);

    // let unreadCount = messages.filter(m => !m.read).length

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight
        }
    }, [messages])

    const handleSendMessage = () => {
        if (inputMessage.trim()) {
            onSendMessage(inputMessage)
            setInputMessage('')
        }
    }

    const handleOnsendMessage = (message: string) => {
        onSendMessage(message)
    }

    const handleOpen = () => {
        onOpen()
        setIsPopoverOpen(false);
    }

    useEffect(() => {
        setIsPopoverOpen(true);
        if (recentResponseFromAi) {
            setTimeout(() => {
                setIsPopoverOpen(false);
            }, 5000);
        }
    }, [recentResponseFromAi])

    useEffect(() => {
        if (isOpen) {
            messages.map(message => {
                message.read = true;
            });
            console.log(messages)
            setUnreadCount(messages.filter(m => !m.read).length);
        }
    }, [isOpen, messages])

    return (
        <div >
            <Popover open={isPopoverOpen && !isOpen} >
                <PopoverTrigger asChild>
                    <Button
                        onClick={handleOpen}
                        className="fixed bottom-7 h-12 w-12 right-6 rounded-full z-50 shadow-xl border bg-gray-600 hover:bg-gray-700 text-white"
                        size="icon"
                    >
                        {isLoading ? (
                            <div className="relative inline-block">
                                <Brain className="h-7 w-7 text-primary animate-pulse" />
                                <div className="absolute inset-0 animate-ping-slow">
                                    <Brain className="h-7 w-7 text-primary opacity-75" />
                                </div>
                                <div className="absolute -top-5 -right-5 w-7 h-7">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                        <path d="M3 13.5C3 17.0899 5.91015 20 9.5 20H13.5C17.0899 20 20 17.0899 20 13.5C20 9.91015 17.0899 7 13.5 7H9.5C5.91015 7 3 9.91015 3 13.5Z" fill="#dbdbd7" stroke="currentColor" strokeWidth="1" />
                                        <circle className="animate-loading-dot" cx="8" cy="13" r="1.5" fill="black" />
                                        <circle className="animate-loading-dot animation-delay-300" cx="12" cy="13" r="1.5" fill="black" />
                                        <circle className="animate-loading-dot animation-delay-600" cx="16" cy="13" r="1.5" fill="black" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <Brain className="h-7 w-7" />
                        )}


                        {unreadCount > 0 && (
                            <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white">
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                {recentResponseFromAi && <PopoverContent side="top" align="end" className="w-80 bg-gray-800 border border-gray-700 cursor-pointer rounded-lg shadow-lg mb-2" onClick={handleOpen}>
                    <Alert className=' bg-gray-800 border border-gray-700'>
                        <Brain className="h-4 w-4" />
                        <AlertTitle>AI Help!</AlertTitle>
                        <AlertDescription>
                            <div>
                                {recentResponseFromAi}
                            </div>
                            {/* {code_output && <CodeBlock code={code_output} language="python" />} */}
                        </AlertDescription>
                    </Alert>
                </PopoverContent>
                }
            </Popover>

            {isOpen && (
                <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-zinc-800 border border-gray-700 rounded-lg shadow-lg flex flex-col z-50">
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2"> <Brain className="h-5 w-5" /> AI Assistant!</h2>
                        <Button onClick={onClose} size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                            <XIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    <ScrollArea className="flex-grow p-4" ref={chatRef}>
                        {messages.map((message, index) => (
                            <div key={index} className={`flex items-start mb-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                <div className={`flex items-start ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
                                        {message.role === 'user' ? <UserIcon size={16} /> : <BotIcon size={16} />}
                                    </div>
                                    <div className={`max-w-[80%] mx-2 p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type your message..."
                                className="flex-1 p-2 mr-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Button onClick={handleSendMessage} size="icon" className="bg-blue-500 hover:bg-blue-600 text-white">
                                <SendIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}