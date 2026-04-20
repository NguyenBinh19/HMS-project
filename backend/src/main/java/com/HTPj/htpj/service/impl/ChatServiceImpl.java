package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.chat.ChatMessageRequest;
import com.HTPj.htpj.dto.request.chat.ConversationDTO;
import com.HTPj.htpj.dto.response.chat.ChatMessageResponse;
import com.HTPj.htpj.entity.Hotel;
import com.HTPj.htpj.entity.Message;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.repository.HotelRepository;
import com.HTPj.htpj.repository.MessageRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.HTPj.htpj.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Message save(ChatMessageRequest request) {
        Users sender = userRepository.findById(request.getSenderId())
                .orElseThrow();

        Users receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow();

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .build();

        return messageRepository.save(message);
    }

    public List<ChatMessageResponse> getHistory(String user1, String user2) {
        return messageRepository.getChatHistory(user1, user2)
                .stream()
                .map(p -> ChatMessageResponse.builder()
                        .senderId(p.getSenderId())
                        .receiverId(p.getReceiverId())
                        .content(p.getContent())
                        .createdAt(p.getCreatedAt())
                        .build())
                .toList();
    }

    public List<ConversationDTO> getConversations(String userId) {
        List<Message> messages = messageRepository.findAllMessagesOfUser(userId);

        Map<String, Message> latestMap = new HashMap<>();

        for (Message m : messages) {
            String otherUserId;

            if (m.getSender().getId().equals(userId)) {
                otherUserId = m.getReceiver().getId();
            } else {
                otherUserId = m.getSender().getId();
            }

            // chỉ lấy message mới nhất cho mỗi user
            if (!latestMap.containsKey(otherUserId)) {
                latestMap.put(otherUserId, m);
            }
        }

        return latestMap.entrySet().stream()
                .map(entry -> {
                    Message m = entry.getValue();

                    Users otherUser = m.getSender().getId().equals(userId)
                            ? m.getReceiver()
                            : m.getSender();

                    return new ConversationDTO(
                            otherUser.getId(),
                            otherUser.getUsername(), // hoặc firstName + lastName
                            m.getContent(),
                            m.getCreatedAt()
                    );
                })
                .sorted((a, b) -> b.getTime().compareTo(a.getTime()))
                .toList();
    }

    public ConversationDTO buildConversation(Message m, String currentUserId) {

        Users otherUser;

        if (m.getSender().getId().equals(currentUserId)) {
            otherUser = m.getReceiver();
        } else {
            otherUser = m.getSender();
        }

        return ConversationDTO.builder()
                .userId(otherUser.getId())
                .name(otherUser.getUsername())
                .lastMessage(m.getContent())
                .time(m.getCreatedAt())
                .build();
    }

    @Override
    public ConversationDTO initChatWithHotel(String userId, String hotelId) {

        Hotel hotel = hotelRepository.findById(Integer.valueOf(hotelId))
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        String hotelManagerID = userRepository.findHotelMangerID(hotelId);

        if (hotelManagerID == null) {
            throw new RuntimeException("Hotel manager not found");
        }

        if (userId.equals(hotelManagerID)) {
            throw new RuntimeException("Cannot chat with yourself");
        }

        Message lastMessage = messageRepository
                .findTopBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtDesc(
                        userId, hotelManagerID,
                        userId, hotelManagerID
                );

        if (lastMessage != null) {
            return buildConversation(lastMessage, userId);
        }

        Message firstMessage = Message.builder()
                .sender(userRepository.findById(userId).orElseThrow())
                .receiver(userRepository.findById(hotelManagerID).orElseThrow())
                .content("Xin chào, tôi cần hỗ trợ 🙏")
                .createdAt(LocalDateTime.now())
                .build();

        messageRepository.save(firstMessage);

        ConversationDTO convo = buildConversation(firstMessage, userId);

        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/conversations",
                convo
        );

        messagingTemplate.convertAndSendToUser(
                hotelManagerID,
                "/queue/conversations",
                buildConversation(firstMessage, hotelManagerID)
        );

        ChatMessageResponse msgRes = ChatMessageResponse.builder()
                .senderId(userId)
                .receiverId(hotelManagerID)
                .content(firstMessage.getContent())
                .createdAt(firstMessage.getCreatedAt())
                .build();

        messagingTemplate.convertAndSendToUser(
                hotelManagerID,
                "/queue/messages",
                msgRes
        );

        return convo;
    }
}