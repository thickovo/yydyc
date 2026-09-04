package com.gao.yydyc.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gao.yydyc.dto.MonthSummaryVO;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.mapper.WardrobeMapper;
import com.gao.yydyc.service.WardrobeService;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class WardrobeServiceImpl extends ServiceImpl<WardrobeMapper, Wardrobe> implements WardrobeService {

    private final WardrobeMapper wardrobeMapper;

    public WardrobeServiceImpl(WardrobeMapper wardrobeMapper) {
        this.wardrobeMapper = wardrobeMapper;
    }

    @Override
    public List<MonthSummaryVO> getMonthlySummary(Integer year, String userId) {
        //1.查询数据库，按月分组汇总
//        QueryWrapper<Wardroabe> Wrapper = new QueryWrapper<Wardrobe>();
//        Wrapper.eq("user_id", userId)
//                .eq("status", 0)
//                .apply("YEAR(final_start) = {0}", year)
//                .select("MONTH(final_start) as month, SUM(final_payment) as totalFinalPayment, COUNT(*) as count")
//                .groupBy("MONTH(final_start)");
//    //2.把查询结果换成 List<MonthSummaryVO>
//        List<Map<String, Object>> results = listMaps(wrapper);
        //3.返回
        return wardrobeMapper.getMonthlySummary(year, userId);
    }

    @Override
    public List<Wardrobe> listByMonth(Integer year, Integer month, String userId) {
        return wardrobeMapper.listByMonth(year,month,userId);
    }
}
