package com.gao.yydyc.controller;

import com.gao.yydyc.common.Result;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.service.BackupService;
import com.gao.yydyc.service.WardrobeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "数据备份", description = "数据导出与导入接口")
@Slf4j
@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private final BackupService backupService;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
    }

    @Operation(summary = "导出数据", description = "导出用户所有裙子和心愿数据为JSON")
    @GetMapping("/export")
    public Result<String> export(@RequestParam String userId) {
        String json = backupService.exportData(userId);
        if (json != null) {
            return Result.success(json);
        } else {
            return Result.error("导出失败");
        }
    }

    @Operation(summary = "导入数据", description = "导入JSON文件恢复用户数据")
    @PostMapping("/import")
    public Result<Void> importData(@RequestParam String userId,
                                   @RequestParam("file") MultipartFile file) {
        backupService.importData(userId, file);
        return Result.success(null);
    }
}