package com.gao.yydyc.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gao.yydyc.service.CabinetService;
import org.springframework.stereotype.Service;
import com.gao.yydyc.mapper.CabinetMapper;
import com.gao.yydyc.entity.Cabinet;

@Service
public class CabinetServiceImpl extends ServiceImpl<CabinetMapper, Cabinet> implements CabinetService {
}
