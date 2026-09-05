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

    @Autowired
    private BackupService backupService;

    @GetMapping("/export")
    public Result<String> export(@RequestParam String userId) {
        //  根据userId查询数据库 将所有信息 打包成json返回前端
        String json = backupService.exportData(userId);
        if (json != null) {
            return Result.success(json);
        }else {
            return Result.error("导出失败");
        }
    }

    @PostMapping("/import")
    public Result<Void> importData(@RequestParam String userId,
                                   @RequestParam("file") MultipartFile file) {
        // 接收拆分前端传来的json格式 根据userId导入数据库
        backupService.importData(userId, file);
        return Result.success(null);
    }
}