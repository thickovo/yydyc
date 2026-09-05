package com.gao.yydyc.service;

import org.springframework.web.multipart.MultipartFile;

public interface BackupService {
    String exportData(String userId);
    void importData(String userId, MultipartFile file);
}