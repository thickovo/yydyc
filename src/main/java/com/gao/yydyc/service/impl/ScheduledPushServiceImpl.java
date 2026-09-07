package com.gao.yydyc.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gao.yydyc.entity.Wardrobe;
import com.gao.yydyc.entity.NotificationLog;
import com.gao.yydyc.mapper.NotificationLogMapper;
import com.gao.yydyc.service.ScheduledPushService;
import com.gao.yydyc.service.WardrobeService;
import com.gao.yydyc.service.WechatPushService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class ScheduledPushServiceImpl implements ScheduledPushService {

    @Autowired
    private WardrobeService wardrobeService;

    @Autowired
    private WechatPushService wechatPushService;

    @Autowired
    private NotificationLogMapper notificationLogMapper;

    @Override
    @Scheduled(cron = "0 0 10 * * ?")
    public void pushFinalPaymentRemind() {
        log.info("开始执行尾款提醒定时任务");

        // 1. 查明天需要补款的裙子
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Wardrobe> list = wardrobeService.lambdaQuery()
                .eq(Wardrobe::getStatus, 0)
                .isNotNull(Wardrobe::getFinalStart)
                .apply("DATE(final_start) = {0}", tomorrow)
                .list();

        if (list.isEmpty()) {
            log.info("明天没有需要补款的裙子");
            return;
        }

        log.info("共有 {} 条裙子需要推送", list.size());

        // 2. 逐条推送
        for (Wardrobe skirt : list) {
            try {
                // 检查今天是否已推送过
                long count = notificationLogMapper.selectCount(
                        new LambdaQueryWrapper<NotificationLog>()
                                .eq(NotificationLog::getSkirtId, skirt.getId())
                                .apply("DATE(send_time) = CURDATE()")
                );
                if (count > 0) {
                    log.info("裙子 {} 今天已推送过，跳过", skirt.getName());
                    continue;
                }

                boolean success = wechatPushService.sendFinalRemind(skirt);

                // 3. 记录日志
                NotificationLog notificationLog = new NotificationLog();
                notificationLog.setSkirtId(skirt.getId());
                notificationLog.setUserId(skirt.getUserId());
                notificationLog.setSendTime(LocalDateTime.now());
                notificationLog.setStatus(success ? 1 : 0);
                notificationLog.setContent(success ? "推送成功" : "推送失败");
                notificationLogMapper.insert(notificationLog);

                if (success) {
                    log.info("推送成功：{}", skirt.getName());
                } else {
                    log.error("推送失败：{}", skirt.getName());
                }

            } catch (Exception e) {
                log.error("推送裙子 {} 异常", skirt.getId(), e);
            }
        }

        log.info("尾款提醒定时任务执行完成");
    }
}