package com.gao.yydyc.entity;

import com.baomidou.mybatisplus.annotation.TableName;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@TableName("skirt")

public class Skirt {
    private Long id;
    private String name;
    private String brand;
    private String type;
    private String color;
    private BigDecimal totalPrice;
    private BigDecimal deposit;
    private BigDecimal finalPayment;
    private BigDecimal accessoriesPrice;
    private LocalDate finalDate;
    private LocalDateTime depositStart;
    private LocalDateTime depositEnd;
    private LocalDateTime finalStart;
    private LocalDateTime finalEnd;
    private String purchaseLink;
    private String note;
    private Integer status;
    private Integer isPaid;
    private String userId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public BigDecimal getDeposit() {
        return deposit;
    }

    public void setDeposit(BigDecimal deposit) {
        this.deposit = deposit;
    }

    public BigDecimal getFinalPayment() {
        return finalPayment;
    }

    public void setFinalPayment(BigDecimal finalPayment) {
        this.finalPayment = finalPayment;
    }

    public BigDecimal getAccessoriesPrice() {
        return accessoriesPrice;
    }

    public void setAccessoriesPrice(BigDecimal accessoriesPrice) {
        this.accessoriesPrice = accessoriesPrice;
    }

    public LocalDate getFinalDate() {
        return finalDate;
    }

    public void setFinalDate(LocalDate finalDate) {
        this.finalDate = finalDate;
    }

    public LocalDateTime getDepositStart() {
        return depositStart;
    }

    public void setDepositStart(LocalDateTime depositStart) {
        this.depositStart = depositStart;
    }

    public LocalDateTime getDepositEnd() {
        return depositEnd;
    }

    public void setDepositEnd(LocalDateTime depositEnd) {
        this.depositEnd = depositEnd;
    }

    public LocalDateTime getFinalStart() {
        return finalStart;
    }

    public void setFinalStart(LocalDateTime finalStart) {
        this.finalStart = finalStart;
    }

    public LocalDateTime getFinalEnd() {
        return finalEnd;
    }

    public void setFinalEnd(LocalDateTime finalEnd) {
        this.finalEnd = finalEnd;
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

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Integer getIsPaid() {
        return isPaid;
    }

    public void setIsPaid(Integer isPaid) {
        this.isPaid = isPaid;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
