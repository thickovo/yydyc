package com.gao.yydyc;

import com.gao.yydyc.dto.OverviewStatisticsVO;
import com.gao.yydyc.service.WardrobeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class RedisTest {

    @Autowired
    private WardrobeService wardrobeService;

    @Test
    public void testCacheWithAnnotation() {
        // 替换成你数据库里真实存在的 userId
        String userId = "你的真实用户ID";

        System.out.println("===== 第一次调用 getOverviewStatistics =====");
        OverviewStatisticsVO result1 = wardrobeService.getOverviewStatistics(userId);
        System.out.println("结果: " + result1);

        System.out.println("===== 第二次调用 getOverviewStatistics =====");
        OverviewStatisticsVO result2 = wardrobeService.getOverviewStatistics(userId);
        System.out.println("结果: " + result2);

        System.out.println("===== 缓存测试完成 =====");
        System.out.println("如果日志只打印了一次 SQL，说明缓存生效了！");
    }
}