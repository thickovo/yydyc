package com.gao.yydyc.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.gao.yydyc.dto.MonthSummaryVO;
import com.gao.yydyc.entity.Wardrobe;
import java.util.List;

public interface WardrobeService extends IService<Wardrobe> {

    List<MonthSummaryVO> getMonthlySummary (Integer year, String userId);

}
