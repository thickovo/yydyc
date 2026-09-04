package com.gao.yydyc.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import javax.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@TableName("wardrobe")
public class Wardrobe {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @NotBlank
    private String name;
    private String brand;
    private String type;
    private String color;
    private BigDecimal totalPrice;
    private BigDecimal deposit;
    private BigDecimal finalPayment;
    private BigDecimal accessoriesPrice;
    private LocalDateTime finalDate;
    private LocalDateTime depositStart;
    private LocalDateTime depositEnd;
    // 全款预售 / 定尾 切换时需要把对方字段写回 null，
    // MyBatis-Plus 默认 FieldStrategy.NOT_NULL 会跳过 null → 必须显式 ALWAYS
    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private LocalDateTime finalStart;
    private LocalDateTime finalEnd;
    private String purchaseLink;
    private String note;
    private Integer status;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long cabinetId;
    @TableField(exist = false)
    private List<SkirtImage> images;

    public List<SkirtImage> getImages() {
        return images;
    }

    public void setImages(List<SkirtImage> images) {
        this.images = images;
    }

    public Long getCabinetId() {
        return cabinetId;
    }

    public void setCabinetId(Long cabinetId) {
        this.cabinetId = cabinetId;
    }

    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private Integer isPaid;
    private Integer remindBefore;

    @NotBlank
    private String userId;
    private String imageUrl;
    // 同 finalStart：购买模式切换时必须能写回 null
    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private LocalDateTime saleStart;

    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    // 新增三个字段
    private String category;
    private String size;
    private String accessories;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
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

    public LocalDateTime getFinalDate() {
        return finalDate;
    }

    public void setFinalDate(LocalDateTime finalDate) {
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

    public Integer getRemindBefore() {
        return remindBefore;
    }

    public void setRemindBefore(Integer remindBefore) {
        this.remindBefore = remindBefore;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getSaleStart() {
        return saleStart;
    }

    public void setSaleStart(LocalDateTime saleStart) {
        this.saleStart = saleStart;
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

    // ===== 新增三个字段的 Getter/Setter =====

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getAccessories() {
        return accessories;
    }

    public void setAccessories(String accessories) {
        this.accessories = accessories;
    }
}