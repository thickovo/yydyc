package com.gao.yydyc.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.gao.yydyc.dto.MonthSummaryVO;
import com.gao.yydyc.entity.Wardrobe;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WardrobeMapper extends BaseMapper<Wardrobe> {

    List<MonthSummaryVO> getMonthlySummary(@Param("year")Integer year,
                                           @Param("userId")String userId);

    List<Wardrobe> listByMonth(@Param("year") Integer year,
                               @Param("month") Integer month,
                               @Param("userId") String userId);
}
