package com.gao.yydyc.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.entity.Wish;
import com.gao.yydyc.exception.BusinessException;
import com.gao.yydyc.service.BackupService;
import com.gao.yydyc.service.WardrobeService;
import com.gao.yydyc.service.WishService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class BackupServiceImpl implements BackupService {

    private final WardrobeService wardrobeService;
    private final WishService wishService;
    private final ObjectMapper objectMapper;

    public BackupServiceImpl(WardrobeService wardrobeService, WishService wishService, ObjectMapper objectMapper) {
        this.wardrobeService = wardrobeService;
        this.wishService = wishService;
        this.objectMapper = objectMapper;
    }

    @Override
    public String exportData(String userId) {
        List<Wardrobe> wardrobeList = wardrobeService
                .lambdaQuery()
                .eq(Wardrobe::getUserId, userId)
                .list();
        List<Wish> wishList = wishService
                .lambdaQuery()
                .eq(Wish::getUserId, userId)
                .list();

        Map<String, Object> data = new HashMap<>();
        data.put("wardrobeList", wardrobeList);
        data.put("wishList", wishList);
        data.put("userId", userId);
        data.put("exportTime", System.currentTimeMillis());

        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("导出数据转JSON失败", e);
            throw new BusinessException("导出数据失败：" + e.getMessage());
        }
    }

    @Override
    public void importData(String userId, MultipartFile file) {
        try {
            String content = new String(file.getBytes());

            Map<String, Object> parseData = objectMapper.readValue(content, Map.class);
            List<Wardrobe> wardrobeList = (List<Wardrobe>) parseData.get("wardrobeList");
            List<Wish> wishList = (List<Wish>) parseData.get("wishList");

            wardrobeService
                    .lambdaUpdate()
                    .eq(Wardrobe::getUserId, userId)
                    .remove();
            wishService
                    .lambdaUpdate()
                    .eq(Wish::getUserId, userId)
                    .remove();

            log.info("开始导入数据,userId:{}", userId);
            wardrobeService.saveBatch(wardrobeList);
            wishService.saveBatch(wishList);
            log.info("导入完成，裙子{}条，心愿{}条", wardrobeList.size(), wishList.size());
        } catch (Exception e) {
            log.error("导入数据失败", e);
            throw new BusinessException("导入失败：" + e.getMessage());
        }
    }
}