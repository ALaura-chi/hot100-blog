---
problemId: 200
title: "岛屿数量"
category: "图论"
difficulty: "medium"
order: 51
leetcode: "https://leetcode.cn/problems/number-of-islands/"
status: "unstarted"
noteReady: true
---

**题目摘要：** 在由字符 1 和 0 组成的网格中，上下左右相连的陆地属于同一座岛，统计岛屿数量。对角相邻不算连通。

**思路：** 遍历网格，每遇到尚未访问的陆地就计数一次，并用显式栈执行深度优先遍历，把这片连通陆地全部标为水。入栈前立即标记，避免同一格重复入栈。

```java
import java.util.ArrayDeque;
import java.util.Deque;

class Solution {
    public int numIslands(char[][] grid) {
        if (grid.length == 0 || grid[0].length == 0) return 0;
        int rows = grid.length, cols = grid[0].length, count = 0;
        int[][] dirs = { {1, 0}, {-1, 0}, {0, 1}, {0, -1} };
        Deque<int[]> stack = new ArrayDeque<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != '1') continue;
                count++;
                grid[r][c] = '0';
                stack.push(new int[] {r, c});
                while (!stack.isEmpty()) {
                    int[] cell = stack.pop();
                    for (int[] dir : dirs) {
                        int nr = cell[0] + dir[0], nc = cell[1] + dir[1];
                        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] != '1') continue;
                        grid[nr][nc] = '0';
                        stack.push(new int[] {nr, nc});
                    }
                }
            }
        }
        return count;
    }
}
```

**为什么正确**

一次遍历会且仅会访问起点所在的连通块。下一次遇到未标记陆地时，它一定属于另一座岛。

**复杂度**

时间 O(mn)，显式栈最坏占用 O(mn) 空间。该实现会修改输入网格。

**易错点与复盘**

邻接只包含四个方向。需要保留原网格时应先复制；使用显式栈可以避免大岛屿导致递归栈过深。

**验证记录**

本仓库提供对应 Java 源码和可复跑的示例、边界及随机测试。未记录个人力扣提交结果，刷题状态保持“未开始”。
