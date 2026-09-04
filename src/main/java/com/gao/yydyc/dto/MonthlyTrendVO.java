package com.gao.yydyc.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MonthlyTrendVO {

    private Integer month;
    private BigDecimal total;
}
