package com.gao.yydyc.controller;

import com.gao.yydyc.common.Result;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.service.BackupService;
import com.gao.yydyc.service.WardrobeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private final BackupService backupService;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
    }

    @GetMapping("/export")
    public Result<String> export(@RequestParam String userId) {
        String json = backupService.exportData(userId);
        if (json != null) {
            return Result.success(json);
        } else {
            return Result.error("导出失败");
        }
    }

    @PostMapping("/import")
    public Result<Void> importData(@RequestParam String userId,
                                   @RequestParam("file") MultipartFile file) {
        backupService.importData(userId, file);
        return Result.success(null);
    }
}