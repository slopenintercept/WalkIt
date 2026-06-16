// Problem templates for the NeetCode-style list. Each template ships with a
// beginner-buggy default (so the divergence flag has something to point at)
// and a working reference solution. Grouped by category for the picker.
//
// Fields:
//   func / argNames / argKinds / retKind   — single-function problems
//   mode:"ops" / className                  — class/method "design" problems
//   compare: exact | index-pair | set | nested-set
//   render: { heap: [varNames] }            — render these lists as heap-trees
//
// argKinds: list | value | string | matrix | tree | linkedlist |
//           linkedlist_cycle | graph

export const TEMPLATES = [
  // ───────────────────────── Arrays & Hashing ─────────────────────────
  {
    id: "two-sum",
    name: "Two Sum",
    group: "Arrays & Hashing",
    func: "two_sum",
    argNames: ["nums", "target"],
    argKinds: ["list", "value"],
    retKind: "list",
    compare: "index-pair",
    description: "Return the indices of the two numbers that add up to target.",
    defaultCode: `def two_sum(nums, target):
    # brute force: check every pair
    for i in range(len(nums)):
        for j in range(i + 1, len(nums) + 1):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
    solutionCode: `def two_sum(nums, target):
    seen = {}  # value -> index
    for i in range(len(nums)):
        need = target - nums[i]
        if need in seen:
            return [seen[need], i]
        seen[nums[i]] = i
    return []`,
    tests: [
      { args: [[2, 7, 11, 15], 26], expected: [2, 3] },
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
    ],
  },
  {
    id: "contains-duplicate",
    name: "Contains Duplicate",
    group: "Arrays & Hashing",
    func: "contains_duplicate",
    argNames: ["nums"],
    argKinds: ["list"],
    retKind: "value",
    description: "Return True if any value appears at least twice.",
    defaultCode: `def contains_duplicate(nums):
    seen = set()
    for n in nums:
        seen.add(n)
    # bug: this is inverted
    return len(seen) == len(nums)`,
    solutionCode: `def contains_duplicate(nums):
    seen = set()
    for n in nums:
        if n in seen:
            return True
        seen.add(n)
    return False`,
    tests: [
      { args: [[1, 2, 3, 1]], expected: true },
      { args: [[1, 2, 3, 4]], expected: false },
      { args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
    ],
  },
  {
    id: "valid-anagram",
    name: "Valid Anagram",
    group: "Arrays & Hashing",
    func: "is_anagram",
    argNames: ["s", "t"],
    argKinds: ["string", "string"],
    retKind: "value",
    description: "Return True if t is an anagram of s.",
    defaultCode: `def is_anagram(s, t):
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for c in t:
        count[c] = count.get(c, 0) - 1
    # bug: never checks the counts actually balanced out
    return True`,
    solutionCode: `def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for c in t:
        count[c] = count.get(c, 0) - 1
        if count[c] < 0:
            return False
    return True`,
    tests: [
      { args: ["rat", "car"], expected: false },
      { args: ["anagram", "nagaram"], expected: true },
      { args: ["ab", "a"], expected: false },
    ],
  },
  {
    id: "group-anagrams",
    name: "Group Anagrams",
    group: "Arrays & Hashing",
    func: "group_anagrams",
    argNames: ["strs"],
    argKinds: ["list"],
    retKind: "list",
    compare: "nested-set",
    description: "Group the strings that are anagrams of each other.",
    defaultCode: `def group_anagrams(strs):
    groups = {}
    for word in strs:
        # bug: keys by the word itself, so nothing groups together
        key = word
        groups.setdefault(key, []).append(word)
    return list(groups.values())`,
    solutionCode: `def group_anagrams(strs):
    groups = {}
    for word in strs:
        key = "".join(sorted(word))
        groups.setdefault(key, []).append(word)
    return list(groups.values())`,
    tests: [
      { args: [["eat", "tea", "tan", "ate", "nat", "bat"]], expected: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]] },
      { args: [[""]], expected: [[""]] },
      { args: [["a"]], expected: [["a"]] },
    ],
  },
  {
    id: "top-k-frequent",
    name: "Top K Frequent Elements",
    group: "Arrays & Hashing",
    func: "top_k_frequent",
    argNames: ["nums", "k"],
    argKinds: ["list", "value"],
    retKind: "list",
    compare: "set",
    description: "Return the k most frequent elements.",
    defaultCode: `def top_k_frequent(nums, k):
    count = {}
    for n in nums:
        count[n] = count.get(n, 0) + 1
    # bug: sorts ascending, so this returns the LEAST frequent
    order = sorted(count, key=lambda x: count[x])
    return order[:k]`,
    solutionCode: `def top_k_frequent(nums, k):
    count = {}
    for n in nums:
        count[n] = count.get(n, 0) + 1
    order = sorted(count, key=lambda x: count[x], reverse=True)
    return order[:k]`,
    tests: [
      { args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
      { args: [[1], 1], expected: [1] },
      { args: [[4, 4, 4, 5, 5, 6], 2], expected: [4, 5] },
    ],
  },
  {
    id: "product-except-self",
    name: "Product of Array Except Self",
    group: "Arrays & Hashing",
    func: "product_except_self",
    argNames: ["nums"],
    argKinds: ["list"],
    retKind: "list",
    description: "answer[i] = product of all elements except nums[i] (no division).",
    defaultCode: `def product_except_self(nums):
    n = len(nums)
    res = [1] * n
    prefix = 1
    for i in range(n):
        res[i] = prefix
        prefix *= nums[i]
    # bug: missing the suffix pass
    return res`,
    solutionCode: `def product_except_self(nums):
    n = len(nums)
    res = [1] * n
    prefix = 1
    for i in range(n):
        res[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        res[i] *= suffix
        suffix *= nums[i]
    return res`,
    tests: [
      { args: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { args: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] },
      { args: [[2, 3, 4]], expected: [12, 8, 6] },
    ],
  },
  {
    id: "longest-consecutive",
    name: "Longest Consecutive Sequence",
    group: "Arrays & Hashing",
    func: "longest_consecutive",
    argNames: ["nums"],
    argKinds: ["list"],
    retKind: "value",
    description: "Length of the longest run of consecutive integers.",
    defaultCode: `def longest_consecutive(nums):
    if not nums:
        return 0
    nums = sorted(nums)
    longest = 1
    current = 1
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1] + 1:
            current += 1
        else:
            current = 1
        longest = max(longest, current)
    # bug: duplicates silently break the run count
    return longest`,
    solutionCode: `def longest_consecutive(nums):
    s = set(nums)
    longest = 0
    for n in s:
        if n - 1 not in s:  # only start counting from a run's start
            length = 1
            while n + length in s:
                length += 1
            longest = max(longest, length)
    return longest`,
    tests: [
      { args: [[1, 2, 0, 1]], expected: 3 },
      { args: [[100, 4, 200, 1, 3, 2]], expected: 4 },
      { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9 },
    ],
  },

  // ───────────────────────── Two Pointers ─────────────────────────
  {
    id: "valid-palindrome",
    name: "Valid Palindrome",
    group: "Two Pointers",
    func: "is_palindrome",
    argNames: ["s"],
    argKinds: ["string"],
    retKind: "value",
    description: "Ignoring case and non-alphanumerics, is s a palindrome?",
    defaultCode: `def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return False
        l += 1
        r -= 1
    # bug: never strips punctuation / case
    return True`,
    solutionCode: `def is_palindrome(s):
    clean = [c.lower() for c in s if c.isalnum()]
    l, r = 0, len(clean) - 1
    while l < r:
        if clean[l] != clean[r]:
            return False
        l += 1
        r -= 1
    return True`,
    tests: [
      { args: ["A man, a plan, a canal: Panama"], expected: true },
      { args: ["race a car"], expected: false },
      { args: ["abba"], expected: true },
    ],
  },
  {
    id: "two-sum-ii",
    name: "Two Sum II (Sorted Input)",
    group: "Two Pointers",
    func: "two_sum",
    argNames: ["numbers", "target"],
    argKinds: ["list", "value"],
    retKind: "list",
    description: "Sorted array — return the two 1-indexed positions summing to target.",
    defaultCode: `def two_sum(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        s = numbers[l] + numbers[r]
        if s == target:
            # bug: problem wants 1-indexed positions
            return [l, r]
        elif s < target:
            l += 1
        else:
            r -= 1
    return []`,
    solutionCode: `def two_sum(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]
        elif s < target:
            l += 1
        else:
            r -= 1
    return []`,
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [1, 2] },
      { args: [[2, 3, 4], 6], expected: [1, 3] },
      { args: [[-1, 0], -1], expected: [1, 2] },
    ],
  },
  {
    id: "container-most-water",
    name: "Container With Most Water",
    group: "Two Pointers",
    func: "max_area",
    argNames: ["height"],
    argKinds: ["list"],
    retKind: "value",
    description: "Most water two lines can hold between them.",
    defaultCode: `def max_area(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        area = min(height[l], height[r]) * (r - l)
        best = max(best, area)
        # bug: moves the taller wall instead of the shorter one
        if height[l] > height[r]:
            l += 1
        else:
            r -= 1
    return best`,
    solutionCode: `def max_area(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        area = min(height[l], height[r]) * (r - l)
        best = max(best, area)
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return best`,
    tests: [
      { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { args: [[1, 1]], expected: 1 },
      { args: [[4, 3, 2, 1, 4]], expected: 16 },
    ],
  },
  {
    id: "three-sum",
    name: "3Sum",
    group: "Two Pointers",
    func: "three_sum",
    argNames: ["nums"],
    argKinds: ["list"],
    retKind: "list",
    compare: "nested-set",
    description: "All unique triplets that sum to zero.",
    defaultCode: `def three_sum(nums):
    nums.sort()
    res = []
    for i in range(len(nums)):
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
    # bug: never skips duplicates -> repeated triplets
    return res`,
    solutionCode: `def three_sum(nums):
    nums.sort()
    res = []
    for i in range(len(nums)):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
    return res`,
    tests: [
      { args: [[-1, 0, 1, 2, -1, -4]], expected: [[-1, -1, 2], [-1, 0, 1]] },
      { args: [[0, 0, 0]], expected: [[0, 0, 0]] },
      { args: [[1, 2, -3, 0]], expected: [[-3, 1, 2]] },
    ],
  },

  // ───────────────────────── Sliding Window ─────────────────────────
  {
    id: "best-time-stock",
    name: "Best Time to Buy/Sell Stock",
    group: "Sliding Window",
    func: "max_profit",
    argNames: ["prices"],
    argKinds: ["list"],
    retKind: "value",
    description: "Max profit from buying on one day and selling on a later day.",
    defaultCode: `def max_profit(prices):
    min_price = 0
    best = 0
    for p in prices:
        if p < min_price:
            min_price = p
        elif p - min_price > best:
            best = p - min_price
    return best`,
    solutionCode: `def max_profit(prices):
    min_price = float('inf')
    best = 0
    for p in prices:
        if p < min_price:
            min_price = p
        elif p - min_price > best:
            best = p - min_price
    return best`,
    tests: [
      { args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { args: [[7, 6, 4, 3, 1]], expected: 0 },
      { args: [[2, 4, 1]], expected: 2 },
    ],
  },
  {
    id: "longest-substring",
    name: "Longest Substring Without Repeating",
    group: "Sliding Window",
    func: "length_of_longest_substring",
    argNames: ["s"],
    argKinds: ["string"],
    retKind: "value",
    description: "Length of the longest substring with no repeated characters.",
    defaultCode: `def length_of_longest_substring(s):
    seen = set()
    longest = 0
    left = 0
    for right in range(len(s)):
        seen.add(s[right])
        # bug: window never shrinks when a repeat appears
        longest = max(longest, right - left + 1)
    return longest`,
    solutionCode: `def length_of_longest_substring(s):
    seen = set()
    longest = 0
    left = 0
    for right in range(len(s)):
        while s[right] in seen:
            seen.remove(s[left])
            left += 1
        seen.add(s[right])
        longest = max(longest, right - left + 1)
    return longest`,
    tests: [
      { args: ["abcabcbb"], expected: 3 },
      { args: ["bbbbb"], expected: 1 },
      { args: ["pwwkew"], expected: 3 },
    ],
  },
  {
    id: "char-replacement",
    name: "Longest Repeating Char Replacement",
    group: "Sliding Window",
    func: "character_replacement",
    argNames: ["s", "k"],
    argKinds: ["string", "value"],
    retKind: "value",
    description: "Longest same-letter run after replacing at most k characters.",
    defaultCode: `def character_replacement(s, k):
    count = {}
    longest = 0
    maxf = 0
    for right in range(len(s)):
        count[s[right]] = count.get(s[right], 0) + 1
        maxf = max(maxf, count[s[right]])
        # bug: assumes the whole prefix is always replaceable
        longest = max(longest, right + 1)
    return longest`,
    solutionCode: `def character_replacement(s, k):
    count = {}
    left = 0
    longest = 0
    maxf = 0
    for right in range(len(s)):
        count[s[right]] = count.get(s[right], 0) + 1
        maxf = max(maxf, count[s[right]])
        while (right - left + 1) - maxf > k:
            count[s[left]] -= 1
            left += 1
        longest = max(longest, right - left + 1)
    return longest`,
    tests: [
      { args: ["AABABBA", 1], expected: 4 },
      { args: ["ABAB", 2], expected: 4 },
      { args: ["AAAA", 0], expected: 4 },
    ],
  },

  // ───────────────────────── Stack ─────────────────────────
  {
    id: "valid-parentheses",
    name: "Valid Parentheses",
    group: "Stack",
    func: "is_valid",
    argNames: ["s"],
    argKinds: ["string"],
    retKind: "value",
    description: "Are the brackets correctly opened and closed?",
    defaultCode: `def is_valid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in pairs:
            if stack and stack[-1] == pairs[c]:
                stack.pop()
            else:
                return False
        else:
            stack.append(c)
    # bug: leftover open brackets are ignored
    return True`,
    solutionCode: `def is_valid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in pairs:
            if stack and stack[-1] == pairs[c]:
                stack.pop()
            else:
                return False
        else:
            stack.append(c)
    return not stack`,
    tests: [
      { args: ["("], expected: false },
      { args: ["()[]{}"], expected: true },
      { args: ["([)]"], expected: false },
    ],
  },
  {
    id: "daily-temperatures",
    name: "Daily Temperatures",
    group: "Stack",
    func: "daily_temperatures",
    argNames: ["temperatures"],
    argKinds: ["list"],
    retKind: "list",
    description: "For each day, how many days until a warmer temperature.",
    defaultCode: `def daily_temperatures(temperatures):
    n = len(temperatures)
    res = [0] * n
    stack = []  # indices
    for i in range(n):
        while stack and temperatures[i] > temperatures[stack[-1]]:
            j = stack.pop()
            # bug: stores the absolute index, not the day gap
            res[j] = i
        stack.append(i)
    return res`,
    solutionCode: `def daily_temperatures(temperatures):
    n = len(temperatures)
    res = [0] * n
    stack = []  # indices
    for i in range(n):
        while stack and temperatures[i] > temperatures[stack[-1]]:
            j = stack.pop()
            res[j] = i - j
        stack.append(i)
    return res`,
    tests: [
      { args: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
      { args: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
      { args: [[30, 60, 90]], expected: [1, 1, 0] },
    ],
  },
  {
    id: "min-stack",
    name: "Min Stack",
    group: "Stack",
    mode: "ops",
    className: "MinStack",
    description: "A stack that also returns its minimum in O(1).",
    defaultCode: `class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val):
        self.stack.append(val)
        # bug: should push the running minimum, not the raw value
        self.min_stack.append(val)

    def pop(self):
        self.stack.pop()
        self.min_stack.pop()

    def top(self):
        return self.stack[-1]

    def getMin(self):
        return self.min_stack[-1]`,
    solutionCode: `class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val):
        self.stack.append(val)
        m = min(val, self.min_stack[-1]) if self.min_stack else val
        self.min_stack.append(m)

    def pop(self):
        self.stack.pop()
        self.min_stack.pop()

    def top(self):
        return self.stack[-1]

    def getMin(self):
        return self.min_stack[-1]`,
    tests: [
      {
        ops: ["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"],
        opArgs: [[], [-2], [0], [-3], [], [], [], []],
        expected: [null, null, null, null, -3, null, 0, -2],
      },
      {
        ops: ["MinStack", "push", "push", "getMin", "pop", "getMin"],
        opArgs: [[], [1], [2], [], [], []],
        expected: [null, null, null, 1, null, 1],
      },
    ],
  },

  // ───────────────────────── Binary Search ─────────────────────────
  {
    id: "binary-search",
    name: "Binary Search",
    group: "Binary Search",
    func: "search",
    argNames: ["nums", "target"],
    argKinds: ["list", "value"],
    retKind: "value",
    description: "Index of target in a sorted array, or -1.",
    defaultCode: `def search(nums, target):
    l, r = 0, len(nums) - 1
    # bug: should be l <= r, so single-element ranges get skipped
    while l < r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1`,
    solutionCode: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1`,
    tests: [
      { args: [[5], 5], expected: 0 },
      { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
    ],
  },
  {
    id: "search-rotated",
    name: "Search in Rotated Sorted Array",
    group: "Binary Search",
    func: "search",
    argNames: ["nums", "target"],
    argKinds: ["list", "value"],
    retKind: "value",
    description: "Search a rotated sorted array in O(log n).",
    defaultCode: `def search(nums, target):
    l, r = 0, len(nums) - 1
    # bug: plain binary search ignores the rotation
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1`,
    solutionCode: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        if nums[l] <= nums[mid]:
            if nums[l] <= target < nums[mid]:
                r = mid - 1
            else:
                l = mid + 1
        else:
            if nums[mid] < target <= nums[r]:
                l = mid + 1
            else:
                r = mid - 1
    return -1`,
    tests: [
      { args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { args: [[1], 1], expected: 0 },
    ],
  },
  {
    id: "find-min-rotated",
    name: "Find Minimum in Rotated Sorted Array",
    group: "Binary Search",
    func: "find_min",
    argNames: ["nums"],
    argKinds: ["list"],
    retKind: "value",
    description: "Find the minimum of a rotated sorted array in O(log n).",
    defaultCode: `def find_min(nums):
    l, r = 0, len(nums) - 1
    while l < r:
        mid = (l + r) // 2
        # bug: compares against the left end, not the right
        if nums[mid] > nums[l]:
            l = mid + 1
        else:
            r = mid
    return nums[l]`,
    solutionCode: `def find_min(nums):
    l, r = 0, len(nums) - 1
    while l < r:
        mid = (l + r) // 2
        if nums[mid] > nums[r]:
            l = mid + 1
        else:
            r = mid
    return nums[l]`,
    tests: [
      { args: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
      { args: [[3, 4, 5, 1, 2]], expected: 1 },
      { args: [[11, 13, 15, 17]], expected: 11 },
    ],
  },

  // ───────────────────────── Linked List ─────────────────────────
  {
    id: "reverse-linked-list",
    name: "Reverse Linked List",
    group: "Linked List",
    func: "reverse_list",
    argNames: ["head"],
    argKinds: ["linkedlist"],
    retKind: "linkedlist",
    description: "Reverse a singly linked list and return the new head.",
    defaultCode: `def reverse_list(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return head`,
    solutionCode: `def reverse_list(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev`,
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { args: [[1, 2]], expected: [2, 1] },
      { args: [[]], expected: [] },
    ],
  },
  {
    id: "merge-two-lists",
    name: "Merge Two Sorted Lists",
    group: "Linked List",
    func: "merge_two_lists",
    argNames: ["list1", "list2"],
    argKinds: ["linkedlist", "linkedlist"],
    retKind: "linkedlist",
    description: "Merge two sorted lists into one sorted list.",
    defaultCode: `def merge_two_lists(list1, list2):
    dummy = ListNode()
    tail = dummy
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next = list1
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    # bug: forgets to attach the leftover list
    return dummy.next`,
    solutionCode: `def merge_two_lists(list1, list2):
    dummy = ListNode()
    tail = dummy
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next = list1
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    tail.next = list1 or list2
    return dummy.next`,
    tests: [
      { args: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4] },
      { args: [[], []], expected: [] },
      { args: [[5], [1, 2, 3]], expected: [1, 2, 3, 5] },
    ],
  },
  {
    id: "remove-nth-node",
    name: "Remove Nth Node From End",
    group: "Linked List",
    func: "remove_nth_from_end",
    argNames: ["head", "n"],
    argKinds: ["linkedlist", "value"],
    retKind: "linkedlist",
    description: "Remove the nth node from the end and return the head.",
    defaultCode: `def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    fast = dummy
    slow = dummy
    for _ in range(n):
        fast = fast.next
    # bug: should be 'while fast.next' so slow stops one before the target
    while fast:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next`,
    solutionCode: `def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    fast = dummy
    slow = dummy
    for _ in range(n):
        fast = fast.next
    while fast.next:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next`,
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] },
      { args: [[1], 1], expected: [] },
      { args: [[1, 2], 1], expected: [1] },
    ],
  },
  {
    id: "linked-list-cycle",
    name: "Linked List Cycle",
    group: "Linked List",
    func: "has_cycle",
    argNames: ["head"],
    argKinds: ["linkedlist_cycle"],
    retKind: "value",
    description: "Does the list contain a cycle? Input is [values, cyclePos].",
    defaultCode: `def has_cycle(head):
    count = 0
    node = head
    # bug: a single pointer never detects a cycle -- it loops forever
    while node:
        count += 1
        node = node.next
    return False`,
    solutionCode: `def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
    tests: [
      { args: [[[3, 2, 0, -4], 1]], expected: true },
      { args: [[[1, 2], 0]], expected: true },
      { args: [[[1], -1]], expected: false },
    ],
  },
  {
    id: "reorder-list",
    name: "Reorder List",
    group: "Linked List",
    func: "reorder_list",
    argNames: ["head"],
    argKinds: ["linkedlist"],
    retKind: "linkedlist",
    description: "Reorder L0→Ln→L1→Ln-1→… in place; returns the head.",
    defaultCode: `def reorder_list(head):
    # bug: this only reverses the list; reorder must interleave the halves
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
    solutionCode: `def reorder_list(head):
    if not head or not head.next:
        return head
    slow, fast = head, head.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    second = slow.next
    slow.next = None
    prev = None
    while second:
        nxt = second.next
        second.next = prev
        prev = second
        second = nxt
    first, second = head, prev
    while second:
        t1, t2 = first.next, second.next
        first.next = second
        second.next = t1
        first, second = t1, t2
    return head`,
    tests: [
      { args: [[1, 2, 3, 4]], expected: [1, 4, 2, 3] },
      { args: [[1, 2, 3, 4, 5]], expected: [1, 5, 2, 4, 3] },
      { args: [[1, 2]], expected: [1, 2] },
    ],
  },
  {
    id: "lru-cache",
    name: "LRU Cache",
    group: "Linked List",
    mode: "ops",
    className: "LRUCache",
    description: "Least-recently-used cache with get/put in O(1).",
    defaultCode: `class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}

    def get(self, key):
        if key in self.cache:
            # bug: a get should mark the key as most-recently-used
            return self.cache[key]
        return -1

    def put(self, key, value):
        if key not in self.cache and len(self.cache) >= self.cap:
            oldest = next(iter(self.cache))
            del self.cache[oldest]
        self.cache[key] = value`,
    solutionCode: `class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}

    def get(self, key):
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val  # move to most-recent
        return val

    def put(self, key, value):
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.cap:
            oldest = next(iter(self.cache))
            del self.cache[oldest]
        self.cache[key] = value`,
    tests: [
      {
        ops: ["LRUCache", "put", "put", "get", "put", "get", "get"],
        opArgs: [[2], [1, 1], [2, 2], [1], [3, 3], [2], [3]],
        expected: [null, null, null, 1, null, -1, 3],
      },
    ],
  },

  // ───────────────────────── Trees ─────────────────────────
  {
    id: "max-depth",
    name: "Maximum Depth of Binary Tree",
    group: "Trees",
    func: "max_depth",
    argNames: ["root"],
    argKinds: ["tree"],
    retKind: "value",
    description: "Number of nodes along the longest root-to-leaf path.",
    defaultCode: `def max_depth(root):
    if not root:
        return 0
    # bug: forgot to add 1 for the current node
    return max(max_depth(root.left), max_depth(root.right))`,
    solutionCode: `def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
      { args: [[1, null, 2]], expected: 2 },
      { args: [[]], expected: 0 },
    ],
  },
  {
    id: "same-tree",
    name: "Same Tree",
    group: "Trees",
    func: "is_same_tree",
    argNames: ["p", "q"],
    argKinds: ["tree", "tree"],
    retKind: "value",
    description: "Are the two trees structurally identical with equal values?",
    defaultCode: `def is_same_tree(p, q):
    if not p and not q:
        return True
    if not p or not q:
        return False
    if p.val != q.val:
        return False
    # bug: 'or' lets one matching side hide a mismatch on the other
    return is_same_tree(p.left, q.left) or is_same_tree(p.right, q.right)`,
    solutionCode: `def is_same_tree(p, q):
    if not p and not q:
        return True
    if not p or not q:
        return False
    if p.val != q.val:
        return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)`,
    tests: [
      { args: [[1, 2, 3], [1, 2, 4]], expected: false },
      { args: [[1, 2, 3], [1, 2, 3]], expected: true },
      { args: [[1, 2], [1, null, 2]], expected: false },
    ],
  },
  {
    id: "invert-tree",
    name: "Invert Binary Tree",
    group: "Trees",
    func: "invert_tree",
    argNames: ["root"],
    argKinds: ["tree"],
    retKind: "tree",
    description: "Mirror the tree left-to-right.",
    defaultCode: `def invert_tree(root):
    if not root:
        return None
    root.left, root.right = root.right, root.left
    # bug: never recurses into the children
    return root`,
    solutionCode: `def invert_tree(root):
    if not root:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root`,
    tests: [
      { args: [[4, 2, 7, 1, 3, 6, 9]], expected: [4, 7, 2, 9, 6, 3, 1] },
      { args: [[1, 2]], expected: [1, null, 2] },
      { args: [[]], expected: [] },
    ],
  },
  {
    id: "balanced-tree",
    name: "Balanced Binary Tree",
    group: "Trees",
    func: "is_balanced",
    argNames: ["root"],
    argKinds: ["tree"],
    retKind: "value",
    description: "Is every node's two subtrees' heights within 1?",
    defaultCode: `def is_balanced(root):
    def height(node):
        if not node:
            return 0
        return 1 + max(height(node.left), height(node.right))
    if not root:
        return True
    # bug: only checks the root, not every subtree
    return abs(height(root.left) - height(root.right)) <= 1`,
    solutionCode: `def is_balanced(root):
    def check(node):
        if not node:
            return 0
        lh = check(node.left)
        rh = check(node.right)
        if lh == -1 or rh == -1 or abs(lh - rh) > 1:
            return -1
        return 1 + max(lh, rh)
    return check(root) != -1`,
    tests: [
      { args: [[1, 2, 2, 3, null, null, 3, 4, null, null, 4]], expected: false },
      { args: [[3, 9, 20, null, null, 15, 7]], expected: true },
      { args: [[]], expected: true },
    ],
  },
  {
    id: "diameter-tree",
    name: "Diameter of Binary Tree",
    group: "Trees",
    func: "diameter_of_binary_tree",
    argNames: ["root"],
    argKinds: ["tree"],
    retKind: "value",
    description: "Longest path (in edges) between any two nodes.",
    defaultCode: `def diameter_of_binary_tree(root):
    def height(node):
        if not node:
            return 0
        return 1 + max(height(node.left), height(node.right))
    if not root:
        return 0
    # bug: only measures the path through the root
    return height(root.left) + height(root.right)`,
    solutionCode: `def diameter_of_binary_tree(root):
    best = 0
    def height(node):
        nonlocal best
        if not node:
            return 0
        lh = height(node.left)
        rh = height(node.right)
        best = max(best, lh + rh)
        return 1 + max(lh, rh)
    height(root)
    return best`,
    tests: [
      { args: [[1, 2, null, 3, 4, 5, null, null, 6]], expected: 4 },
      { args: [[1, 2, 3, 4, 5]], expected: 3 },
      { args: [[1]], expected: 0 },
    ],
  },
  {
    id: "level-order",
    name: "Binary Tree Level Order Traversal",
    group: "Trees",
    func: "level_order",
    argNames: ["root"],
    argKinds: ["tree"],
    retKind: "list",
    description: "Return node values grouped by level, top to bottom.",
    defaultCode: `def level_order(root):
    if not root:
        return []
    res = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        # bug: appends into one flat list instead of grouping by level
        res.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return res`,
    solutionCode: `def level_order(root):
    if not root:
        return []
    res = []
    queue = [root]
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.pop(0)
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        res.append(level)
    return res`,
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]] },
      { args: [[1]], expected: [[1]] },
      { args: [[]], expected: [] },
    ],
  },
  {
    id: "right-side-view",
    name: "Binary Tree Right Side View",
    group: "Trees",
    func: "right_side_view",
    argNames: ["root"],
    argKinds: ["tree"],
    retKind: "list",
    description: "Values visible from the right side, top to bottom.",
    defaultCode: `def right_side_view(root):
    res = []
    node = root
    # bug: only follows right children -- misses deeper left-subtree nodes
    while node:
        res.append(node.val)
        node = node.right
    return res`,
    solutionCode: `def right_side_view(root):
    if not root:
        return []
    res = []
    queue = [root]
    while queue:
        res.append(queue[-1].val)
        nxt = []
        for node in queue:
            if node.left:
                nxt.append(node.left)
            if node.right:
                nxt.append(node.right)
        queue = nxt
    return res`,
    tests: [
      { args: [[1, 2, 3, 4]], expected: [1, 3, 4] },
      { args: [[1, 2, 3, null, 5, null, 4]], expected: [1, 3, 4] },
      { args: [[]], expected: [] },
    ],
  },
  {
    id: "validate-bst",
    name: "Validate Binary Search Tree",
    group: "Trees",
    func: "is_valid_bst",
    argNames: ["root"],
    argKinds: ["tree"],
    retKind: "value",
    description: "Is the tree a valid binary search tree?",
    defaultCode: `def is_valid_bst(root):
    if not root:
        return True
    # bug: only compares against immediate children, not the whole range
    if root.left and root.left.val >= root.val:
        return False
    if root.right and root.right.val <= root.val:
        return False
    return is_valid_bst(root.left) and is_valid_bst(root.right)`,
    solutionCode: `def is_valid_bst(root):
    def valid(node, low, high):
        if not node:
            return True
        if not (low < node.val < high):
            return False
        return valid(node.left, low, node.val) and valid(node.right, node.val, high)
    return valid(root, float('-inf'), float('inf'))`,
    tests: [
      { args: [[5, 4, 6, null, null, 3, 7]], expected: false },
      { args: [[2, 1, 3]], expected: true },
      { args: [[5, 1, 4, null, null, 3, 6]], expected: false },
    ],
  },
  {
    id: "kth-smallest-bst",
    name: "Kth Smallest Element in a BST",
    group: "Trees",
    func: "kth_smallest",
    argNames: ["root", "k"],
    argKinds: ["tree", "value"],
    retKind: "value",
    description: "The kth smallest value (1-indexed) in a BST.",
    defaultCode: `def kth_smallest(root, k):
    res = []
    def inorder(node):
        if not node:
            return
        inorder(node.left)
        res.append(node.val)
        inorder(node.right)
    inorder(root)
    # bug: off by one -- k is 1-indexed
    return res[k]`,
    solutionCode: `def kth_smallest(root, k):
    res = []
    def inorder(node):
        if not node:
            return
        inorder(node.left)
        res.append(node.val)
        inorder(node.right)
    inorder(root)
    return res[k - 1]`,
    tests: [
      { args: [[3, 1, 4, null, 2], 1], expected: 1 },
      { args: [[5, 3, 6, 2, 4, null, null, 1], 3], expected: 3 },
      { args: [[1], 1], expected: 1 },
    ],
  },
  {
    id: "lca-bst",
    name: "Lowest Common Ancestor of a BST",
    group: "Trees",
    func: "lowest_common_ancestor",
    argNames: ["root", "p", "q"],
    argKinds: ["tree", "value", "value"],
    retKind: "value",
    description: "Value of the lowest common ancestor of p and q in a BST.",
    defaultCode: `def lowest_common_ancestor(root, p, q):
    node = root
    while node:
        if p < node.val and q < node.val:
            node = node.left
        elif p > node.val and q > node.val:
            # bug: both are larger, so we should go right
            node = node.left
        else:
            return node.val
    return None`,
    solutionCode: `def lowest_common_ancestor(root, p, q):
    node = root
    while node:
        if p < node.val and q < node.val:
            node = node.left
        elif p > node.val and q > node.val:
            node = node.right
        else:
            return node.val
    return None`,
    tests: [
      { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 7, 9], expected: 8 },
      { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8], expected: 6 },
      { args: [[2, 1, 3], 1, 3], expected: 2 },
    ],
  },
  {
    id: "subtree",
    name: "Subtree of Another Tree",
    group: "Trees",
    func: "is_subtree",
    argNames: ["root", "sub_root"],
    argKinds: ["tree", "tree"],
    retKind: "value",
    description: "Is sub_root an exact subtree of root?",
    defaultCode: `def is_subtree(root, sub_root):
    def same(a, b):
        if not a and not b:
            return True
        if not a or not b:
            return False
        return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)
    # bug: only compares from the root, never tries deeper nodes
    return same(root, sub_root)`,
    solutionCode: `def is_subtree(root, sub_root):
    def same(a, b):
        if not a and not b:
            return True
        if not a or not b:
            return False
        return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)
    if not sub_root:
        return True
    if not root:
        return False
    if same(root, sub_root):
        return True
    return is_subtree(root.left, sub_root) or is_subtree(root.right, sub_root)`,
    tests: [
      { args: [[3, 4, 5, 1, 2], [4, 1, 2]], expected: true },
      { args: [[3, 4, 5, 1, 2, null, null, null, null, 0], [4, 1, 2]], expected: false },
      { args: [[1, 1], [1]], expected: true },
    ],
  },
  {
    id: "good-nodes",
    name: "Count Good Nodes in Binary Tree",
    group: "Trees",
    func: "good_nodes",
    argNames: ["root"],
    argKinds: ["tree"],
    retKind: "value",
    description: "Count nodes with no larger value on the path from the root.",
    defaultCode: `def good_nodes(root):
    def dfs(node, parent_val):
        if not node:
            return 0
        good = 1 if node.val >= parent_val else 0
        # bug: passes the parent value, not the running max on the path
        return good + dfs(node.left, node.val) + dfs(node.right, node.val)
    return dfs(root, root.val)`,
    solutionCode: `def good_nodes(root):
    def dfs(node, best):
        if not node:
            return 0
        good = 1 if node.val >= best else 0
        best = max(best, node.val)
        return good + dfs(node.left, best) + dfs(node.right, best)
    return dfs(root, root.val)`,
    tests: [
      { args: [[3, 1, 4, 2]], expected: 2 },
      { args: [[3, 1, 4, 3, null, 1, 5]], expected: 4 },
      { args: [[1]], expected: 1 },
    ],
  },

  // ───────────────────────── Heap / Priority Queue ─────────────────────────
  {
    id: "last-stone-weight",
    name: "Last Stone Weight",
    group: "Heap",
    func: "last_stone_weight",
    argNames: ["stones"],
    argKinds: ["list"],
    retKind: "value",
    description: "Smash the two heaviest stones until ≤1 remains.",
    defaultCode: `import heapq

def last_stone_weight(stones):
    # bug: heapq is a MIN-heap, so this smashes the lightest stones
    heapq.heapify(stones)
    while len(stones) > 1:
        a = heapq.heappop(stones)
        b = heapq.heappop(stones)
        if a != b:
            heapq.heappush(stones, abs(a - b))
    return stones[0] if stones else 0`,
    solutionCode: `import heapq

def last_stone_weight(stones):
    heap = [-s for s in stones]
    heapq.heapify(heap)
    while len(heap) > 1:
        a = -heapq.heappop(heap)
        b = -heapq.heappop(heap)
        if a != b:
            heapq.heappush(heap, -(a - b))
    return -heap[0] if heap else 0`,
    tests: [
      { args: [[2, 7, 4, 1, 8, 1]], expected: 1 },
      { args: [[1]], expected: 1 },
      { args: [[3, 3]], expected: 0 },
    ],
  },
  {
    id: "kth-largest",
    name: "Kth Largest Element in an Array",
    group: "Heap",
    func: "find_kth_largest",
    argNames: ["nums", "k"],
    argKinds: ["list", "value"],
    retKind: "value",
    render: { heap: ["heap", "h", "pq"] },
    description: "Return the kth largest element.",
    defaultCode: `import heapq

def find_kth_largest(nums, k):
    # bug: nsmallest returns the kth SMALLEST, not largest
    return heapq.nsmallest(k, nums)[-1]`,
    solutionCode: `import heapq

def find_kth_largest(nums, k):
    heap = []
    for n in nums:
        heapq.heappush(heap, n)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`,
    tests: [
      { args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
      { args: [[1], 1], expected: 1 },
    ],
  },
  {
    id: "kth-largest-stream",
    name: "Kth Largest Element in a Stream",
    group: "Heap",
    mode: "ops",
    className: "KthLargest",
    render: { heap: ["heap", "h", "pq"] },
    description: "Stream of adds; each returns the kth largest so far.",
    defaultCode: `import heapq

class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.heap = nums
        heapq.heapify(self.heap)

    def add(self, val):
        heapq.heappush(self.heap, val)
        # bug: never trims to size k, so this returns the overall minimum
        return self.heap[0]`,
    solutionCode: `import heapq

class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.heap = nums
        heapq.heapify(self.heap)
        while len(self.heap) > k:
            heapq.heappop(self.heap)

    def add(self, val):
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]`,
    tests: [
      {
        ops: ["KthLargest", "add", "add", "add", "add", "add"],
        opArgs: [[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]],
        expected: [null, 4, 5, 5, 8, 8],
      },
    ],
  },

  // ───────────────────────── Graphs ─────────────────────────
  {
    id: "clone-graph",
    name: "Clone Graph",
    group: "Graphs",
    func: "clone_graph",
    argNames: ["node"],
    argKinds: ["graph"],
    retKind: "graph",
    description: "Deep-copy a connected undirected graph (adjacency list input).",
    defaultCode: `def clone_graph(node):
    if not node:
        return None
    seen = {}
    def dfs(n):
        if n in seen:
            return seen[n]
        copy = Node(n.val)
        seen[n] = copy
        # bug: never clones the neighbors
        return copy
    return dfs(node)`,
    solutionCode: `def clone_graph(node):
    if not node:
        return None
    seen = {}
    def dfs(n):
        if n in seen:
            return seen[n]
        copy = Node(n.val)
        seen[n] = copy
        for nb in n.neighbors:
            copy.neighbors.append(dfs(nb))
        return copy
    return dfs(node)`,
    tests: [
      { args: [[[2, 4], [1, 3], [2, 4], [1, 3]]], expected: [[2, 4], [1, 3], [2, 4], [1, 3]] },
      { args: [[[2], [1]]], expected: [[2], [1]] },
      { args: [[[]]], expected: [[]] },
    ],
  },
  {
    id: "course-schedule",
    name: "Course Schedule",
    group: "Graphs",
    func: "can_finish",
    argNames: ["num_courses", "prerequisites"],
    argKinds: ["value", "matrix"],
    retKind: "value",
    description: "Can all courses be finished (no prerequisite cycle)?",
    defaultCode: `def can_finish(num_courses, prerequisites):
    graph = {i: [] for i in range(num_courses)}
    for a, b in prerequisites:
        graph[a].append(b)
    visited = set()
    def dfs(c):
        if c in visited:
            # bug: a previously-seen node isn't necessarily a cycle
            return True
        visited.add(c)
        for nxt in graph[c]:
            if not dfs(nxt):
                return False
        return True
    for c in range(num_courses):
        if not dfs(c):
            return False
    return True`,
    solutionCode: `def can_finish(num_courses, prerequisites):
    graph = {i: [] for i in range(num_courses)}
    for a, b in prerequisites:
        graph[a].append(b)
    state = [0] * num_courses  # 0 unvisited, 1 in-progress, 2 done
    def dfs(c):
        if state[c] == 1:
            return False
        if state[c] == 2:
            return True
        state[c] = 1
        for nxt in graph[c]:
            if not dfs(nxt):
                return False
        state[c] = 2
        return True
    for c in range(num_courses):
        if not dfs(c):
            return False
    return True`,
    tests: [
      { args: [2, [[1, 0], [0, 1]]], expected: false },
      { args: [2, [[1, 0]]], expected: true },
      { args: [4, [[1, 0], [2, 1], [3, 2]]], expected: true },
    ],
  },
  {
    id: "course-schedule-ii",
    name: "Course Schedule II",
    group: "Graphs",
    func: "find_order",
    argNames: ["num_courses", "prerequisites"],
    argKinds: ["value", "matrix"],
    retKind: "list",
    description: "A valid course order, or [] if impossible.",
    defaultCode: `def find_order(num_courses, prerequisites):
    graph = {i: [] for i in range(num_courses)}
    for a, b in prerequisites:
        graph[a].append(b)
    visited = set()
    order = []
    def dfs(c):
        visited.add(c)
        for nxt in graph[c]:
            if nxt not in visited:
                dfs(nxt)
        order.append(c)
    for c in range(num_courses):
        if c not in visited:
            dfs(c)
    # bug: this reverses a correct topological order
    return order[::-1]`,
    solutionCode: `def find_order(num_courses, prerequisites):
    graph = {i: [] for i in range(num_courses)}
    for a, b in prerequisites:
        graph[a].append(b)
    state = [0] * num_courses
    order = []
    ok = True
    def dfs(c):
        nonlocal ok
        if state[c] == 1:
            ok = False
            return
        if state[c] == 2:
            return
        state[c] = 1
        for nxt in graph[c]:
            dfs(nxt)
        state[c] = 2
        order.append(c)
    for c in range(num_courses):
        if state[c] == 0:
            dfs(c)
    return order if ok else []`,
    tests: [
      { args: [2, [[1, 0]]], expected: [0, 1] },
      { args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: [0, 1, 2, 3] },
      { args: [2, [[1, 0], [0, 1]]], expected: [] },
    ],
  },

  // ───────────────────────── Matrix ─────────────────────────
  {
    id: "number-of-islands",
    name: "Number of Islands",
    group: "Matrix",
    func: "num_islands",
    argNames: ["grid"],
    argKinds: ["matrix"],
    retKind: "value",
    description: 'Count islands of "1" cells (4-directionally connected).',
    defaultCode: `def num_islands(grid):
    if not grid:
        return 0
    count = 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            # bug: counts every land cell instead of flooding each island
            if grid[r][c] == "1":
                count += 1
    return count`,
    solutionCode: `def num_islands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    def sink(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != "1":
            return
        grid[r][c] = "0"
        sink(r + 1, c)
        sink(r - 1, c)
        sink(r, c + 1)
        sink(r, c - 1)
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                count += 1
                sink(r, c)
    return count`,
    tests: [
      { args: [[["1", "1", "0"], ["1", "0", "0"], ["0", "0", "1"]]], expected: 2 },
      { args: [[["1", "1", "1"], ["0", "1", "0"], ["0", "0", "0"]]], expected: 1 },
      { args: [[["0", "0"], ["0", "0"]]], expected: 0 },
    ],
  },
  {
    id: "max-area-island",
    name: "Max Area of Island",
    group: "Matrix",
    func: "max_area_of_island",
    argNames: ["grid"],
    argKinds: ["matrix"],
    retKind: "value",
    description: "Area of the largest island of 1s.",
    defaultCode: `def max_area_of_island(grid):
    rows, cols = len(grid), len(grid[0])
    def area(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != 1:
            return 0
        grid[r][c] = 0
        # bug: forgot to count the current cell (the +1)
        return area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1)
    best = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                best = max(best, area(r, c))
    return best`,
    solutionCode: `def max_area_of_island(grid):
    rows, cols = len(grid), len(grid[0])
    def area(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != 1:
            return 0
        grid[r][c] = 0
        return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1)
    best = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                best = max(best, area(r, c))
    return best`,
    tests: [
      { args: [[[0, 1, 0], [1, 1, 0], [0, 0, 1]]], expected: 3 },
      { args: [[[0, 0], [0, 0]]], expected: 0 },
      { args: [[[1, 1], [1, 1]]], expected: 4 },
    ],
  },
  {
    id: "surrounded-regions",
    name: "Surrounded Regions",
    group: "Matrix",
    func: "solve",
    argNames: ["board"],
    argKinds: ["matrix"],
    retKind: "matrix",
    description: 'Flip every "O" not connected to a border into "X".',
    defaultCode: `def solve(board):
    for r in range(len(board)):
        for c in range(len(board[0])):
            # bug: flips border-connected regions too
            if board[r][c] == "O":
                board[r][c] = "X"
    return board`,
    solutionCode: `def solve(board):
    if not board:
        return board
    rows, cols = len(board), len(board[0])
    def mark(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or board[r][c] != "O":
            return
        board[r][c] = "S"
        mark(r + 1, c)
        mark(r - 1, c)
        mark(r, c + 1)
        mark(r, c - 1)
    for r in range(rows):
        mark(r, 0)
        mark(r, cols - 1)
    for c in range(cols):
        mark(0, c)
        mark(rows - 1, c)
    for r in range(rows):
        for c in range(cols):
            if board[r][c] == "O":
                board[r][c] = "X"
            elif board[r][c] == "S":
                board[r][c] = "O"
    return board`,
    tests: [
      {
        args: [[["X", "X", "X", "X"], ["X", "O", "O", "X"], ["X", "X", "O", "X"], ["X", "O", "X", "X"]]],
        expected: [["X", "X", "X", "X"], ["X", "X", "X", "X"], ["X", "X", "X", "X"], ["X", "O", "X", "X"]],
      },
      { args: [[["O", "O"], ["O", "O"]]], expected: [["O", "O"], ["O", "O"]] },
    ],
  },
  {
    id: "valid-sudoku",
    name: "Valid Sudoku",
    group: "Matrix",
    func: "is_valid_sudoku",
    argNames: ["board"],
    argKinds: ["matrix"],
    retKind: "value",
    description: "Is the partially filled 9×9 board valid?",
    defaultCode: `def is_valid_sudoku(board):
    for i in range(9):
        row = [x for x in board[i] if x != "."]
        if len(row) != len(set(row)):
            return False
        col = [board[j][i] for j in range(9) if board[j][i] != "."]
        if len(col) != len(set(col)):
            return False
    # bug: never checks the 3x3 boxes
    return True`,
    solutionCode: `def is_valid_sudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == ".":
                continue
            b = (r // 3) * 3 + c // 3
            if v in rows[r] or v in cols[c] or v in boxes[b]:
                return False
            rows[r].add(v)
            cols[c].add(v)
            boxes[b].add(v)
    return True`,
    tests: [
      {
        // invalid by 3x3 box only: two 1s share the top-left box but no row/col
        args: [[
          ["1", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", "1", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
        ]],
        expected: false,
      },
      {
        args: [[
          ["5", "3", ".", ".", "7", ".", ".", ".", "."],
          ["6", ".", ".", "1", "9", "5", ".", ".", "."],
          [".", "9", "8", ".", ".", ".", ".", "6", "."],
          ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
          ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
          ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
          [".", "6", ".", ".", ".", ".", "2", "8", "."],
          [".", ".", ".", "4", "1", "9", ".", ".", "5"],
          [".", ".", ".", ".", "8", ".", ".", "7", "9"],
        ]],
        expected: true,
      },
    ],
  },
  {
    id: "pacific-atlantic",
    name: "Pacific Atlantic Water Flow",
    group: "Matrix",
    func: "pacific_atlantic",
    argNames: ["heights"],
    argKinds: ["matrix"],
    retKind: "list",
    compare: "nested-set",
    description: "Cells from which water can reach both oceans.",
    defaultCode: `def pacific_atlantic(heights):
    rows, cols = len(heights), len(heights[0])
    res = []
    for r in range(rows):
        for c in range(cols):
            # bug: only the corner cells trivially touch both borders --
            # there's no flow simulation at all
            touches_pac = r == 0 or c == 0
            touches_atl = r == rows - 1 or c == cols - 1
            if touches_pac and touches_atl:
                res.append([r, c])
    return res`,
    solutionCode: `def pacific_atlantic(heights):
    if not heights:
        return []
    rows, cols = len(heights), len(heights[0])
    pac, atl = set(), set()
    def dfs(r, c, seen, prev):
        if (r < 0 or c < 0 or r >= rows or c >= cols or
                (r, c) in seen or heights[r][c] < prev):
            return
        seen.add((r, c))
        dfs(r + 1, c, seen, heights[r][c])
        dfs(r - 1, c, seen, heights[r][c])
        dfs(r, c + 1, seen, heights[r][c])
        dfs(r, c - 1, seen, heights[r][c])
    for c in range(cols):
        dfs(0, c, pac, heights[0][c])
        dfs(rows - 1, c, atl, heights[rows - 1][c])
    for r in range(rows):
        dfs(r, 0, pac, heights[r][0])
        dfs(r, cols - 1, atl, heights[r][cols - 1])
    return [[r, c] for r in range(rows) for c in range(cols)
            if (r, c) in pac and (r, c) in atl]`,
    tests: [
      {
        args: [[[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]],
        expected: [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]],
      },
      { args: [[[1]]], expected: [[0, 0]] },
    ],
  },
];

export function testLabel(template, test) {
  if (template.mode === "ops") {
    const ctor = test.opArgs[0];
    const calls = test.ops.length - 1;
    return `new ${template.className}(${JSON.stringify(ctor).slice(1, -1)}) · ${calls} ops`;
  }
  const parts = template.argNames.map((nm, i) => {
    let v = JSON.stringify(test.args[i]);
    if (v && v.length > 22) v = v.slice(0, 21) + "…";
    return `${nm}=${v}`;
  });
  return parts.join(", ");
}

export const GROUPS = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Heap",
  "Graphs",
  "Matrix",
];
