package com.gao.yydyc.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gao.yydyc.common.Result;
import com.gao.yydyc.entity.Feedback;
import com.gao.yydyc.entity.AdminConfig;
import com.gao.yydyc.service.FeedbackService;
import com.gao.yydyc.service.AdminConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

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

    @GetMapping("/feedback/list")
    public Result<Page<Feedback>> listFeedback(@RequestParam(defaultValue = "1")Integer page,
                                               @RequestParam(defaultValue = "10") Integer size,
                                               @RequestParam(required = false)Integer status) {
        // 1. 创建 wrapper
        LambdaQueryWrapper<Feedback> wrapper = new LambdaQueryWrapper<>();
        // 2. 如果 status 不为空，添加 status 条件
        if (status != null){
            wrapper.eq(Feedback::getStatus,status);
        }
        // 3. 按 createTime 倒序
        wrapper.orderByDesc(Feedback::getCreateTime);
        // 4. 调用 feedbackService.page()
        Page<Feedback> result = feedbackService.page(new Page<>(page,size),wrapper);
        // 5. 返回 Result.success()
        return Result.success(result);
    }

    @PutMapping("/feedback/handle/{id}")
    public Result<Void> handleFeedback(@PathVariable Long id) {
        // 1. 用 feedbackService.getById(id) 查反馈
        Feedback feedback = feedbackService.getById(id);
        // 2. 如果不存在，返回 Result.error("反馈不存在")
        if (feedback == null) {
            return Result.error("反馈不存在");
        }
        // 3. 设置 status = 1
        feedback.setStatus(1);
        // 4. 设置 handleTime = LocalDateTime.now()
        feedback.setHandleTime(LocalDateTime.now());
        // 5. 调用 feedbackService.updateById()
        feedbackService.updateById(feedback);
        // 6. 返回 Result.success(null)
        return Result.success(null);
    }

    @DeleteMapping("/feedback/delete/{id}")
    public Result<Void> deleteFeedback(@PathVariable Long id) {
        // 1. 调用 feedbackService.removeById(id)
        feedbackService.removeById(id);
        // 2. 返回 Result.success(null)
        return Result.success(null);
    }

    @GetMapping("/config/get/{key}")
    public Result<AdminConfig> getConfig(@PathVariable String key) {
        // 1. 用 adminConfigService.lambdaQuery().eq(AdminConfig::getConfigKey, key).one() 查
         AdminConfig config = adminConfigService
                    .lambdaQuery()
                    .eq(AdminConfig::getConfigKey,key)
                    .one();
        // 2. 如果不存在，返回 Result.error("配置不存在")
        if (config == null) {
            return Result.error("配置不存在");
        }
        // 3. 返回 Result.success(config)
        return Result.success(config);
    }

    @PutMapping("/config/update")
    public Result<Void> updateConfig(@RequestParam String key, @RequestParam String value) {
        // 1. 用 adminConfigService.lambdaQuery().eq(AdminConfig::getConfigKey, key).one() 查
        AdminConfig config = adminConfigService
                    .lambdaQuery()
                    .eq(AdminConfig::getConfigKey,key)
                    .one();
        // 2. 如果不存在，返回 Result.error("配置不存在")
        if (config == null) {
            return Result.error("配置不存在");
        }
        // 3. 设置 config.setConfigValue(value)
        config.setConfigValue(value);
        // 4. 调用 adminConfigService.updateById(config)
        adminConfigService.updateById(config);
        // 5. 返回 Result.success(null)
        return Result.success(null);
    }
}