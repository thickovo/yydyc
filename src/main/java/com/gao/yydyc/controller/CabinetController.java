package com.gao.yydyc.controller;

import com.baomidou.mybatisplus.extension.conditions.query.LambdaQueryChainWrapper;
import com.gao.yydyc.common.Result;
import com.gao.yydyc.entity.Cabinet;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.service.CabinetService;
import com.gao.yydyc.service.WardrobeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "柜子管理", description = "柜子分类的增删改查接口")
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

    @Operation(summary = "获取柜子列表", description = "获取用户的所有柜子分类")
    @GetMapping("/list")
    public Result<List<Cabinet>> list(@RequestParam String userId) {
        LambdaQueryChainWrapper<Cabinet> cabinets = cabinetService.lambdaQuery()
                .eq(Cabinet::getUserId, userId).orderByDesc(Cabinet::getCreateTime);
        List<Cabinet> cabinetList = cabinets.list();
        return Result.success(cabinetList);
    }

    @Operation(summary = "添加柜子", description = "创建新的柜子分类")
    @PostMapping("/add")
    public Result<Long> add(@RequestBody Cabinet cabinet) {
        cabinetService.save(cabinet);
        return Result.success(cabinet.getId());
    }

    @Operation(summary = "更新柜子", description = "修改柜子名称或描述")
    @PutMapping("/update")
    public Result<Void> update(@RequestBody Cabinet cabinet) {
        cabinetService.updateById(cabinet);
        return Result.success(null);
    }

    @Operation(summary = "删除柜子", description = "删除柜子，关联裙子会自动取消柜子归属")
    @DeleteMapping("/delete/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        wardrobeService.lambdaUpdate()
                .eq(Wardrobe::getCabinetId, id)
                .set(Wardrobe::getCabinetId, null)
                .update();
        cabinetService.removeById(id);
        return Result.success(null);
    }
}