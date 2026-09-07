package com.gao.yydyc.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gao.yydyc.common.Result;
import com.gao.yydyc.constant.CoverStatusConstant;
import com.gao.yydyc.constant.SkirtStatusEnum;
import com.gao.yydyc.dto.CategoryStatisticsVO;
import com.gao.yydyc.dto.MonthSummaryVO;
import com.gao.yydyc.dto.MonthlyTrendVO;
import com.gao.yydyc.dto.OverviewStatisticsVO;
import com.gao.yydyc.entity.SkirtImage;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.mapper.SkirtImageMapper;
import com.gao.yydyc.service.SkirtImageService;
import com.gao.yydyc.service.WardrobeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@Tag(name = "衣橱管理", description = "裙子/商品的增删改查、状态管理、统计等接口")
@Slf4j
@RestController
@RequestMapping("/api/wardrobe")
public class WardrobeController {

    private final WardrobeService wardrobeService;
    private final SkirtImageMapper skirtImageMapper;
    private final SkirtImageService skirtImageService;

    public WardrobeController(WardrobeService wardrobeService, SkirtImageMapper skirtImageMapper,
                              SkirtImageService skirtImageService) {
        this.wardrobeService = wardrobeService;
        this.skirtImageMapper = skirtImageMapper;
        this.skirtImageService = skirtImageService;
    }

    @Operation(summary = "添加商品", description = "新增一条裙子/商品记录")
    @PostMapping("/add")
    public Result<Long> add(@RequestBody @Valid Wardrobe wardrobe) {
        wardrobeService.save(wardrobe);
        return Result.success(wardrobe.getId());
    }

    @Operation(summary = "获取商品列表", description = "分页查询，支持多条件筛选")
    @GetMapping("/list")
    public Result<Page<Wardrobe>> list(@RequestParam(defaultValue = "1") Integer page,
                                       @RequestParam(defaultValue = "10") Integer size,
                                       @RequestParam String userId,
                                       @RequestParam(required = false) String category,
                                       @RequestParam(required = false) String type,
                                       @RequestParam(required = false) String color,
                                       @RequestParam(required = false) Integer status,
                                       @RequestParam(required = false) Long cabinetId,
                                       @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<Wardrobe> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Wardrobe::getUserId, userId);

        if (category != null) {
            wrapper.eq(Wardrobe::getCategory, category);
        }
        if (type != null) {
            wrapper.eq(Wardrobe::getType, type);
        }
        if (color != null) {
            wrapper.eq(Wardrobe::getColor, color);
        }
        if (status != null) {
            wrapper.eq(Wardrobe::getStatus, status);
        }
        if (keyword != null) {
            wrapper.like(Wardrobe::getName, keyword);
        }
        if (cabinetId != null) {
            wrapper.eq(Wardrobe::getCabinetId, cabinetId);
        }
        wrapper.orderByDesc(Wardrobe::getFinalStart);

