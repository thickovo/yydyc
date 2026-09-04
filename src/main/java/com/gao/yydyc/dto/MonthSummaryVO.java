package com.gao.yydyc.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MonthSummaryVO {

    private Integer month;
    private BigDecimal totalFinalPayment;
    private Integer count;

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public BigDecimal getTotalFinalPayment() {
        return totalFinalPayment;
    }

    public void setTotalFinalPayment(BigDecimal totalFinalPayment) {
        this.totalFinalPayment = totalFinalPayment;
    }
}
