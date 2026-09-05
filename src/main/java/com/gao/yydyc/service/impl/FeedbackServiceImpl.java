package com.gao.yydyc.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gao.yydyc.entity.Feedback;
import com.gao.yydyc.mapper.FeedbackMapper;
import com.gao.yydyc.service.FeedbackService;
import org.springframework.stereotype.Service;

@Service
public class FeedbackServiceImpl extends ServiceImpl<FeedbackMapper, Feedback> implements FeedbackService {
}