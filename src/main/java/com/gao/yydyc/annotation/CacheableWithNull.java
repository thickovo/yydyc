package com.gao.yydyc.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

//带控制缓存的@Cacheable
//查询结果为null时也会缓存（短时间过期），防止缓存穿透
//使用示例：
//@CacheableWithNull(value = "dress",key = "#id",ttl = 600,nullTtl = 60)
//public Dress getDress(Long id){ ... }

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface CacheableWithNull {
    //缓存名称（用于构建key前缀）
    //例如：dress、user
    String value();

    //缓存key（支持SpeEL表达式）
    //例如：#id、#userrId、#dress.id
    String key();

    //正常数据的过期时间（秒）
    long ttl();

    //空值的过期时间（秒），默认60秒
    long nullTtl() default 60;
}
