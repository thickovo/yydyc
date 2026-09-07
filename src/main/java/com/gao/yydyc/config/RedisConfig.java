package com.gao.yydyc.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.gao.yydyc.constant.CacheConstants;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCache;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@EnableCaching
@Configuration
public class RedisConfig {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        //你要在这里创建一个RedisTemplate对象
        RedisTemplate<String,Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        //然后设置他的序列化方式
        // 1.创建 Jackson 序列化器（用来把对象转成 JSON）
        Jackson2JsonRedisSerializer<Object> jacksonSerializer
                = new Jackson2JsonRedisSerializer<>(Object.class);

        // 2.配置 Jackson 序列化器（让它支持时间类型，存类型信息）
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // 支持 LocalDateTime
        objectMapper.activateDefaultTyping(
                com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL
        );

        jacksonSerializer.setObjectMapper(objectMapper);

        //3.创建 String 序列化器（用来序列化 key）
        StringRedisSerializer stringSerializer = new StringRedisSerializer();


        // 5.然后分别设置到 template 上
        template.setKeySerializer(stringSerializer);         // key 用 String
        template.setValueSerializer(jacksonSerializer);       // value 用 JSON
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(jacksonSerializer);

        // 6.初始化
        template.afterPropertiesSet();
        return template;
    }


    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        //1.默认配置（使用常量）
        RedisCacheConfiguration defaultConfig
                = RedisCacheConfiguration
                .defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(CacheConstants.STATISTICS_TTL + getRandomOffset()))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new Jackson2JsonRedisSerializer<Object>(Object.class)));
//                .disableCachingNullValues();  //查询结果为null时不缓存
                //黑客可以用不存在的ID疯狂请求：
                //GET /api/derss/99999
                //GET /api/derss/99998
                //GET /api/derss/99997
                //GET /api/derss/99996
                //GET /api/derss/.....
                //每次都查数据库，DB可能被打爆 -> 缓存穿透
                //解决方案： 缓存空值：查到null也缓存，但过期时间很短（比如一分钟）
//                .entryTtl(Duration.ofSeconds(CacheConstants.NULL_TTL + getRandomOffset()));
        //不在Config里实现


        //2.不同缓存单独配置（都加上随机偏移）
        Map<String, RedisCacheConfiguration> configMap = new HashMap<>();
        configMap.put(CacheConstants.DRESS,
                defaultConfig.entryTtl(Duration
                        .ofSeconds(CacheConstants.DRESS_TTL + getRandomOffset())));
        configMap.put(CacheConstants.DRESS_LIST,
                defaultConfig.entryTtl(Duration
                        .ofSeconds(CacheConstants.DRESS_LIST_TTL + getRandomOffset())));
        configMap.put(CacheConstants.STATISTICS,
                defaultConfig.entryTtl(Duration
                        .ofSeconds(CacheConstants.STATISTICS_TTL + getRandomOffset())));
        configMap.put(CacheConstants.WECHAT,
                defaultConfig.entryTtl(Duration
                        .ofSeconds(CacheConstants.WECHAT_TTL + getRandomOffset())));
        configMap.put(CacheConstants.USER,
                defaultConfig.entryTtl(Duration
                        .ofSeconds(CacheConstants.USER_TTL + getRandomOffset())));
        configMap.put(CacheConstants.WISHLIST,
                defaultConfig.entryTtl(Duration
                        .ofSeconds(CacheConstants.WISHLIST_TTL + getRandomOffset())));

        //3.构建并返回
        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(configMap)
                .build();
    }

    //获取随机偏移量（防止缓存雪崩）
    private long getRandomOffset() {
        //生成-60到60之间的随机数、
        return (long) (Math.random() * CacheConstants.TTL_OFFSITE * 2 - CacheConstants.TTL_OFFSITE);
    }
}
//    @Bean
//    public CacheManager cacheManager(RedisConnectionFactory factory) {
//        // 1. 创建默认配置
//        // - 过期时间：30 分钟
//        // - key 用 String 序列化
//        // - value 用 Jackson 序列化
//        // - 不缓存 null 值
//        RedisCacheConfiguration defaultConfig
//                = RedisCacheConfiguration.defaultCacheConfig()
//                .entryTtl(Duration.ofMinutes(30))
//                .serializeKeysWith(RedisSerializationContext.SerializationPair
//                        .fromSerializer(new StringRedisSerializer()))
//                .serializeValuesWith(RedisSerializationContext.SerializationPair
//                        .fromSerializer(new Jackson2JsonRedisSerializer<>(Object.class)))
//                .disableCachingNullValues();
//
//        // 2. 创建不同缓存的特殊配置
//        // - dress: 10 分钟
//        // - dressList: 5 分钟
//        // - statistics: 30 分钟
//        // - wechat: 110 分钟
//        Map<String, RedisCacheConfiguration> configMap = new HashMap<>();
//        configMap.put("dress",defaultConfig.entryTtl(Duration.ofMinutes(10)));
//        configMap.put("dressList",defaultConfig.entryTtl(Duration.ofMinutes(5)));
//        configMap.put("statistics",defaultConfig.entryTtl(Duration.ofMinutes(30)));
//        configMap.put("wechat",defaultConfig.entryTtl(Duration.ofMinutes(110)));
//        configMap.put("user",defaultConfig.entryTtl(Duration.ofMinutes(30)));
//
//        // 3. 用 builder 构建 CacheManager 返回
//        return RedisCacheManager.builder(factory)
//                .cacheDefaults(defaultConfig)
//                .withInitialCacheConfigurations(configMap)
//                .build();
//    }
//}
