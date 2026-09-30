import { RoadmapModule } from '../../types';

export const PART_5: RoadmapModule = {
  key: 'part-5',
  title: 'Phần 5 (Quy hoạch động - DP) · Dynamic Programming Mastery',
  icon: '📈',
  description: 'LIS O(N log N), Knapsack 0/1, LCS & Edit Distance, Bitmask DP, Digit DP, Tree DP và Convex Hull Trick (CHT).',
  lessons: [
    {
      id: '5-1',
      title: 'Dãy con tăng dài nhất (LIS O(N log N))',
      xp: 35,
      subtitle: 'Tối ưu bằng mảng tails và tìm kiếm nhị phân std::lower_bound',
      theory: 'Kỹ thuật tìm dãy con tăng nghiêm ngặt dài nhất trong O(N log N) bằng cách duy trì mảng phần tử kết thúc nhỏ nhất.',
      theoryDeep: {
        intuition: 'DP O(N^2) duyệt hai vòng lặp. Để tối ưu thành O(N log N), ta duy trì vector `tails` trong đó `tails[i]` là giá trị nhỏ nhất của phần tử kết thúc một dãy con tăng độ dài i + 1. Vì `tails` luôn tăng dần, ta có thể dùng binary search (lower_bound) để tìm vị trí thay thế trong O(log N).',
        mathInvariant: 'Mảng tails luôn đơn điệu tăng nghiêm ngặt: tails[0] < tails[1] < ... < tails[k-1].',
        steps: [
          'Duyệt từng phần tử x trong mảng ban đầu.',
          'Dùng lower_bound tìm phần tử đầu tiên >= x trong tails.',
          'Nếu tìm thấy: cập nhật *it = x; nếu không tìm thấy: tails.push_back(x).',
          'Độ dài LIS chính là tails.size().'
        ],
        complexity: {
          time: 'O(N log N)',
          space: 'O(N)'
        },
        pitfalls: [
          'Nếu bài toán yêu cầu dãy con tăng KHÔNG NGHIÊM NGẶT (a[i] <= a[j]), phải dùng `upper_bound` thay vì `lower_bound`.'
        ],
        practiceProblems: [
          { name: 'Increasing Subsequence', oj: 'CSES', diff: 'Trung bình', linkHint: 'LIS O(N log N) chuẩn' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int lengthOfLIS(const vector<int>& a) {
    vector<int> tails;
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return tails.size();
}

int main() {
    vector<int> a = {10, 9, 2, 5, 3, 7, 101, 18};
    cout << "Do dai LIS: " << lengthOfLIS(a) << "\\n"; // 4 (đoạn [2, 3, 7, 101])
    return 0;
}`
    },
    {
      id: '5-2',
      title: 'Knapsack 0/1 & Các biến thể',
      xp: 35,
      subtitle: 'Tối ưu không gian 1 chiều, Balo không giới hạn, Balo đa chiều',
      theory: 'Bài toán kinh điển chọn tập đồ vật tối đa hóa giá trị với giới hạn trọng lượng W.',
      theoryDeep: {
        intuition: 'Duyệt mảng 1D từ W lùi về wt[i] để đảm bảo mỗi đồ vật chỉ được chọn 1 lần. Nếu duyệt xuôi từ wt[i] lên W, đồ vật có thể được chọn vô hạn lần (Balo không giới hạn).',
        mathInvariant: 'dp[w] = max(dp[w], dp[w - wt[i]] + val[i]).',
        steps: [
          'Khởi tạo dp[W + 1] bằng 0.',
          'Duyệt từng vật (wt[i], val[i]).',
          'Duyệt lùi w từ W về wt[i].'
        ],
        complexity: {
          time: 'O(N * W)',
          space: 'O(W)'
        },
        pitfalls: [
          'Duyệt xuôi trong Balo 0/1 sẽ làm biến thành Balo không giới hạn (Unbounded Knapsack).'
        ],
        practiceProblems: [
          { name: 'Book Shop', oj: 'CSES', diff: 'Trung bình', linkHint: 'Balo 0/1 tối ưu mảng 1D' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n = 4, W = 10;
    vector<int> wt = {2, 3, 4, 5};
    vector<int> val = {3, 4, 5, 8};

    vector<long long> dp(W + 1, 0);
    for (int i = 0; i < n; i++) {
        for (int w = W; w >= wt[i]; w--) {
            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
        }
    }
    cout << "Gia tri lon nhat: " << dp[W] << "\\n"; // 16
    return 0;
}`
    },
    {
      id: '5-3',
      title: 'LCS & Edit Distance',
      xp: 40,
      subtitle: 'Xâu con chung dài nhất & Khoảng cách biến đổi xâu (Levenshtein)',
      theory: 'Tính số phép biến đổi tối thiểu (thêm, xóa, sửa ký tự) để biến xâu S thành xâu T trong O(N * M).',
      theoryDeep: {
        intuition: 'dp[i][j] là số thao tác tối thiểu biến đổi i ký tự đầu của S thành j ký tự đầu của T. Nếu S[i] == T[j], dp[i][j] = dp[i-1][j-1]. Ngược lại, lấy min của 3 phép toán: Thêm (dp[i][j-1]), Xóa (dp[i-1][j]), Thay thế (dp[i-1][j-1]) + 1.',
        mathInvariant: 'Hệ thức Levenshtein: dp[i][j] = min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + (S[i-1] != T[j-1])).',
        steps: [
          'Khởi tạo dp[N + 1][M + 1].',
          'dp[i][0] = i (xóa hết), dp[0][j] = j (thêm hết).',
          'Lặp hai vòng duyệt tính giá trị bảng DP.'
        ],
        complexity: {
          time: 'O(N * M)',
          space: 'O(N * M) hoặc O(min(N, M)) nếu chỉ lưu 2 dòng'
        },
        pitfalls: [
          'Quên khởi tạo các dòng và cột biên dp[i][0] và dp[0][j].'
        ],
        practiceProblems: [
          { name: 'Edit Distance', oj: 'CSES', diff: 'Trung bình', linkHint: 'Quy hoạch động khoảng cách sửa đổi' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int editDistance(const string& s1, const string& s2) {
    int n = s1.size(), m = s2.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));

    for (int i = 0; i <= n; i++) dp[i][0] = i;
    for (int j = 0; j <= m; j++) dp[0][j] = j;

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (s1[i - 1] == s2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
        }
    }
    return dp[n][m];
}

int main() {
    cout << "Khoang cach LOVE va MOVIE: " << editDistance("LOVE", "MOVIE") << "\\n"; // 2
    return 0;
}`
    },
    {
      id: '5-4',
      title: 'Bitmask DP (Quy hoạch động trạng thái nhị phân)',
      xp: 45,
      subtitle: 'Biểu diễn tập con bằng bit của số nguyên, giải bài toán TSP N ≤ 20',
      theory: 'Kỹ thuật dùng bit thứ i của số nguyên mask để biểu diễn phần tử thứ i đã được chọn hay chưa trong các bài toán hoán vị, ghép cặp.',
      theoryDeep: {
        intuition: 'Thay vì duyệt N! hoán vị, trạng thái dp[mask][u] lưu chi phí tối ưu khi đã đi qua tập các đỉnh được bật trong mask và đang đứng tại đỉnh u. Giảm từ 20! xuống 2^20 * 20^2 ≈ 4 * 10^8 phép tính.',
        mathInvariant: 'Kiểm tra bit i: `(mask >> i) & 1`; Bật bit i: `mask | (1 << i)`.',
        steps: [
          'Khởi tạo dp[1 << N][N] bằng vô cùng.',
          'Đặt dp[1 << start][start] = 0.',
          'Duyệt mask từ 1 đến (1 << N) - 1, duyệt mở rộng sang đỉnh v chưa thăm.'
        ],
        complexity: {
          time: 'O(2^N * N^2)',
          space: 'O(2^N * N)'
        },
        pitfalls: [
          'Tràn số khi N >= 31: phải dùng `1LL << i`.'
        ],
        practiceProblems: [
          { name: 'Hamiltonian Flights', oj: 'CSES', diff: 'Nâng cao', linkHint: 'Đếm đường đi Hamilton bằng Bitmask DP' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

const int INF = 1e9;
int distMat[4][4] = {
    {0, 10, 15, 20},
    {10, 0, 35, 25},
    {15, 35, 0, 30},
    {20, 25, 30, 0}
};
int dp[1 << 4][4];

int main() {
    int n = 4;
    for (int mask = 0; mask < (1 << n); mask++)
        for (int i = 0; i < n; i++) dp[mask][i] = INF;

    dp[1][0] = 0;
    for (int mask = 1; mask < (1 << n); mask++) {
        for (int u = 0; u < n; u++) {
            if (!(mask & (1 << u)) || dp[mask][u] == INF) continue;
            for (int v = 0; v < n; v++) {
                if (mask & (1 << v)) continue;
                dp[mask | (1 << v)][v] = min(dp[mask | (1 << v)][v], dp[mask][u] + distMat[u][v]);
            }
        }
    }
    int ans = INF;
    for (int u = 1; u < n; u++) ans = min(ans, dp[(1 << n) - 1][u] + distMat[u][0]);
    cout << "Chi phi hanh trinh TSP ngan nhat: " << ans << "\\n"; // 80
    return 0;
}`
    },
    {
      id: '5-5',
      title: 'Digit DP (Quy hoạch động chữ số)',
      xp: 45,
      subtitle: 'Đếm số lượng số trong khoảng [L, R] thỏa mãn tính chất với N ≤ 10¹⁸',
      theory: 'Duyệt xây dựng số từ trái sang phải, dùng biến cờ tight để giới hạn chữ số và đệ quy có nhớ.',
      theoryDeep: {
        intuition: 'Đếm số trong [L, R] = solve(R) - solve(L - 1). Xây dựng từng chữ số với cờ tight: nếu tight = true thì chữ số d chỉ được chọn từ 0 đến digits[pos], nếu tight = false thì được chọn từ 0 đến 9.',
        mathInvariant: 'Chỉ lưu memo khi tight == false.',
        steps: [
          'Chuyển số N thành mảng chữ số.',
          'Viết hàm đệ quy có nhớ `memo(pos, tight, leading_zero, sum)`.',
          'Lặp d từ 0 đến limit, gọi đệ quy với tight mới.'
        ],
        complexity: {
          time: 'O(len(N) * 2 * S)',
          space: 'O(len(N) * 2 * S)'
        },
        pitfalls: [
          'Lưu vào mảng memo khi tight == true sẽ làm hỏng kết quả vì trạng thái bị phụ thuộc vào tiền tố của N cụ thể.'
        ],
        practiceProblems: [
          { name: 'Counting Numbers', oj: 'CSES', diff: 'Nâng cao', linkHint: 'Đếm số không có 2 chữ số kề nhau trùng lặp' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

string S;
long long memo[20][2][10];
bool vis[20][2][10];

long long countNoAdjacentSame(int pos, bool tight, int lastDigit) {
    if (pos == (int)S.size()) return 1;
    if (!tight && vis[pos][tight][lastDigit]) return memo[pos][tight][lastDigit];

    int limit = tight ? (S[pos] - '0') : 9;
    long long total = 0;

    for (int d = 0; d <= limit; d++) {
        if (pos > 0 && d == lastDigit) continue; // Khong cho 2 so ke giong nhau
        total += countNoAdjacentSame(pos + 1, tight && (d == limit), d);
    }

    if (!tight) {
        vis[pos][tight][lastDigit] = true;
        memo[pos][tight][lastDigit] = total;
    }
    return total;
}

int main() {
    S = "100";
    memset(vis, false, sizeof(vis));
    cout << "So luong so <= " << S << " khong co 2 chu so ke nhau giong: " 
         << countNoAdjacentSame(0, true, -1) << "\\n";
    return 0;
}`
    },
    {
      id: '5-6',
      title: 'Tree DP (Quy hoạch động trên cây)',
      xp: 45,
      subtitle: 'Quy hoạch động từ lá lên gốc, bài toán Độc lập cực đại (Max Independent Set)',
      theory: 'Kỹ thuật duyệt DFS tính toán giá trị của nút cha dựa trên các nút con trong cây có gốc.',
      theoryDeep: {
        intuition: 'Trong cấu trúc cây, mỗi nút là gốc của một cây con độc lập. Trạng thái dp[u][0] (không chọn u) và dp[u][1] (chọn u) được tổng hợp trực tiếp từ các con v của u.',
        mathInvariant: 'Nếu chọn u: các con v KHÔNG được chọn. Nếu không chọn u: các con v có thể chọn hoặc không chọn.',
        steps: [
          'Gọi hàm dfs(u, p) duyệt cây.',
          'Sau khi các con v đệ quy xong: cập nhật dp[u][1] += dp[v][0], dp[u][0] += max(dp[v][0], dp[v][1]).'
        ],
        complexity: {
          time: 'O(N) - duyệt mỗi đỉnh đúng 1 lần',
          space: 'O(N)'
        },
        pitfalls: [
          'Quên kiểm tra `if (v != parent)` dẫn đến đệ quy quay ngược lên cha gây lặp vô hạn.'
        ],
        practiceProblems: [
          { name: 'Tree Matching', oj: 'CSES', diff: 'Trung bình', linkHint: 'Tree DP tìm cặp ghép cực đại trên cây' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
vector<int> adj[MAXN];
int dp[MAXN][2]; // dp[u][0]: khong chon u, dp[u][1]: chon u

void dfs(int u, int p) {
    dp[u][0] = 0;
    dp[u][1] = 1; // Chi phi ban than
    for (int v : adj[u]) {
        if (v == p) continue;
        dfs(v, u);
        dp[u][0] += max(dp[v][0], dp[v][1]);
        dp[u][1] += dp[v][0];
    }
}

int main() {
    int n = 5;
    // 1-2, 1-3, 2-4, 2-5
    adj[1].push_back(2); adj[2].push_back(1);
    adj[1].push_back(3); adj[3].push_back(1);
    adj[2].push_back(4); adj[4].push_back(2);
    adj[2].push_back(5); adj[5].push_back(2);

    dfs(1, 0);
    cout << "Tap doc lap cuc dai tren cay: " << max(dp[1][0], dp[1][1]) << "\\n"; // 3 (chọn 3, 4, 5)
    return 0;
}`
    },
    {
      id: '5-7',
      title: 'Convex Hull Trick (CHT - Tối ưu hóa bao lồi trong DP)',
      xp: 50,
      subtitle: 'Tối ưu DP dạng dp[i] = min(dp[j] + m_j * x_i + c_j) từ O(N²) về O(N log N) hoặc O(N)',
      theory: 'Kỹ thuật biểu diễn các trạng thái DP trước đó dưới dạng các đường thẳng y = m*x + c và duy trì bao lồi của các đường thẳng.',
      theoryDeep: {
        intuition: 'Mỗi trạng thái j tạo ra một đường thẳng L_j(x) = m_j * x + c_j. Cần tìm đường thẳng cho giá trị nhỏ nhất tại hoành độ x_i. Duy trì tập các đường thẳng tối ưu bằng ngăn xếp bao lồi giúp trả lời trong O(log N) bằng binary search hoặc O(1) nếu hệ số góc m và x đơn điệu.',
        mathInvariant: 'Giao điểm của đường thẳng L1, L2 nằm trước giao điểm của L2, L3 -> L2 có ích; nếu không L2 bị che khuất hoàn toàn.',
        steps: [
          'Viết lại công thức DP thành dạng hàm bậc nhất y = m*x + c.',
          'Kiểm tra tính đơn điệu của hệ số góc m và biến truy vấn x.',
          'Duy trì bao lồi các đường thẳng bằng deque hoặc LineContainer.'
        ],
        complexity: {
          time: 'O(N) nếu m và x đơn điệu; O(N log N) với Dynamic CHT',
          space: 'O(N)'
        },
        pitfalls: [
          'Tràn số khi tính giao điểm hai đường thẳng: dùng `__int128_t` hoặc phép nhân chéo an toàn.'
        ],
        practiceProblems: [
          { name: 'Frog 3', oj: 'AtCoder DP', diff: 'HSGQG', linkHint: 'CHT kinh điển' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

// Cấu trúc đường thẳng: y = m * x + c
struct Line {
    long long m, c;
    long long eval(long long x) const { return m * x + c; }
    // Giao điểm x giữa 2 đường
    double intersect(const Line& other) const {
        return (double)(other.c - c) / (m - other.m);
    }
};

int main() {
    // Duy trì bao lồi các đường thẳng
    vector<Line> hull;
    // Giả sử m giảm dần
    auto addLine = [&](Line newLine) {
        while (hull.size() >= 2) {
            double x1 = hull.back().intersect(hull[hull.size() - 2]);
            double x2 = newLine.intersect(hull.back());
            if (x2 <= x1) hull.pop_back();
            else break;
        }
        hull.push_back(newLine);
    };

    addLine({-2, 5});
    addLine({-1, 2});
    cout << "Da khoi tao bao loi 2 duong thang!\\n";
    return 0;
}`
    }
  ]
};
