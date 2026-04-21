package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.chat.ConversationDTO;
import com.HTPj.htpj.dto.response.chat.ChatMessageResponse;
import com.HTPj.htpj.entity.Message;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.repository.MessageRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.HTPj.htpj.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ChatService chatService;

    @GetMapping("/history")
    public List<ChatMessageResponse> getHistory(
            @RequestParam String user1,
            @RequestParam String user2
    ) {
        return chatService.getHistory(user1, user2);
    }

    @GetMapping("/conversations")
    public List<ConversationDTO> getConversations(
            @RequestParam String userId
    ) {
        return chatService.getConversations(userId);
    }

    @PostMapping("/init")
    public ConversationDTO initChatWithHotel(@RequestParam String hotelId,
                                             @RequestParam String userId) {
        return chatService.initChatWithHotel(userId, hotelId);
    }
}