---
problemId: 1
title: "两数之和"
category: "哈希"
difficulty: "easy"
order: 1
leetcode: "https://leetcode.cn/problems/two-sum/"
status: "unstarted"
noteReady: true
---

**题目摘要：** 给定整数数组和目标值，返回两个不同位置的下标，使对应数值之和等于目标值。例：nums = [2,7,11,15]，target = 9，返回 [0,1]。

**思路：** 从左到右扫描，用 HashMap 保存已经见过的数值和下标。处理 nums[i] 时，先查找 target - nums[i]，命中就得到一对答案，再把当前元素存入表中。先查询后写入，保证不会重复使用同一个位置。

```java
import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) {
                return new int[] { seen.get(need), i };
            }
            seen.put(nums[i], i);
        }
        throw new IllegalArgumentException("No solution");
    }
}
```

**为什么正确**

哈希表只保存当前位置左侧的元素。找到补数时，两下标必定不同；继续扫描不会漏掉答案中靠右的那个位置。

**复杂度**

时间 O(n)，额外空间 O(n)。

**易错点与复盘**

不能把“数值”当成“下标”返回。数组可以含负数和重复值；[3,3] 的目标为 6 时仍需要两个不同位置。

**验证记录**

本仓库提供对应 Java 源码和可复跑的示例、边界及随机测试。未记录个人力扣提交结果，刷题状态保持“未开始”。
