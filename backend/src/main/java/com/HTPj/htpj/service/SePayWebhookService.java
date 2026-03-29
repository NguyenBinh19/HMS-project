package com.HTPj.htpj.service;

import java.util.Map;

public interface SePayWebhookService {
    public void processWebhook(Map<String, Object> payload);
}
