package com.gao.yydyc.constant;

public class CacheConstants {

    //环境前缀 通过环境控制变量 dev/prod 缓存数据隔离
    public static final String ENV;
    public static final String PREFIX;

    static {
        String env = System.getenv("SPRING_PROFILES_ACTIVE");
        ENV = env != null ? env : "dev";
        PREFIX = "yydyc:" + ENV + ":";
    }

    //缓存名称
    public static final String DRESS = "dress";
    public static final String DRESS_LIST = "dressList";
    public static final String STATISTICS = "statistics";
    public static final String WECHAT = "wechat";
    public static final String USER = "user";
    public static final String WISHLIST = "wishlist";

    //过期时间/秒
    public static final long DRESS_TTL = 600; //10分钟
    public static final long DRESS_LIST_TTL = 300;  //5分钟
    public static final long STATISTICS_TTL = 1800;  //30分钟
    public static final long WECHAT_TTL = 6600;  //110分钟
    public static final long USER_TTL = 1800;  //30分钟
    public static final long WISHLIST_TTL = 600;  //10分钟
    public static final long NULL_TTL = 60;  //控制缓存1分钟

//随即偏移范围 （防止缓存雪崩）

    //假设 100 条缓存都设 30 分钟过期
//→ 同时过期 → 100 个请求同时去查 DB → DB 被打爆 → 这就是缓存雪崩
//加上随机偏移后：
//→ 第1条：29分30秒过期
//→ 第2条：30分15秒过期
//→ 第3条：28分45秒过期
//→ 分散过期 → DB 压力分散 → 安全
    public static final long TTL_OFFSITE = 60; //±60秒
}

