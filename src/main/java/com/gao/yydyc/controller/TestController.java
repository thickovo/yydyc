package com.gao.yydyc.controller;

import com.gao.yydyc.common.Result;
import com.gao.yydyc.config.WechatConfig;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.service.WardrobeService;
import com.gao.yydyc.service.WechatPushService;
import com.gao.yydyc.service.WechatTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    @Autowired
    private WechatConfig wechatConfig;
    @Autowired
    private WechatTokenService wechatTokenService;
    @Autowired
    private WechatPushService wechatPushService;
    @Autowired
    private WardrobeService wardrobeService;

    @GetMapping("/token")
    public Result<String> getToken(){
        String token = wechatTokenService.getAccessToken();
        if(token != null){
            return Result.success(token);
        } else {
            return Result.error("获取access_token失败");
        }
    }

    @GetMapping("/push")
    public Result<String> getPush(){
         Wardrobe skirt = wardrobeService.lambdaQuery()
                 .last("limit 1")
                 .one();
         if (skirt == null) {
             return Result.error("没有裙子数据");
         }
         boolean success = wechatPushService.sendFinalRemind(skirt);
         if (success) {
             return Result.success("推送成功");
         }else {
             return Result.error("推送失败");
         }
    }

}
