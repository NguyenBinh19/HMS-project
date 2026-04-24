package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.chat.ChatMessageRequest;
import com.HTPj.htpj.dto.request.chat.ConversationDTO;
import com.HTPj.htpj.dto.response.chat.ChatMessageResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.repository.ConversationRepository;
import com.HTPj.htpj.repository.HotelRepository;
import com.HTPj.htpj.repository.MessageRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.HTPj.htpj.service.ChatService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatServiceImpl implements ChatService {

    MessageRepository messageRepository;
    UserRepository userRepository;
    ConversationRepository conversationRepository;


    public Message save(ChatMessageRequest request) {

        Conversation convo = conversationRepository.findById(request.getConversationId())
                .orElseThrow();

        Users sender = userRepository.findById(request.getSenderId())
                .orElseThrow();

        Users receiver = convo.getUser1().getId().equals(sender.getId())
                ? convo.getUser2()
                : convo.getUser1();

        Message message = Message.builder()
                .conversation(convo)
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .type(request.getType())
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .createdAt(LocalDateTime.now())
                .build();

        return messageRepository.save(message);
    }

    public List<ChatMessageResponse> getHistory(String conversationId) {
        return messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(m -> ChatMessageResponse.builder()
                        .senderId(m.getSender().getId())
                        .receiverId(m.getReceiver().getId())
                        .content(m.getContent())
                        .type(m.getType())
                        .fileUrl(m.getFileUrl())
                        .fileName(m.getFileName())
                        .createdAt(m.getCreatedAt())
                        .build())
                .toList();
    }

    public List<ConversationDTO> getConversations(String userId) {

        List<Conversation> conversations =
                conversationRepository.findByUser1_IdOrUser2_Id(userId, userId);

        return conversations.stream().map(convo -> {

            Message lastMessage =
                    messageRepository.findTopByConversation_IdOrderByCreatedAtDesc(convo.getId());

            Users otherUser = convo.getUser1().getId().equals(userId)
                    ? convo.getUser2()
                    : convo.getUser1();

            int unreadCount = messageRepository
                    .countByConversation_IdAndReceiver_IdAndSeenFalse(
                            convo.getId(), userId
                    );

            return ConversationDTO.builder()
                    .conversationId(convo.getId())
                    .userId(otherUser.getId())
                    .name(otherUser.getUsername())
                    .lastMessage(lastMessage != null ? lastMessage.getContent() : "")
                    .time(lastMessage != null ? lastMessage.getCreatedAt() : null)
                    .type(convo.getType())
                    .referenceId(convo.getReferenceId())
                    .booking(convo.getBookingId())
                    .unreadCount(unreadCount)
                    .room(convo.getRoom())
                    .checkIn(convo.getCheckIn())
                    .checkOut(convo.getCheckOut())
                    .hotelName(convo.getHotelName())
                    .build();

        }).toList();
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
    public ConversationDTO initChatWithHotel(
            String userId,
            String hotelId,
            String bookingId,
            String bookingCode,
            String hotelName,
            String room,
            String checkIn,
            String checkOut
    ) {

        Users user = userRepository.findById(userId).orElseThrow();
        String hotelManagerID = userRepository.findHotelMangerID(hotelId);
        Users hotelManager = userRepository.findById(hotelManagerID).orElseThrow();

        Conversation convo = conversationRepository
                .findByUser1_IdAndUser2_IdAndReferenceId(userId, hotelManagerID, hotelId)
                .orElse(null);

        if (convo == null) {
            convo = Conversation.builder()
                    .user1(user)
                    .user2(hotelManager)
                    .type("BOOKING")
                    .referenceId(hotelId)
                    .createdAt(LocalDateTime.now())
                    .bookingId(bookingCode)
                    .room(room)
                    .checkIn(checkIn)
                    .checkOut(checkOut)
                    .hotelName(hotelName)
                    .build();

            conversationRepository.save(convo);

            Message firstMessage = Message.builder()
                    .sender(user)
                    .receiver(hotelManager)
                    .conversation(convo)
                    .content("Xin chào, tôi cần hỗ trợ đơn booking #" + bookingCode)
                    .createdAt(LocalDateTime.now())
                    .build();

            messageRepository.save(firstMessage);
        } else {
            convo.setBookingId(bookingCode);
            conversationRepository.save(convo);
        }

        Message lastMessage = messageRepository
                .findTopByConversation_IdOrderByCreatedAtDesc(convo.getId());

        return ConversationDTO.builder()
                .conversationId(convo.getId())
                .userId(hotelManager.getId())
                .name(hotelManager.getUsername())
                .lastMessage(lastMessage != null ? lastMessage.getContent() : "")
                .time(lastMessage != null ? lastMessage.getCreatedAt() : null)
                .booking(convo.getBookingId())
                .type(convo.getType())
                .referenceId(convo.getReferenceId())
                .room(convo.getRoom())
                .checkIn(convo.getCheckIn())
                .checkOut(convo.getCheckOut())
                .hotelName(convo.getHotelName())
                .build();
    }

    @Override
    public ConversationDTO initChatRegular(
            String userId,
            String hotelId,
            String bookingId,
            String bookingCode,
            String hotelName
    ) {

        Users user = userRepository.findById(userId).orElseThrow();
        Users hotelManager = userRepository.findById(hotelId).orElseThrow();

        Conversation convo = conversationRepository
                .findByUser1_IdAndUser2_IdAndReferenceId(userId, hotelManager.getId(), hotelId)
                .orElse(null);

        if (convo == null) {
            convo = Conversation.builder()
                    .user1(user)
                    .user2(hotelManager)
                    .type("GENERAL")
                    .referenceId(hotelId)
                    .createdAt(LocalDateTime.now())
                    .bookingId(bookingCode)
                    .build();

            conversationRepository.save(convo);

            Message firstMessage = Message.builder()
                    .sender(user)
                    .receiver(hotelManager)
                    .conversation(convo)
                    .content("Xin chào!")
                    .createdAt(LocalDateTime.now())
                    .build();

            messageRepository.save(firstMessage);
        } else {
            convo.setBookingId(bookingCode);
            conversationRepository.save(convo);
        }

        Message lastMessage = messageRepository
                .findTopByConversation_IdOrderByCreatedAtDesc(convo.getId());

        return ConversationDTO.builder()
                .conversationId(convo.getId())
                .userId(hotelManager.getId())
                .name(hotelManager.getUsername())
                .lastMessage(lastMessage != null ? lastMessage.getContent() : "")
                .time(lastMessage != null ? lastMessage.getCreatedAt() : null)
                .booking(convo.getBookingId())
                .type(convo.getType())
                .referenceId(convo.getReferenceId())
                .build();
    }
}