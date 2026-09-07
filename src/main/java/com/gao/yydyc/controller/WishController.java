package com.gao.yydyc.controller;

import com.gao.yydyc.common.Result;
import com.gao.yydyc.entity.Wish;
import com.gao.yydyc.service.WishService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@Tag(name = "心愿单管理", description = "心愿单的增删改查接口")
@Slf4j
@RestController
@RequestMapping("/api/wish")
public class WishController {

    private final WishService wishService;

    public WishController(WishService wishService) {
        this.wishService = wishService;
    }

    @Operation(summary = "添加心愿", description = "新增一条心愿记录")
    @PostMapping("/add")
    public Result<Long> add(@RequestBody @Valid Wish wish) {
        wishService.save(wish);
        return Result.success(wish.getId());
    }

    @Operation(summary = "获取心愿列表", description = "获取用户所有心愿")
    @GetMapping("/list")
    public Result<List<Wish>> getAll(@RequestParam String userId) {
        List<Wish> list = wishService.lambdaQuery()
                .eq(Wish::getUserId, userId)
                .orderByDesc(Wish::getCreateTime)
                .list();
        return Result.success(list);
    }

    @Operation(summary = "更新心愿", description = "修改心愿信息")
    @PutMapping("/update")
    public Result<Void> update(@RequestBody Wish wish) {
        wishService.updateById(wish);
        return Result.success(null);
    }

    @Operation(summary = "删除心愿", description = "根据ID删除心愿")
    @DeleteMapping("/delete/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        wishService.removeById(id);
        return Result.success(null);
    }

    @Operation(summary = "标记已完成", description = "将心愿标记为已完成")
    @PutMapping("/done/{id}")
    public Result<Void> done(@PathVariable Long id) {
        Wish wish = wishService.getById(id);
        if (wish == null) {
            return Result.error("心愿不存在");
        }
        wish.setIsDone(1);
        wishService.updateById(wish);
        return Result.success(null);
    }
}