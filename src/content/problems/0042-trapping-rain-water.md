---
problemId: 42
title: "接雨水"
category: "双指针"
difficulty: "hard"
order: 7
leetcode: "https://leetcode.cn/problems/trapping-rain-water/"
status: "unstarted"
noteReady: true
---

**题目摘要：** 每根柱子的宽度为 1，计算这些非负高度之间最多能接住多少雨水。例：[0,1,0,2,1,0,1,3,2,1,2,1] 的答案为 6。

**思路：** 左右指针从两端相向移动，同时维护两侧最高柱子。当前左柱不高于右柱时，左侧已有足够高的右边界，可按 leftMax - height[left] 结算并右移；反之结算右侧。每轮只移动一侧，不重复计算位置。

```java
class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] <= height[right]) {
                leftMax = Math.max(leftMax, height[left]);
                water += leftMax - height[left++];
            } else {
                rightMax = Math.max(rightMax, height[right]);
                water += rightMax - height[right--];
            }
        }
        return water;
    }
}
```

**为什么正确**

较矮端的水位可以由该侧历史最高值确定；若这一侧曾有更高边界，对端在指针移动过程中也已经提供了相应约束。每个被移出的格子只结算一次。

**复杂度**

时间 O(n)，额外空间 O(1)。

**易错点与复盘**

先更新当前侧的最高值，再计算积水，避免出现负数。柱子不足两根时循环不会进入，答案自然为 0。

**验证记录**

本仓库提供对应 Java 源码和可复跑的示例、边界及随机测试。未记录个人力扣提交结果，刷题状态保持“未开始”。
