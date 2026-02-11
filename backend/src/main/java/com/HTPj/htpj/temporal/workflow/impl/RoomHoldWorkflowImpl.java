package com.HTPj.htpj.temporal.workflow.impl;

import com.HTPj.htpj.temporal.activity.RoomHoldActivities;
import com.HTPj.htpj.temporal.workflow.RoomHoldWorkflow;
import io.temporal.activity.ActivityOptions;
import io.temporal.workflow.Workflow;
import java.time.Duration;

public class RoomHoldWorkflowImpl implements RoomHoldWorkflow {

    private final RoomHoldActivities activities =
            Workflow.newActivityStub(
                    RoomHoldActivities.class,
                    ActivityOptions.newBuilder()
                            .setStartToCloseTimeout(Duration.ofSeconds(10))
                            .build()
            );

    @Override
    public void startRoomHold(String holdCode, long expireEpochMillis) {

        long now = Workflow.currentTimeMillis();
        long delay = expireEpochMillis - now;

        if (delay > 0) {
            Workflow.sleep(Duration.ofMillis(delay));
        }

        activities.expireHold(holdCode);
    }
}
