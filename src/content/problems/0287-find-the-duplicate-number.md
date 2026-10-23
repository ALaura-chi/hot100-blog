---
problemId: 287
title: "寻找重复数"
category: "技巧"
difficulty: "medium"
order: 100
leetcode: "https://leetcode.cn/problems/find-the-duplicate-number/"
status: "unstarted"
noteReady: true
---

**题目摘要：** 长度为 n + 1 的数组中，每个数都位于 1 到 n，只有一种重复数，找出它。要求不修改数组，并使用常数级额外空间。例：[1,3,4,2,2] 返回 2。

**思路：** 把下标视为节点，把 nums[i] 视为下一节点。有限节点上的跳转会进入环，重复数对应环入口。先用快慢指针找到环内相遇点，再让一个指针从起点出发，两者每次前进一步，再次相遇的位置就是重复数。

```java
class Solution {
    public int findDuplicate(int[] nums) {
        int slow = nums[0], fast = nums[0];
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);
        slow = nums[0];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }
}
```

**为什么正确**

若入环距离为 a，相遇点距入口为 b，环长为 L，则有 a + b 为 L 的整数倍。从起点与相遇点等速前进 a 步，会在入口重合。

**复杂度**

时间 O(n)，额外空间 O(1)。

**易错点与复盘**

两阶段的起点约定必须一致。本实现两指针初值为 nums[0]，第二阶段也从 nums[0] 出发。这个方法依赖数值范围和唯一重复值条件。

**验证记录**

本仓库提供对应 Java 源码和可复跑的示例、边界及随机测试。未记录个人力扣提交结果，刷题状态保持“未开始”。
