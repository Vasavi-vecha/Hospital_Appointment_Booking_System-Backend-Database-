package com.appointment.booking.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class ChatbotService {

    private final ChatClient chatClient;

    public ChatbotService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    public String ask(String question) {
        if (question == null || question.isBlank()) {
            return "Please type a question so I can help you.";
        }

        return chatClient.prompt()
                .user(question)
                .call()
                .content();
    }
}
