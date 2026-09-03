package com.gao.yydyc.controller;

import com.gao.yydyc.common.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/image")
public class ImageController {

    @Value("${image.base-url}")
    private String baseUrl;

    @PostMapping("/upload")
    public Result<String> imageUpload
            (@RequestParam("file") MultipartFile file,
             HttpServletRequest request)
    throws IOException {

        if (file == null || file.isEmpty())  {
            return Result.error("请选择图片");
        }
        if (file.getSize() > 5 * 1024 *1024) {
            return Result.error("图片大小不能超过5MB");
        }

        String fileName = file.getOriginalFilename();
        String suffix = fileName
                .substring(fileName
                        .lastIndexOf(".")+1)
                .toLowerCase();
        if (!suffix.equals("jpg")
                && !suffix.equals("jpeg")
                && !suffix.equals("png")) {
            return Result.error("只支持jpgg/png/webp格式");
        }
        String newFileName = UUID.randomUUID()
                .toString() + "." + suffix;
        String firstFile = System.getProperty("user.dir");
        fileName = newFileName;
        String imageFile = "D:/yydyc-images/" + newFileName;
        File localFile = new File(imageFile);
        if (!localFile.getParentFile().exists()) {
            localFile.mkdirs();
        }
        file.transferTo(localFile);

        String baseUrl = request.getScheme() +
                "://" + request.getServerName() +
                ":" + request.getServerPort();
        String imageUrl = baseUrl + "/images/" + newFileName;
        return Result.success(imageUrl);

    }

}
