---
problemId: 283
title: "移动零"
category: "双指针"
difficulty: "easy"
order: 4
leetcode: "https://leetcode.cn/problems/move-zeroes/"
status: "unstarted"
noteReady: true
---

**题目摘要：** 在原数组中将所有 0 移至末尾，同时保持非零元素的相对顺序。例：[0,1,0,3,12] 处理后为 [1,3,12,0,0]。

**思路：** 使用写指针 write 表示下一个非零元素的落点。扫描原数组，遇到非零值就写入 nums[write++]；扫描结束后，将剩余位置补为 0。写指针始终不会越过读取位置，因此原地覆盖不会破坏尚未读取的数据。

```java
class Solution {
    public void moveZeroes(int[] nums) {
        int write = 0;
        for (int value : nums) {
            if (value != 0) nums[write++] = value;
        }
        while (write < nums.length) nums[write++] = 0;
    }
}
```

**为什么正确**

写指针之前恰好是已扫描部分的全部非零元素，且顺序不变。最后补零即可保持数组长度。

**复杂度**

时间 O(n)，额外空间 O(1)。

**易错点与复盘**

题目要求原地修改并保留顺序。不要通过排序移动零；全零、没有零、空数组都需要正常处理。

**验证记录**

本仓库提供对应 Java 源码和可复跑的示例、边界及随机测试。未记录个人力扣提交结果，刷题状态保持“未开始”。
