package com.gao.yydyc.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gao.yydyc.common.Result;
import com.gao.yydyc.dto.CategoryStatisticsVO;
import com.gao.yydyc.dto.MonthSummaryVO;
import com.gao.yydyc.dto.MonthlyTrendVO;
import com.gao.yydyc.dto.OverviewStatisticsVO;
import com.gao.yydyc.entity.SkirtImage;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.mapper.SkirtImageMapper;
import com.gao.yydyc.mapper.WardrobeMapper;
import com.gao.yydyc.service.SkirtImageService;
import com.gao.yydyc.service.WardrobeService;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/wardrobe")
public class WardrobeController {

    @Autowired
    private WardrobeService wardrobeService;

    @Autowired
    private SkirtImageMapper skirtImageMapper;
    @Autowired
    private SkirtImageService skirtImageService;

    @PostMapping("/add")
    public Result<Long> add(@RequestBody @Valid Wardrobe wardrobe) {
        wardrobeService.save(wardrobe);
        return Result.success(wardrobe.getId());
    }

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

        if (category != null){
            wrapper.eq(Wardrobe::getCategory, category);
        }
        if (type != null){
            wrapper.eq(Wardrobe::getType, type);
        }
        if (color != null){
            wrapper.eq(Wardrobe::getColor, color);
        }
        if (status != null){
            wrapper.eq(Wardrobe::getStatus, status);
        }
        if (keyword != null){
            wrapper.like(Wardrobe::getName, keyword);
        }
        if (cabinetId != null){
            wrapper.eq(Wardrobe::getCabinetId, cabinetId);
        }
        wrapper.orderByDesc(Wardrobe::getFinalStart);

        Page<Wardrobe> wardrobePage = wardrobeService.page(new Page<>(page, size), wrapper);
        return Result.success(wardrobePage);
    }


    @GetMapping("/detail/{id}")
    public Result<Wardrobe> detail(@PathVariable Long id) {
        Wardrobe wardrobe = wardrobeService.getById(id);
        //查询关联图片
        List<SkirtImage> images = skirtImageService.lambdaQuery()
                .eq(SkirtImage::getSkirtId,id)
                .orderByDesc(SkirtImage::getCreateTime)
                .list();

        //需要Wardrobe 实体加images字段
        wardrobe.setImages(images);

        return Result.success(wardrobe);
    }

    @PutMapping("/update")
    public Result<Void> update(@RequestBody Wardrobe wardrobe) {
        wardrobeService.updateById(wardrobe);
        return Result.success(null);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        wardrobeService.removeById(id);
        return Result.success(null);
    }

    @GetMapping("/calendar/summary")
    public Result<List<MonthSummaryVO>> summarry(@RequestParam Integer year,
                                           @RequestParam String userId) {
        List<MonthSummaryVO> list =
                wardrobeService.getMonthlySummary(year, userId);
        return Result.success(list);
    }

    @GetMapping("/calendar/detail")
    public Result<List<Wardrobe>> listByMonth(@RequestParam Integer year,
                                              @RequestParam Integer month,
                                              @RequestParam String userId) {
        List<Wardrobe> list = wardrobeService.listByMonth(year,month,userId);
        return Result.success(list);
    }

    @GetMapping("/statistics/overview")
    public Result<OverviewStatisticsVO> getOverviewStatistics(@RequestParam String userId){
        OverviewStatisticsVO data = wardrobeService.getOverviewStatistics(userId);
        return Result.success(data);
    }

    @GetMapping("/statistics/trend")
    public Result<List<MonthlyTrendVO>> getMonthlyTrend(@RequestParam String userId){
        List<MonthlyTrendVO> data = wardrobeService.getMonthlyTrend(userId);
        return Result.success(data);
    }

    @GetMapping("/statistics/category")
    public Result<List<CategoryStatisticsVO>> getCategoryStatistics(@RequestParam String userId){
        List<CategoryStatisticsVO> data = wardrobeService.getCategoryStatistics(userId);
        return Result.success(data);
    }

    @PostMapping("/image/add")
    public Result<Void> addImage(@RequestParam Long skirtId, @RequestParam String imageUrl) {
        // 1. 检查裙子是否存在
        Wardrobe skirt  = wardrobeService.getById(skirtId);
        if (skirt == null){
            return Result.error("裙子不存在");
        }
        // 2. 查询当前已有图片数量，决定 sort_order
        long count = skirtImageService
                    .lambdaQuery()
                    .eq(SkirtImage::getSkirtId, skirtId)
                    .count();
        // 3. 如果这是第一张图片，设为封面
        int isCover = (count == 0) ? 1 : 0;
        // 4. 插入 skirt_image 表
        SkirtImage image = new SkirtImage();
        image.setSkirtId(skirtId);
        image.setImageUrl(imageUrl);
        image.setIsCover(isCover);
        image.setSortOrder((int) count);
        skirtImageService.save(image);
        return Result.success(null);
    }

    @DeleteMapping("/image/delete/{imageId}")
    public Result<Void> deleteImage(@PathVariable Long imageId) {
        // 1. 查图片存不存在
        SkirtImage image = skirtImageService.getById(imageId);
        if (image == null){
            // 2. 如果不存在，返回错误
            return Result.error("图片不存在");
        }
        // 3. 查出这条裙子还有哪些图片
        long skirtId = image.getSkirtId();
        boolean isCover = image.getIsCover() == 1;

        // 4. 删除这张图
        skirtImageService.removeById(imageId);

        // 5. 如果删的是封面，把剩余的第一张设为封面
        if (isCover){
            List<SkirtImage> remaining = skirtImageService.lambdaQuery()
                    .eq(SkirtImage::getSkirtId,skirtId)
                    .orderByAsc(SkirtImage::getSortOrder)
                    .list();
            if (!remaining.isEmpty()){
                SkirtImage first = remaining.get(0);
                first.setIsCover(1);
                skirtImageService.updateById(first);
            }
        }
        return Result.success(null);
    }

    @PutMapping("/image/cover/{imageId}")
    public Result<Void> setCover(@PathVariable Long imageId) {
        // 1. 查图片存不存在
        SkirtImage image = skirtImageService.getById(imageId);
        if (image == null){
            return Result.error("图片不存在");
        }
        // 2. 查出这条裙子
        Long skirtId = image.getSkirtId();
        // 3. 把该裙子所有图片的 isCover 设为 0
        skirtImageService.lambdaUpdate()
                .eq(SkirtImage::getSkirtId,skirtId)
                .set(SkirtImage::getIsCover,0)
                .update();
        // 4. 把当前图片的 isCover 设为 1
        image.setIsCover(1);
        skirtImageService.updateById(image);

        return Result.success(null);
    }

}