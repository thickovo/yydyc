package com.gao.yydyc.service.impl;


import com.gao.yydyc.config.WechatConfig;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.service.WechatPushService;
import com.gao.yydyc.service.WechatTokenService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class WechatPushServiceImpl implements WechatPushService {

    private final WechatConfig wechatConfig;
    private final WechatTokenService wechatTokenService;
    private final RestTemplate restTemplate;

    public WechatPushServiceImpl(WechatConfig wechatConfig, WechatTokenService wechatTokenService, RestTemplate restTemplate) {
        this.wechatConfig = wechatConfig;
        this.wechatTokenService = wechatTokenService;
        this.restTemplate = restTemplate;
    }

    @Override
    public boolean sendFinalRemind(Wardrobe skirt) {
        String tokenUrl = "https://api.weixin.qq.com/cgi-bin/message/subscribe/send?"
                + "access_token=" + wechatTokenService.getAccessToken();

        Map<String,Object> data = new HashMap<>();

        Map<String, Object> thing1Value = new HashMap<>();
        thing1Value.put("value", "尾款提醒" + skirt.getName());
        data.put("thing1", thing1Value);

        Map<String, Object> time2Value = new HashMap<>();
        time2Value.put("value", DateTimeFormatter
                .ofPattern("yyyy-MM-dd HH:mm:ss")
                .format(LocalDateTime.now()));
        data.put("time2", time2Value);

        Map<String, Object> amount6Value = new HashMap<>();
        amount6Value.put("value", skirt.getFinalPayment() + "元");
        data.put("amount6", amount6Value);

        Map<String, Object> time4Value = new HashMap<>();
        time4Value.put("value", DateTimeFormatter
                .ofPattern("yyyy-MM-dd HH:mm:ss")
                .format(skirt.getFinalStart()));
        data.put("time4", time4Value);

        Map<String, Object> short_thing5 = new HashMap<>();
        short_thing5.put("value", "尾款提醒");
        data.put("short_thing5", short_thing5);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("touser", skirt.getUserId());
        requestBody.put("template_id", wechatConfig.getTemplateId());
        requestBody.put("data", data);

        Map<String,Object> response = restTemplate.postForObject(tokenUrl, requestBody, Map.class);
        log.info("推送响应{}", response);
        if (response != null) {
            Object code = response.get("errcode");
            if (code != null) {
                if (String.valueOf(code).equals("0")) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
        return false;
    }
}
