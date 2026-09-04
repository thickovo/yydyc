package com.gao.yydyc.controller;


import com.gao.yydyc.common.Result;
import com.gao.yydyc.entity.Wish;
import com.gao.yydyc.service.WishService;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Delete;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/wish")
public class WishController {

    @Autowired
    private WishService wishService;

    @PostMapping("/add")
    public Result<Long> add(@RequestBody @Valid Wish wish) {
        wishService.save(wish);
        return Result.success(wish.getId());
    }

    @GetMapping("/list")
    public Result<List<Wish>> getAll(@RequestParam String userId) {
        List<Wish> list = wishService.lambdaQuery()
                .eq(Wish::getUserId,userId)
                .orderByDesc(Wish::getCreateTime)
                .list();
        return Result.success(list);
    }

    @PutMapping("/update")
    public Result<Void> update(@RequestBody Wish wish) {
        wishService.updateById(wish);
        return Result.success(null);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Void> delete(@PathVariable Long id){
        wishService.removeById(id);
        return Result.success(null);
    }
}
