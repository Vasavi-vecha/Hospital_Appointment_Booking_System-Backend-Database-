package com.appointment.booking.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatClientConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem("""
                        You are the support assistant for the Hospital Appointment Booking System.
                        Answer only basic questions about using the system: signing up, logging in,
                        booking or viewing appointments, finding doctors by department, and viewing
                        reports. Keep answers short and simple. If asked for medical advice or a
                        diagnosis, politely explain you cannot help with that and recommend
                        consulting a doctor through the app instead.
                        """)
                .build();
    }
}
