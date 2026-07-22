package com.gao.yydyc.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gao.yydyc.common.Result;
import com.gao.yydyc.entity.Skirt;
import com.gao.yydyc.service.SkirtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
//告诉spring 这个类是处理HTTP请求的
@RequestMapping("/api/skirt")
//告诉 Spring 这个类里所有接口的路径都以 /api/skirt 开头
public class SkirtController {
    @Autowired
    private SkirtService skirtService;

    @PostMapping("/add")
    public Result<Long> add(@RequestBody Skirt skirt){
        skirtService.save(skirt);
        return Result.success(skirt.getId());
    }

    @GetMapping("/List")
    public Result<Page<Skirt>> List(@RequestParam(defaultValue = "1") Integer page, @RequestParam(defaultValue = "10") Integer size, @RequestParam String userId){
        LambdaQueryWrapper<Skirt> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Skirt::getUserId, userId).orderByDesc(Skirt::getId);
        Page<Skirt> skirtPage = skirtService.page(new Page<>(page, size), wrapper);
        return Result.success(skirtPage);
    }

    @GetMapping("/detail/{id}")
    public Result<Skirt> detail(@PathVariable Long id){
        Skirt skirt = skirtService.getById(id);
        return Result.success(skirt);
    }

    @PutMapping("/update")
    public Result<Skirt> update(@RequestBody Skirt skirt){
        skirtService.updateById(skirt);
        return Result.success(null);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Skirt> delete(@PathVariable Long id){
        skirtService.removeById(id);
        return Result.success(null);
    }
}
