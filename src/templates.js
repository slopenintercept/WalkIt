// Problem templates for the NeetCode-style list. Each template ships with a
// beginner-buggy default (so the divergence flag has something to point at)
// and a working reference solution. Grouped by category for the picker.
//
// Fields:
//   lc                                      — LeetCode number (searchable in the picker)
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
    lc: 1,
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
    lc: 217,
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
    lc: 242,
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
    lc: 49,
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
    lc: 347,
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
    lc: 238,
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
    lc: 128,
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

  {
    id: "adjacent-same-color",
    name: "Number of Adjacent Elements With the Same Color",
    lc: 2672,
    group: "Arrays & Hashing",
    func: "color_the_array",
    argNames: ["n", "queries"],
    argKinds: ["value", "matrix"],
    retKind: "list",
    description: "Count adjacent equal-color pairs after each paint; uncolored cells never match.",
    defaultCode: `def color_the_array(n, queries):
    colors = [0] * n
    res = []
    for i in range(len(queries)):
        colors[queries[i][0]] = queries[i][1]
        count = 0
        for j in range(n - 1):
            # bug: two still-uncolored neighbors are both 0, so they match
            if colors[j] == colors[j + 1]:
                count += 1
        res.append(count)
    return res`,
    solutionCode: `def color_the_array(n, queries):
    colors = [0] * n  # 0 means "not painted yet"
    res = []
    count = 0
    for i in range(len(queries)):
        idx = queries[i][0]
        color = queries[i][1]
        # drop the matches this cell is part of right now
        if colors[idx] != 0:
            if idx > 0 and colors[idx - 1] == colors[idx]:
                count -= 1
            if idx < n - 1 and colors[idx + 1] == colors[idx]:
                count -= 1
        colors[idx] = color
        # a painted cell can only match a painted neighbour, so 0s never count
        if idx > 0 and colors[idx - 1] == colors[idx]:
            count += 1
        if idx < n - 1 and colors[idx + 1] == colors[idx]:
            count += 1
        res.append(count)
    return res`,
    tests: [
      { args: [4, [[0, 2], [1, 2], [3, 1], [1, 1]]], expected: [0, 1, 1, 0] },
      { args: [3, [[0, 5], [1, 5], [2, 5]]], expected: [0, 1, 2] },
      { args: [1, [[0, 7]]], expected: [0] },
    ],
  },
  {
    id: "monotonic-array",
    name: "Monotonic Array",
    lc: 896,
    group: "Arrays & Hashing",
    func: "is_monotonic",
    argNames: ["nums"],
    argKinds: ["list"],
    retKind: "value",
    description: "Return True if nums never goes up or never goes down.",
    defaultCode: `def is_monotonic(nums):
    # bug: only the non-decreasing case is checked, so [6,5,4,4] is rejected
    for i in range(1, len(nums)):
        if nums[i] < nums[i - 1]:
            return False
    return True`,
    solutionCode: `def is_monotonic(nums):
    inc = True  # still possible that nums never goes down
    dec = True  # still possible that nums never goes up
    for i in range(1, len(nums)):
        if nums[i] < nums[i - 1]:
            inc = False
        if nums[i] > nums[i - 1]:
            dec = False
    return inc or dec`,
    tests: [
      { args: [[6, 5, 4, 4]], expected: true },
      { args: [[1, 2, 2, 3]], expected: true },
      { args: [[1, 3, 2]], expected: false },
    ],
  },
  {
    id: "subarray-sum-k",
    name: "Subarray Sum Equals K",
    lc: 560,
    group: "Arrays & Hashing",
    func: "subarray_sum",
    argNames: ["nums", "k"],
    argKinds: ["list", "value"],
    retKind: "value",
    description: "Count the contiguous subarrays whose sum equals k.",
    defaultCode: `def subarray_sum(nums, k):
    # bug: the empty prefix (sum 0) is never recorded, so subarrays
    # that start at index 0 are missed
    counts = {}
    total = 0
    res = 0
    for i in range(len(nums)):
        total += nums[i]
        res += counts.get(total - k, 0)
        counts[total] = counts.get(total, 0) + 1
    return res`,
    solutionCode: `def subarray_sum(nums, k):
    counts = {0: 1}  # running sum -> how many prefixes had it
    total = 0
    res = 0
    for i in range(len(nums)):
        total += nums[i]
        # every earlier prefix worth total - k closes a subarray summing to k
        res += counts.get(total - k, 0)
        counts[total] = counts.get(total, 0) + 1
    return res`,
    tests: [
      { args: [[1, 2, 3, -3, 1, 2], 3], expected: 6 },
      { args: [[1, 1, 1], 2], expected: 2 },
      { args: [[1, 2, 3], 3], expected: 2 },
    ],
  },
  {
    id: "count-nice-pairs",
    name: "Count Nice Pairs in an Array",
    lc: 1814,
    group: "Arrays & Hashing",
    func: "count_nice_pairs",
    argNames: ["nums"],
    argKinds: ["list"],
    retKind: "value",
    description: "Count pairs i < j where nums[i] + rev(nums[j]) equals nums[j] + rev(nums[i]).",
    defaultCode: `def count_nice_pairs(nums):
    counts = {}
    res = 0
    for i in range(len(nums)):
        v = nums[i]
        rev = int(str(v)[::-1])
        key = v - rev
        counts[key] = counts.get(key, 0) + 1
        # bug: the tally is bumped first, so v is counted as its own partner
        res += counts.get(key, 0)
    return res % (10 ** 9 + 7)`,
    solutionCode: `def count_nice_pairs(nums):
    counts = {}  # v - rev(v) -> how many earlier numbers had it
    res = 0
    for i in range(len(nums)):
        v = nums[i]
        rev = int(str(v)[::-1])
        # the condition rearranges to v - rev(v) being equal for both numbers
        key = v - rev
        res += counts.get(key, 0)
        counts[key] = counts.get(key, 0) + 1
    return res % (10 ** 9 + 7)`,
    tests: [
      { args: [[13, 10, 35, 24, 76]], expected: 4 },
      { args: [[42, 11, 1, 97]], expected: 2 },
      { args: [[12, 21, 30]], expected: 0 },
    ],
  },
  {
    id: "distribute-two-arrays-ii",
    name: "Distribute Elements Into Two Arrays II",
    lc: 3072,
    group: "Arrays & Hashing",
    func: "result_array",
    argNames: ["nums"],
    argKinds: ["list"],
    retKind: "list",
    description: "Deal nums into two arrays by greater-element count; ties go to the shorter, then arr1.",
    defaultCode: `import bisect

def result_array(nums):
    arr1 = [nums[0]]
    arr2 = [nums[1]]
    sorted1 = [nums[0]]
    sorted2 = [nums[1]]
    for i in range(2, len(nums)):
        v = nums[i]
        g1 = len(sorted1) - bisect.bisect_right(sorted1, v)
        g2 = len(sorted2) - bisect.bisect_right(sorted2, v)
        # bug: when the counts tie AND the lengths tie, v must go to arr1
        if g1 > g2 or (g1 == g2 and len(arr1) < len(arr2)):
            arr1.append(v)
            bisect.insort(sorted1, v)
        else:
            arr2.append(v)
            bisect.insort(sorted2, v)
    return arr1 + arr2`,
    solutionCode: `import bisect

def result_array(nums):
    arr1 = [nums[0]]
    arr2 = [nums[1]]
    sorted1 = [nums[0]]  # arr1 kept sorted so bisect can count
    sorted2 = [nums[1]]
    for i in range(2, len(nums)):
        v = nums[i]
        # elements strictly greater than v sit after its rightmost slot
        g1 = len(sorted1) - bisect.bisect_right(sorted1, v)
        g2 = len(sorted2) - bisect.bisect_right(sorted2, v)
        # ties go to the shorter array, and to arr1 when they are equal too
        if g1 > g2 or (g1 == g2 and len(arr1) <= len(arr2)):
            arr1.append(v)
            bisect.insort(sorted1, v)
        else:
            arr2.append(v)
            bisect.insort(sorted2, v)
    return arr1 + arr2`,
    tests: [
      { args: [[4, 6, 2, 7, 1, 5]], expected: [4, 2, 1, 6, 7, 5] },
      { args: [[5, 14, 3, 1, 2]], expected: [5, 3, 1, 2, 14] },
      { args: [[2, 1, 3, 3]], expected: [2, 3, 1, 3] },
    ],
  },
  // ───────────────────────── Two Pointers ─────────────────────────
  {
    id: "valid-palindrome",
    name: "Valid Palindrome",
    lc: 125,
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
    lc: 167,
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
    lc: 11,
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
    lc: 15,
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
    lc: 121,
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
    lc: 3,
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
    lc: 424,
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

  {
    id: "longest-subarray-diff-limit",
    name: "Longest Subarray With Diff Limit",
    lc: 1438,
    group: "Sliding Window",
    func: "longest_subarray",
    argNames: ["nums", "limit"],
    argKinds: ["list", "value"],
    retKind: "value",
    description: "Longest subarray whose max minus min is at most limit.",
    defaultCode: `def longest_subarray(nums, limit):
    max_q = []  # values, decreasing; max_head is its front
    min_q = []  # values, increasing; min_head is its front
    max_head = 0
    min_head = 0
    left = 0
    best = 0
    for right in range(len(nums)):
        while len(max_q) > max_head and max_q[-1] < nums[right]:
            max_q.pop()
        max_q.append(nums[right])
        while len(min_q) > min_head and min_q[-1] > nums[right]:
            min_q.pop()
        min_q.append(nums[right])
        # bug: >= throws away windows whose spread is exactly limit,
        # but the problem allows a difference equal to limit
        while max_q[max_head] - min_q[min_head] >= limit:
            if max_q[max_head] == nums[left]:
                max_head += 1
            if min_q[min_head] == nums[left]:
                min_head += 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
    solutionCode: `def longest_subarray(nums, limit):
    max_q = []  # values, decreasing; max_head is its front
    min_q = []  # values, increasing; min_head is its front
    max_head = 0
    min_head = 0
    left = 0
    best = 0
    for right in range(len(nums)):
        # keep max_q decreasing so its front is the window max
        while len(max_q) > max_head and max_q[-1] < nums[right]:
            max_q.pop()
        max_q.append(nums[right])
        # keep min_q increasing so its front is the window min
        while len(min_q) > min_head and min_q[-1] > nums[right]:
            min_q.pop()
        min_q.append(nums[right])
        # shrink from the left until the spread fits
        while max_q[max_head] - min_q[min_head] > limit:
            if max_q[max_head] == nums[left]:
                max_head += 1
            if min_q[min_head] == nums[left]:
                min_head += 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
    tests: [
      { args: [[10, 1, 2, 4, 7, 2], 5], expected: 4 },
      { args: [[8, 2, 4, 7], 4], expected: 2 },
      { args: [[4, 2, 2, 2, 4, 4], 0], expected: 3 },
    ],
  },
  {
    id: "subarrays-match-pattern",
    name: "Subarrays That Match a Pattern",
    lc: 3034,
    group: "Sliding Window",
    func: "count_matching_subarrays",
    argNames: ["nums", "pattern"],
    argKinds: ["list", "list"],
    retKind: "value",
    description: "Count subarrays whose consecutive comparisons match the 1/0/-1 pattern.",
    defaultCode: `def count_matching_subarrays(nums, pattern):
    n = len(nums)
    m = len(pattern)
    count = 0
    for i in range(n - m):
        ok = True
        for k in range(m):
            j = i + k
            a = nums[j]
            b = nums[j + 1]
            # bug: the comparisons are backwards — pattern[k] == 1
            # means the NEXT value is bigger, not the current one
            if pattern[k] == 1 and not a > b:
                ok = False
            elif pattern[k] == 0 and not a == b:
                ok = False
            elif pattern[k] == -1 and not a < b:
                ok = False
        if ok:
            count += 1
    return count`,
    solutionCode: `def count_matching_subarrays(nums, pattern):
    n = len(nums)
    m = len(pattern)
    count = 0
    # a match spans m + 1 values, so the last start is n - m - 1
    for i in range(n - m):
        ok = True
        for k in range(m):
            j = i + k
            a = nums[j]
            b = nums[j + 1]
            if pattern[k] == 1 and not b > a:
                ok = False
            elif pattern[k] == 0 and not b == a:
                ok = False
            elif pattern[k] == -1 and not b < a:
                ok = False
        if ok:
            count += 1
    return count`,
    tests: [
      { args: [[1, 2, 3, 4, 5, 6], [1, 1]], expected: 4 },
      { args: [[1, 4, 4, 1, 3], [1, 0, -1]], expected: 1 },
      { args: [[1, 2, 1, 2, 1], [1, -1]], expected: 2 },
    ],
  },
  {
    id: "grumpy-bookstore",
    name: "Grumpy Bookstore Owner",
    lc: 1052,
    group: "Sliding Window",
    func: "max_satisfied",
    argNames: ["customers", "grumpy", "minutes"],
    argKinds: ["list", "list", "value"],
    retKind: "value",
    description: "Max satisfied customers if the owner can stay calm for one window of minutes.",
    defaultCode: `def max_satisfied(customers, grumpy, minutes):
    base = 0
    for i in range(len(customers)):
        if grumpy[i] == 0:
            base += customers[i]
    gained = 0
    best = 0
    for i in range(len(customers)):
        if grumpy[i] == 1:
            gained += customers[i]
        # bug: the window never gives anything back, so gained keeps
        # every grumpy minute instead of just the last few of them
        best = max(best, gained)
    return base + best`,
    solutionCode: `def max_satisfied(customers, grumpy, minutes):
    # customers already served happily, no matter which window we pick
    base = 0
    for i in range(len(customers)):
        if grumpy[i] == 0:
            base += customers[i]
    # slide a window of length minutes over the grumpy minutes
    gained = 0
    best = 0
    for i in range(len(customers)):
        if grumpy[i] == 1:
            gained += customers[i]
        if i >= minutes and grumpy[i - minutes] == 1:
            gained -= customers[i - minutes]
        best = max(best, gained)
    return base + best`,
    tests: [
      { args: [[4, 10, 10, 1, 1, 2], [0, 1, 1, 0, 1, 0], 2], expected: 27 },
      { args: [[2, 6, 6, 9], [0, 0, 1, 1], 1], expected: 17 },
      { args: [[1], [0], 1], expected: 1 },
    ],
  },
  {
    id: "subarrays-k-distinct",
    name: "Subarrays With K Distinct",
    lc: 992,
    group: "Sliding Window",
    func: "subarrays_with_k_distinct",
    argNames: ["nums", "k"],
    argKinds: ["list", "value"],
    retKind: "value",
    description: "Count subarrays containing exactly k distinct integers.",
    defaultCode: `def subarrays_with_k_distinct(nums, k):
    def at_most(cap):
        count = {}
        left = 0
        total = 0
        for right in range(len(nums)):
            v = nums[right]
            count[v] = count.get(v, 0) + 1
            while len(count) > cap:
                u = nums[left]
                count[u] -= 1
                if count[u] == 0:
                    del count[u]
                left += 1
            total += right - left + 1
        return total

    # bug: at-most-k also counts subarrays with fewer than k distinct values
    return at_most(k)`,
    solutionCode: `def subarrays_with_k_distinct(nums, k):
    # count subarrays with at most cap distinct values
    def at_most(cap):
        count = {}
        left = 0
        total = 0
        for right in range(len(nums)):
            v = nums[right]
            count[v] = count.get(v, 0) + 1
            while len(count) > cap:
                u = nums[left]
                count[u] -= 1
                if count[u] == 0:
                    del count[u]
                left += 1
            total += right - left + 1
        return total

    # exactly k = (at most k) - (at most k - 1)
    return at_most(k) - at_most(k - 1)`,
    tests: [
      { args: [[1, 2, 1, 2, 3], 2], expected: 7 },
      { args: [[1, 2, 1, 3, 4], 3], expected: 3 },
      { args: [[1, 1, 1, 1], 1], expected: 10 },
    ],
  },
  // ───────────────────────── Stack ─────────────────────────
  {
    id: "valid-parentheses",
    name: "Valid Parentheses",
    lc: 20,
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
    lc: 739,
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
    lc: 155,
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

  {
    id: "simplify-path",
    name: "Simplify Path",
    lc: 71,
    group: "Stack",
    func: "simplify_path",
    argNames: ["path"],
    argKinds: ["string"],
    retKind: "value",
    description: "Collapse a Unix-style absolute path into its canonical form.",
    defaultCode: `def simplify_path(path):
    stack = []  # surviving directory names
    for part in path.split("/"):
        if part == "":
            continue
        if part == "..":
            if stack:
                stack.pop()
        else:
            # bug: "." means "stay here", so it must be skipped too
            stack.append(part)
    return "/" + "/".join(stack)`,
    solutionCode: `def simplify_path(path):
    stack = []  # surviving directory names
    for part in path.split("/"):
        # empty pieces come from "//" and the leading slash
        if part == "" or part == ".":
            continue
        if part == "..":
            if stack:
                stack.pop()  # step up, but never past the root
        else:
            stack.append(part)
    return "/" + "/".join(stack)`,
    tests: [
      { args: ["/a/./b/../../c/"], expected: "/c" },
      { args: ["/home//foo/"], expected: "/home/foo" },
      { args: ["/../"], expected: "/" },
    ],
  },
  {
    id: "largest-rectangle-histogram",
    name: "Largest Rectangle in Histogram",
    lc: 84,
    group: "Stack",
    func: "largest_rectangle_area",
    argNames: ["heights"],
    argKinds: ["list"],
    retKind: "value",
    description: "Area of the largest rectangle that fits inside the histogram.",
    defaultCode: `def largest_rectangle_area(heights):
    stack = []  # indices with increasing heights
    best = 0
    for i in range(len(heights) + 1):
        h = heights[i] if i < len(heights) else 0
        while stack and heights[stack[-1]] >= h:
            top = stack.pop()
            left = stack[-1] if stack else -1
            # bug: off by one — the bar spans columns left+1 .. i-1
            width = i - left
            best = max(best, heights[top] * width)
        stack.append(i)
    return best`,
    solutionCode: `def largest_rectangle_area(heights):
    stack = []  # indices with increasing heights
    best = 0
    for i in range(len(heights) + 1):
        # a virtual height of 0 past the end flushes the stack
        h = heights[i] if i < len(heights) else 0
        while stack and heights[stack[-1]] >= h:
            top = stack.pop()
            # the bar at top can stretch from left+1 up to i-1
            left = stack[-1] if stack else -1
            width = i - left - 1
            best = max(best, heights[top] * width)
        stack.append(i)
    return best`,
    tests: [
      { args: [[2, 1, 5, 6, 2, 3]], expected: 10 },
      { args: [[2, 4]], expected: 4 },
      { args: [[2, 1, 2]], expected: 3 },
    ],
  },
  // ───────────────────────── Binary Search ─────────────────────────
  {
    id: "binary-search",
    name: "Binary Search",
    lc: 704,
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
    lc: 33,
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
    lc: 153,
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

  {
    id: "block-placement-queries",
    name: "Block Placement Queries",
    lc: 3161,
    group: "Binary Search",
    func: "get_results",
    argNames: ["queries"],
    argKinds: ["matrix"],
    retKind: "list",
    description: "Add obstacles to a line and answer whether a block of size sz fits inside [0, x].",
    defaultCode: `import bisect

def get_results(queries):
    obstacles = [0]  # the line starts at 0
    res = []
    for query in queries:
        if query[0] == 1:
            bisect.insort(obstacles, query[1])
        else:
            x = query[1]
            sz = query[2]
            k = bisect.bisect_right(obstacles, x)
            best = 0
            for i in range(1, k):
                gap = obstacles[i] - obstacles[i - 1]
                if gap > best:
                    best = gap
            # bug: forgets the free stretch from the last obstacle out to x
            res.append(best >= sz)
    return res`,
    solutionCode: `import bisect

def get_results(queries):
    obstacles = [0]  # the line starts at 0
    res = []
    for query in queries:
        if query[0] == 1:
            # build an obstacle, keeping the list sorted
            bisect.insort(obstacles, query[1])
        else:
            x = query[1]
            sz = query[2]
            # k = how many obstacles sit at or before x
            k = bisect.bisect_right(obstacles, x)
            best = 0
            # widest gap between two obstacles that both lie inside [0, x]
            for i in range(1, k):
                gap = obstacles[i] - obstacles[i - 1]
                if gap > best:
                    best = gap
            # plus the open stretch from the last obstacle out to x
            tail = x - obstacles[k - 1]
            if tail > best:
                best = tail
            res.append(best >= sz)
    return res`,
    tests: [
      {
        args: [[[1, 2], [2, 5, 3], [1, 4], [2, 5, 3], [2, 4, 2]]],
        expected: [true, false, true],
      },
      { args: [[[1, 2], [2, 3, 3], [2, 3, 1], [2, 2, 2]]], expected: [false, true, true] },
      {
        args: [[[1, 7], [2, 7, 6], [1, 2], [2, 7, 5], [2, 7, 6]]],
        expected: [true, true, false],
      },
    ],
  },
  {
    id: "min-abs-diff-with-constraint",
    name: "Minimum Absolute Difference Between Elements With Constraint",
    lc: 2817,
    group: "Binary Search",
    func: "min_absolute_difference",
    argNames: ["nums", "x"],
    argKinds: ["list", "value"],
    retKind: "value",
    description: "Smallest absolute difference between two values that are at least x indices apart.",
    defaultCode: `import bisect

def min_absolute_difference(nums, x):
    window = []  # values from indices at least x behind, kept sorted
    best = float("inf")
    for i in range(x, len(nums)):
        bisect.insort(window, nums[i - x])
        j = bisect.bisect_left(window, nums[i])
        # bug: only compares against the neighbour to the right of the
        # insertion point, so a closer value just to the left is missed
        if j < len(window):
            if window[j] - nums[i] < best:
                best = window[j] - nums[i]
    return best`,
    solutionCode: `import bisect

def min_absolute_difference(nums, x):
    window = []  # values from indices at least x behind, kept sorted
    best = float("inf")
    for i in range(x, len(nums)):
        # nums[i - x] is now far enough away from i to be a legal partner
        bisect.insort(window, nums[i - x])
        j = bisect.bisect_left(window, nums[i])
        # the best match is one of the two neighbours of the insertion point
        if j < len(window):
            if window[j] - nums[i] < best:
                best = window[j] - nums[i]
        if j > 0:
            if nums[i] - window[j - 1] < best:
                best = nums[i] - window[j - 1]
    return best`,
    tests: [
      { args: [[7, 2, 5, 3, 9], 2], expected: 1 },
      { args: [[4, 3, 2, 4], 2], expected: 0 },
      { args: [[5, 3, 2, 10, 15], 1], expected: 1 },
    ],
  },
  {
    id: "max-running-time-of-n-computers",
    name: "Maximum Running Time of N Computers",
    lc: 2141,
    group: "Binary Search",
    func: "max_run_time",
    argNames: ["n", "batteries"],
    argKinds: ["value", "list"],
    retKind: "value",
    description: "Longest time all n computers can run at once, swapping batteries freely.",
    defaultCode: `def max_run_time(n, batteries):
    lo = 0
    hi = sum(batteries) // n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        total = 0
        for b in batteries:
            # bug: one battery can only power one computer at a time, so it
            # can contribute at most mid minutes -- this counts all of it
            total += b
        if total >= n * mid:
            lo = mid
        else:
            hi = mid - 1
    return lo`,
    solutionCode: `def max_run_time(n, batteries):
    # binary search on the answer: can every computer run for mid minutes?
    lo = 0
    hi = sum(batteries) // n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        total = 0
        for b in batteries:
            # a single battery is useful for at most mid of those minutes
            total += min(b, mid)
        if total >= n * mid:
            lo = mid
        else:
            hi = mid - 1
    return lo`,
    tests: [
      { args: [2, [10, 1, 1]], expected: 2 },
      { args: [2, [3, 3, 3]], expected: 4 },
      { args: [3, [10, 10, 3, 5]], expected: 8 },
    ],
  },
  // ───────────────────────── Linked List ─────────────────────────
  {
    id: "reverse-linked-list",
    name: "Reverse Linked List",
    lc: 206,
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
    lc: 21,
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
    lc: 19,
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
    lc: 141,
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
    lc: 143,
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
    lc: 146,
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

  {
    id: "add-two-numbers",
    name: "Add Two Numbers",
    lc: 2,
    group: "Linked List",
    func: "add_two_numbers",
    argNames: ["l1", "l2"],
    argKinds: ["linkedlist", "linkedlist"],
    retKind: "linkedlist",
    description: "Add two numbers whose digits are stored in reverse order.",
    defaultCode: `def add_two_numbers(l1, l2):
    head = ListNode(0)  # dummy node in front of the answer
    curr = head
    carry = 0
    p = l1
    q = l2
    # bug: stops as soon as both lists run out, dropping the last carry
    while p or q:
        total = carry
        if p:
            total += p.val
            p = p.next
        if q:
            total += q.val
            q = q.next
        carry = total // 10
        curr.next = ListNode(total % 10)
        curr = curr.next
    return head.next`,
    solutionCode: `def add_two_numbers(l1, l2):
    head = ListNode(0)  # dummy node in front of the answer
    curr = head
    carry = 0
    p = l1
    q = l2
    # keep going while either list has digits OR a carry is still pending
    while p or q or carry:
        total = carry
        if p:
            total += p.val
            p = p.next
        if q:
            total += q.val
            q = q.next
        carry = total // 10
        curr.next = ListNode(total % 10)
        curr = curr.next
    return head.next`,
    tests: [
      { args: [[9, 9, 9], [1]], expected: [0, 0, 0, 1] },
      { args: [[2, 4, 3], [5, 6, 4]], expected: [7, 0, 8] },
      { args: [[0], [0]], expected: [0] },
    ],
  },
  // ───────────────────────── Trees ─────────────────────────
  {
    id: "max-depth",
    name: "Maximum Depth of Binary Tree",
    lc: 104,
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
    lc: 100,
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
    lc: 226,
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
    lc: 110,
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
    lc: 543,
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
    lc: 102,
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
    lc: 199,
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
    lc: 98,
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
    lc: 230,
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
    lc: 235,
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
    lc: 572,
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
    lc: 1448,
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

  {
    id: "binary-tree-paths",
    name: "Binary Tree Paths",
    lc: 257,
    group: "Trees",
    func: "binary_tree_paths",
    argNames: ["root"],
    argKinds: ["tree"],
    retKind: "list",
    compare: "set",
    description: "Return every root-to-leaf path as a 1->2->5 string.",
    defaultCode: `def binary_tree_paths(root):
    res = []

    def dfs(node, path):
        if not node:
            return
        path = path + str(node.val)
        # bug: records a path at every node instead of only at the leaves
        res.append(path)
        dfs(node.left, path + "->")
        dfs(node.right, path + "->")

    dfs(root, "")
    return res`,
    solutionCode: `def binary_tree_paths(root):
    res = []

    def dfs(node, path):
        if not node:
            return
        path = path + str(node.val)
        if not node.left and not node.right:
            res.append(path)  # a leaf ends a whole root-to-leaf path
            return
        dfs(node.left, path + "->")
        dfs(node.right, path + "->")

    dfs(root, "")
    return res`,
    tests: [
      { args: [[1, 2, 3, null, 5]], expected: ["1->2->5", "1->3"] },
      { args: [[1, 2, 3, 4, 5]], expected: ["1->2->4", "1->2->5", "1->3"] },
      { args: [[1]], expected: ["1"] },
    ],
  },
  // ───────────────────────── Heap / Priority Queue ─────────────────────────
  {
    id: "last-stone-weight",
    name: "Last Stone Weight",
    lc: 1046,
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
    lc: 215,
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
    lc: 703,
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
    lc: 133,
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
    lc: 207,
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
    lc: 210,
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

  {
    id: "word-ladder",
    name: "Word Ladder",
    lc: 127,
    group: "Graphs",
    func: "ladder_length",
    argNames: ["begin_word", "end_word", "word_list"],
    argKinds: ["string", "string", "list"],
    retKind: "value",
    description: "Length of the shortest one-letter-at-a-time word ladder, or 0.",
    defaultCode: `def ladder_length(begin_word, end_word, word_list):
    if end_word not in word_list:
        return 0
    queue = [begin_word]
    head = 0
    # bug: the answer counts words in the ladder, not the hops between them
    dist = {begin_word: 0}
    while head < len(queue):
        word = queue[head]
        head += 1
        if word == end_word:
            return dist[word]
        for cand in word_list:
            if cand in dist:
                continue
            diff = 0
            for i in range(len(word)):
                if word[i] != cand[i]:
                    diff += 1
            if diff == 1:
                dist[cand] = dist[word] + 1
                queue.append(cand)
    return 0`,
    solutionCode: `def ladder_length(begin_word, end_word, word_list):
    if end_word not in word_list:
        return 0
    queue = [begin_word]      # plain list used as a BFS queue
    head = 0                  # index of the next word to expand
    dist = {begin_word: 1}    # word -> words used to reach it
    while head < len(queue):
        word = queue[head]
        head += 1
        if word == end_word:
            return dist[word]
        for cand in word_list:
            if cand in dist:  # already queued at an equal or shorter distance
                continue
            diff = 0
            for i in range(len(word)):
                if word[i] != cand[i]:
                    diff += 1
            if diff == 1:     # exactly one letter apart
                dist[cand] = dist[word] + 1
                queue.append(cand)
    return 0`,
    tests: [
      { args: ["hit", "cog", ["hot", "dot", "dog", "cog", "lot"]], expected: 5 },
      { args: ["a", "c", ["a", "b", "c"]], expected: 2 },
      { args: ["hit", "cog", ["hot", "dot", "dog"]], expected: 0 },
    ],
  },
  {
    id: "reconstruct-itinerary",
    name: "Reconstruct Itinerary",
    lc: 332,
    group: "Graphs",
    func: "find_itinerary",
    argNames: ["tickets"],
    argKinds: ["matrix"],
    retKind: "list",
    description: "Use every ticket once from JFK, taking the smallest airport first.",
    defaultCode: `def find_itinerary(tickets):
    graph = {}  # airport -> unused destinations
    # bug: the tickets are added in input order, so the walk does not always
    # take the lexicographically smallest destination first
    for src, dst in tickets:
        graph.setdefault(src, []).append(dst)
    route = []

    def visit(airport):
        while graph.get(airport):
            nxt = graph[airport].pop(0)
            visit(nxt)
        route.append(airport)

    visit("JFK")
    return route[::-1]`,
    solutionCode: `def find_itinerary(tickets):
    graph = {}  # airport -> unused destinations, smallest first
    for src, dst in sorted(tickets):
        graph.setdefault(src, []).append(dst)
    route = []

    def visit(airport):
        # burn tickets out of this airport until it is a dead end
        while graph.get(airport):
            nxt = graph[airport].pop(0)
            visit(nxt)
        route.append(airport)  # dead ends land at the back of the route

    visit("JFK")
    return route[::-1]`,
    tests: [
      {
        args: [[["JFK", "SFO"], ["JFK", "ATL"], ["SFO", "JFK"], ["ATL", "JFK"]]],
        expected: ["JFK", "ATL", "JFK", "SFO", "JFK"],
      },
      {
        args: [[["MUC", "LHR"], ["JFK", "MUC"], ["SFO", "SJC"], ["LHR", "SFO"]]],
        expected: ["JFK", "MUC", "LHR", "SFO", "SJC"],
      },
      {
        args: [[["JFK", "SFO"], ["JFK", "ATL"], ["SFO", "ATL"], ["ATL", "JFK"], ["ATL", "SFO"]]],
        expected: ["JFK", "ATL", "JFK", "SFO", "ATL", "SFO"],
      },
    ],
  },
  {
    id: "restore-array-adjacent-pairs",
    name: "Restore the Array From Adjacent Pairs",
    lc: 1743,
    group: "Graphs",
    func: "restore_array",
    argNames: ["adjacent_pairs"],
    argKinds: ["matrix"],
    retKind: "list",
    compare: "reversible",
    description: "Rebuild the original array from its unordered adjacent pairs.",
    defaultCode: `def restore_array(adjacent_pairs):
    graph = {}
    for pair in adjacent_pairs:
        u = pair[0]
        v = pair[1]
        if u not in graph:
            graph[u] = []
        if v not in graph:
            graph[v] = []
        graph[u].append(v)
        graph[v].append(u)
    # bug: starts at whatever node came first, but the walk has to
    # begin at an END of the chain (a node with only one neighbour)
    start = adjacent_pairs[0][0]
    res = [start]
    prev = start
    curr = graph[start][0]
    while True:
        res.append(curr)
        nbrs = graph[curr]
        if len(nbrs) == 1:
            break
        nxt = nbrs[0]
        if nxt == prev:
            nxt = nbrs[1]
        prev = curr
        curr = nxt
    return res`,
    solutionCode: `def restore_array(adjacent_pairs):
    graph = {}  # value -> its neighbours in the original array
    for pair in adjacent_pairs:
        u = pair[0]
        v = pair[1]
        if u not in graph:
            graph[u] = []
        if v not in graph:
            graph[v] = []
        graph[u].append(v)
        graph[v].append(u)
    # an end of the chain is the only kind of node with a single neighbour
    start = 0
    for key in graph:
        if len(graph[key]) == 1:
            start = key
            break
    res = [start]
    prev = start
    curr = graph[start][0]
    while True:
        res.append(curr)
        nbrs = graph[curr]
        if len(nbrs) == 1:
            break
        nxt = nbrs[0]
        if nxt == prev:
            nxt = nbrs[1]
        prev = curr
        curr = nxt
    return res`,
    tests: [
      { args: [[[2, 1], [3, 4], [3, 2]]], expected: [1, 2, 3, 4] },
      { args: [[[4, -2], [1, 4], [-3, 1]]], expected: [-2, 4, 1, -3] },
      { args: [[[5, 9]]], expected: [5, 9] },
    ],
  },
  // ───────────────────────── Matrix ─────────────────────────
  {
    id: "number-of-islands",
    name: "Number of Islands",
    lc: 200,
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
    lc: 695,
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
    lc: 130,
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
    lc: 36,
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
    lc: 417,
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
  {
    id: "spiral-matrix",
    name: "Spiral Matrix",
    lc: 54,
    group: "Matrix",
    func: "spiral_order",
    argNames: ["matrix"],
    argKinds: ["matrix"],
    retKind: "list",
    description: "Return all elements of the matrix in spiral order.",
    defaultCode: `def spiral_order(matrix):
    res = []
    top = 0
    bottom = len(matrix) - 1
    left = 0
    right = len(matrix[0]) - 1
    while top <= bottom and left <= right:
        # bug: range(left, right) stops one short, so the last cell of every top row is skipped
        for c in range(left, right):
            res.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            res.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                res.append(matrix[r][left])
            left += 1
    return res`,
    solutionCode: `def spiral_order(matrix):
    res = []
    top = 0
    bottom = len(matrix) - 1
    left = 0
    right = len(matrix[0]) - 1
    while top <= bottom and left <= right:
        # walk the top row left to right, then close it off
        for c in range(left, right + 1):
            res.append(matrix[top][c])
        top += 1
        # walk the right column downwards
        for r in range(top, bottom + 1):
            res.append(matrix[r][right])
        right -= 1
        # the two guards stop a single leftover row/column being walked twice
        if top <= bottom:
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                res.append(matrix[r][left])
            left += 1
    return res`,
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      { args: [[[1, 2], [3, 4]]], expected: [1, 2, 4, 3] },
      { args: [[[1, 2, 3, 4]]], expected: [1, 2, 3, 4] },
    ],
  },
  {
    id: "candy-crush",
    name: "Candy Crush",
    lc: 723,
    group: "Matrix",
    func: "candy_crush",
    argNames: ["board"],
    argKinds: ["matrix"],
    retKind: "matrix",
    description: "Crush runs of three or more equal candies, let the rest fall, and return the stable board.",
    defaultCode: `def candy_crush(board):
    rows = len(board)
    cols = len(board[0])
    crushed = True
    while crushed:
        crushed = False
        for r in range(rows):
            for c in range(cols - 2):
                v = abs(board[r][c])
                if v != 0 and v == abs(board[r][c + 1]) and v == abs(board[r][c + 2]):
                    board[r][c] = -v
                    board[r][c + 1] = -v
                    board[r][c + 2] = -v
                    crushed = True
        for c in range(cols):
            for r in range(rows - 2):
                v = abs(board[r][c])
                if v != 0 and v == abs(board[r + 1][c]) and v == abs(board[r + 2][c]):
                    board[r][c] = -v
                    board[r + 1][c] = -v
                    board[r + 2][c] = -v
                    crushed = True
        # bug: crushed candies are blanked where they stand, but gravity is never applied
        for r in range(rows):
            for c in range(cols):
                if board[r][c] < 0:
                    board[r][c] = 0
    return board`,
    solutionCode: `def candy_crush(board):
    rows = len(board)
    cols = len(board[0])
    crushed = True
    while crushed:
        crushed = False
        # mark, don't delete: a candy in a run is flipped negative so overlapping
        # runs are still detectable in the same pass
        for r in range(rows):
            for c in range(cols - 2):
                v = abs(board[r][c])
                if v != 0 and v == abs(board[r][c + 1]) and v == abs(board[r][c + 2]):
                    board[r][c] = -v
                    board[r][c + 1] = -v
                    board[r][c + 2] = -v
                    crushed = True
        for c in range(cols):
            for r in range(rows - 2):
                v = abs(board[r][c])
                if v != 0 and v == abs(board[r + 1][c]) and v == abs(board[r + 2][c]):
                    board[r][c] = -v
                    board[r + 1][c] = -v
                    board[r + 2][c] = -v
                    crushed = True
        if crushed:
            # gravity: pack the survivors of each column down, blank the rest
            for c in range(cols):
                idx = rows - 1
                for r in range(rows - 1, -1, -1):
                    if board[r][c] > 0:
                        board[idx][c] = board[r][c]
                        idx -= 1
                for r in range(idx, -1, -1):
                    board[r][c] = 0
    return board`,
    tests: [
      {
        args: [[[4, 5, 3], [1, 1, 1], [2, 5, 3]]],
        expected: [[0, 0, 0], [4, 5, 3], [2, 5, 3]],
      },
      {
        args: [[[1, 2, 3], [2, 3, 1], [3, 1, 2]]],
        expected: [[1, 2, 3], [2, 3, 1], [3, 1, 2]],
      },
      {
        args: [[[2, 1, 3], [1, 1, 2], [3, 1, 3], [2, 1, 2]]],
        expected: [[2, 0, 3], [1, 0, 2], [3, 0, 3], [2, 0, 2]],
      },
    ],
  },
  {
    id: "write-letter-y-grid",
    name: "Minimum Operations to Write the Letter Y on a Grid",
    lc: 3071,
    group: "Matrix",
    func: "min_operations",
    argNames: ["grid"],
    argKinds: ["matrix"],
    retKind: "value",
    description: "Fewest cell changes so the Y is one value and everything else another.",
    defaultCode: `def min_operations(grid):
    n = len(grid)
    mid = n // 2
    y_count = [0, 0, 0]
    other_count = [0, 0, 0]
    for r in range(n):
        for c in range(n):
            # bug: the two arms are drawn as full diagonals instead of stopping at the centre
            on_y = (c == r or c == n - 1 - r) or (r >= mid and c == mid)
            if on_y:
                y_count[grid[r][c]] += 1
            else:
                other_count[grid[r][c]] += 1
    total = n * n
    y_total = y_count[0] + y_count[1] + y_count[2]
    best = total
    for a in range(3):
        for b in range(3):
            if a != b:
                ops = (y_total - y_count[a]) + (total - y_total - other_count[b])
                if ops < best:
                    best = ops
    return best`,
    solutionCode: `def min_operations(grid):
    n = len(grid)
    mid = n // 2
    y_count = [0, 0, 0]
    other_count = [0, 0, 0]
    for r in range(n):
        for c in range(n):
            # above the centre the Y is the two diagonals; from the centre down it is the stem
            on_y = (r < mid and (c == r or c == n - 1 - r)) or (r >= mid and c == mid)
            if on_y:
                y_count[grid[r][c]] += 1
            else:
                other_count[grid[r][c]] += 1
    total = n * n
    y_total = y_count[0] + y_count[1] + y_count[2]
    best = total
    # try every pair of distinct values for (the Y, everything else)
    for a in range(3):
        for b in range(3):
            if a != b:
                ops = (y_total - y_count[a]) + (total - y_total - other_count[b])
                if ops < best:
                    best = ops
    return best`,
    tests: [
      { args: [[[1, 2, 2], [1, 1, 0], [0, 1, 0]]], expected: 3 },
      { args: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]], expected: 4 },
      {
        args: [[[0, 1, 0, 1, 0], [2, 1, 0, 1, 2], [2, 2, 2, 0, 1], [2, 2, 2, 2, 2], [2, 1, 2, 2, 2]]],
        expected: 12,
      },
    ],
  },
  {
    id: "number-of-black-blocks",
    name: "Number of Black Blocks",
    lc: 2768,
    group: "Matrix",
    func: "count_black_blocks",
    argNames: ["m", "n", "coordinates"],
    argKinds: ["value", "value", "matrix"],
    retKind: "list",
    description: "Count the 2x2 blocks of the grid holding exactly 0, 1, 2, 3 and 4 black cells.",
    defaultCode: `def count_black_blocks(m, n, coordinates):
    counts = {}  # top-left corner r * n + c -> black cells in that block
    for i in range(len(coordinates)):
        x = coordinates[i][0]
        y = coordinates[i][1]
        for r in range(x - 1, x + 1):
            for c in range(y - 1, y + 1):
                # bug: checks the cell bounds, but a 2x2 block's corner only goes up to m-2 / n-2
                if 0 <= r < m and 0 <= c < n:
                    key = r * n + c
                    counts[key] = counts.get(key, 0) + 1
    res = [0, 0, 0, 0, 0]
    res[0] = (m - 1) * (n - 1) - len(counts)
    for key in counts:
        res[counts[key]] += 1
    return res`,
    solutionCode: `def count_black_blocks(m, n, coordinates):
    counts = {}  # top-left corner r * n + c -> black cells in that block
    for i in range(len(coordinates)):
        x = coordinates[i][0]
        y = coordinates[i][1]
        # a black cell belongs to the (up to) four blocks whose corner is at or one before it
        for r in range(x - 1, x + 1):
            for c in range(y - 1, y + 1):
                if 0 <= r <= m - 2 and 0 <= c <= n - 2:
                    key = r * n + c
                    counts[key] = counts.get(key, 0) + 1
    res = [0, 0, 0, 0, 0]
    # every block never touched by a black cell is an all-white one
    res[0] = (m - 1) * (n - 1) - len(counts)
    for key in counts:
        res[counts[key]] += 1
    return res`,
    tests: [
      { args: [3, 3, [[0, 0], [1, 1], [0, 2]]], expected: [0, 2, 2, 0, 0] },
      { args: [3, 3, [[0, 0]]], expected: [3, 1, 0, 0, 0] },
      { args: [2, 2, [[0, 0], [0, 1], [1, 0], [1, 1]]], expected: [0, 0, 0, 0, 1] },
    ],
  },
  {
    id: "rotate-image",
    name: "Rotate Image",
    lc: 48,
    group: "Matrix",
    func: "rotate",
    argNames: ["matrix"],
    argKinds: ["matrix"],
    retKind: "matrix",
    description: "Rotate an n x n matrix 90 degrees clockwise in place.",
    defaultCode: `def rotate(matrix):
    n = len(matrix)
    # bug: transposing over the WHOLE row swaps every pair twice, so the
    # two swaps cancel and the matrix comes out only mirrored, not rotated
    for r in range(n):
        for c in range(n):
            matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
    for r in range(n):
        matrix[r].reverse()
    return matrix`,
    solutionCode: `def rotate(matrix):
    n = len(matrix)
    # step 1: transpose (reflect across the main diagonal).
    # start c at r + 1 so each pair is swapped exactly once
    for r in range(n):
        for c in range(r + 1, n):
            matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
    # step 2: mirror each row left-to-right -> 90 degrees clockwise
    for r in range(n):
        matrix[r].reverse()
    return matrix`,
    tests: [
      {
        args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]],
      },
      { args: [[[1, 2], [3, 4]]], expected: [[3, 1], [4, 2]] },
      { args: [[[5]]], expected: [[5]] },
    ],
  },
  {
    id: "rotating-the-box",
    name: "Rotating the Box",
    lc: 1861,
    group: "Matrix",
    func: "rotate_the_box",
    argNames: ["box"],
    argKinds: ["matrix"],
    retKind: "matrix",
    description: "Rotate the box 90 degrees clockwise and let every stone fall.",
    defaultCode: `def rotate_the_box(box):
    rows = len(box)
    cols = len(box[0])
    # settle the stones to the right first: the right edge becomes the floor
    for r in range(rows):
        write = cols - 1
        for c in range(cols - 1, -1, -1):
            if box[r][c] == "*":
                write = c - 1
            elif box[r][c] == "#":
                # bug: drops a copy of the stone on the landing square but
                # never clears the square it fell from, so stones multiply
                box[r][write] = "#"
                write -= 1
    res = [["."] * rows for _ in range(cols)]
    for r in range(rows):
        for c in range(cols):
            res[c][rows - 1 - r] = box[r][c]
    return res`,
    solutionCode: `def rotate_the_box(box):
    rows = len(box)
    cols = len(box[0])
    # settle the stones to the right first: the right edge becomes the floor
    for r in range(rows):
        write = cols - 1  # rightmost free square a stone may land on
        for c in range(cols - 1, -1, -1):
            if box[r][c] == "*":
                write = c - 1  # obstacles never move and block the fall
            elif box[r][c] == "#":
                box[r][c] = "."
                box[r][write] = "#"
                write -= 1
    # now turn the settled box 90 degrees clockwise into a cols x rows grid
    res = [["."] * rows for _ in range(cols)]
    for r in range(rows):
        for c in range(cols):
            res[c][rows - 1 - r] = box[r][c]
    return res`,
    tests: [
      {
        args: [[["#", ".", "*", "."], ["#", "#", "*", "."]]],
        expected: [["#", "."], ["#", "#"], ["*", "*"], [".", "."]],
      },
      { args: [[["#", ".", "#"]]], expected: [["."], ["#"], ["#"]] },
      {
        args: [[["#", "*", "."], [".", "#", "."]]],
        expected: [[".", "#"], [".", "*"], ["#", "."]],
      },
    ],
  },
  {
    id: "flood-fill",
    name: "Flood Fill",
    lc: 733,
    group: "Matrix",
    func: "flood_fill",
    argNames: ["image", "sr", "sc", "color"],
    argKinds: ["matrix", "value", "value", "value"],
    retKind: "matrix",
    description: "Repaint the connected same-colored region around (sr, sc).",
    defaultCode: `def flood_fill(image, sr, sc, color):
    def fill(r, c):
        if r < 0 or r >= len(image) or c < 0 or c >= len(image[0]):
            return
        # bug: re-reads the starting colour from the image every call, but
        # that square was already repainted, so no neighbour ever matches
        if image[r][c] != image[sr][sc]:
            return
        image[r][c] = color
        fill(r + 1, c)
        fill(r - 1, c)
        fill(r, c + 1)
        fill(r, c - 1)

    fill(sr, sc)
    return image`,
    solutionCode: `def flood_fill(image, sr, sc, color):
    start = image[sr][sc]  # remember it: the pixel is about to change
    if start == color:
        return image  # already that colour, filling would never stop

    def fill(r, c):
        if r < 0 or r >= len(image) or c < 0 or c >= len(image[0]):
            return
        if image[r][c] != start:
            return
        image[r][c] = color
        fill(r + 1, c)
        fill(r - 1, c)
        fill(r, c + 1)
        fill(r, c - 1)

    fill(sr, sc)
    return image`,
    tests: [
      {
        args: [[[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2],
        expected: [[2, 2, 2], [2, 2, 0], [2, 0, 1]],
      },
      { args: [[[0, 0, 0], [0, 1, 0]], 1, 1, 2], expected: [[0, 0, 0], [0, 2, 0]] },
      { args: [[[1, 1], [1, 1]], 0, 0, 3], expected: [[3, 3], [3, 3]] },
    ],
  },

  // ───────────────────────── Strings ─────────────────────────
  {
    id: "text-justification",
    name: "Text Justification",
    lc: 68,
    group: "Strings",
    func: "full_justify",
    argNames: ["words", "max_width"],
    argKinds: ["list", "value"],
    retKind: "list",
    description: "Greedily pack words into lines of max_width, fully justifying every line except the last.",
    defaultCode: `def full_justify(words, max_width):
    res = []
    line = []   # words waiting on the current line
    length = 0  # letters only, spaces not counted yet
    for w in words:
        if length + len(line) + len(w) > max_width:
            gaps = len(line) - 1
            if gaps == 0:
                res.append(line[0] + " " * (max_width - length))
            else:
                spaces = max_width - length
                base = spaces // gaps
                # bug: integer division throws away the leftover spaces, so a
                # line that does not divide evenly comes out short
                row = ""
                for i in range(gaps):
                    row += line[i] + " " * base
                row += line[gaps]
                res.append(row)
            line = []
            length = 0
        line.append(w)
        length += len(w)
    last = " ".join(line)
    return res + [last + " " * (max_width - len(last))]`,
    solutionCode: `def full_justify(words, max_width):
    res = []
    line = []   # words waiting on the current line
    length = 0  # letters only, spaces not counted yet
    for w in words:
        # len(line) is the minimum number of single spaces this line needs
        if length + len(line) + len(w) > max_width:
            gaps = len(line) - 1
            if gaps == 0:
                # single word: left justified, pad the rest
                res.append(line[0] + " " * (max_width - length))
            else:
                spaces = max_width - length
                base = spaces // gaps
                extra = spaces % gaps   # leftmost gaps get one more
                row = ""
                for i in range(gaps):
                    pad = base + 1 if i < extra else base
                    row += line[i] + " " * pad
                row += line[gaps]
                res.append(row)
            line = []
            length = 0
        line.append(w)
        length += len(w)
    # the last line is always single spaced and left justified
    last = " ".join(line)
    return res + [last + " " * (max_width - len(last))]`,
    tests: [
      {
        args: [["This", "is", "an", "example", "of", "text", "justification."], 16],
        expected: ["This    is    an", "example  of text", "justification.  "],
      },
      {
        args: [["What", "must", "be", "acknowledgment", "shall", "be"], 16],
        expected: ["What   must   be", "acknowledgment  ", "shall be        "],
      },
      { args: [["a", "b", "c"], 5], expected: ["a b c"] },
    ],
  },
  {
    id: "add-strings",
    name: "Add Strings",
    lc: 415,
    group: "Strings",
    func: "add_strings",
    argNames: ["num1", "num2"],
    argKinds: ["string", "string"],
    retKind: "value",
    description: "Add two non-negative numbers given as strings, without converting to int.",
    defaultCode: `def add_strings(num1, num2):
    i = len(num1) - 1
    j = len(num2) - 1
    carry = 0
    digits = []
    # bug: stops as soon as both strings run out, so a carry off the front is lost
    while i >= 0 or j >= 0:
        total = carry
        if i >= 0:
            total += ord(num1[i]) - ord("0")
            i -= 1
        if j >= 0:
            total += ord(num2[j]) - ord("0")
            j -= 1
        carry = total // 10
        digits.append(str(total % 10))
    res = ""
    for k in range(len(digits) - 1, -1, -1):
        res += digits[k]
    return res`,
    solutionCode: `def add_strings(num1, num2):
    i = len(num1) - 1
    j = len(num2) - 1
    carry = 0
    digits = []   # least significant digit first
    # keep going while either string has digits left OR a carry is pending
    while i >= 0 or j >= 0 or carry > 0:
        total = carry
        if i >= 0:
            total += ord(num1[i]) - ord("0")
            i -= 1
        if j >= 0:
            total += ord(num2[j]) - ord("0")
            j -= 1
        carry = total // 10
        digits.append(str(total % 10))
    res = ""
    for k in range(len(digits) - 1, -1, -1):
        res += digits[k]
    return res`,
    tests: [
      { args: ["99", "987"], expected: "1086" },
      { args: ["456", "77"], expected: "533" },
      { args: ["0", "0"], expected: "0" },
    ],
  },
  {
    id: "number-changing-keys",
    name: "Number of Changing Keys",
    lc: 3019,
    group: "Strings",
    func: "count_key_changes",
    argNames: ["s"],
    argKinds: ["string"],
    retKind: "value",
    description: "Count key changes while typing s, where shift and caps lock do not count.",
    defaultCode: `def count_key_changes(s):
    changes = 0
    for i in range(1, len(s)):
        # bug: compares the raw characters, so "a" then "A" looks like a change
        if s[i] != s[i - 1]:
            changes += 1
    return changes`,
    solutionCode: `def count_key_changes(s):
    changes = 0
    for i in range(1, len(s)):
        # shift / caps lock is the same physical key, so compare lower case
        if s[i].lower() != s[i - 1].lower():
            changes += 1
    return changes`,
    tests: [
      { args: ["aAbBcC"], expected: 2 },
      { args: ["AaAaAaaA"], expected: 0 },
      { args: ["bBBbA"], expected: 1 },
    ],
  },
  {
    id: "palindromic-substrings",
    name: "Palindromic Substrings",
    lc: 647,
    group: "Strings",
    func: "count_substrings",
    argNames: ["s"],
    argKinds: ["string"],
    retKind: "value",
    description: "Count how many substrings of s are palindromes.",
    defaultCode: `def count_substrings(s):
    n = len(s)
    total = 0
    for i in range(n):
        # odd length palindromes centred on i
        left = i
        right = i
        while left >= 0 and right < n and s[left] == s[right]:
            total += 1
            left -= 1
            right += 1
    # bug: only odd length centres are expanded, so "aa" is never counted
    return total`,
    solutionCode: `def count_substrings(s):
    n = len(s)
    total = 0
    for i in range(n):
        # odd length palindromes centred on i
        left = i
        right = i
        while left >= 0 and right < n and s[left] == s[right]:
            total += 1
            left -= 1
            right += 1
        # even length palindromes centred between i and i + 1
        left = i
        right = i + 1
        while left >= 0 and right < n and s[left] == s[right]:
            total += 1
            left -= 1
            right += 1
    return total`,
    tests: [
      { args: ["aabaa"], expected: 9 },
      { args: ["abc"], expected: 3 },
      { args: ["aaa"], expected: 6 },
    ],
  },
  {
    id: "count-prefix-suffix-pairs-i",
    name: "Count Prefix and Suffix Pairs I",
    lc: 3042,
    group: "Strings",
    func: "count_prefix_suffix_pairs",
    argNames: ["words"],
    argKinds: ["list"],
    retKind: "value",
    description: "Count pairs i < j where words[i] is both a prefix and a suffix of words[j].",
    defaultCode: `def count_prefix_suffix_pairs(words):
    n = len(words)
    count = 0
    for i in range(n):
        for j in range(i + 1, n):
            a = words[i]
            b = words[j]
            # bug: only checks the prefix half, but a must sit at BOTH ends of b
            if b.startswith(a):
                count += 1
    return count`,
    solutionCode: `def count_prefix_suffix_pairs(words):
    n = len(words)
    count = 0
    for i in range(n):
        for j in range(i + 1, n):
            a = words[i]
            b = words[j]
            # a has to be a prefix AND a suffix of b
            if b.startswith(a) and b.endswith(a):
                count += 1
    return count`,
    tests: [
      { args: [["a", "aba", "ab", "aa"]], expected: 2 },
      { args: [["pa", "papa", "ma", "mama"]], expected: 2 },
      { args: [["abab", "ab"]], expected: 0 },
    ],
  },
  {
    id: "longest-common-prefix-pairs",
    name: "Find the Length of the Longest Common Prefix",
    lc: 3043,
    group: "Strings",
    func: "longest_common_prefix",
    argNames: ["arr1", "arr2"],
    argKinds: ["list", "list"],
    retKind: "value",
    description: "Longest common prefix length over every pair of numbers from arr1 and arr2.",
    defaultCode: `def longest_common_prefix(arr1, arr2):
    prefixes = set()
    for x in arr1:
        s = str(x)
        # bug: range stops one short, so the whole number is never stored
        for k in range(1, len(s)):
            prefixes.add(s[:k])
    best = 0
    for y in arr2:
        t = str(y)
        for k in range(1, len(t) + 1):
            if t[:k] in prefixes:
                best = max(best, k)
            else:
                break
    return best`,
    solutionCode: `def longest_common_prefix(arr1, arr2):
    prefixes = set()
    for x in arr1:
        s = str(x)
        # every prefix of every number in arr1, including the whole number
        for k in range(1, len(s) + 1):
            prefixes.add(s[:k])
    best = 0
    for y in arr2:
        t = str(y)
        # grow t's prefix while it stays in the set; once it misses, longer ones miss too
        for k in range(1, len(t) + 1):
            if t[:k] in prefixes:
                best = max(best, k)
            else:
                break
    return best`,
    tests: [
      { args: [[1, 10, 100], [1000]], expected: 3 },
      { args: [[2, 3], [4, 5]], expected: 0 },
      { args: [[1, 10], [12]], expected: 1 },
    ],
  },
  {
    id: "count-prefix-suffix-pairs-ii",
    name: "Count Prefix and Suffix Pairs II",
    lc: 3045,
    group: "Strings",
    func: "count_prefix_suffix_pairs_ii",
    argNames: ["words"],
    argKinds: ["list"],
    retKind: "value",
    description: "Count pairs i < j where words[i] is a border of words[j] — both its prefix and its suffix.",
    defaultCode: `def count_prefix_suffix_pairs_ii(words):
    seen = {}  # word -> how many times it appeared earlier
    res = 0
    for w in words:
        # bug: counts w before scanning, so every word pairs with itself
        seen[w] = seen.get(w, 0) + 1
        for k in range(1, len(w) + 1):
            if w[:k] == w[len(w) - k:]:
                res += seen.get(w[:k], 0)
    return res`,
    solutionCode: `def count_prefix_suffix_pairs_ii(words):
    seen = {}  # word -> how many times it appeared earlier
    res = 0
    for w in words:
        # a border of w is a slice that is both its prefix and its suffix;
        # every earlier word equal to that border pairs with w
        for k in range(1, len(w) + 1):
            if w[:k] == w[len(w) - k:]:
                res += seen.get(w[:k], 0)
        seen[w] = seen.get(w, 0) + 1
    return res`,
    tests: [
      { args: [["a", "aba", "ababa", "aa"]], expected: 4 },
      { args: [["pa", "papa", "ma", "mama"]], expected: 2 },
      { args: [["abab", "ab"]], expected: 0 },
    ],
  },
  {
    id: "concatenation-equal-target",
    name: "Number of Pairs of Strings With Concatenation Equal to Target",
    lc: 2023,
    group: "Strings",
    func: "num_of_pairs",
    argNames: ["nums", "target"],
    argKinds: ["list", "string"],
    retKind: "value",
    description: "Count ordered index pairs i != j where nums[i] + nums[j] equals target.",
    defaultCode: `def num_of_pairs(nums, target):
    n = len(nums)
    count = 0
    for i in range(n):
        # bug: the pairs are ordered, so j must sweep every index, not just i + 1
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                count += 1
    return count`,
    solutionCode: `def num_of_pairs(nums, target):
    n = len(nums)
    count = 0
    for i in range(n):
        for j in range(n):
            # (i, j) and (j, i) are different pairs, but i == j is not allowed
            if i != j and nums[i] + nums[j] == target:
                count += 1
    return count`,
    tests: [
      { args: [["777", "7", "77", "77"], "7777"], expected: 4 },
      { args: [["123", "4", "12", "34"], "1234"], expected: 2 },
      { args: [["1", "1", "1"], "11"], expected: 6 },
    ],
  },
  // ───────────────────────── Math ─────────────────────────
  {
    id: "palindrome-number",
    name: "Palindrome Number",
    lc: 9,
    group: "Math",
    func: "is_palindrome_number",
    argNames: ["x"],
    argKinds: ["value"],
    retKind: "value",
    description: "Return true when the integer x reads the same forwards and backwards.",
    defaultCode: `def is_palindrome_number(x):
    if x < 0 or (x % 10 == 0 and x != 0):
        return False
    rev = 0
    # peel digits off the back of x onto rev until they meet
    while x > rev:
        rev = rev * 10 + x % 10
        x = x // 10
    # bug: only handles an even digit count; with an odd count the middle
    # digit is stuck on rev and has to be dropped
    return x == rev`,
    solutionCode: `def is_palindrome_number(x):
    # negatives, and anything ending in 0 except 0 itself, can never work
    if x < 0 or (x % 10 == 0 and x != 0):
        return False
    rev = 0
    # peel digits off the back of x onto rev until they meet in the middle
    while x > rev:
        rev = rev * 10 + x % 10
        x = x // 10
    # even digit count: halves match. odd: drop rev's middle digit first
    return x == rev or x == rev // 10`,
    tests: [
      { args: [121], expected: true },
      { args: [1221], expected: true },
      { args: [-121], expected: false },
    ],
  },
  {
    id: "fizz-buzz",
    name: "Fizz Buzz",
    lc: 412,
    group: "Math",
    func: "fizz_buzz",
    argNames: ["n"],
    argKinds: ["value"],
    retKind: "list",
    description: "Build the classic Fizz / Buzz / FizzBuzz answer strings for 1..n.",
    defaultCode: `def fizz_buzz(n):
    res = []
    for i in range(1, n + 1):
        # bug: 3 is tested before 15, so a multiple of 15 stops at "Fizz"
        if i % 3 == 0:
            res.append("Fizz")
        elif i % 5 == 0:
            res.append("Buzz")
        elif i % 15 == 0:
            res.append("FizzBuzz")
        else:
            res.append(str(i))
    return res`,
    solutionCode: `def fizz_buzz(n):
    res = []
    for i in range(1, n + 1):
        # the strictest rule (divisible by both 3 and 5) has to be tested first
        if i % 15 == 0:
            res.append("FizzBuzz")
        elif i % 3 == 0:
            res.append("Fizz")
        elif i % 5 == 0:
            res.append("Buzz")
        else:
            res.append(str(i))
    return res`,
    tests: [
      {
        args: [15],
        expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"],
      },
      { args: [3], expected: ["1", "2", "Fizz"] },
      { args: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] },
    ],
  },
  {
    id: "count-operations-zero",
    name: "Count Operations to Obtain Zero",
    lc: 2169,
    group: "Math",
    func: "count_operations",
    argNames: ["num1", "num2"],
    argKinds: ["value", "value"],
    retKind: "value",
    description: "Count the subtractions of the smaller number from the larger until one of them hits zero.",
    defaultCode: `def count_operations(num1, num2):
    ops = 0
    while num1 != 0 and num2 != 0:
        if num1 >= num2:
            num1 = num1 - num2
            # bug: the counter is indented into the if, so the subtractions
            # done in the else branch are never counted
            ops = ops + 1
        else:
            num2 = num2 - num1
    return ops`,
    solutionCode: `def count_operations(num1, num2):
    ops = 0
    while num1 != 0 and num2 != 0:
        # always shrink the bigger one by the smaller one
        if num1 >= num2:
            num1 = num1 - num2
        else:
            num2 = num2 - num1
        ops = ops + 1
    return ops`,
    tests: [
      { args: [2, 3], expected: 3 },
      { args: [10, 10], expected: 1 },
      { args: [5, 8], expected: 5 },
    ],
  },
  {
    id: "alternating-digit-sum",
    name: "Alternating Digit Sum",
    lc: 2544,
    group: "Math",
    func: "alternate_digit_sum",
    argNames: ["n"],
    argKinds: ["value"],
    retKind: "value",
    description: "Sum the digits of n with alternating signs, starting positive at the leading digit.",
    defaultCode: `def alternate_digit_sum(n):
    digits = []
    while n > 0:
        digits.append(n % 10)
        n = n // 10
    # bug: digits came off the back of n, so this signs them right-to-left
    # instead of starting positive at the leading digit
    total = 0
    sign = 1
    for i in range(len(digits)):
        total = total + sign * digits[i]
        sign = -sign
    return total`,
    solutionCode: `def alternate_digit_sum(n):
    digits = []
    while n > 0:
        digits.append(n % 10)
        n = n // 10
    # peeling with % 10 gives least-significant first, so flip it around
    digits.reverse()
    total = 0
    sign = 1  # the leading digit is positive
    for i in range(len(digits)):
        total = total + sign * digits[i]
        sign = -sign
    return total`,
    tests: [
      { args: [4321], expected: 2 },
      { args: [521], expected: 4 },
      { args: [111], expected: 1 },
    ],
  },
  {
    id: "min-time-difference",
    name: "Minimum Time Difference",
    lc: 539,
    group: "Math",
    func: "find_min_difference",
    argNames: ["time_points"],
    argKinds: ["list"],
    retKind: "value",
    description: "Smallest minutes between any two clock times, counting across midnight.",
    defaultCode: `def find_min_difference(time_points):
    minutes = []
    for t in time_points:
        minutes.append(int(t[0:2]) * 60 + int(t[3:5]))
    minutes.sort()
    # bug: only compares neighbours, so the pair that wraps past midnight
    # (last time to first time) is never considered
    best = 24 * 60
    for i in range(1, len(minutes)):
        gap = minutes[i] - minutes[i - 1]
        if gap < best:
            best = gap
    return best`,
    solutionCode: `def find_min_difference(time_points):
    minutes = []
    for t in time_points:
        # "HH:MM" -> minutes since midnight
        minutes.append(int(t[0:2]) * 60 + int(t[3:5]))
    minutes.sort()
    # start from the wrap-around pair: last time round to the first one
    best = 24 * 60 - minutes[-1] + minutes[0]
    for i in range(1, len(minutes)):
        gap = minutes[i] - minutes[i - 1]
        if gap < best:
            best = gap
    return best`,
    tests: [
      { args: [["23:59", "00:00", "12:30", "12:45"]], expected: 1 },
      { args: [["01:10", "03:00", "02:20"]], expected: 40 },
      { args: [["00:00", "23:59", "00:00"]], expected: 0 },
    ],
  },
  // ───────────────────────── Intervals ─────────────────────────
  {
    id: "merge-intervals",
    name: "Merge Intervals",
    lc: 56,
    group: "Intervals",
    func: "merge_intervals",
    argNames: ["intervals"],
    argKinds: ["matrix"],
    retKind: "list",
    description: "Merge every set of overlapping intervals into one.",
    defaultCode: `def merge_intervals(intervals):
    # bug: assumes the intervals already arrive sorted by start time
    merged = [[intervals[0][0], intervals[0][1]]]
    for i in range(1, len(intervals)):
        start = intervals[i][0]
        end = intervals[i][1]
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,
    solutionCode: `def merge_intervals(intervals):
    intervals.sort(key=lambda x: x[0])  # earliest start first
    merged = [[intervals[0][0], intervals[0][1]]]
    for i in range(1, len(intervals)):
        start = intervals[i][0]
        end = intervals[i][1]
        if start <= merged[-1][1]:
            # overlaps the block we are building, so stretch its end
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,
    tests: [
      { args: [[[1, 3], [8, 10], [2, 6], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { args: [[[1, 4], [2, 3]]], expected: [[1, 4]] },
    ],
  },
  {
    id: "meeting-rooms-ii",
    name: "Meeting Rooms II",
    lc: 253,
    group: "Intervals",
    func: "min_meeting_rooms",
    argNames: ["intervals"],
    argKinds: ["matrix"],
    retKind: "value",
    render: { heap: ["heap"] },
    description: "Fewest conference rooms needed to hold every meeting.",
    defaultCode: `import heapq

def min_meeting_rooms(intervals):
    intervals.sort(key=lambda x: x[0])
    heap = []  # end times of the meetings still running
    for i in range(len(intervals)):
        start = intervals[i][0]
        end = intervals[i][1]
        # bug: uses a strict <, so a room whose meeting ends exactly when the
        # next one starts is treated as still busy and a new room is opened
        if heap and heap[0] < start:
            heapq.heappop(heap)
        heapq.heappush(heap, end)
    return len(heap)`,
    solutionCode: `import heapq

def min_meeting_rooms(intervals):
    intervals.sort(key=lambda x: x[0])  # walk the meetings in start order
    heap = []  # end times of the meetings still running
    for i in range(len(intervals)):
        start = intervals[i][0]
        end = intervals[i][1]
        # the earliest-ending meeting frees its room if it is already over
        if heap and heap[0] <= start:
            heapq.heappop(heap)
        heapq.heappush(heap, end)
    return len(heap)`,
    tests: [
      { args: [[[0, 10], [10, 20], [5, 15], [20, 30]]], expected: 2 },
      { args: [[[7, 10], [2, 4]]], expected: 1 },
      { args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
    ],
  },
  {
    id: "non-overlapping-intervals",
    name: "Non-overlapping Intervals",
    lc: 435,
    group: "Intervals",
    func: "erase_overlap_intervals",
    argNames: ["intervals"],
    argKinds: ["matrix"],
    retKind: "value",
    description: "Fewest intervals to remove so the rest never overlap.",
    defaultCode: `def erase_overlap_intervals(intervals):
    # bug: greedy needs the earliest END time, not the earliest start
    intervals.sort(key=lambda x: x[0])
    removed = 0
    prev_end = intervals[0][1]
    for i in range(1, len(intervals)):
        start = intervals[i][0]
        end = intervals[i][1]
        if start < prev_end:
            removed += 1
        else:
            prev_end = end
    return removed`,
    solutionCode: `def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda x: x[1])  # earliest finisher first
    removed = 0
    prev_end = intervals[0][1]
    for i in range(1, len(intervals)):
        start = intervals[i][0]
        end = intervals[i][1]
        if start < prev_end:
            removed += 1  # drop this one, the earlier finisher is safer
        else:
            prev_end = end
    return removed`,
    tests: [
      { args: [[[1, 100], [11, 22], [1, 11], [2, 12]]], expected: 2 },
      { args: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expected: 1 },
      { args: [[[1, 2], [1, 2], [1, 2]]], expected: 2 },
    ],
  },
  {
    id: "brightest-position-street",
    name: "Brightest Position on Street",
    lc: 2021,
    group: "Intervals",
    func: "brightest_position",
    argNames: ["lights"],
    argKinds: ["matrix"],
    retKind: "value",
    description: "Smallest position on the street lit by the most lamps.",
    defaultCode: `def brightest_position(lights):
    delta = {}  # position -> change in brightness
    for i in range(len(lights)):
        start_pos = lights[i][0] - lights[i][1]
        # bug: the lit range is inclusive, so turning the light off at
        # position + range darkens the last position it actually covers
        end_pos = lights[i][0] + lights[i][1]
        delta[start_pos] = delta.get(start_pos, 0) + 1
        delta[end_pos] = delta.get(end_pos, 0) - 1
    positions = sorted(delta)
    best_pos = positions[0]
    best = 0
    running = 0
    for i in range(len(positions)):
        pos = positions[i]
        running += delta[pos]
        if running > best:
            best = running
            best_pos = pos
    return best_pos`,
    solutionCode: `def brightest_position(lights):
    delta = {}  # position -> change in brightness
    for i in range(len(lights)):
        start_pos = lights[i][0] - lights[i][1]
        end_pos = lights[i][0] + lights[i][1] + 1  # first position past the light
        delta[start_pos] = delta.get(start_pos, 0) + 1
        delta[end_pos] = delta.get(end_pos, 0) - 1
    positions = sorted(delta)
    best_pos = positions[0]
    best = 0
    running = 0
    # sweep left to right, adding up the events we pass
    for i in range(len(positions)):
        pos = positions[i]
        running += delta[pos]
        if running > best:
            best = running
            best_pos = pos
    return best_pos`,
    tests: [
      { args: [[[-3, 2], [1, 2], [3, 3]]], expected: -1 },
      { args: [[[1, 0], [0, 1]]], expected: 1 },
      { args: [[[1, 2]]], expected: -1 },
    ],
  },
  // ───────────────────────── Backtracking ─────────────────────────
  {
    id: "letter-combinations",
    name: "Letter Combinations of a Phone Number",
    lc: 17,
    group: "Backtracking",
    func: "letter_combinations",
    argNames: ["digits"],
    argKinds: ["string"],
    retKind: "list",
    compare: "set",
    description: "All letter strings a phone keypad could spell from the digits.",
    defaultCode: `def letter_combinations(digits):
    if not digits:
        return []
    letters = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
               "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    res = []
    path = []

    def backtrack(i):
        if i == len(digits):
            res.append("".join(path))
            return
        for ch in letters[digits[i]]:
            path.append(ch)
            backtrack(i + 1)
            # bug: the letter is never removed, so path keeps growing

    backtrack(0)
    return res`,
    solutionCode: `def letter_combinations(digits):
    if not digits:
        return []
    letters = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
               "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    res = []
    path = []

    def backtrack(i):
        # every digit has been given a letter
        if i == len(digits):
            res.append("".join(path))
            return
        for ch in letters[digits[i]]:
            path.append(ch)
            backtrack(i + 1)
            path.pop()  # undo the choice before trying the next letter

    backtrack(0)
    return res`,
    tests: [
      { args: ["23"], expected: ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"] },
      { args: [""], expected: [] },
      { args: ["9"], expected: ["w", "x", "y", "z"] },
    ],
  },
  // ───────────────────────── Dynamic Programming ─────────────────────────
  {
    id: "remove-boxes",
    name: "Remove Boxes",
    lc: 546,
    group: "Dynamic Programming",
    func: "remove_boxes",
    argNames: ["boxes"],
    argKinds: ["list"],
    retKind: "value",
    description: "Remove runs of equal boxes for k*k points each; maximise the total.",
    defaultCode: `def remove_boxes(boxes):
    memo = {}

    # best score for boxes[i..j] with k extra boxes equal to boxes[i]
    # already attached on the left
    def dp(i, j, k):
        if i > j:
            return 0
        key = str(i) + "," + str(j) + "," + str(k)
        if key in memo:
            return memo[key]
        while i + 1 <= j and boxes[i + 1] == boxes[i]:
            i += 1
            k += 1
        best = (k + 1) * (k + 1) + dp(i + 1, j, 0)
        for m in range(i + 1, j + 1):
            if boxes[m] == boxes[i]:
                # bug: forgets that box i itself joins the run, so it passes
                # k instead of k+1 to the merged subproblem
                best = max(best, dp(i + 1, m - 1, 0) + dp(m, j, k))
        memo[key] = best
        return best

    return dp(0, len(boxes) - 1, 0)`,
    solutionCode: `def remove_boxes(boxes):
    memo = {}

    # best score for boxes[i..j] with k extra boxes equal to boxes[i]
    # already attached on the left
    def dp(i, j, k):
        if i > j:
            return 0
        key = str(i) + "," + str(j) + "," + str(k)
        if key in memo:
            return memo[key]
        # absorb the run of equal boxes sitting right after i
        while i + 1 <= j and boxes[i + 1] == boxes[i]:
            i += 1
            k += 1
        # option 1: cash in the whole run of k+1 boxes right now
        best = (k + 1) * (k + 1) + dp(i + 1, j, 0)
        # option 2: clear the gap first so a later equal box joins the run
        for m in range(i + 1, j + 1):
            if boxes[m] == boxes[i]:
                best = max(best, dp(i + 1, m - 1, 0) + dp(m, j, k + 1))
        memo[key] = best
        return best

    return dp(0, len(boxes) - 1, 0)`,
    tests: [
      { args: [[1, 2, 2, 1]], expected: 8 },
      { args: [[1, 1, 1]], expected: 9 },
      { args: [[1, 2, 1, 2, 1]], expected: 11 },
    ],
  },
  // ───────────────────────── Design ─────────────────────────
  {
    id: "simple-bank-system",
    name: "Simple Bank System",
    lc: 2043,
    group: "Design",
    mode: "ops",
    className: "Bank",
    description: "A bank with n accounts that validates every transfer, deposit and withdrawal.",
    defaultCode: `class Bank:
    def __init__(self, balance):
        self.balance = balance
        self.n = len(balance)

    def is_valid(self, account):
        # bug: accounts are numbered 1..n, so the last account
        # needs <= here — with < it is always rejected
        return 1 <= account < self.n

    def transfer(self, account1, account2, money):
        if not self.is_valid(account1) or not self.is_valid(account2):
            return False
        if self.balance[account1 - 1] < money:
            return False
        self.balance[account1 - 1] -= money
        self.balance[account2 - 1] += money
        return True

    def deposit(self, account, money):
        if not self.is_valid(account):
            return False
        self.balance[account - 1] += money
        return True

    def withdraw(self, account, money):
        if not self.is_valid(account):
            return False
        if self.balance[account - 1] < money:
            return False
        self.balance[account - 1] -= money
        return True`,
    solutionCode: `class Bank:
    def __init__(self, balance):
        self.balance = balance  # balance[i] belongs to account i + 1
        self.n = len(balance)

    def is_valid(self, account):
        # accounts are numbered 1..n
        return 1 <= account <= self.n

    def transfer(self, account1, account2, money):
        # both accounts must exist and the sender must cover the amount
        if not self.is_valid(account1) or not self.is_valid(account2):
            return False
        if self.balance[account1 - 1] < money:
            return False
        self.balance[account1 - 1] -= money
        self.balance[account2 - 1] += money
        return True

    def deposit(self, account, money):
        if not self.is_valid(account):
            return False
        self.balance[account - 1] += money
        return True

    def withdraw(self, account, money):
        if not self.is_valid(account):
            return False
        if self.balance[account - 1] < money:
            return False
        self.balance[account - 1] -= money
        return True`,
    tests: [
      {
        ops: ["Bank", "withdraw", "transfer", "deposit", "transfer", "withdraw"],
        opArgs: [[[10, 100, 20, 50, 30]], [3, 10], [5, 1, 20], [5, 20], [3, 4, 15], [10, 50]],
        expected: [null, true, true, true, false, false],
      },
      {
        ops: ["Bank", "deposit", "withdraw", "transfer"],
        opArgs: [[[10, 20]], [1, 5], [2, 30], [1, 2, 15]],
        expected: [null, true, false, true],
      },
      {
        ops: ["Bank", "transfer", "deposit", "withdraw"],
        opArgs: [[[100, 50]], [1, 3, 10], [3, 5], [2, 50]],
        expected: [null, false, false, true],
      },
    ],
  },
  {
    id: "design-memory-allocator",
    name: "Design Memory Allocator",
    lc: 2502,
    group: "Design",
    mode: "ops",
    className: "Allocator",
    description: "Allocate the leftmost run of free memory units and free them again by id.",
    defaultCode: `class Allocator:
    def __init__(self, n):
        self.memory = [0] * n  # 0 means the unit is free

    def allocate(self, size, mID):
        count = 0
        for i in range(len(self.memory)):
            if self.memory[i] == 0:
                count += 1
            # bug: count is never reset when the unit is taken, so free
            # units on both sides of a used block look like one run
            if count == size:
                start = i - size + 1
                for j in range(start, i + 1):
                    self.memory[j] = mID
                return start
        return -1

    def freeMemory(self, mID):
        freed = 0
        for i in range(len(self.memory)):
            if self.memory[i] == mID:
                self.memory[i] = 0
                freed += 1
        return freed`,
    solutionCode: `class Allocator:
    def __init__(self, n):
        self.memory = [0] * n  # 0 means the unit is free

    def allocate(self, size, mID):
        count = 0  # length of the free run ending at i
        for i in range(len(self.memory)):
            if self.memory[i] == 0:
                count += 1
            else:
                count = 0
            if count == size:
                start = i - size + 1
                for j in range(start, i + 1):
                    self.memory[j] = mID
                return start
        return -1

    def freeMemory(self, mID):
        freed = 0
        for i in range(len(self.memory)):
            if self.memory[i] == mID:
                self.memory[i] = 0
                freed += 1
        return freed`,
    tests: [
      {
        ops: ["Allocator", "allocate", "allocate", "allocate", "freeMemory", "allocate"],
        opArgs: [[10], [1, 1], [1, 2], [1, 3], [2], [3, 4]],
        expected: [null, 0, 1, 2, 1, 3],
      },
      {
        ops: ["Allocator", "allocate", "allocate", "freeMemory", "allocate", "allocate"],
        opArgs: [[10], [4, 1], [4, 2], [1], [10, 3], [4, 5]],
        expected: [null, 0, 4, 4, -1, 0],
      },
      {
        ops: ["Allocator", "allocate", "freeMemory", "freeMemory", "allocate"],
        opArgs: [[10], [2, 7], [9], [7], [10, 8]],
        expected: [null, 0, 0, 2, 0],
      },
    ],
  },
  {
    id: "design-file-system",
    name: "Design File System",
    lc: 1166,
    group: "Design",
    mode: "ops",
    className: "FileSystem",
    description: "Create paths with values, but only when the parent path already exists.",
    defaultCode: `class FileSystem:
    def __init__(self):
        self.paths = {}  # full path string -> value

    def createPath(self, path, value):
        if len(path) < 2 or path[0] != "/":
            return False
        if path in self.paths:
            return False
        # bug: never checks that the parent path exists first
        self.paths[path] = value
        return True

    def get(self, path):
        if path in self.paths:
            return self.paths[path]
        return -1`,
    solutionCode: `class FileSystem:
    def __init__(self):
        self.paths = {}  # full path string -> value

    def createPath(self, path, value):
        # "" and "/" are not valid paths
        if len(path) < 2 or path[0] != "/":
            return False
        if path in self.paths:
            return False
        parent = path[:path.rfind("/")]
        # an empty parent means the root, which always exists
        if parent != "" and parent not in self.paths:
            return False
        self.paths[path] = value
        return True

    def get(self, path):
        if path in self.paths:
            return self.paths[path]
        return -1`,
    tests: [
      {
        ops: ["FileSystem", "createPath", "createPath", "get", "createPath", "get"],
        opArgs: [[], ["/leet", 1], ["/leet/code", 2], ["/leet/code"], ["/c/d", 1], ["/c"]],
        expected: [null, true, true, 2, false, -1],
      },
      {
        ops: ["FileSystem", "createPath", "createPath", "get"],
        opArgs: [[], ["/a", 1], ["/a", 2], ["/a"]],
        expected: [null, true, false, 1],
      },
      {
        ops: ["FileSystem", "get", "createPath", "createPath", "get"],
        opArgs: [[], ["/x"], ["/x", 5], ["/x/y", 6], ["/x/y"]],
        expected: [null, -1, true, true, 6],
      },
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
  "Strings",
  "Math",
  "Intervals",
  "Backtracking",
  "Dynamic Programming",
  "Design",
];
