import java.util.*;

public final class AlgorithmTests {
    private static int checks = 0;
    private static void require(boolean ok, String message) {
        checks++;
        if (!ok) throw new AssertionError(message);
    }
    private static int bruteRain(int[] a) {
        int total = 0;
        for (int i = 0; i < a.length; i++) {
            int l = 0, r = 0;
            for (int j = 0; j <= i; j++) l = Math.max(l, a[j]);
            for (int j = i; j < a.length; j++) r = Math.max(r, a[j]);
            total += Math.min(l, r) - a[i];
        }
        return total;
    }
    private static int referenceIslands(char[][] a) {
        int count = 0;
        boolean[][] seen = new boolean[a.length][a[0].length];
        for (int r = 0; r < a.length; r++) for (int c = 0; c < a[0].length; c++) {
            if (a[r][c] != '1' || seen[r][c]) continue;
            count++;
            Queue<int[]> queue = new ArrayDeque<>();
            queue.add(new int[] {r, c}); seen[r][c] = true;
            while (!queue.isEmpty()) {
                int[] p = queue.remove();
                int[][] ns = {{p[0]-1,p[1]}, {p[0]+1,p[1]}, {p[0],p[1]-1}, {p[0],p[1]+1}};
                for (int[] n : ns) if (n[0]>=0 && n[0]<a.length && n[1]>=0 && n[1]<a[0].length && !seen[n[0]][n[1]] && a[n[0]][n[1]]=='1') {
                    seen[n[0]][n[1]]=true; queue.add(n);
                }
            }
        }
        return count;
    }
    public static void main(String[] args) {
        Random random = new Random(100);
        TwoSum two = new TwoSum(); MoveZeroes move = new MoveZeroes();
        RainWater rain = new RainWater(); Islands islands = new Islands(); DuplicateNumber duplicate = new DuplicateNumber();
        require(Arrays.equals(two.twoSum(new int[]{2,7,11,15},9),new int[]{0,1}),"two sum example");
        require(rain.trap(new int[]{0,1,0,2,1,0,1,3,2,1,2,1})==6,"rain example");
        require(rain.trap(new int[]{})==0 && rain.trap(new int[]{2})==0,"rain empty and single");
        require(duplicate.findDuplicate(new int[]{1,3,4,2,2})==2,"duplicate example");
        for (int t=0;t<400;t++) {
            int length=2+random.nextInt(25); int[] nums=new int[length];
            for(int i=0;i<length;i++) nums[i]=random.nextInt(41)-20;
            int x=random.nextInt(length), y=(x+1+random.nextInt(length-1))%length;
            int target=nums[x]+nums[y]; int[] pair=two.twoSum(nums,target);
            require(pair[0]!=pair[1] && nums[pair[0]]+nums[pair[1]]==target,"two sum randomized");
            int[] input=new int[length], expected=new int[length]; int write=0;
            for(int i=0;i<length;i++) {input[i]=random.nextInt(7)-3; if(input[i]!=0) expected[write++]=input[i];}
            move.moveZeroes(input); require(Arrays.equals(input,expected),"move zero stable order");
            int[] heights=new int[random.nextInt(40)];
            for(int i=0;i<heights.length;i++) heights[i]=random.nextInt(30);
            require(rain.trap(heights)==bruteRain(heights),"rain differential");
            int rows=1+random.nextInt(9), cols=1+random.nextInt(9); char[][] grid=new char[rows][cols];
            for(int r=0;r<rows;r++) for(int c=0;c<cols;c++) grid[r][c]=random.nextBoolean()?'1':'0';
            int expectedIslands=referenceIslands(grid);
            require(islands.numIslands(grid)==expectedIslands,"islands differential");
            int n=2+random.nextInt(50), repeated=1+random.nextInt(n); int[] cycle=new int[n+1];
            for(int i=0;i<n;i++) cycle[i]=i+1; cycle[n]=repeated;
            for(int i=n;i>0;i--) {int j=random.nextInt(i+1), tmp=cycle[i];cycle[i]=cycle[j];cycle[j]=tmp;}
            require(duplicate.findDuplicate(cycle)==repeated,"duplicate randomized");
        }
        require(islands.numIslands(new char[][]{})==0,"empty grid");
        System.out.println("PASS: " + checks + " Java algorithm assertions across five examples.");
    }
}
