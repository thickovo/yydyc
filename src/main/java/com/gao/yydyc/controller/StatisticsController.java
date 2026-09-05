package com.gao.yydyc.controller;

import com.gao.yydyc.common.Result;
import com.gao.yydyc.entity.CalendarItem;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.service.WardrobeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final WardrobeService wardrobeService;

    public StatisticsController(WardrobeService wardrobeService) {
        this.wardrobeService = wardrobeService;
    }

    @GetMapping("/calendar")
    public Result<Map<String, List<CalendarItem>>> statistics(
            @RequestParam String userId,
            @RequestParam String yearMonth) {

        List<Wardrobe> list = wardrobeService.lambdaQuery()
                .eq(Wardrobe::getUserId, userId)
                .and(wrapper -> wrapper
                        .like(Wardrobe::getFinalStart, yearMonth)
                        .or()
                        .like(Wardrobe::getSaleStart, yearMonth)
                )
                .list();

        Map<String, List<CalendarItem>> result = new HashMap<>();
        for (Wardrobe item : list) {
            String date = item.getFinalStart() != null ?
                    item.getFinalStart().toString() :
                    item.getSaleStart().toString();

            CalendarItem calendarItem = new CalendarItem();
            calendarItem.setId(String.valueOf(item.getId()));
            calendarItem.setName(item.getName());
            calendarItem.setAmount(item.getFinalPayment());

            result.computeIfAbsent(date, k -> new ArrayList<>()).add(calendarItem);
        }

        return Result.success(result);
    }
}