package com.gao.yydyc.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gao.yydyc.config.WechatConfig;
import com.gao.yydyc.service.LoginService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    private WechatConfig wechatConfig;
    @Autowired
    private RestTemplate restTemplate;

    @Override
    public String wxLogin(String code) {
        String loginUrl = "https://api.weixin.qq.com/sns/jscode2session"
                + "?appid=" + wechatConfig.getAppId()
                + "&secret=" + wechatConfig.getSecret()
                + "&js_code=" + code
                + "&grant_type=authorization_code";
        try {
            String result = restTemplate.getForObject(loginUrl, String.class);
            log.info("微信返回原始内容：{}",result);

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String,Object> reslt = objectMapper.readValue(result, Map.class);

            if (reslt != null && reslt.containsKey("openid")) {
                String openid = (String) reslt.get("openid");
                log.info("微信登录成功，openid：{}" + openid);
                return openid;
            } else {
                log.info("微信登录失败，openid：{}" + reslt);
                return null;
            }
        }catch (Exception e) {
            log.error("微信登录异常：{}",e);
            return null;
        }

    }
}

