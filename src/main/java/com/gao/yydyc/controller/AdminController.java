package com.gao.yydyc.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gao.yydyc.common.Result;
import com.gao.yydyc.entity.AdminConfig;
import com.gao.yydyc.entity.Feedback;
import com.gao.yydyc.exception.BusinessException;
import com.gao.yydyc.service.AdminConfigService;
import com.gao.yydyc.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Tag(name = "后台管理", description = "反馈管理、系统配置等管理接口")
@Slf4j
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final FeedbackService feedbackService;
    private final AdminConfigService adminConfigService;

    public AdminController(FeedbackService feedbackService, AdminConfigService adminConfigService) {
        this.feedbackService = feedbackService;
        this.adminConfigService = adminConfigService;
    }

    @Operation(summary = "提交反馈", description = "用户提交意见反馈")
    @PostMapping("/feedback")
    public Result<Void> submitFeedback(@RequestBody Feedback feedback) {
        if (feedback.getContent() == null || feedback.getContent().trim().isEmpty()) {
            throw new BusinessException("反馈内容不能为空");
        }
        feedback.setStatus(0);
        feedback.setCreateTime(LocalDateTime.now());
        feedbackService.save(feedback);
        return Result.success(null);
    }

    @Operation(summary = "反馈列表", description = "分页查询用户反馈，可按状态筛选")
    @GetMapping("/feedback/list")
    public Result<Page<Feedback>> listFeedback(@RequestParam(defaultValue = "1") Integer page,
                                               @RequestParam(defaultValue = "10") Integer size,
                                               @RequestParam(required = false) Integer status) {
        LambdaQueryWrapper<Feedback> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(Feedback::getStatus, status);
        }
        wrapper.orderByDesc(Feedback::getCreateTime);
        Page<Feedback> result = feedbackService.page(new Page<>(page, size), wrapper);
        return Result.success(result);
    }

    @Operation(summary = "标记已处理", description = "将反馈状态标记为已处理")
    @PutMapping("/feedback/handle/{id}")
    public Result<Void> handleFeedback(@PathVariable Long id) {
        Feedback feedback = feedbackService.getById(id);
        if (feedback == null) {
            return Result.error("反馈不存在");
        }
        feedback.setStatus(1);
        feedback.setHandleTime(LocalDateTime.now());
        feedbackService.updateById(feedback);
        return Result.success(null);
    }

    @Operation(summary = "删除反馈", description = "根据ID删除反馈")
    @DeleteMapping("/feedback/delete/{id}")
    public Result<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.removeById(id);
        return Result.success(null);
    }

    @Operation(summary = "获取配置", description = "根据配置键获取配置值")
    @GetMapping("/config/get/{key}")
    public Result<AdminConfig> getConfig(@PathVariable String key) {
        AdminConfig config = adminConfigService
                .lambdaQuery()
                .eq(AdminConfig::getConfigKey, key)
                .one();
        if (config == null) {
            return Result.error("配置不存在");
        }
        return Result.success(config);
    }

    @Operation(summary = "更新配置", description = "更新配置值")
    @PutMapping("/config/update")
    public Result<Void> updateConfig(@RequestParam String key, @RequestParam String value) {
        AdminConfig config = adminConfigService
                .lambdaQuery()
                .eq(AdminConfig::getConfigKey, key)
                .one();
        if (config == null) {
            return Result.error("配置不存在");
        }
        config.setConfigValue(value);
        adminConfigService.updateById(config);
        return Result.success(null);
    }
}