        Page<Wardrobe> wardrobePage = wardrobeService.page(new Page<>(page, size), wrapper);
        return Result.success(wardrobePage);
    }


    @Operation(summary = "获取商品详情", description = "根据ID查询单条商品记录，包含关联图片")
    @GetMapping("/detail/{id}")
    public Result<Wardrobe> detail(@PathVariable Long id) {
        Wardrobe wardrobe = wardrobeService.getById(id);
        List<SkirtImage> images = skirtImageService.lambdaQuery()
                .eq(SkirtImage::getSkirtId, id)
                .orderByDesc(SkirtImage::getCreateTime)
                .list();
        wardrobe.setImages(images);
        return Result.success(wardrobe);
    }

    @Operation(summary = "更新商品", description = "全量更新商品信息")
    @PutMapping("/update")
    public Result<Void> update(@RequestBody Wardrobe wardrobe) {
        wardrobeService.updateById(wardrobe);
        return Result.success(null);
    }

    @Operation(summary = "删除商品", description = "根据ID删除商品")
    @DeleteMapping("/delete/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        wardrobeService.removeById(id);
        return Result.success(null);
    }

    @Operation(summary = "尾款日历汇总", description = "按月汇总用户尾款总额和数量")
    @GetMapping("/calendar/summary")
    public Result<List<MonthSummaryVO>> summarry(@RequestParam Integer year,
                                           @RequestParam String userId) {
        List<MonthSummaryVO> list =
                wardrobeService.getMonthlySummary(year, userId);
        return Result.success(list);
    }

    @Operation(summary = "尾款日历明细", description = "查询某个月的裙子列表")
    @GetMapping("/calendar/detail")
    public Result<List<Wardrobe>> listByMonth(@RequestParam Integer year,
                                              @RequestParam Integer month,
                                              @RequestParam String userId) {
        List<Wardrobe> list = wardrobeService.listByMonth(year,month,userId);
        return Result.success(list);
    }

    @Operation(summary = "总览统计", description = "获取总支出、待付尾款等统计数据")
    @GetMapping("/statistics/overview")
    public Result<OverviewStatisticsVO> getOverviewStatistics(@RequestParam String userId){
        OverviewStatisticsVO data = wardrobeService.getOverviewStatistics(userId);
        return Result.success(data);
    }

    @Operation(summary = "月度趋势", description = "获取每月支出趋势")
    @GetMapping("/statistics/trend")
    public Result<List<MonthlyTrendVO>> getMonthlyTrend(@RequestParam String userId){
        List<MonthlyTrendVO> data = wardrobeService.getMonthlyTrend(userId);
        return Result.success(data);
    }

    @Operation(summary = "分类统计", description = "按品牌/类型统计支出")
    @GetMapping("/statistics/category")
    public Result<List<CategoryStatisticsVO>> getCategoryStatistics(@RequestParam String userId){
        List<CategoryStatisticsVO> data = wardrobeService.getCategoryStatistics(userId);
        return Result.success(data);
    }

    @Operation(summary = "添加图片", description = "为商品添加关联图片")
    @PostMapping("/image/add")
    public Result<Void> addImage(@RequestParam Long skirtId, @RequestParam String imageUrl) {
        Wardrobe skirt = wardrobeService.getById(skirtId);
        if (skirt == null) {
            return Result.error("裙子不存在");
        }
        long count = skirtImageService
                .lambdaQuery()
                .eq(SkirtImage::getSkirtId, skirtId)
                .count();
        int isCover = (count == 0) ? CoverStatusConstant.IS_COVER : CoverStatusConstant.NOT_COVER;
        SkirtImage image = new SkirtImage();
        image.setSkirtId(skirtId);
        image.setImageUrl(imageUrl);
        image.setIsCover(isCover);
        image.setSortOrder((int) count);
        skirtImageService.save(image);
        return Result.success(null);
    }

    @Operation(summary = "删除图片", description = "删除商品关联图片")
    @DeleteMapping("/image/delete/{imageId}")
    public Result<Void> deleteImage(@PathVariable Long imageId) {
        SkirtImage image = skirtImageService.getById(imageId);
        if (image == null) {
            return Result.error("图片不存在");
        }
        long skirtId = image.getSkirtId();
        boolean isCover = image.getIsCover() == CoverStatusConstant.IS_COVER;

        skirtImageService.removeById(imageId);

        if (isCover) {
            List<SkirtImage> remaining = skirtImageService.lambdaQuery()
                    .eq(SkirtImage::getSkirtId, skirtId)
                    .orderByAsc(SkirtImage::getSortOrder)
                    .list();
            if (!remaining.isEmpty()) {
                SkirtImage first = remaining.get(0);
                first.setIsCover(CoverStatusConstant.IS_COVER);
                skirtImageService.updateById(first);
            }
        }
        return Result.success(null);
    }

    @Operation(summary = "设置封面", description = "设置图片为商品封面")
    @PutMapping("/image/cover/{imageId}")
    public Result<Void> setCover(@PathVariable Long imageId) {
        SkirtImage image = skirtImageService.getById(imageId);
        if (image == null) {
            return Result.error("图片不存在");
        }
        Long skirtId = image.getSkirtId();
        skirtImageService.lambdaUpdate()
                .eq(SkirtImage::getSkirtId, skirtId)
                .set(SkirtImage::getIsCover, CoverStatusConstant.NOT_COVER)
                .update();
        image.setIsCover(CoverStatusConstant.IS_COVER);
        skirtImageService.updateById(image);
        return Result.success(null);
    }

    @Operation(summary = "标记已出掉", description = "将商品状态改为已出掉")
    @PutMapping("/mark-sold/{id}")
    public Result<Void> markSold(@PathVariable Long id) {
        Wardrobe skirt = wardrobeService.getById(id);
        if (skirt == null) {
            return Result.error("裙子不存在");
        }
        skirt.setStatus(SkirtStatusEnum.SOLD.getCode());
        wardrobeService.updateById(skirt);
        return Result.success(null);
    }

    @Operation(summary = "取消出掉", description = "将商品状态恢复为待补款")
    @PutMapping("/unmark-sold/{id}")
    public Result<Void> unmarkSold(@PathVariable Long id) {
        Wardrobe skirt = wardrobeService.getById(id);
        if (skirt == null) {
            return Result.error("裙子不存在");
        }
        skirt.setStatus(SkirtStatusEnum.PENDING.getCode());
        wardrobeService.updateById(skirt);
        return Result.success(null);
    }

}