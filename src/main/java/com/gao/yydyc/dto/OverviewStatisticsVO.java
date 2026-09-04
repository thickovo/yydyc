package com.gao.yydyc.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OverviewStatisticsVO {
    private BigDecimal totalSpent;          // 总支出
    private BigDecimal pendingTotal;        // 待付尾款总额
    private BigDecimal paidTotal;           // 已付尾款总额
    private Integer totalCount;             // 裙子总数
    private Integer pendingCount;           // 待补款数量
    private Integer paidCount;              // 已补款数量
}
