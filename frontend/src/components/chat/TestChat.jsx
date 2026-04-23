import { useState, useEffect, useRef } from "react";
import { Avatar, Input, List, Spin, Empty } from "antd";
import {
    MessageOutlined,
    SendOutlined,
} from "@ant-design/icons";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../../services/axios.config";

export default function TestChat() {
    const [open, setOpen] = useState(true);
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
    const protocol = window.location.protocol === "https:" ? "https" : "http";

    const socketUrl =
        protocol === "https"
            ? `https://www.jushotel.site/backend/hms/ws`
            : `http://localhost:8080/hms/ws`;
    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    // 🚀 SOCKET
    useEffect(() => {
        if (!currentUserId) return;

        const client = new Client({
            webSocketFactory: () =>
                new SockJS(`${socketUrl}?userId=${currentUserId}`),
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
        <div>
            {/* FLOAT BUTTON */}
            <div
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer z-[9999]"
            >
                <MessageOutlined />
            </div>

            <div className="fixed bottom-24 right-6 w-[1100px] h-[680px] bg-white rounded-xl shadow-2xl flex overflow-hidden">

                {/* SIDEBAR */}
                <div className="w-[320px] border-r flex flex-col bg-gray-50">

                    {/* HEADER */}
                    <div className="p-4 border-b bg-white">
                        <div className="font-semibold text-lg">Tin nhắn</div>

                        <Input
                            placeholder="Tìm theo tên đại lý hoặc mã booking..."
                            className="mt-3"
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                        />

                        {/* FILTER */}
                        <div className="flex gap-2 mt-3 text-sm">
                            <div className="px-3 py-1 bg-blue-500 text-white rounded-full cursor-pointer">
                                Tất cả
                            </div>
                            <div className="px-3 py-1 bg-gray-200 rounded-full cursor-pointer">
                                Chưa đọc
                            </div>
                            <div className="px-3 py-1 bg-gray-200 rounded-full cursor-pointer">
                                Thương lượng giá
                            </div>
                        </div>
                    </div>

                    {/* LIST */}
                    <div className="flex-1 overflow-auto p-2">
                        {chats.map((item) => (
                            <div
                                key={item.userId}
                                onClick={() => setSelectedChat(item)}
                                className={`p-3 rounded-xl cursor-pointer mb-2 ${selectedChat?.userId === item.userId
                                    ? "bg-blue-100"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                <div className="flex gap-3">

                                    <Avatar className="bg-blue-500">
                                        {item.name?.[0]}
                                    </Avatar>

                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between">
                                            <div className="font-medium text-sm">
                                                {item.name}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {item.time
                                                    ? new Date(item.time).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                    : ""}
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 truncate">
                                            {item.lastMessage || "Start chatting..."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="flex-1 flex flex-col">

                    {/* HEADER */}
                    <div className="p-4 border-b bg-white flex justify-between items-center">

                        <div className="flex items-center gap-3">
                            <Avatar className="bg-blue-500">
                                {selectedChat?.name?.[0]}
                            </Avatar>

                            <div>
                                <div className="font-semibold text-sm">
                                    {selectedChat?.name}
                                </div>
                                <div className="text-xs text-gray-400">
                                    0987 654 321
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 text-gray-500 text-lg">
                            <span>📞</span>
                            <span>🎥</span>
                        </div>
                    </div>

                    {/* BOOKING CARD */}
                    <div className="p-3 border-b bg-gray-50">
                        <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <div className="font-medium text-sm text-blue-700">
                                    Mường Thanh Luxury
                                </div>
                                <div className="text-xs text-gray-500">
                                    20/05 - 22/05 • #BK-8899
                                </div>
                            </div>

                            <div className="text-blue-500 text-xs cursor-pointer">
                                Xem chi tiết đơn
                            </div>
                        </div>
                    </div>

                    {/* MESSAGES */}
                    <div className="flex-1 overflow-auto p-4 bg-gray-100 space-y-3">

                        {/* SYSTEM MESSAGE */}
                        <div className="text-center text-xs text-gray-400">
                            Đại lý đã gửi yêu cầu đặt phòng #BK-8899
                        </div>

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.type === "right"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[65%] px-4 py-2 rounded-xl text-sm ${msg.type === "right"
                                        ? "bg-blue-500 text-white"
                                        : "bg-white"
                                        }`}
                                >
                                    <div>{msg.content}</div>

                                    <div className="text-[10px] opacity-60 mt-1 text-right">
                                        {msg.time}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div ref={bottomRef} />
                    </div>

                    {/* INPUT */}
                    <div className="p-3 border-t bg-white flex items-center gap-2">

                        <div className="flex gap-3 text-gray-500 text-lg px-2">
                            📎 ⚡ 📷
                        </div>

                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                        />

                        <div
                            onClick={sendMessage}
                            className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full cursor-pointer"
                        >
                            ➤
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}