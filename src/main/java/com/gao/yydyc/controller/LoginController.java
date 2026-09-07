package com.gao.yydyc.controller;


import com.gao.yydyc.common.Result;
import com.gao.yydyc.service.LoginService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "微信登录", description = "微信小程序登录接口")
@Slf4j
@RestController
@RequestMapping("/api")
public class LoginController {

    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }


    @Operation(summary = "微信登录", description = "用微信code换取openid")
    @GetMapping("/login")
    public Result<String> wxLogin(@RequestParam("code") String code) {
        String loginCode = loginService.wxLogin(code);
        if (loginCode != null) {
            return Result.success(loginCode);
        } else {
            return Result.error("微信登录失败");
        }
    }
}
