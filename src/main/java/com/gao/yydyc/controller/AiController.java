package com.gao.yydyc.controller;

import com.gao.yydyc.common.Result;
import com.gao.yydyc.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "AI助手", description = "AI对话接口")
@Slf4j
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @Operation(summary = "AI对话", description = "用户发送问题，AI返回回复（当前仅支持闲聊）")
    @PostMapping("/chat")
    public Result<String> chat(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        String userId = request.get("userId");

        if (question == null || question.isEmpty()) {
            return Result.error("问题不能为空");
        }
        String answer = aiService.chat(userId, question);
        return Result.success(answer);
    }
}