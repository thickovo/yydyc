package com.gao.yydyc.controller;

import com.gao.yydyc.common.Result;
import com.gao.yydyc.config.ImageConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.gao.yydyc.constant.ImageConstant;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Tag(name = "图片管理", description = "图片上传接口")
@Slf4j
@RestController
@RequestMapping("/api/image")
public class ImageController {

    @Autowired
    private ImageConfig imageConfig;

    @Operation(summary = "上传图片", description = "上传商品图片，返回相对路径")
    @PostMapping("/upload")
    public Result<String> imageUpload(@RequestParam("file") MultipartFile file)
    throws IOException {

        if (file == null || file.isEmpty())  {
            return Result.error("请选择图片");
        }
        if (file.getSize() > ImageConstant.MAX_FILE_SIZE) {
            return Result.error("图片大小不能超过5MB");
        }

        String fileName = file.getOriginalFilename();
        String suffix = fileName
                .substring(fileName
                        .lastIndexOf(".")+1)
                .toLowerCase();
        if (!ImageConstant.ALLOWED_SUFFIXES.contains(suffix)) {
            return Result.error("只支持jpg/jpeg/png格式");
        }
        log.info("storagePath: {}", imageConfig.getStoragePath());
        String newFileName = UUID.randomUUID()
                .toString() + "." + suffix;
        String imageFile = "D:/yydyc-images/" + newFileName;
        File localFile = new File(imageFile);
        if (!localFile.getParentFile().exists()) {
            localFile.mkdirs();
        }
        file.transferTo(localFile);

        // 返回相对路径（/images/{filename}），由前端拼上 baseUrl 再渲染。
        // 这样：
        //   1) 切换环境（dev/lan/tunnel）不需要改数据库；
        //   2) 真机上图片 URL 始终是当前 baseUrl，避免反向代理拿到 localhost 之类的坑；
        //   3) 老数据里如果是绝对 URL（http://...），前端 resolveImageUrl 会识别并直接使用。
        String imageUrl = "/images/" + newFileName;
        return Result.success(imageUrl);

    }

}
