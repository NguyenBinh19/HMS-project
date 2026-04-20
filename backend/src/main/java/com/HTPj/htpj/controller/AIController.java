package com.HTPj.htpj.controller;

import com.HTPj.htpj.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> req) {

        String message = req.get("message");

        String response = aiService.askAI(message);

        return Map.of("reply", response);
    }
}