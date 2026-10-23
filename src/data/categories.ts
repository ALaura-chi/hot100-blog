export const categories = [
  ['哈希', 'hash'], ['双指针', 'two-pointers'], ['滑动窗口', 'sliding-window'],
  ['子串', 'substring'], ['普通数组', 'array'], ['矩阵', 'matrix'],
  ['链表', 'linked-list'], ['二叉树', 'binary-tree'], ['图论', 'graph'],
  ['回溯', 'backtracking'], ['二分查找', 'binary-search'], ['栈', 'stack'],
  ['堆', 'heap'], ['贪心算法', 'greedy'], ['动态规划', 'dp'],
  ['多维动态规划', 'multi-dp'], ['技巧', 'tricks'],
].map(([name, slug], index) => ({ name, slug, order: index + 1 }));

export const difficultyLabels = { easy: '简单', medium: '中等', hard: '困难' } as const;
