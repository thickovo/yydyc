package com.gao.yydyc.constant;

public enum SkirtStatusEnum {
    PENDING(0, "待补款"),
    PAID(1, "已补款"),
    RECEIVED(2, "已收到"),
    SOLD(3, "已出掉");

    private final Integer code;
    private final String desc;

    SkirtStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public Integer getCode() {
        return code;
    }

    public String getDesc() {
        return desc;
    }
}
