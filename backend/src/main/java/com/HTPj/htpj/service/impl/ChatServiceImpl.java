package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.chat.ChatMessageRequest;
import com.HTPj.htpj.dto.request.chat.ConversationDTO;
import com.HTPj.htpj.dto.response.chat.ChatMessageResponse;
import com.HTPj.htpj.entity.Message;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.repository.MessageRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.HTPj.htpj.service.ChatService;
import lombok.RequiredArgsConstructor;
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
}