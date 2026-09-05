package com.gao.yydyc.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gao.yydyc.entity.AdminConfig;
import com.gao.yydyc.mapper.AdminConfigMapper;
import com.gao.yydyc.service.AdminConfigService;
import org.springframework.stereotype.Service;

@Service
public class AdminConfigServiceImpl extends ServiceImpl<AdminConfigMapper, AdminConfig> implements AdminConfigService {
}