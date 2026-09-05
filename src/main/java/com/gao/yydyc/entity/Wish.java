package com.gao.yydyc.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("wish")
public class Wish {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    private String name;

    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private String brand;

    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private BigDecimal price;

    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private String imageUrl;

    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private String purchaseLink;

    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private String note;

    private String userId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
}
