import java.util.ArrayDeque;
import java.util.Deque;

public final class Islands {
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
