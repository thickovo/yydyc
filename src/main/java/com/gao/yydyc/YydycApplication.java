package com.gao.yydyc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class YydycApplication {
    public static void main(String[] args) {
        SpringApplication.run(YydycApplication.class, args);
    }
}