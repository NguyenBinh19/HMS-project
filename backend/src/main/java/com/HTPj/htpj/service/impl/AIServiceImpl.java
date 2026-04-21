//package com.HTPj.htpj.service.impl;
//
//import com.HTPj.htpj.service.AIService;
//import com.google.genai.Client;
//import com.google.genai.types.GenerateContentResponse;
//import org.springframework.stereotype.Service;
//
//@Service
//public class AIServiceImpl implements AIService {
//
//    private final Client client;
//
//    public AIServiceImpl() {
//        this.client = Client.builder()
//                .apiKey("AQ.Ab8RN6IYhBn0emQ5WqyUjAecVxNDHQoWnmiG0JyPnrVI-YfYKQ")
//                .build();
//    }
//
//    @Override
//    public String askAI(String message) {
//        try {
//            GenerateContentResponse response =
//                    client.models.generateContent(
//                            "gemini-3-flash-preview",
//                            message,
//                            null
//                    );
//
//            return response.text();
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            return "AI lỗi 😅";
//        }
//    }
//}