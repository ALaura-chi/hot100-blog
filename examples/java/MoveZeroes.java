public final class MoveZeroes {
    public void moveZeroes(int[] nums) {
        int write = 0;
        for (int value : nums) {
            if (value != 0) nums[write++] = value;
        }
        while (write < nums.length) nums[write++] = 0;
    }
}
