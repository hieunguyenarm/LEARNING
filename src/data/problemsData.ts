import { Problem } from '../types';

export const PROBLEMS: Problem[] = [
  {
    id: 'p1',
    name: 'Bài 1 · Tổng hai số lớn (A + B Warmup)',
    category: 'Cơ bản',
    difficulty: 'Cơ bản',
    timeLimit: '1.0s',
    memLimit: '256MB',
    description: 'Cho hai số nguyên a và b. Hãy tính và in ra tổng của chúng. Lưu ý giới hạn của a và b có thể vượt quá kiểu int thông thường.',
    inputFormat: 'Một dòng duy nhất chứa hai số nguyên a và b cách nhau bởi dấu cách.',
    outputFormat: 'In ra một số nguyên duy nhất là tổng a + b.',
    constraints: [
      '-10^18 ≤ a, b ≤ 10^18',
      'Thời gian chạy ≤ 1.0 giây',
      'Bộ nhớ ≤ 256MB'
    ],
    samples: [
      {
        input: '3 5',
        output: '8',
        explanation: '3 + 5 = 8'
      },
      {
        input: '1000000000000 2000000000000',
        output: '3000000000000',
        explanation: 'Tổng hai số 64-bit'
      }
    ],
    hints: [
      'Dùng kiểu dữ liệu `long long` trong C++ để tránh tràn số 32-bit `int`.',
      'Sử dụng `cin >> a >> b; cout << a + b;`.'
    ],
    starter: `#include <bits/stdc++.h>
using namespace std;

int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    long long a, b;
    if (cin >> a >> b) {
        cout << a + b << "\\n";
    }
    return 0;
}`,
    testCases: [
      { input: '3 5', expected: '8' },
      { input: '0 0', expected: '0' },
      { input: '-10 25', expected: '15' },
      { input: '1000000000000 2000000000000', expected: '3000000000000' },
      { input: '-500000000000 -500000000000', expected: '-1000000000000' },
      { input: '999999999999999999 1', expected: '1000000000000000000' },
      { input: '42 -42', expected: '0' },
      { input: '123456789 987654321', expected: '1111111110' }
    ]
  },
  {
    id: 'p2',
    name: 'Bài 2 · Kiểm tra số nguyên tố (Prime Check)',
    category: 'Số học',
    difficulty: 'Cơ bản',
    timeLimit: '1.0s',
    memLimit: '256MB',
    description: 'Cho số nguyên dương n. Hãy kiểm tra xem n có phải là số nguyên tố hay không. Một số nguyên p > 1 được gọi là số nguyên tố nếu nó chỉ có đúng hai ước số dương là 1 và chính nó.',
    inputFormat: 'Gồm một số nguyên dương n duy nhất.',
    outputFormat: 'In ra "YES" nếu n là số nguyên tố, ngược lại in ra "NO".',
    constraints: [
      '1 ≤ n ≤ 10^14',
      'Thời gian chạy ≤ 1.0 giây'
    ],
    samples: [
      {
        input: '97',
        output: 'YES',
        explanation: '97 là số nguyên tố'
      },
      {
        input: '1',
        output: 'NO',
        explanation: '1 không phải là số nguyên tố theo định nghĩa'
      },
      {
        input: '100',
        output: 'NO',
        explanation: '100 chia hết cho 2, 4, 5, 10...'
      }
    ],
    hints: [
      'Nếu n < 2 trả về false.',
      'Duyệt từ i = 2 đến sqrt(n). Viết điều kiện vòng lặp `i * i <= n` để tránh tính toán căn bậc hai số thực.',
      'Cẩn thận ép kiểu `(long long)i * i` để tránh tràn số int khi n lớn.'
    ],
    starter: `#include <bits/stdc++.h>
using namespace std;

bool isPrime(long long n) {
    if (n < 2) return false;
    for (long long i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    long long n;
    if (cin >> n) {
        cout << (isPrime(n) ? "YES" : "NO") << "\\n";
    }
    return 0;
}`,
    testCases: [
      { input: '97', expected: 'YES' },
      { input: '1', expected: 'NO' },
      { input: '2', expected: 'YES' },
      { input: '4', expected: 'NO' },
      { input: '1000000007', expected: 'YES' },
      { input: '1000000009', expected: 'YES' },
      { input: '99999999999999', expected: 'NO' },
      { input: '1000000000039', expected: 'YES' }
    ]
  },
  {
    id: 'p3',
    name: 'Bài 3 · Dijkstra đường đi ngắn nhất',
    category: 'Đồ thị',
    difficulty: 'Trung bình',
    timeLimit: '1.0s',
    memLimit: '256MB',
    description: 'Cho đồ thị có hướng gồm N đỉnh (được đánh số bằng các chữ cái A, B, C...) và M cạnh có trọng số không âm. Hãy tìm khoảng cách ngắn nhất từ đỉnh nguồn A đến tất cả các đỉnh A, B, C, D, E, F theo thứ tự bảng chữ cái.',
    inputFormat: 'Dòng đầu tiên chứa hai số nguyên N và M.\nM dòng tiếp theo, mỗi dòng chứa hai ký tự u, v và số nguyên w thể hiện cạnh u -> v có trọng số w.',
    outputFormat: 'In ra khoảng cách từ đỉnh A đến lần lượt các đỉnh A, B, C, D, E, F trên một dòng, cách nhau bởi dấu cách. Nếu không có đường đi đến đỉnh nào thì in -1.',
    constraints: [
      '1 ≤ N ≤ 26',
      '0 ≤ M ≤ 200',
      '0 ≤ w ≤ 10^9'
    ],
    samples: [
      {
        input: '6 8\\nA B 4\\nA C 2\\nC B 1\\nB D 5\\nC E 8\\nD E 3\\nD F 6\\nE F 2',
        output: '0 3 2 8 10 12',
        explanation: 'Đường đi ngắn nhất: A->A=0, A->C->B=3, A->C=2, A->C->B->D=8, A->C->B->D->E=11 hoặc qua C->E? Check: A->C->B->D=8 -> D->E=3 tổng 11, nhưng A->C->E=10 tốt hơn! Đến F: E->F=2 -> 10+2=12.'
      }
    ],
    hints: [
      'Dùng std::priority_queue lưu pair<long long, int> với greater<> làm min-heap.',
      'Khởi tạo dist[u] = INF, riêng dist[\'A\'] = 0.',
      'Bỏ qua trạng thái lỗi thời khi d > dist[u].'
    ],
    starter: `#include <bits/stdc++.h>
using namespace std;

const long long INF = 1e18;

int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (!(cin >> n >> m)) return 0;

    vector<vector<pair<int, long long>>> adj(26);
    for (int i = 0; i < m; i++) {
        char u, v; long long w;
        cin >> u >> v >> w;
        adj[u - 'A'].push_back({v - 'A', w});
    }

    vector<long long> dist(26, INF);
    priority_queue<pair<long long, int>, 
                   vector<pair<long long, int>>, 
                   greater<pair<long long, int>>> pq;

    dist[0] = 0;
    pq.push({0, 0});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;

        for (auto& edge : adj[u]) {
            int v = edge.first;
            long long w = edge.second;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }

    for (int i = 0; i < n; i++) {
        if (dist[i] == INF) cout << -1 << (i == n - 1 ? "" : " ");
        else cout << dist[i] << (i == n - 1 ? "" : " ");
    }
    cout << "\\n";
    return 0;
}`,
    testCases: [
      {
        input: '6 8\nA B 4\nA C 2\nC B 1\nB D 5\nC E 8\nD E 3\nD F 6\nE F 2',
        expected: '0 3 2 8 10 12'
      },
      {
        input: '3 2\nA B 5\nB C 10',
        expected: '0 5 15'
      },
      {
        input: '4 3\nA B 1\nB C 2\nC D 3',
        expected: '0 1 3 6'
      },
      {
        input: '2 1\nA B 100',
        expected: '0 100'
      },
      {
        input: '4 4\nA B 10\nA C 5\nC B 2\nB D 1',
        expected: '0 7 5 8'
      },
      {
        input: '3 3\nA B 3\nB C 4\nA C 10',
        expected: '0 3 7'
      },
      {
        input: '5 5\nA B 2\nB C 2\nC D 2\nD E 2\nA E 10',
        expected: '0 2 4 6 8'
      },
      {
        input: '1 0',
        expected: '0'
      }
    ]
  },
  {
    id: 'p4',
    name: 'Bài 4 · Dãy con tăng dài nhất (LIS O(N log N))',
    category: 'Quy hoạch động',
    difficulty: 'Trung bình',
    timeLimit: '1.0s',
    memLimit: '256MB',
    description: 'Cho dãy số nguyên A gồm N phần tử. Một dãy con được tạo ra bằng cách xóa đi một số phần tử (hoặc không xóa) mà vẫn giữ nguyên thứ tự tương đối. Hãy tìm độ dài của dãy con tăng nghiêm ngặt dài nhất.',
    inputFormat: 'Dòng đầu tiên chứa số nguyên N.\nDòng thứ hai chứa N số nguyên A1, A2, ..., AN cách nhau bởi dấu cách.',
    outputFormat: 'In ra một số nguyên duy nhất là độ dài của dãy con tăng dài nhất.',
    constraints: [
      '1 ≤ N ≤ 200,000',
      '-10^9 ≤ Ai ≤ 10^9',
      'Độ phức tạp yêu cầu: O(N log N)'
    ],
    samples: [
      {
        input: '6\\n1 2 4 3 5 4',
        output: '4',
        explanation: 'Dãy con tăng dài nhất là [1, 2, 4, 5] hoặc [1, 2, 3, 5], có độ dài 4.'
      },
      {
        input: '5\\n5 4 3 2 1',
        output: '1',
        explanation: 'Mọi phần tử đơn lẻ đều có độ dài 1.'
      }
    ],
    hints: [
      'Thuật toán O(N^2) sẽ bị TLE với N = 200,000.',
      'Sử dụng mảng `tails` và hàm `std::lower_bound` để tìm vị trí thích hợp cho mỗi phần tử trong O(log N).',
      'Độ dài cuối cùng của vector `tails` chính là đáp số của bài toán.'
    ],
    starter: `#include <bits/stdc++.h>
using namespace std;

int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    // tails[i] lưu phần tử nhỏ nhất kết thúc một dãy con tăng độ dài i + 1
    vector<int> tails;
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) {
            tails.push_back(x);
        } else {
            *it = x;
        }
    }

    cout << tails.size() << "\\n";
    return 0;
}`,
    testCases: [
      { input: '6\n1 2 4 3 5 4', expected: '4' },
      { input: '5\n5 4 3 2 1', expected: '1' },
      { input: '8\n10 9 2 5 3 7 101 18', expected: '4' },
      { input: '1\n42', expected: '1' },
      { input: '7\n1 3 5 7 9 11 13', expected: '7' },
      { input: '6\n2 2 2 2 2 2', expected: '1' },
      { input: '8\n3 1 4 1 5 9 2 6', expected: '4' },
      { input: '9\n10 22 9 33 21 50 41 60 80', expected: '6' }
    ]
  },
  {
    id: 'p5',
    name: 'Bài 5 · Balo 0/1 tối ưu mảng 1D (0/1 Knapsack)',
    category: 'Quy hoạch động',
    difficulty: 'Trung bình',
    timeLimit: '1.0s',
    memLimit: '256MB',
    description: 'Một tên trộm có một chiếc balo có thể chịu được trọng lượng tối đa là W. Có N món đồ, món đồ thứ i có trọng lượng wi và giá trị vi. Mỗi món đồ chỉ được chọn tối đa một lần. Hãy tính tổng giá trị lớn nhất mà tên trộm có thể mang theo.',
    inputFormat: 'Dòng đầu tiên gồm hai số nguyên N và W.\nN dòng tiếp theo, mỗi dòng chứa hai số nguyên wi và vi.',
    outputFormat: 'In ra tổng giá trị lớn nhất có thể thu được.',
    constraints: [
      '1 ≤ N ≤ 1,000',
      '1 ≤ W ≤ 100,000',
      '1 ≤ wi ≤ W, 1 ≤ vi ≤ 10^9'
    ],
    samples: [
      {
        input: '4 7\\n1 1\\n3 4\\n4 5\\n5 7',
        output: '9',
        explanation: 'Chọn món thứ 2 (w=3, v=4) và món thứ 3 (w=4, v=5), tổng w=7, tổng giá trị = 9.'
      }
    ],
    hints: [
      'Khởi tạo mảng dp kích thước W + 1 bằng 0.',
      'Vòng lặp bên ngoài qua từng đồ vật.',
      'QUAN TRỌNG: Vòng lặp bên trong duyệt trọng lượng GIẢM DẦN từ W về wi: `dp[w] = max(dp[w], dp[w - wi] + vi)`.'
    ],
    starter: `#include <bits/stdc++.h>
using namespace std;

int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, W;
    if (!(cin >> n >> W)) return 0;

    vector<long long> dp(W + 1, 0);

    for (int i = 0; i < n; i++) {
        int w; long long v;
        cin >> w >> v;
        for (int j = W; j >= w; j--) {
            dp[j] = max(dp[j], dp[j - w] + v);
        }
    }

    cout << dp[W] << "\\n";
    return 0;
}`,
    testCases: [
      { input: '4 7\n1 1\n3 4\n4 5\n5 7', expected: '9' },
      { input: '3 4\n1 15\n3 20\n4 30', expected: '35' },
      { input: '1 5\n6 100', expected: '0' },
      { input: '1 5\n5 100', expected: '100' },
      { input: '3 50\n10 60\n20 100\n30 120', expected: '220' },
      { input: '5 10\n2 3\n3 4\n4 5\n5 8\n9 10', expected: '16' },
      { input: '2 1\n1 10\n1 20', expected: '20' },
      { input: '4 15\n2 10\n5 20\n7 35\n10 50', expected: '75' }
    ]
  },
  {
    id: 'p6',
    name: 'Bài 6 · Segment Tree: Range Minimum Query',
    category: 'Cấu trúc dữ liệu',
    difficulty: 'Nâng cao',
    timeLimit: '1.0s',
    memLimit: '256MB',
    description: 'Cho mảng A gồm N phần tử. Có Q truy vấn thuộc một trong hai loại:\n- Loại 1: "1 k u": Cập nhật giá trị tại vị trí k thành u (A[k] = u).\n- Loại 2: "2 a b": Tìm giá trị nhỏ nhất trong đoạn từ vị trí a đến vị trí b.',
    inputFormat: 'Dòng đầu chứa hai số nguyên N và Q.\nDòng thứ hai chứa N số nguyên A1, A2, ..., AN.\nQ dòng tiếp theo, mỗi dòng mô tả một truy vấn dạng "1 k u" hoặc "2 a b" (đánh số từ 1).',
    outputFormat: 'Với mỗi truy vấn loại 2, in ra giá trị nhỏ nhất tìm được trên một dòng riêng biệt.',
    constraints: [
      '1 ≤ N, Q ≤ 200,000',
      '1 ≤ Ai, u ≤ 10^9',
      '1 ≤ k, a ≤ b ≤ N'
    ],
    samples: [
      {
        input: '8 4\\n3 2 4 5 1 1 5 3\\n2 1 4\\n2 5 6\\n1 3 1\\n2 1 4',
        output: '2\\n1\\n1',
        explanation: 'Min[1..4] = 2. Min[5..6] = 1. Cập nhật A[3] = 1. Min[1..4] bây giờ là 1.'
      }
    ],
    hints: [
      'Sử dụng cây phân đoạn (Segment Tree) lưu giá trị nhỏ nhất.',
      'Kích thước cây là 4 * N.',
      'Cập nhật điểm và truy vấn đoạn đều chạy trong O(log N).'
    ],
    starter: `#include <bits/stdc++.h>
using namespace std;

const long long INF = 2e9;
int n, q;
vector<long long> a, treeNode;

void build(int id, int l, int r) {
    if (l == r) {
        treeNode[id] = a[l];
        return;
    }
    int mid = (l + r) / 2;
    build(2 * id, l, mid);
    build(2 * id + 1, mid + 1, r);
    treeNode[id] = min(treeNode[2 * id], treeNode[2 * id + 1]);
}

void update(int id, int l, int r, int pos, long long val) {
    if (l == r) {
        treeNode[id] = val;
        return;
    }
    int mid = (l + r) / 2;
    if (pos <= mid) update(2 * id, l, mid, pos, val);
    else update(2 * id + 1, mid + 1, r, pos, val);
    treeNode[id] = min(treeNode[2 * id], treeNode[2 * id + 1]);
}

long long query(int id, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return INF;
    if (ql <= l && r <= qr) return treeNode[id];
    int mid = (l + r) / 2;
    return min(query(2 * id, l, mid, ql, qr),
               query(2 * id + 1, mid + 1, r, ql, qr));
}

int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    if (!(cin >> n >> q)) return 0;
    a.resize(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];

    treeNode.assign(4 * n + 1, INF);
    build(1, 1, n);

    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int k; long long u;
            cin >> k >> u;
            update(1, 1, n, k, u);
        } else {
            int l, r;
            cin >> l >> r;
            cout << query(1, 1, n, l, r) << "\\n";
        }
    }
    return 0;
}`,
    testCases: [
      {
        input: '8 4\n3 2 4 5 1 1 5 3\n2 1 4\n2 5 6\n1 3 1\n2 1 4',
        expected: '2\n1\n1'
      },
      {
        input: '5 3\n10 20 30 40 50\n2 1 5\n1 3 5\n2 1 5',
        expected: '10\n5'
      },
      {
        input: '4 2\n5 5 5 5\n2 2 3\n2 1 4',
        expected: '5\n5'
      },
      {
        input: '1 2\n100\n2 1 1\n1 1 200\n2 1 1',
        expected: '100\n200'
      },
      {
        input: '6 3\n9 8 7 6 5 4\n2 2 5\n1 6 10\n2 4 6',
        expected: '5\n5'
      },
      {
        input: '3 2\n1 2 3\n1 1 10\n2 1 3',
        expected: '2'
      },
      {
        input: '4 3\n10 5 8 2\n2 1 2\n2 3 4\n2 1 4',
        expected: '5\n2\n2'
      },
      {
        input: '5 2\n4 2 8 6 1\n2 1 3\n2 4 5',
        expected: '2\n1'
      }
    ]
  },
  {
    id: 'p7',
    name: 'Bài 7 · Hai con trỏ: Cặp số có tổng đích',
    category: 'Kỹ thuật',
    difficulty: 'Cơ bản',
    timeLimit: '1.0s',
    memLimit: '256MB',
    description: 'Cho mảng A gồm N số nguyên đã được sắp xếp tăng dần và một số nguyên X. Hãy tìm một cặp vị trí (i, j) với i < j sao cho A[i] + A[j] = X. Nếu có nhiều cặp, hãy in ra một cặp bất kỳ (chỉ số 1-indexed). Nếu không tồn tại cặp nào, in ra "IMPOSSIBLE".',
    inputFormat: 'Dòng đầu chứa hai số nguyên N và X.\nDòng thứ hai chứa N số nguyên A1, A2, ..., AN (đã sắp xếp tăng dần).',
    outputFormat: 'In ra hai chỉ số i và j cách nhau bởi dấu cách (i < j), hoặc "IMPOSSIBLE".',
    constraints: [
      '2 ≤ N ≤ 200,000',
      '1 ≤ Ai, X ≤ 10^9'
    ],
    samples: [
      {
        input: '4 8\\n2 7 5 1',
        output: '2 4',
        explanation: 'Nếu mảng đã sắp xếp: 1 2 5 7, ta có 1 + 7 = 8 (vị trí 1 và 4).'
      },
      {
        input: '5 10\\n1 2 4 6 9',
        output: '3 4',
        explanation: 'A[3] + A[4] = 4 + 6 = 10.'
      }
    ],
    hints: [
      'Sử dụng hai con trỏ: `left = 1` và `right = N`.',
      'Tính tổng `sum = a[left] + a[right]`. Nếu `sum == X` -> tìm thấy. Nếu `sum < X` -> tăng `left++`. Nếu `sum > X` -> giảm `right--`.',
      'Độ phức tạp tuyến tính O(N).'
    ],
    starter: `#include <bits/stdc++.h>
using namespace std;

int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    long long X;
    if (!(cin >> n >> X)) return 0;

    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];

    int l = 1, r = n;
    while (l < r) {
        long long sum = a[l] + a[r];
        if (sum == X) {
            cout << l << " " << r << "\\n";
            return 0;
        } else if (sum < X) {
            l++;
        } else {
            r--;
        }
    }

    cout << "IMPOSSIBLE\\n";
    return 0;
}`,
    testCases: [
      { input: '5 10\n1 2 4 6 9', expected: '3 4' },
      { input: '4 10\n1 2 3 4', expected: 'IMPOSSIBLE' },
      { input: '2 7\n3 4', expected: '1 2' },
      { input: '6 12\n1 3 5 7 9 11', expected: '1 6' },
      { input: '5 8\n2 4 6 8 10', expected: '1 3' },
      { input: '4 100\n10 20 30 70', expected: '3 4' },
      { input: '3 6\n2 3 5', expected: 'IMPOSSIBLE' },
      { input: '5 15\n1 4 7 11 14', expected: '1 5' }
    ]
  },
  {
    id: 'p8',
    name: 'Bài 8 · DSU: Đếm thành phần liên thông',
    category: 'Cấu trúc dữ liệu',
    difficulty: 'Trung bình',
    timeLimit: '1.0s',
    memLimit: '256MB',
    description: 'Một quốc gia có N thành phố được đánh số từ 1 đến N. Ban đầu chưa có con đường nào nối giữa các thành phố. Có M sự kiện xây đường: mỗi sự kiện xây một con đường hai chiều nối giữa thành phố u và v. Sau mỗi lần xây đường, hãy in ra số lượng thành phần liên thông hiện tại của các thành phố.',
    inputFormat: 'Dòng đầu chứa hai số nguyên N và M.\nM dòng tiếp theo, mỗi dòng chứa hai số nguyên u và v mô tả một con đường vừa được xây.',
    outputFormat: 'Gồm M dòng, dòng thứ i in ra số lượng thành phần liên thông sau khi xây xong con đường thứ i.',
    constraints: [
      '1 ≤ N ≤ 100,000',
      '1 ≤ M ≤ 200,000',
      '1 ≤ u, v ≤ N'
    ],
    samples: [
      {
        input: '4 3\\n1 2\\n3 4\\n2 3',
        output: '3\\n2\\n1',
        explanation: 'Ban đầu có 4 thành phần. Nối 1-2 còn 3. Nối 3-4 còn 2. Nối 2-3 còn 1.'
      }
    ],
    hints: [
      'Khởi tạo DSU với số thành phần = N.',
      'Khi gọi unite(u, v): nếu u và v chưa cùng tập hợp thì gộp lại và giảm số thành phần đi 1.',
      'In ra số thành phần liên thông sau mỗi thao tác.'
    ],
    starter: `#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> parent, sz;
    int components;
    DSU(int n) : parent(n + 1), sz(n + 1, 1), components(n) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        return parent[x] == x ? x : parent[x] = find(parent[x]);
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        parent[b] = a;
        sz[a] += sz[b];
        components--;
        return true;
    }
};

int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (!(cin >> n >> m)) return 0;

    DSU dsu(n);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        dsu.unite(u, v);
        cout << dsu.components << "\\n";
    }
    return 0;
}`,
    testCases: [
      { input: '4 3\n1 2\n3 4\n2 3', expected: '3\n2\n1' },
      { input: '3 2\n1 2\n1 2', expected: '2\n2' },
      { input: '5 4\n1 2\n2 3\n3 4\n4 5', expected: '4\n3\n2\n1' },
      { input: '3 1\n1 3', expected: '2' },
      { input: '4 2\n1 2\n3 4', expected: '3\n2' },
      { input: '5 3\n1 2\n3 4\n1 2', expected: '4\n3\n3' },
      { input: '2 1\n1 2', expected: '1' },
      { input: '4 4\n1 2\n2 3\n3 1\n1 4', expected: '3\n2\n2\n1' }
    ]
  },
  {
    id: 'p9',
    name: 'Bài 9 · KMP: Đếm số lần xuất hiện của xâu mẫu',
    category: 'Xâu ký tự',
    difficulty: 'Trung bình',
    timeLimit: '1.0s',
    memLimit: '256MB',
    description: 'Cho văn bản T và xâu mẫu P. Hãy đếm xem xâu mẫu P xuất hiện bao nhiêu lần trong văn bản T (các lần xuất hiện có thể chồng lấn nhau).',
    inputFormat: 'Dòng đầu chứa văn bản T.\nDòng thứ hai chứa xâu mẫu P (chỉ gồm các chữ cái in hoa/in thường).',
    outputFormat: 'In ra một số nguyên duy nhất là số lần xuất hiện của P trong T.',
    constraints: [
      '1 ≤ |T|, |P| ≤ 1,000,000',
      'Độ phức tạp yêu cầu: O(|T| + |P|)'
    ],
    samples: [
      {
        input: 'ababab\\naba',
        output: '2',
        explanation: 'Xâu "aba" xuất hiện tại vị trí 0 ("aba"bab) và vị trí 2 (ab"aba"b).'
      },
      {
        input: 'aaaaa\\naa',
        output: '4',
        explanation: 'Xuất hiện tại các vị trí 0, 1, 2, 3.'
      }
    ],
    hints: [
      'Tính mảng LPS (Longest Proper Prefix which is also Suffix) của xâu mẫu P.',
      'Sử dụng thuật toán so khớp KMP để duyệt qua T trong O(|T|).',
      'Khi khớp đủ |P| ký tự, tăng biến đếm và gán `j = lps[j - 1]` để tiếp tục tìm kiếm chồng lấn.'
    ],
    starter: `#include <bits/stdc++.h>
using namespace std;

vector<int> buildLPS(const string& pat) {
    int m = pat.size();
    vector<int> lps(m, 0);
    int len = 0, i = 1;
    while (i < m) {
        if (pat[i] == pat[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len != 0) len = lps[len - 1];
            else { lps[i] = 0; i++; }
        }
    }
    return lps;
}

int countMatches(const string& text, const string& pat) {
    int n = text.size(), m = pat.size();
    if (m > n) return 0;
    vector<int> lps = buildLPS(pat);

    int count = 0;
    int i = 0, j = 0;
    while (i < n) {
        if (text[i] == pat[j]) {
            i++; j++;
        }
        if (j == m) {
            count++;
            j = lps[j - 1];
        } else if (i < n && text[i] != pat[j]) {
            if (j != 0) j = lps[j - 1];
            else i++;
        }
    }
    return count;
}

int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string text, pat;
    if (cin >> text >> pat) {
        cout << countMatches(text, pat) << "\\n";
    }
    return 0;
}`,
    testCases: [
      { input: 'ababab\naba', expected: '2' },
      { input: 'aaaaa\naa', expected: '4' },
      { input: 'abcdef\ngh', expected: '0' },
      { input: 'xyz\nxyz', expected: '1' },
      { input: 'mississippi\nissi', expected: '2' },
      { input: 'banana\nan', expected: '2' },
      { input: 'a\na', expected: '1' },
      { input: 'ab\nabc', expected: '0' }
    ]
  },
  {
    id: 'p10',
    name: 'Bài 10 · Tổ hợp C(n, k) modulo 10^9+7',
    category: 'Số học & Tổ hợp',
    difficulty: 'Trung bình',
    timeLimit: '1.0s',
    memLimit: '256MB',
    description: 'Cho hai số nguyên n và k. Hãy tính giá trị của tổ hợp chập k của n phần tử: C(n, k) modulo 10^9 + 7. Nếu k > n hoặc k < 0, kết quả là 0.',
    inputFormat: 'Gồm hai số nguyên n và k cách nhau bởi dấu cách.',
    outputFormat: 'In ra giá trị của C(n, k) modulo 10^9 + 7.',
    constraints: [
      '0 ≤ k ≤ n ≤ 1,000,000',
      'Modulo = 1,000,000,007'
    ],
    samples: [
      {
        input: '5 2',
        output: '10',
        explanation: 'C(5, 2) = 5! / (2! * 3!) = 120 / 12 = 10.'
      },
      {
        input: '10 3',
        output: '120',
        explanation: 'C(10, 3) = 120.'
      }
    ],
    hints: [
      'Công thức: C(n, k) = n! * (k!)^(-1) * ((n - k)!)^(-1) mod M.',
      'Sử dụng định lý Fermat nhỏ: inv(x) = x^(M - 2) mod M.',
      'Tiền xử lý giai thừa để tính toán trong O(log M).'
    ],
    starter: `#include <bits/stdc++.h>
using namespace std;

const long long MOD = 1e9 + 7;

long long power(long long a, long long b) {
    long long res = 1; a %= MOD;
    while (b > 0) {
        if (b & 1) res = (res * a) % MOD;
        a = (a * a) % MOD;
        b >>= 1;
    }
    return res;
}

long long modInverse(long long n) {
    return power(n, MOD - 2);
}

long long nCr(long long n, long long r) {
    if (r < 0 || r > n) return 0;
    if (r == 0 || r == n) return 1;

    long long num = 1, den = 1;
    for (long long i = 1; i <= r; i++) {
        num = (num * (n - i + 1)) % MOD;
        den = (den * i) % MOD;
    }
    return (num * modInverse(den)) % MOD;
}

int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    long long n, k;
    if (cin >> n >> k) {
        cout << nCr(n, k) << "\\n";
    }
    return 0;
}`,
    testCases: [
      { input: '5 2', expected: '10' },
      { input: '10 3', expected: '120' },
      { input: '5 0', expected: '1' },
      { input: '5 5', expected: '1' },
      { input: '5 6', expected: '0' },
      { input: '20 10', expected: '184756' },
      { input: '100 50', expected: '538992043' },
      { input: '1000 500', expected: '159835829' }
    ]
  }
];
