package com.HTPj.htpj.dto.request.chat;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String senderId;
    private String receiverId;
    private String content;
}