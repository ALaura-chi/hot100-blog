import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const plan = await readFile(path.join(root, 'docs/reference/original-plan.md'), 'utf8');
const rows = [...plan.matchAll(/^\| \[.\] \| (\d+) \| ([^|]+) \| \[(\d+)、(.+?)\]\((https:\/\/leetcode\.cn\/problems\/[^)]+)\) \| (简单|中等|困难) \|\s*$/gm)];
const difficulty = {'简单':'easy', '中等':'medium', '困难':'hard'};
const problems = rows.map(([,order,category,problemId,title,leetcode,level]) => ({
  problemId: Number(problemId), title, category: category.trim(), difficulty: difficulty[level],
  order: Number(order), leetcode, status: 'unstarted',
}));
if (problems.length !== 100 || new Set(problems.map(p => p.problemId)).size !== 100) throw new Error('Expected 100 unique problems');
const notes = {
  1: {source:'TwoSum', summary:'给定整数数组和目标值，返回两个不同位置的下标，使对应数值之和等于目标值。例：nums = [2,7,11,15]，target = 9，返回 [0,1]。',
    idea:'从左到右扫描，用 HashMap 保存已经见过的数值和下标。处理 nums[i] 时，先查找 target - nums[i]，命中就得到一对答案，再把当前元素存入表中。先查询后写入，保证不会重复使用同一个位置。',
    complexity:'时间 O(n)，额外空间 O(n)。', pitfalls:'不能把“数值”当成“下标”返回。数组可以含负数和重复值；[3,3] 的目标为 6 时仍需要两个不同位置。', invariant:'哈希表只保存当前位置左侧的元素。找到补数时，两下标必定不同；继续扫描不会漏掉答案中靠右的那个位置。'},
  283: {source:'MoveZeroes', summary:'在原数组中将所有 0 移至末尾，同时保持非零元素的相对顺序。例：[0,1,0,3,12] 处理后为 [1,3,12,0,0]。',
    idea:'使用写指针 write 表示下一个非零元素的落点。扫描原数组，遇到非零值就写入 nums[write++]；扫描结束后，将剩余位置补为 0。写指针始终不会越过读取位置，因此原地覆盖不会破坏尚未读取的数据。',
    complexity:'时间 O(n)，额外空间 O(1)。', pitfalls:'题目要求原地修改并保留顺序。不要通过排序移动零；全零、没有零、空数组都需要正常处理。', invariant:'写指针之前恰好是已扫描部分的全部非零元素，且顺序不变。最后补零即可保持数组长度。'},
  42: {source:'RainWater', summary:'每根柱子的宽度为 1，计算这些非负高度之间最多能接住多少雨水。例：[0,1,0,2,1,0,1,3,2,1,2,1] 的答案为 6。',
    idea:'左右指针从两端相向移动，同时维护两侧最高柱子。当前左柱不高于右柱时，左侧已有足够高的右边界，可按 leftMax - height[left] 结算并右移；反之结算右侧。每轮只移动一侧，不重复计算位置。',
    complexity:'时间 O(n)，额外空间 O(1)。', pitfalls:'先更新当前侧的最高值，再计算积水，避免出现负数。柱子不足两根时循环不会进入，答案自然为 0。', invariant:'较矮端的水位可以由该侧历史最高值确定；若这一侧曾有更高边界，对端在指针移动过程中也已经提供了相应约束。每个被移出的格子只结算一次。'},
  200: {source:'Islands', summary:'在由字符 1 和 0 组成的网格中，上下左右相连的陆地属于同一座岛，统计岛屿数量。对角相邻不算连通。',
    idea:'遍历网格，每遇到尚未访问的陆地就计数一次，并用显式栈执行深度优先遍历，把这片连通陆地全部标为水。入栈前立即标记，避免同一格重复入栈。',
    complexity:'时间 O(mn)，显式栈最坏占用 O(mn) 空间。该实现会修改输入网格。', pitfalls:'邻接只包含四个方向。需要保留原网格时应先复制；使用显式栈可以避免大岛屿导致递归栈过深。', invariant:'一次遍历会且仅会访问起点所在的连通块。下一次遇到未标记陆地时，它一定属于另一座岛。'},
  287: {source:'DuplicateNumber', summary:'长度为 n + 1 的数组中，每个数都位于 1 到 n，只有一种重复数，找出它。要求不修改数组，并使用常数级额外空间。例：[1,3,4,2,2] 返回 2。',
    idea:'把下标视为节点，把 nums[i] 视为下一节点。有限节点上的跳转会进入环，重复数对应环入口。先用快慢指针找到环内相遇点，再让一个指针从起点出发，两者每次前进一步，再次相遇的位置就是重复数。',
    complexity:'时间 O(n)，额外空间 O(1)。', pitfalls:'两阶段的起点约定必须一致。本实现两指针初值为 nums[0]，第二阶段也从 nums[0] 出发。这个方法依赖数值范围和唯一重复值条件。', invariant:'若入环距离为 a，相遇点距入口为 b，环长为 L，则有 a + b 为 L 的整数倍。从起点与相遇点等速前进 a 步，会在入口重合。'},
};
await mkdir(path.join(root,'src/content/problems'),{recursive:true});
for (const problem of problems) {
  const note = notes[problem.problemId];
  const metadata = {...problem, noteReady: Boolean(note)};
  const frontmatter = Object.entries(metadata).map(([key,value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
  let body = '**笔记状态**\n\n这道题的题解待补充。可以先打开标题中的力扣链接练习，再记录自己的思路、复杂度和易错点。\n';
  if (note) {
    const source = (await readFile(path.join(root,`examples/java/${note.source}.java`),'utf8')).replace(`public final class ${note.source}`, 'class Solution');
    body = `**题目摘要**\n\n${note.summary}\n\n**思路**\n\n${note.idea}\n\n**Java 代码**\n\n\`\`\`java\n${source.trim()}\n\`\`\`\n\n**为什么正确**\n\n${note.invariant}\n\n**复杂度**\n\n${note.complexity}\n\n**易错点与复盘**\n\n${note.pitfalls}\n\n**验证记录**\n\n本仓库提供对应 Java 源码和可复跑的示例、边界及随机测试。未记录个人力扣提交结果，刷题状态保持“未开始”。\n`;
  }
  if (note) body = body.replace('**题目摘要**\n\n', '**题目摘要：** ').replace('**思路**\n\n', '**思路：** ').replace('**Java 代码**\n\n', '');
  const slug = new URL(problem.leetcode).pathname.split('/').filter(Boolean).at(-1);
  await writeFile(path.join(root,`src/content/problems/${String(problem.problemId).padStart(4,'0')}-${slug}.md`), `---\n${frontmatter}\n---\n\n${body}`, 'utf8');
}
await mkdir(path.join(root,'src/data'),{recursive:true});
await writeFile(path.join(root,'src/data/problem-index.json'),JSON.stringify(problems,null,2)+'\n');
console.log(`Created ${problems.length} Markdown notes across ${new Set(problems.map(p=>p.category)).size} categories; ${Object.keys(notes).length} complete examples.`);
