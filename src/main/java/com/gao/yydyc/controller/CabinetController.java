package com.gao.yydyc.controller;

import com.baomidou.mybatisplus.extension.conditions.query.LambdaQueryChainWrapper;
import com.gao.yydyc.common.Result;
import com.gao.yydyc.entity.Cabinet;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.service.CabinetService;
import com.gao.yydyc.service.WardrobeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/cabinet")
public class CabinetController {

    private final CabinetService cabinetService;
    private final WardrobeService wardrobeService;

    public CabinetController(CabinetService cabinetService, WardrobeService wardrobeService) {
        this.cabinetService = cabinetService;
        this.wardrobeService = wardrobeService;
    }

    @GetMapping("/list")
    public Result<List<Cabinet>> list(@RequestParam String userId) {
        LambdaQueryChainWrapper<Cabinet> cabinets = cabinetService.lambdaQuery()
                .eq(Cabinet::getUserId, userId).orderByDesc(Cabinet::getCreateTime);
        List<Cabinet> cabinetList = cabinets.list();
        return Result.success(cabinetList);
    }

    @PostMapping("/add")
    public Result<Long> add(@RequestBody Cabinet cabinet) {
        cabinetService.save(cabinet);
        return Result.success(cabinet.getId());
    }

    @PutMapping("/update")
    public Result<Void> update(@RequestBody Cabinet cabinet) {
        cabinetService.updateById(cabinet);
        return Result.success(null);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        wardrobeService.lambdaUpdate()
                .eq(Wardrobe::getCabinetId,id)
                .set(Wardrobe::getCabinetId,null)
                .update();
        cabinetService.removeById(id);
        return Result.success(null);
    }

}
