package com.gao.yydyc.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gao.yydyc.annotation.CacheableWithNull;
import com.gao.yydyc.constant.SkirtStatusEnum;
import com.gao.yydyc.dto.CategoryStatisticsVO;
import com.gao.yydyc.dto.MonthSummaryVO;
import com.gao.yydyc.dto.MonthlyTrendVO;
import com.gao.yydyc.dto.OverviewStatisticsVO;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.exception.BusinessException;
import com.gao.yydyc.mapper.WardrobeMapper;
import com.gao.yydyc.service.WardrobeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class WardrobeServiceImpl extends ServiceImpl<WardrobeMapper, Wardrobe> implements WardrobeService {

    private final WardrobeMapper wardrobeMapper;

    public WardrobeServiceImpl(WardrobeMapper wardrobeMapper) {
        this.wardrobeMapper = wardrobeMapper;
    }

    @Override
    public List<MonthSummaryVO> getMonthlySummary(Integer year, String userId) {
        return wardrobeMapper.getMonthlySummary(year, userId);
    }

    @Override
    public List<Wardrobe> listByMonth(Integer year, Integer month, String userId) {
        return wardrobeMapper.listByMonth(year,month,userId);
    }

    @Override
    @CacheableWithNull(value = "statistics", key = "#userId + '_overview'", ttl = 1800, nullTtl = 60)
    public OverviewStatisticsVO getOverviewStatistics(String userId) {
        return wardrobeMapper.getOverviewStatistics(userId);
    }

    @Override
    public List<MonthlyTrendVO> getMonthlyTrend(String userId) {
        return wardrobeMapper.getMonthlyTrend(userId);
    }

    @Override
    public List<CategoryStatisticsVO> getCategoryStatistics(String userId) {
        return wardrobeMapper.getCategoryStatistics(userId);
    }

    @Override
    public void markSold(Long id) {
        Wardrobe skirt = getById(id);
        if (skirt == null) {
            throw new BusinessException("裙子不存在");
        }
        skirt.setStatus(SkirtStatusEnum.SOLD.getCode());
        updateById(skirt);
    }

    @Override
    public void unmarkSold(Long id) {
        Wardrobe skirt = getById(id);
        if (skirt == null) {
            throw new BusinessException("裙子不存在");
        }
        skirt.setStatus(SkirtStatusEnum.PENDING.getCode());
        updateById(skirt);
    }
}
