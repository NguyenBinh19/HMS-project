package com.HTPj.htpj.dto.request.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class ConversationDTO {
    private String userId;
    private String name;
    private String lastMessage;
    private LocalDateTime time;
}