package com.gao.yydyc.service.impl;

import com.gao.yydyc.config.WechatConfig;
import com.gao.yydyc.service.WechatTokenService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class WechatTokenServiceImpl implements WechatTokenService {

    @Autowired
    private WechatConfig wechatConfig;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public String getAccessToken(){
        String url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential"
                + "&appid=" + wechatConfig.getAppId()
                + "&secret=" + wechatConfig.getSecret();
        try{
            Map<String, Object> result = restTemplate.getForObject(url, Map.class);
            if (result != null && result.containsKey("access_token") ) {
                String token = (String)result.get("access_token");
                log.info("获取 access_token 成功");
                return token;
            }else {
                log.error("获取 access_token 失败: {}", result);
                return null;
            }
        } catch(Exception e){
            log.error("获取 access_token 异常", e);
            return null;
            }

    }

}
