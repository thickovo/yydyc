package com.gao.yydyc.aspect;

import com.gao.yydyc.annotation.CacheableWithNull;
import com.gao.yydyc.common.NullValue;
import com.gao.yydyc.util.CacheKeyGenerator;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;

@Aspect
@Component
@Slf4j
public class CacheAspect {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Around("@annotation(com.gao.yydyc.annotation.CacheableWithNull)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        CacheableWithNull annotation = method.getAnnotation(CacheableWithNull.class);

        String cacheKey = CacheKeyGenerator.generateKey(
                annotation.value(),
                annotation.key(),
                joinPoint.getArgs()
        );
        log.debug("缓存查询：Key={}", cacheKey);

        // 直接取，不要包装
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            if (cached instanceof NullValue) {
                log.debug("缓存命中（空值）：{}", cacheKey);
                return null;
            }
            log.debug("缓存命中：{}", cacheKey);
            return cached;
        }

        log.debug("缓存未命中，执行原方法：{}", cacheKey);
        Object result = joinPoint.proceed();

        // 直接存，不要包装
        if (result == null) {
            log.debug("缓存空值：{}，过期时间：{}秒", cacheKey, annotation.nullTtl());
            redisTemplate.opsForValue().set(
                    cacheKey,
                    NullValue.INSTANCE,
                    annotation.nullTtl(),
                    TimeUnit.SECONDS
            );
        } else {
            log.debug("缓存正常数据：{}，过期时间：{}秒", cacheKey, annotation.ttl());
            redisTemplate.opsForValue().set(
                    cacheKey,
                    result,
                    annotation.ttl(),
                    TimeUnit.SECONDS
            );
        }

        return result;
    }
}