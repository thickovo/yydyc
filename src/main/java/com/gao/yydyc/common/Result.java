package com.gao.yydyc.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.gao.yydyc.constant.ResultCodeConstant;

@JsonInclude(JsonInclude.Include.ALWAYS)
public class Result<T> {
    private Integer code;
    private String msg;
    private T data;

    public Result(Integer code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(ResultCodeConstant.SUCCESS, "success", data);
    }

    public static <T> Result<T> error(String msg) {
        return new Result<>(ResultCodeConstant.ERROR, msg, null);
    }

    public Integer getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}