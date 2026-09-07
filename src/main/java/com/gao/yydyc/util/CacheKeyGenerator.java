package com.gao.yydyc.util;

import com.gao.yydyc.constant.CacheConstants;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;

//缓存Key生成器
//支持SpEL表达式，例如#id、#userId
public class CacheKeyGenerator {

    private static final ExpressionParser PARSER = new SpelExpressionParser();

    //生成缓存Key
    //@param prefix 缓存前缀（例如：dress）
    //@param keySpel SpEL表达式（例如：#id）
    //@param args 方法参数
    //@return 完整的缓存Key（例如：yydyc:dev:dress:123）
    public static String generateKey(String prefix,String keySpel,Object[] args){
        //1.解析SpEL表达式，获取实际key值
        StandardEvaluationContext context = new StandardEvaluationContext();

        //把方法参数放入上下文，支持 #arg0、#arg1 等
        for (int i = 0; i < args.length; i++) {
            context.setVariable("arg" + i,args[i]);
        }

        //解析 #id、#userId 等表达式
        String keyValue = PARSER.parseExpression(keySpel).getValue(context, String.class);
        if (keyValue == null) {
            keyValue = "null";
        }

        //2.拼接完整 key：环境前缀 + 模块 + 实际key
        return CacheConstants.PREFIX + prefix + ":" + keyValue;
    }
}
