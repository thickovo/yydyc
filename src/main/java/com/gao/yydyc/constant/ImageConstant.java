package com.gao.yydyc.constant;

import java.util.List;

public class ImageConstant {
    private ImageConstant() {}

    public static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    public static final List<String> ALLOWED_SUFFIXES = List.of("jpg", "jpeg", "png");
}