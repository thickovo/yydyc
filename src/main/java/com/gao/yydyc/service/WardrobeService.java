package com.gao.yydyc.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.gao.yydyc.dto.CategoryStatisticsVO;
import com.gao.yydyc.dto.MonthSummaryVO;
import com.gao.yydyc.dto.MonthlyTrendVO;
import com.gao.yydyc.dto.OverviewStatisticsVO;
import com.gao.yydyc.entity.Wardrobe;
import java.util.List;

public interface WardrobeService extends IService<Wardrobe> {

    List<MonthSummaryVO> getMonthlySummary (Integer year, String userId);

    List<Wardrobe> listByMonth(Integer year, Integer month, String userId);

    OverviewStatisticsVO getOverviewStatistics(String userId);

    List<MonthlyTrendVO> getMonthlyTrend(String userId);

    List<CategoryStatisticsVO> getCategoryStatistics(String userId);

    void markSold(Long id);

    void unmarkSold(Long id);
}
