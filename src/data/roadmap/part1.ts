import { RoadmapModule } from '../../types';

export const PART_1: RoadmapModule = {
  key: 'part-1',
  title: 'Phần 1 (Mảng) · Kỹ thuật mảng chuyên sâu',
  icon: '🧱',
  description: 'Mảng cộng dồn 1D/2D, Mảng hiệu (Difference Array), Thuật toán Kadane 1D/2D, Sliding Window, Two Pointers và Nén tọa độ.',
  lessons: [
    {
      id: '1-1',
      title: 'Mảng cộng dồn 1D & 2D (Prefix Sum)',
      xp: 30,
      subtitle: 'Trả lời truy vấn tổng đoạn trong O(1) sau tiền xử lý O(N)',
      theory: 'Kỹ thuật tiền tính tổng tiền tố để tính tổng của bất kỳ đoạn con [L, R] hoặc hình chữ nhật con [x1, y1, x2, y2] trong O(1).',
      theoryDeep: {
        intuition: 'Thay vì mỗi truy vấn phải lặp từ L đến R tốn O(N), ta tính trước mảng pref[i] = tổng từ 1 đến i. Khi đó tổng [L, R] = pref[R] - pref[L - 1]. Tương tự với ma trận 2D dựa trên nguyên lý bù trừ hình học.',
        mathInvariant: '1D: sum(L, R) = pref[R] - pref[L - 1].\n2D: sum(x1, y1, x2, y2) = pref[x2][y2] - pref[x1-1][y2] - pref[x2][y1-1] + pref[x1-1][y1-1].',
        steps: [
          'Khởi tạo mảng pref với kích thước (N + 1) và đánh số từ 1 (1-indexed).',
          'Duyệt tính tiền tố: pref[i] = pref[i - 1] + a[i].',
          'Với 2D: pref[i][j] = a[i][j] + pref[i-1][j] + pref[i][j-1] - pref[i-1][j-1].'
        ],
        complexity: {
          time: 'Tiền xử lý O(N*M), mỗi truy vấn O(1)',
          space: 'O(N*M)'
        },
        pitfalls: [
          'Dùng chỉ số 0-indexed dễ bị lỗi truy cập pref[-1] khi L = 0. Nên đổi sang 1-indexed để pref[0] = 0 an toàn.'
        ],
        practiceProblems: [
          { name: 'Static Range Sum Queries', oj: 'CSES 1646', diff: 'Dễ', linkHint: 'Mảng cộng dồn 1D cơ bản', url: 'https://cses.fi/problemset/task/1646' },
          { name: 'Forest Queries', oj: 'CSES 1652', diff: 'Trung bình', linkHint: 'Mảng cộng dồn 2D trên lưới cây rừng', url: 'https://cses.fi/problemset/task/1652' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n = 5;
    vector<int> a = {0, 3, 2, 4, 5, 1}; // 1-indexed
    vector<long long> pref(n + 1, 0);

    for (int i = 1; i <= n; i++) {
        pref[i] = pref[i - 1] + a[i];
    }

    // Truy vấn tổng đoạn [2, 4] (a[2]+a[3]+a[4] = 2+4+5 = 11)
    int L = 2, R = 4;
    long long sum = pref[R] - pref[L - 1];
    cout << "Tong doan [" << L << ", " << R << "] = " << sum << "\\n"; // 11
    return 0;
}`
    },
    {
      id: '1-2',
      title: 'Mảng hiệu (Difference Array 1D & 2D)',
      xp: 35,
      subtitle: 'Cập nhật cộng giá trị lên cả một đoạn [L, R] trong O(1)',
      theory: 'Kỹ thuật mảng hiệu cho phép cộng giá trị d vào toàn bộ đoạn [L, R] trong O(1), sau đó dùng prefix sum để khôi phục mảng kết quả trong O(N).',
      theoryDeep: {
        intuition: 'Nếu cần thực hiện Q truy vấn cộng giá trị vào đoạn [L, R], cách ngây thơ tốn O(Q * N). Mảng hiệu diff[i] = a[i] - a[i-1]. Thao tác cộng d vào [L, R] chỉ làm thay đổi 2 vị trí: diff[L] += d và diff[R + 1] -= d.',
        mathInvariant: 'Cộng d vào [L, R]: diff[L] += d, diff[R + 1] -= d. Mảng ban đầu = Prefix sum của mảng hiệu diff.',
        steps: [
          'Khởi tạo mảng diff[N + 2] bằng 0.',
          'Mỗi truy vấn (L, R, d): diff[L] += d; diff[R + 1] -= d;.',
          'Sau khi thực hiện hết mọi truy vấn, chạy 1 vòng lặp tính mảng cộng dồn của diff để thu được mảng cuối cùng.'
        ],
        complexity: {
          time: 'Mỗi cập nhật O(1), tái tạo mảng O(N)',
          space: 'O(N)'
        },
        pitfalls: [
          'Khai báo mảng diff thiếu kích thước: diff[R + 1] có thể chạm tới N + 1, do đó kích thước tối thiểu phải là N + 2.'
        ],
        practiceProblems: [
          { name: 'Greg and Array (Difference Array)', oj: 'Codeforces 295A', diff: 'Trung bình', linkHint: 'Mảng hiệu 1D cho các sự kiện đoạn', url: 'https://codeforces.com/problemset/problem/295/A' },
          { name: 'Range Update Queries', oj: 'CSES 1651', diff: 'Trung bình', linkHint: 'Cập nhật đoạn trên mảng hiệu', url: 'https://cses.fi/problemset/task/1651' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n = 5;
    vector<long long> diff(n + 2, 0);

    // Truy vấn 1: cộng 10 vào đoạn [1, 3]
    diff[1] += 10; diff[3 + 1] -= 10;
    // Truy vấn 2: cộng 5 vào đoạn [2, 5]
    diff[2] += 5; diff[5 + 1] -= 5;

    // Khôi phục mảng kết quả bằng Prefix Sum
    vector<long long> a(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        a[i] = a[i - 1] + diff[i];
        cout << a[i] << " "; // 10 15 15 5 5
    }
    cout << "\\n";
    return 0;
}`
    },
    {
      id: '1-3',
      title: 'Thuật toán Kadane 1D & 2D',
      xp: 35,
      subtitle: 'Tìm đoạn con liên tiếp có tổng lớn nhất trong O(N) và O(N³)',
      theory: 'Thuật toán Kadane tìm đoạn con có tổng lớn nhất trong O(N) bằng quy hoạch động, mở rộng sang ma trận 2D bằng cách ép 2 dòng.',
      theoryDeep: {
        intuition: 'Tại mỗi vị trí i, tổng đoạn con kết thúc tại i hoặc là tự một mình phần tử a[i], hoặc là mở rộng từ đoạn con trước đó: max_ending_here = max(a[i], max_ending_here + a[i]).',
        mathInvariant: 'dp[i] = max(a[i], dp[i - 1] + a[i]). Đáp án là max của toàn bộ mảng dp.',
        steps: [
          'Khởi tạo max_so_far = a[0], current_max = a[0].',
          'Duyệt từ i = 1 đến N - 1: current_max = max(a[i], current_max + a[i]).',
          'max_so_far = max(max_so_far, current_max).'
        ],
        complexity: {
          time: '1D: O(N); 2D: O(N^3)',
          space: 'O(1) bộ nhớ'
        },
        pitfalls: [
          'Khởi tạo max_so_far = 0: Nếu mảng toàn số âm, đáp án sẽ ra 0 là sai! Phải khởi tạo bằng a[0] hoặc -INF.'
        ],
        practiceProblems: [
          { name: 'Maximum Subarray Sum', oj: 'CSES 1643', diff: 'Dễ', linkHint: 'Kadane 1D chuẩn', url: 'https://cses.fi/problemset/task/1643' },
          { name: 'Max Subarray LeetCode', oj: 'LeetCode 53', diff: 'Dễ', linkHint: 'Kadane kinh điển', url: 'https://leetcode.com/problems/maximum-subarray/' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

long long maxSubarraySum(const vector<long long>& a) {
    long long max_so_far = a[0];
    long long current_max = a[0];

    for (size_t i = 1; i < a.size(); i++) {
        current_max = max(a[i], current_max + a[i]);
        max_so_far = max(max_so_far, current_max);
    }
    return max_so_far;
}

int main() {
    vector<long long> a = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    cout << "Tong doan con lon nhat: " << maxSubarraySum(a) << "\\n"; // 6 (đoạn [4, -1, 2, 1])
    return 0;
}`
    },
    {
      id: '1-4',
      title: 'Sliding Window & Deque đơn điệu',
      xp: 35,
      subtitle: 'Tìm min/max trên đoạn trượt độ dài K trong O(N)',
      theory: 'Kỹ thuật cửa sổ trượt duy trì các phần tử tiềm năng trong Deque đơn điệu để tìm phần tử lớn nhất/nhỏ nhất trên đoạn tịnh tiến trong O(N).',
      theoryDeep: {
        intuition: 'Nếu phần tử a[i] lớn hơn hoặc bằng a[j] (với i > j), thì a[j] sẽ không bao giờ có cơ hội trở thành phần tử lớn nhất trong bất kỳ cửa sổ nào trong tương lai. Ta có thể loại bỏ a[j] ngay lập tức.',
        mathInvariant: 'Deque luôn duy trì chỉ số theo thứ tự giá trị giảm dần nghiêm ngặt.',
        steps: [
          'Loại bỏ các chỉ số nằm ngoài phạm vi cửa sổ [i - k + 1, i] ở đầu deque.',
          'Loại bỏ các phần tử nhỏ hơn a[i] ở đuôi deque.',
          'Thêm chỉ số i vào đuôi deque.',
          'Phần tử đầu deque luôn là max của cửa sổ.'
        ],
        complexity: {
          time: 'O(N) khấu hao (mỗi phần tử vào và ra deque tối đa 1 lần)',
          space: 'O(K)'
        },
        pitfalls: [
          'Lưu giá trị thay vì chỉ số vào deque: lưu giá trị sẽ không thể kiểm tra được phần tử đã trôi ra ngoài cửa sổ hay chưa.'
        ],
        practiceProblems: [
          { name: 'Sliding Window Maximum', oj: 'LeetCode 239', diff: 'Trung bình', linkHint: 'Duy trì max trên cửa sổ độ dài K', url: 'https://leetcode.com/problems/sliding-window-maximum/' },
          { name: 'Playlist (Unique Sliding Window)', oj: 'CSES 1141', diff: 'Trung bình', linkHint: 'Cửa sổ trượt tìm bài hát không trùng', url: 'https://cses.fi/problemset/task/1141' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

vector<int> maxSlidingWindow(const vector<int>& a, int k) {
    deque<int> dq;
    vector<int> res;
    for (int i = 0; i < (int)a.size(); i++) {
        if (!dq.empty() && dq.front() <= i - k) dq.pop_front();
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) res.push_back(a[dq.front()]);
    }
    return res;
}

int main() {
    vector<int> a = {1, 3, -1, -3, 5, 3, 6, 7};
    auto ans = maxSlidingWindow(a, 3);
    for (int x : ans) cout << x << " "; // 3 3 5 5 6 7
    cout << "\\n";
    return 0;
}`
    },
    {
      id: '1-5',
      title: 'Two Pointers (Hai con trỏ)',
      xp: 30,
      subtitle: 'Kỹ thuật hai con trỏ ngược chiều và cùng chiều trên mảng đơn điệu',
      theory: 'Kỹ thuật hai con trỏ giảm độ phức tạp từ O(N²) xuống O(N) bằng cách tận dụng tính chất đơn điệu của bài toán.',
      theoryDeep: {
        intuition: 'Khi mảng đã sắp xếp, nếu tổng hai phần tử A[L] + A[R] < X, ta bắt buộc phải tăng L. Nếu tổng > X, ta bắt buộc phải giảm R.',
        mathInvariant: 'Khoảng cách giữa hai con trỏ giảm dần sau mỗi bước lặp.',
        steps: [
          'Sắp xếp mảng nếu cần thiết.',
          'Đặt L = 0, R = N - 1.',
          'Tính tổng và tịnh tiến con trỏ tương ứng.'
        ],
        complexity: {
          time: 'O(N log N) cho sắp xếp + O(N) duyệt',
          space: 'O(1)'
        },
        pitfalls: [
          'Áp dụng hai con trỏ khi mảng có phần tử âm mà không thỏa mãn tính đơn điệu.'
        ],
        practiceProblems: [
          { name: 'Sum of Two Values', oj: 'CSES 1640', diff: 'Dễ', linkHint: 'Tìm 2 phần tử có tổng bằng X', url: 'https://cses.fi/problemset/task/1640' },
          { name: 'Sum of Three Values', oj: 'CSES 1641', diff: 'Trung bình', linkHint: 'Kết hợp vòng lặp và two pointers', url: 'https://cses.fi/problemset/task/1641' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> a = {1, 2, 4, 7, 11, 15};
    int X = 15;
    int l = 0, r = a.size() - 1;
    while (l < r) {
        int sum = a[l] + a[r];
        if (sum == X) {
            cout << "Tim thay: " << a[l] << " + " << a[r] << " = " << X << "\\n";
            return 0;
        } else if (sum < X) l++;
        else r--;
    }
    cout << "Khong tim thay\\n";
    return 0;
}`
    },
    {
      id: '1-6',
      title: 'Nén tọa độ (Coordinate Compression)',
      xp: 35,
      subtitle: 'Ánh xạ giá trị lớn (10⁹) về giá trị nhỏ (1..N) bảo toàn thứ tự',
      theory: 'Kỹ thuật ánh xạ tập giá trị rời rạc lên đến 10^9 về tập [0..N-1] để làm chỉ số cho mảng, Fenwick Tree hoặc Segment Tree.',
      theoryDeep: {
        intuition: 'Nếu đề bài cho giá trị A[i] <= 10^9 nhưng N <= 10^5, ta không thể tạo mảng bit[10^9]. Nén tọa độ chỉ giữ lại thứ tự tương đối giữa các phần tử bằng std::sort và std::unique.',
        mathInvariant: 'A[i] < A[j] <=> Compressed(A[i]) < Compressed(A[j]).',
        steps: [
          'Sao chép mảng gốc sang vector tạm `vals`.',
          'Sắp xếp `sort(vals.begin(), vals.end())`.',
          'Loại bỏ phần tử trùng lặp bằng `vals.erase(unique(vals.begin(), vals.end()), vals.end())`.',
          'Giá trị mới của x là `lower_bound(vals.begin(), vals.end(), x) - vals.begin()`.'
        ],
        complexity: {
          time: 'O(N log N)',
          space: 'O(N)'
        },
        pitfalls: [
          'Quên gọi `erase(unique(...))` dẫn đến các giá trị trùng lặp vẫn tồn tại nhiều lần trong bảng nén.'
        ],
        practiceProblems: [
          { name: 'Salary Queries', oj: 'CSES 1144', diff: 'Trung bình', linkHint: 'Nén tọa độ kết hợp Fenwick Tree', url: 'https://cses.fi/problemset/task/1144' },
          { name: 'Static Range Frequency Queries', oj: 'Codeforces 1360E', diff: 'Trung bình', linkHint: 'Nén giá trị và dùng vector chỉ số', url: 'https://codeforces.com/problemset/problem/1360/E' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<long long> a = {1000000000, 50, 1000000000, 300, 50};
    vector<long long> vals = a;

    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());

    cout << "Mang sau khi nen toa do:\\n";
    for (auto x : a) {
        int compressed = lower_bound(vals.begin(), vals.end(), x) - vals.begin();
        cout << x << " -> " << compressed << "\\n";
    }
    // 1000000000 -> 2, 50 -> 0, 300 -> 1
    return 0;
}`
    }
  ]
};
