package com.HTPj.htpj.dto.request.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class ConversationDTO {
    private String userId;
    private String name;
    private String lastMessage;
    private LocalDateTime time;
}