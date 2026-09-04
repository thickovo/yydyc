package com.gao.yydyc.dto;

import java.math.BigDecimal;

public class CategoryStatisticsVO {

    private String brand;
    private BigDecimal total;

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }
}
