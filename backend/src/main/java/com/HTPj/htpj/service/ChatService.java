package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.chat.ChatMessageRequest;
import com.HTPj.htpj.dto.request.chat.ConversationDTO;
import com.HTPj.htpj.dto.response.chat.ChatMessageResponse;
import com.HTPj.htpj.entity.Message;

import java.util.List;

public interface ChatService {
    Message save(ChatMessageRequest request);
    List<ChatMessageResponse> getHistory(String user1, String user2);
    List<ConversationDTO> getConversations(String userId);
    ConversationDTO buildConversation(Message m, String currentUserId);
    ConversationDTO initChatWithHotel(String userId, String hotelId);
}
