package com.gao.yydyc.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
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
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getPurchaseLink() {
        return purchaseLink;
    }

    public void setPurchaseLink(String purchaseLink) {
        this.purchaseLink = purchaseLink;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
