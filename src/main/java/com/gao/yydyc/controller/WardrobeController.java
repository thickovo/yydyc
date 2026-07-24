package com.gao.yydyc.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gao.yydyc.common.Result;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.service.WardrobeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/wardrobe")
public class WardrobeController {

    @Autowired
    private WardrobeService wardrobeService;

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
}