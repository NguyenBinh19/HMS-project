import { useState, useEffect, useRef } from "react";
import { Avatar, Input, List, Spin, Empty } from "antd";
import {
    MessageOutlined,
    SendOutlined,
} from "@ant-design/icons";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../../services/axios.config";

export default function GlobalChatWidget() {
    const [open, setOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState([]);

    const [allUsers, setAllUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [connected, setConnected] = useState(false);

    const clientRef = useRef(null);
    const bottomRef = useRef(null);
    const selectedChatRef = useRef(null);
    const searchTimeout = useRef(null);

    const currentUser = JSON.parse(sessionStorage.getItem("user"));
    const currentUserId = currentUser?.userId;
    const [mode, setMode] = useState("user"); // "user" | "ai"
    const [aiMessages, setAiMessages] = useState([]);
    const [aiInput, setAiInput] = useState("");
    const [unreadCounts, setUnreadCounts] = useState({});
    const totalUnread = Object.values(unreadCounts).reduce((sum, val) => sum + val, 0);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    // 🚀 SOCKET
    useEffect(() => {
        if (!currentUserId) return;

        const client = new Client({
            webSocketFactory: () =>
                new SockJS(`http://localhost:8080/hms/ws?userId=${currentUserId}`),
            reconnectDelay: 5000,
            connectHeaders: {
                username: currentUser.username,
            },
            onConnect: () => {
                setConnected(true);

                client.subscribe("/user/queue/conversations", (msg) => {
                    const convo = JSON.parse(msg.body);
                    setChats((prev) => {
                        const filtered = prev.filter((c) => c.userId !== convo.userId);
                        return [convo, ...filtered];
                    });
                });

                client.subscribe("/user/queue/messages", (msg) => {
                    const newMsg = JSON.parse(msg.body);
                    const currentChat = selectedChatRef.current;

                    const otherUserId =
                        newMsg.senderId === currentUserId
                            ? newMsg.receiverId
                            : newMsg.senderId;

                    const isCurrentChat =
                        currentChat &&
                        (
                            (newMsg.senderId === currentUserId && newMsg.receiverId === currentChat.userId) ||
                            (newMsg.receiverId === currentUserId && newMsg.senderId === currentChat.userId)
                        );

                    if (!isCurrentChat && newMsg.senderId !== currentUserId) {
                        setUnreadCounts((prev) => ({
                            ...prev,
                            [otherUserId]: (prev[otherUserId] || 0) + 1,
                        }));
                    }

                    if (!isCurrentChat) return;
                    if (newMsg.senderId === currentUserId) return;

                    setMessages((prev) => [
                        ...prev,
                        {
                            type: "left",
                            content: newMsg.content,
                            time: new Date(newMsg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            }),
                        },
                    ]);
                });
            },
            onDisconnect: () => setConnected(false),
        });

        client.activate();
        clientRef.current = client;

        return () => client.deactivate();
    }, [currentUserId]);

    // 📡 LOAD CHAT LIST
    useEffect(() => {
        if (!currentUserId) return;

        api.get("/chat/conversations", {
            params: { userId: currentUserId },
        }).then((res) => {
            setChats(res.data);
            if (res.data.length > 0) setSelectedChat(res.data[0]);
        });
    }, [currentUserId]);

    // 🔍 SEARCH
    const handleSearch = (value) => {
        setSearchText(value);

        clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            if (!value.trim()) return setAllUsers([]);

            setLoadingUsers(true);

            const res = await api.get("/users");
            const filtered = res.data.result
                .filter((u) => u.id !== currentUserId)
                .filter((u) =>
                    (u.username || "").toLowerCase().includes(value.toLowerCase())
                );

            setAllUsers(filtered);
            setLoadingUsers(false);
        }, 400);
    };

    // 📡 HISTORY
    useEffect(() => {
        if (!selectedChat) return;

        api.get("/chat/history", {
            params: {
                user1: currentUserId,
                user2: selectedChat.userId,
            },
        }).then((res) => {
            setMessages(
                res.data.map((m) => ({
                    type: m.senderId === currentUserId ? "right" : "left",
                    content: m.content,
                    time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                }))
            );
        });
    }, [selectedChat]);

    const startChat = (user) => {
        const newChat = {
            userId: user.id,
            name: user.username,
            lastMessage: "",
        };

        setSelectedChat(newChat);

        setChats((prev) => {
            const exists = prev.find((c) => c.userId === user.id);
            return exists ? prev : [newChat, ...prev];
        });

        setShowSearch(false);
        setSearchText("");
        setAllUsers([]);
    };

    const sendMessage = () => {
        if (!message.trim() || !clientRef.current?.connected || !selectedChat) return;

        const text = message;

        setMessage("");

        setMessages((prev) => [
            ...prev,
            {
                type: "right",
                content: text,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
        ]);

        clientRef.current.publish({
            destination: "/app/chat.send",
            body: JSON.stringify({
                senderId: currentUserId,
                receiverId: selectedChat.userId,
                content: text,
            }),
        });
    };

    const sendAIMessage = async () => {
        if (!aiInput.trim()) return;

        const text = aiInput;
        setAiInput("");

        setAiMessages((prev) => [
            ...prev,
            {
                type: "right",
                content: text,
                time: new Date().toLocaleTimeString(),
            }
        ]);

        setAiMessages((prev) => [
            ...prev,
            { type: "left", content: "Typing...", loading: true }
        ]);

        try {
            const res = await api.post("/ai/chat", {
                message: text,
            });

            // ❗ replace "Typing..." bằng message thật
            setAiMessages((prev) => {
                const withoutTyping = prev.filter((m) => !m.loading);

                return [
                    ...withoutTyping,
                    {
                        type: "left",
                        content: res.data.reply,
                        time: new Date().toLocaleTimeString(),
                    }
                ];
            });

        } catch (err) {
            setAiMessages((prev) => {
                const withoutTyping = prev.filter((m) => !m.loading);

                return [
                    ...withoutTyping,
                    {
                        type: "left",
                        content: "AI lỗi 😅",
                        time: new Date().toLocaleTimeString(),
                    }
                ];
            });
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
            {/* FLOAT BUTTON */}
            <div
                onClick={() => setOpen(!open)}
                style={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    width: 56,
                    height: 56,
                    zIndex: 999999,
                }}
                className="bg-gradient-to-tr from-blue-500 to-blue-700 text-white flex items-center justify-center rounded-full shadow-xl cursor-pointer hover:scale-105 transition relative"
            >
                <MessageOutlined style={{ fontSize: 22, color: "#fff" }} />

                {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full font-bold pointer-events-none">
                        {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                )}
            </div>

            {open && (
                <div className="fixed bottom-24 right-6 w-[980px] h-[640px] bg-white rounded-2xl shadow-2xl flex overflow-hidden z-[9999]">

                    {/* SIDEBAR */}
                    <div className="w-[320px] border-r flex flex-col bg-gray-50">

                        {/* 🔥 MODE SWITCH (PILL STYLE) */}
                        <div className="p-3 border-b bg-white">
                            <div className="flex bg-gray-100 rounded-xl p-1">
                                <div
                                    onClick={() => setMode("user")}
                                    className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-medium transition
                                    ${mode === "user"
                                            ? "bg-white shadow text-blue-600"
                                            : "text-gray-500 hover:bg-gray-200"}`}
                                >
                                    Chats
                                </div>

                                <div
                                    onClick={() => setMode("ai")}
                                    className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-medium transition
                                    ${mode === "ai"
                                            ? "bg-white shadow text-blue-600"
                                            : "text-gray-500 hover:bg-gray-200"}`}
                                >
                                    AI
                                </div>
                            </div>
                        </div>

                        {/* 🔥 USER MODE */}
                        {mode === "user" && (
                            <>
                                {/* HEADER */}
                                <div className="px-4 py-3 flex justify-between items-center border-b bg-white">
                                    <span className="font-semibold text-gray-700">Conversations</span>
                                    <button
                                        onClick={() => setShowSearch(!showSearch)}
                                        className="text-blue-500 text-sm hover:underline"
                                    >
                                        + New
                                    </button>
                                </div>

                                {/* SEARCH */}
                                {showSearch && (
                                    <div className="p-3 border-b bg-white">
                                        <Input
                                            placeholder="Search user..."
                                            value={searchText}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />

                                        <div className="mt-2 max-h-[200px] overflow-auto rounded-lg border">
                                            {loadingUsers ? (
                                                <div className="flex justify-center p-4"><Spin /></div>
                                            ) : allUsers.length === 0 ? (
                                                <Empty description="No user found" />
                                            ) : (
                                                allUsers.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        onClick={() => startChat(user)}
                                                        className="p-2 hover:bg-gray-100 cursor-pointer flex gap-2 items-center transition"
                                                    >
                                                        <Avatar>{user.username?.[0]}</Avatar>
                                                        <span className="text-sm">{user.username}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* LIST */}
                                <div className="flex-1 overflow-auto px-2 py-2">
                                    {chats.length === 0 && (
                                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                            No conversations yet
                                        </div>
                                    )}

                                    <List
                                        dataSource={chats}
                                        renderItem={(item) => {
                                            const active = selectedChat?.userId === item.userId;

                                            return (
                                                <List.Item
                                                    onClick={() => {
                                                        setSelectedChat(item);

                                                        setUnreadCounts((prev) => ({
                                                            ...prev,
                                                            [item.userId]: 0,
                                                        }));
                                                    }}
                                                    className={`cursor-pointer rounded-xl px-3 py-3 mb-2 transition-all
                                                ${active
                                                            ? "bg-blue-100 border border-blue-300"
                                                            : "hover:bg-gray-100"}`}
                                                >
                                                    <div className="flex gap-3 w-full items-center">

                                                        <div className="relative">
                                                            <Avatar className="bg-blue-500">
                                                                {item.name?.[0]}
                                                            </Avatar>

                                                            {unreadCounts[item.userId] > 0 && (
                                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                                                    {unreadCounts[item.userId]}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-medium text-sm truncate">
                                                                    {item.name}
                                                                </span>

                                                                <span className="text-[10px] text-gray-400">
                                                                    {item.time &&
                                                                        new Date(item.time).toLocaleTimeString([], {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit"
                                                                        })}
                                                                </span>
                                                            </div>

                                                            <div className="text-xs text-gray-500 truncate">
                                                                {item.lastMessage || "Start chatting..."}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </List.Item>
                                            );
                                        }}
                                    />
                                </div>
                            </>
                        )}

                        {/* 🔥 AI MODE */}
                        {mode === "ai" && (
                            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                                Ask anything
                            </div>
                        )}
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="flex-1 flex flex-col">

                        {/* HEADER */}
                        <div className="px-4 py-3 border-b bg-white flex items-center gap-3">
                            {mode === "user" ? (
                                selectedChat ? (
                                    <>
                                        <Avatar className="bg-blue-500">
                                            {selectedChat.name?.[0]}
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-sm">
                                                {selectedChat.name}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-400 text-sm">
                                        Select a conversation
                                    </div>
                                )
                            ) : (
                                <div className="font-medium text-sm">AI Assistant</div>
                            )}
                        </div>

                        {/* MESSAGES */}
                        <div className="flex-1 overflow-auto p-4 space-y-3 bg-gray-100">
                            {(mode === "user" ? messages : aiMessages).map((msg, i) => (
                                <div key={i} className={`flex ${msg.type === "right" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[65%] px-4 py-2 rounded-2xl shadow-sm
                                    ${msg.type === "right"
                                            ? "bg-blue-500 text-white rounded-br-none"
                                            : "bg-white rounded-bl-none"}`}>

                                        <div className="text-sm">{msg.content}</div>

                                        <div className="text-[10px] mt-1 opacity-60 text-right">
                                            {msg.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        {/* INPUT */}
                        <div className="p-3 border-t bg-white flex gap-2 items-center">
                            <input
                                value={mode === "user" ? message : aiInput}
                                onChange={(e) =>
                                    mode === "user"
                                        ? setMessage(e.target.value)
                                        : setAiInput(e.target.value)
                                }
                                className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                placeholder={mode === "user" ? "Type a message..." : "Ask AI..."}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        mode === "user" ? sendMessage() : sendAIMessage();
                                    }
                                }}
                            />

                            <SendOutlined
                                onClick={() =>
                                    mode === "user" ? sendMessage() : sendAIMessage()
                                }
                                className="text-xl text-blue-500 cursor-pointer hover:scale-110 transition"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}