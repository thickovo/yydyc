package com.gao.yydyc.common;

import lombok.extern.slf4j.Slf4j;

import java.io.Serializable;

//空值占位符
//用于缓存空值，区分“缓存中没有数据”和“缓存中存的是空值”

public class NullValue implements Serializable {

    private static final long serialVersionUID = 1L;

    public static final NullValue INSTANCE = new NullValue();

    private NullValue() {
        //私有构造，防止外部创建
    }

    @Override
    public String toString(){
        return "null";
    }
}
