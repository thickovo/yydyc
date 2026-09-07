package com.gao.yydyc.controller;

import com.gao.yydyc.common.Result;
import com.gao.yydyc.config.WechatConfig;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.service.WardrobeService;
import com.gao.yydyc.service.WechatPushService;
import com.gao.yydyc.service.WechatTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "测试接口", description = "用于开发测试的临时接口（生产环境应关闭）")
@RestController
@RequestMapping("/test")
public class TestController {

    private final WechatConfig wechatConfig;
    private final WechatTokenService wechatTokenService;
    private final WechatPushService wechatPushService;
    private final WardrobeService wardrobeService;

    public TestController(WechatConfig wechatConfig, WechatTokenService wechatTokenService,
                          WechatPushService wechatPushService, WardrobeService wardrobeService) {
        this.wechatConfig = wechatConfig;
        this.wechatTokenService = wechatTokenService;
        this.wechatPushService = wechatPushService;
        this.wardrobeService = wardrobeService;
    }

    @Operation(summary = "获取access_token", description = "测试微信access_token获取")
    @GetMapping("/token")
    public Result<String> getToken() {
        String token = wechatTokenService.getAccessToken();
        if (token != null) {
            return Result.success(token);
        } else {
            return Result.error("获取access_token失败");
        }
    }

    @Operation(summary = "测试推送", description = "手动触发尾款推送测试")
    @GetMapping("/push")
    public Result<String> getPush() {
        Wardrobe skirt = wardrobeService.lambdaQuery()
                .last("limit 1")
                .one();
        if (skirt == null) {
            return Result.error("没有裙子数据");
        }
        boolean success = wechatPushService.sendFinalRemind(skirt);
        if (success) {
            return Result.success("推送成功");
        } else {
            return Result.error("推送失败");
        }
    }
}