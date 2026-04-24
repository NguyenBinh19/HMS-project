import { useState, useEffect, useRef } from "react";
import { Avatar, Input, List, Spin, Empty } from "antd";
import {
    MessageOutlined,
    SendOutlined,
} from "@ant-design/icons";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../../services/axios.config";
import { useLocation, useNavigate } from "react-router-dom";
import {
    PhoneOutlined,
    VideoCameraOutlined
} from "@ant-design/icons";

export default function GlobalChatWidget() {
    const navigate = useNavigate();
    const peerRef = useRef(null);
    const [callState, setCallState] = useState("idle");
    const [isCalling, setIsCalling] = useState(false);
    const [isVideoCall, setIsVideoCall] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const localStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState([]);

    const [allUsers, setAllUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [connected, setConnected] = useState(false);
    const targetUserIdRef = useRef(null);
    const clientRef = useRef(null);
    const bottomRef = useRef(null);
    const selectedChatRef = useRef(null);
    const searchTimeout = useRef(null);
    const [isSearching, setIsSearching] = useState(false);
    const currentUser = JSON.parse(sessionStorage.getItem("user"));
    const currentUserId = currentUser?.userId;
    const [mode, setMode] = useState("user"); // "user" | "ai"
    const [aiMessages, setAiMessages] = useState([]);
    const [aiInput, setAiInput] = useState("");
    const [unreadCounts, setUnreadCounts] = useState({});
    const totalUnread = Object.values(unreadCounts).reduce((sum, val) => sum + val, 0);
    const protocol = window.location.protocol === "https:" ? "https" : "http";
    const location = useLocation();
    const bookingInfo = location.state?.bookingInfo;
    const conversationIdFromNav = location.state?.conversationId;
    const iceQueueRef = useRef([]);
    const remoteAudioRef = useRef(null);

    const createPeer = () => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        pc.ontrack = (event) => {
            const stream = event.streams[0];

            console.log("REMOTE STREAM TRACKS:", stream.getTracks());
            console.log("AUDIO TRACK ENABLED:", stream.getAudioTracks()[0]?.enabled);

            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = stream;
                remoteAudioRef.current.play()
                    .then(() => console.log("🔊 audio playing"))
                    .catch(e => console.error("audio play blocked:", e));
            }

            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
        };

        pc.onconnectionstatechange = () => {
            console.log("🔗 Connection state:", pc.connectionState);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && targetUserIdRef.current) {
                clientRef.current.publish({
                    destination: "/app/call.signal",
                    body: JSON.stringify({
                        type: "ICE",
                        fromUserId: currentUserId,
                        toUserId: targetUserIdRef.current,
                        candidate: event.candidate
                    })
                });
            }
        };

        return pc;
    };

    useEffect(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.volume = 1;
        }
    }, [remoteStream]);

    const socketUrl =
        protocol === "https"
            ? `https://www.jushotel.site/backend/ws`
            : `http://localhost:8080/ws`;
    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

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

                client.subscribe("/user/queue/call", async (msg) => {
                    const signal = JSON.parse(msg.body);

                    console.log("📞 Signal:", signal);

                    if (signal.type === "CALL") {
                        targetUserIdRef.current = signal.fromUserId;

                        setCallState("incoming");
                        setIsVideoCall(signal.video);

                        setSelectedChat({
                            userId: signal.fromUserId,
                            name: "Caller"
                        });
                    }

                    if (signal.type === "OFFER") {
                        targetUserIdRef.current = signal.fromUserId;

                        setCallState("incoming");
                        setIsVideoCall(signal.video);

                        setSelectedChat({
                            userId: signal.fromUserId,
                            name: "Caller"
                        });

                        peerRef.current = createPeer();

                        await peerRef.current.setRemoteDescription(signal.offer);

                        // 🔥 xử lý ICE bị delay
                        iceQueueRef.current.forEach(async (c) => {
                            try {
                                await peerRef.current.addIceCandidate(c);
                            } catch (e) {
                                console.error("ICE error:", e);
                            }
                        });
                        iceQueueRef.current = [];
                    }

                    if (signal.type === "ANSWER") {
                        await peerRef.current.setRemoteDescription(signal.answer);

                        // 🔥 flush ICE queue
                        iceQueueRef.current.forEach(async (c) => {
                            try {
                                await peerRef.current.addIceCandidate(c);
                            } catch (e) {
                                console.error("ICE error:", e);
                            }
                        });
                        iceQueueRef.current = [];
                        setCallState("in-call");
                    }

                    if (signal.type === "ICE") {
                        const pc = peerRef.current;
                        if (!pc) return;

                        const candidate = new RTCIceCandidate(signal.candidate);

                        if (!pc.remoteDescription) {
                            iceQueueRef.current.push(candidate);
                            return;
                        }

                        await pc.addIceCandidate(candidate);
                    }

                    if (signal.type === "END") {
                        endCall();
                    }
                });

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

            if (conversationIdFromNav) {
                const found = res.data.find(
                    (c) => c.conversationId === conversationIdFromNav
                );
                if (found) setSelectedChat(found);
            } else if (res.data.length > 0) {
                setSelectedChat(res.data[0]);
            }
        });
    }, [currentUserId]);

    const startMedia = async (video = false) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: video,
            });

            setLocalStream(stream);
            localStreamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            return stream;
        } catch (err) {
            console.error("❌ Media error:", err);
        }
    };

    // 🔍 SEARCH
    const handleSearch = (value) => {
        setSearchText(value);

        clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            if (!value.trim()) {
                setAllUsers([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            setLoadingUsers(true);

            const res = await api.get("/users");

            const filtered = res.data.result
                .filter((u) => u.id !== currentUserId)
                .filter((u) =>
                    (u.username || "").toLowerCase().includes(value.toLowerCase())
                );

            setAllUsers(filtered);
            setLoadingUsers(false);
        }, 300);
    };

    // 📡 HISTORY
    useEffect(() => {
        if (!selectedChat?.conversationId) return;

        api.get("/chat/history", {
            params: {
                conversationId: selectedChat.conversationId
            }
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
                conversationId: selectedChat.conversationId,
                senderId: currentUserId,
                content: text
            })
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

    const displayList = isSearching
        ? allUsers.map((u) => ({
            userId: u.id,
            name: u.username,
            lastMessage: "",
            time: null,
            conversationId: null,
            unread: 0,
            bookingCode: null,
            tag: null,
            rank: null
        }))
        : chats;

    const handleCall = async (video) => {
        targetUserIdRef.current = selectedChat.userId;
        if (!selectedChat || !clientRef.current?.connected) return;

        setCallState("calling");
        setIsVideoCall(video);

        const stream = await startMedia(video);

        const pc = createPeer();
        peerRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        clientRef.current.publish({
            destination: "/app/call.signal",
            body: JSON.stringify({
                type: "OFFER",
                fromUserId: currentUserId,
                toUserId: targetUserIdRef.current,
                offer,
                video
            })
        });
    };

    const endCall = () => {
        setCallState("idle");

        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        setLocalStream(null);
        setRemoteStream(null);

        if (clientRef.current && selectedChat) {
            clientRef.current.publish({
                destination: "/app/call.signal",
                body: JSON.stringify({
                    type: "END",
                    toUserId: selectedChat.userId
                })
            });
        }
    };

    const acceptCall = async () => {
        const stream = await startMedia(isVideoCall);
        let pc = peerRef.current;

        // ❗ nếu chưa có peer thì mới tạo
        if (!pc) {
            pc = createPeer();
            peerRef.current = pc;
        }

        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        // ❗ đảm bảo đã có remoteDescription
        if (!pc.remoteDescription) {
            console.error("❌ No remote offer yet!");
            return;
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log("Test: ", targetUserIdRef.current);

        clientRef.current.publish({
            destination: "/app/call.signal",
            body: JSON.stringify({
                type: "ANSWER",
                fromUserId: currentUserId,
                toUserId: targetUserIdRef.current,
                answer
            })
        });

        setCallState("in-call");
        document.body.click();
    };

    const rejectCall = () => {
        setCallState("idle");

        clientRef.current.publish({
            destination: "/app/call.signal",
            body: JSON.stringify({
                type: "REJECT",
                fromUserId: currentUserId,
                toUserId: selectedChat.userId
            })
        });
    };

    return (
        <div>
            <div className="w-full h-[85vh] bg-white flex overflow-hidden">

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
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-full cursor-pointer">
                                Tất cả
                            </button>
                            <button className="px-4 py-2 bg-gray-200 rounded-full cursor-pointer">
                                Chưa đọc
                            </button>
                            <button className="px-4 py-2 bg-gray-200 rounded-full cursor-pointer">
                                Thương lượng giá
                            </button>
                        </div>
                    </div>

                    {/* LIST */}
                    <div className="flex-1 overflow-auto p-2">
                        {loadingUsers && (
                            <div className="flex justify-center p-4">
                                <Spin />
                            </div>
                        )}

                        {!loadingUsers && displayList.map((item) => (
                            <div
                                key={item.userId}
                                onClick={() => setSelectedChat(item)}
                                className={`p-3 rounded-xl cursor-pointer mb-2 transition ${selectedChat?.userId === item.userId
                                    ? "bg-blue-100"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                <div className="flex gap-3">

                                    {/* AVATAR */}
                                    <div className="relative">
                                        <Avatar className="bg-blue-500">
                                            {item.name?.[0]}
                                        </Avatar>

                                        {item.unread > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                                                {item.unread}
                                            </span>
                                        )}
                                    </div>

                                    {/* CONTENT */}
                                    <div className="flex-1 overflow-hidden">

                                        {/* NAME + TIME */}
                                        <div className="flex justify-between items-center">
                                            <div className="font-medium text-sm">
                                                {item.name}
                                            </div>

                                            <div className="text-xs text-gray-400">
                                                {item.time &&
                                                    new Date(item.time).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                            </div>
                                        </div>

                                        {/* RANK + BOOKING */}
                                        <div className="text-[11px] text-gray-500 flex gap-2 mt-0.5">
                                            <span className="text-yellow-600 font-medium">
                                                🏆 {item.rank}
                                            </span>
                                            {item?.type === "BOOKING" && (
                                                <span>
                                                    Booking: {item.booking}
                                                </span>
                                            )}
                                            {item?.type === "NEGOTIATION" && (
                                                <span className="text-green-600 font-medium">
                                                    Thương lượng giá
                                                </span>
                                            )}
                                            {item?.type === "GENERAL" && (
                                                <span className="text-blue-600 font-medium">
                                                    Tin nhắn chung
                                                </span>
                                            )}
                                        </div>

                                        {/* TAG */}
                                        {item.tag && (
                                            <div className="text-[11px] text-orange-500 mt-0.5">
                                                {item.tag}
                                            </div>
                                        )}

                                        {/* LAST MESSAGE */}
                                        <div className="text-xs text-gray-500 truncate mt-1">
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

                        <div className="flex gap-3">
                            <div
                                onClick={() => handleCall(false)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-500 cursor-pointer transition"
                            >
                                <PhoneOutlined />
                            </div>

                            <div
                                onClick={() => handleCall(true)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-500 cursor-pointer transition"
                            >
                                <VideoCameraOutlined />
                            </div>
                        </div>
                    </div>

                    {bookingInfo && (
                        <div className="p-3 border-b bg-gray-50">
                            <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-sm text-blue-700">
                                        {bookingInfo.hotelName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(bookingInfo.checkIn).toLocaleDateString()} -{" "}
                                        {new Date(bookingInfo.checkOut).toLocaleDateString()} • #{bookingInfo.bookingCode}
                                    </div>
                                    {bookingInfo.room && (
                                        <div className="text-xs text-gray-400">
                                            {bookingInfo.room}
                                        </div>
                                    )}
                                </div>

                                <div
                                    onClick={() =>
                                        navigate(`/agency/booking-list/detail/${bookingInfo?.bookingCode}`)
                                    }
                                    className="text-blue-500 text-xs cursor-pointer"
                                >
                                    Xem chi tiết đơn
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MESSAGES */}
                    <div className="flex-1 overflow-auto p-4 bg-gray-100 space-y-3">
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
                    {callState !== "idle" && (
                        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">

                            {/* 📥 INCOMING CALL */}
                            {callState === "incoming" && (
                                <>
                                    <div className="text-white text-xl mb-6">
                                        📞 Cuộc gọi đến...
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={acceptCall}
                                            className="px-6 py-2 bg-green-500 text-white rounded-full"
                                        >
                                            Nghe
                                        </button>

                                        <button
                                            onClick={rejectCall}
                                            className="px-6 py-2 bg-red-500 text-white rounded-full"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* 📤 CALLING */}
                            {callState === "calling" && (
                                <>
                                    <div className="text-white text-lg mb-4">
                                        📞 Đang gọi...
                                    </div>

                                    <button
                                        onClick={endCall}
                                        className="px-6 py-2 bg-red-500 text-white rounded-full"
                                    >
                                        Hủy
                                    </button>
                                </>
                            )}

                            {/* 📡 IN CALL */}
                            {callState === "in-call" && (
                                <>
                                    {/* VIDEO nếu là video call */}
                                    {isVideoCall && (
                                        <div className="flex gap-4 mb-6">
                                            <video
                                                ref={localVideoRef}
                                                autoPlay
                                                muted
                                                className="w-40 h-40 bg-black rounded-lg"
                                            />
                                            <video
                                                ref={remoteVideoRef}
                                                autoPlay
                                                playsInline
                                                className="w-60 h-60 bg-black"
                                            />
                                        </div>
                                    )}

                                    {/* AUDIO ONLY */}
                                    {!isVideoCall && (
                                        <div className="text-white text-lg mb-6">
                                            📞 Đang trong cuộc gọi
                                            <audio
                                                ref={remoteAudioRef}
                                                autoPlay
                                                playsInline
                                            />
                                        </div>
                                    )}

                                    {/* ❗ QUAN TRỌNG: Nút kết thúc */}
                                    <button
                                        onClick={endCall}
                                        className="px-6 py-2 bg-red-500 text-white rounded-full"
                                    >
                                        Kết thúc
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <audio ref={remoteAudioRef} autoPlay playsInline />
            </div>
        </div>

    );
}