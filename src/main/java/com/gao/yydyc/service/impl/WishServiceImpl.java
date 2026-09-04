package com.gao.yydyc.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gao.yydyc.entity.Wish;
import com.gao.yydyc.mapper.WishMapper;
import com.gao.yydyc.service.WishService;
import org.springframework.stereotype.Service;

@Service
public class WishServiceImpl extends ServiceImpl<WishMapper,Wish> implements WishService {
}
