import { RoadmapModule } from '../../types';

export const PART_7: RoadmapModule = {
  key: 'part-7',
  title: 'Phần 7 (Cấu trúc dữ liệu) · Advanced Data Structures',
  icon: '🌲',
  description: 'DSU (Path Compression & Union by Rank), Fenwick Tree (BIT 1D/2D), Segment Tree with Lazy Propagation, Trie và PBDS (tree).',
  lessons: [
    {
      id: '7-1',
      title: 'DSU: Nén đường dẫn & Hợp nhất theo kích thước',
      xp: 40,
      subtitle: 'Disjoint Set Union với Path Compression & Union by Rank / Size O(α(N))',
      theory: 'Cấu trúc dữ liệu các tập hợp rời nhau hỗ trợ tìm đại diện tập hợp và hợp nhất hai tập trong thời gian gần như O(1) nhờ hàm Ackermann nghịch đảo.',
      theoryDeep: {
        intuition: 'DSU quản lý một rừng cây. Kỹ thuật Nén đường dẫn (Path Compression) san phẳng cây bằng cách trỏ trực tiếp mọi nút được duyệt về gốc. Kỹ thuật Hợp nhất theo kích thước (Union by Size) luôn gắn cây nhỏ hơn vào dưới gốc của cây lớn hơn, khống chế chiều cao cây tối đa là O(log N).',
        mathInvariant: 'Hàm Ackermann nghịch đảo α(N) <= 4 với mọi N <= 10^600. Độ phức tạp mỗi thao tác coi như là O(1) thực tế.',
        steps: [
          'Khởi tạo mảng `parent[i] = i` và `sz[i] = 1`.',
          'Hàm `find(i)`: đệ quy tìm gốc đồng thời gán `parent[i] = find(parent[i])`.',
          'Hàm `unite(u, v)`: tìm gốc `rootU` và `rootV`. Nếu khác nhau, so sánh `sz[rootU]` và `sz[rootV]` để treo cây nhỏ vào cây lớn, cộng dồn kích thước.'
        ],
        complexity: {
          time: 'O(α(N)) cho mỗi truy vấn Find và Union',
          space: 'O(N)'
        },
        pitfalls: [
          'Chỉ dùng Nén đường dẫn mà không dùng Union by Rank/Size: nếu có thao tác Rollback (hoàn tác DSU), Path Compression sẽ phá hỏng cấu trúc cây khiến không thể rollback được.'
        ],
        practiceProblems: [
          { name: 'Road Construction', oj: 'CSES', diff: 'Trung bình', linkHint: 'DSU đếm số thành phần và kích thước thành phần lớn nhất' },
          { name: 'Moocryption / DSU with Rollback', oj: 'Codeforces', diff: 'HSGQG', linkHint: 'DSU không nén đường dẫn để hỗ trợ hoàn tác' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> parent, sz;
    int numComponents;

    DSU(int n) : parent(n + 1), sz(n + 1, 1), numComponents(n) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int u) {
        if (u == parent[u]) return u;
        return parent[u] = find(parent[u]); // Path compression
    }

    bool unite(int u, int v) {
        int rootU = find(u), rootV = find(v);
        if (rootU == rootV) return false;

        // Union by size
        if (sz[rootU] < sz[rootV]) swap(rootU, rootV);
        parent[rootV] = rootU;
        sz[rootU] += sz[rootV];
        numComponents--;
        return true;
    }

    int getSize(int u) {
        return sz[find(u)];
    }
};

int main() {
    DSU dsu(5);
    dsu.unite(1, 2);
    dsu.unite(2, 3);
    cout << "1 va 3 cung tap hop? " << (dsu.find(1) == dsu.find(3) ? "Co" : "Khong") << "\\n"; // Co
    cout << "Kich thuoc tap hop chua dinh 1: " << dsu.getSize(1) << "\\n"; // 3
    cout << "So thanh phan lien thong con lai: " << dsu.numComponents << "\\n"; // 3
    return 0;
}`
    },
    {
      id: '7-2',
      title: 'Fenwick Tree (Binary Indexed Tree - BIT 1D & 2D)',
      xp: 45,
      subtitle: 'Cập nhật điểm và truy vấn tổng tiền tố bằng phép toán bitwise LSB O(log N)',
      theory: 'Cấu trúc dữ liệu dạng cây nhị phân lưu trữ chỉ số dựa trên bit 1 nhỏ nhất (LSB = i & (-i)), cực kỳ ngắn gọn, bộ nhớ chỉ đúng bằng N phần tử và hằng số chạy nhanh gấp 4 lần Segment Tree.',
      theoryDeep: {
        intuition: 'Mỗi nút `bit[i]` chịu trách nhiệm quản lý tổng của một đoạn có độ dài bằng `i & (-i)` kết thúc tại i. Khi tính tổng tiền tố từ 1 đến i, ta trừ dần LSB `i -= (i & -i)`. Khi cập nhật giá trị tại vị trí i, ta cộng dồn LSB `i += (i & -i)` để cập nhật các nút cha phụ trách.',
        mathInvariant: 'LSB của i được lấy bằng phép toán bù hai: `i & (-i)`. Vòng lặp chỉ chạy tối đa log2(N) bước.',
        steps: [
          'Đánh số mảng 1-indexed từ 1 đến N (BẮT BUỘC vì 0 & -0 = 0 gây lặp vô hạn).',
          'Hàm `add(idx, val)`: vòng lặp `while (idx <= n) { tree[idx] += val; idx += idx & (-idx); }`.',
          'Hàm `query(idx)`: vòng lặp `while (idx > 0) { sum += tree[idx]; idx -= idx & (-idx); }`.',
          'Truy vấn đoạn [L, R]: `query(R) - query(L - 1)`.',
          'Mở rộng 2D: lồng 2 vòng lặp theo x và y.'
        ],
        complexity: {
          time: 'Cập nhật O(log N), Truy vấn O(log N) (với 2D là O(log N * log M))',
          space: 'Đúng O(N) bộ nhớ - không hề tốn hằng số 4N như Segment Tree'
        },
        pitfalls: [
          'Dùng chỉ số 0: `idx = 0` sẽ khiến `idx & -idx = 0`, gây vòng lặp vô hạn và Time Limit Exceeded!'
        ],
        practiceProblems: [
          { name: 'Dynamic Range Sum Queries', oj: 'CSES', diff: 'Trung bình', linkHint: 'BIT 1D cập nhật điểm và tính tổng đoạn' },
          { name: 'Forest Queries II', oj: 'CSES', diff: 'Nâng cao', linkHint: 'BIT 2D cập nhật điểm và truy vấn hình chữ nhật' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

struct FenwickTree {
    int n;
    vector<long long> tree;

    FenwickTree(int n) : n(n), tree(n + 1, 0) {}

    void add(int idx, long long val) {
        for (; idx <= n; idx += idx & -idx) {
            tree[idx] += val;
        }
    }

    long long query(int idx) {
        long long sum = 0;
        for (; idx > 0; idx -= idx & -idx) {
            sum += tree[idx];
        }
        return sum;
    }

    long long queryRange(int l, int r) {
        return query(r) - query(l - 1);
    }
};

int main() {
    int n = 8;
    FenwickTree bit(n);
    vector<int> a = {0, 3, 2, 4, 5, 1, 1, 5, 3}; // 1-indexed

    for (int i = 1; i <= n; i++) bit.add(i, a[i]);

    cout << "Tong doan [1, 4]: " << bit.queryRange(1, 4) << "\\n"; // 3+2+4+5 = 14
    bit.add(3, 6); // Cong them 6 vao a[3] (2 -> 8)
    cout << "Tong doan [1, 4] sau khi cap nhat: " << bit.queryRange(1, 4) << "\\n"; // 20
    return 0;
}`
    },
    {
      id: '7-3',
      title: 'Segment Tree & Kỹ thuật Lazy Propagation',
      xp: 50,
      subtitle: 'Cập nhật đoạn [L, R] và truy vấn đoạn [L, R] trong O(log N)',
      theory: 'Kỹ thuật trì hoãn (Lazy Propagation) lưu thông tin cập nhật tại nút hiện tại và chỉ đẩy xuống hai con khi thực sự cần thiết, giải quyết triệt để bài toán Range Update - Range Query.',
      theoryDeep: {
        intuition: 'Nếu cần cộng giá trị V vào cả một đoạn [ql, qr] chứa hàng chục nghìn phần tử, ta không thể cập nhật từng lá. Nút nào nằm hoàn toàn trong đoạn truy vấn sẽ được cộng ngay và đánh dấu vào mảng `lazy`. Khi nào cần duyệt sâu xuống các con của nút này ở truy vấn sau, ta mới "đẩy" (pushdown) giá trị lazy xuống hai con.',
        mathInvariant: 'Tổng giá trị của nút `tree[node]` luôn phản ánh đúng giá trị sau khi đã cộng dồn `lazy[node] * length`.',
        steps: [
          'Hàm `push(node, l, r)`: nếu `lazy[node] != 0`, truyền giá trị cho hai con `2*node` và `2*node+1`, sau đó reset `lazy[node] = 0`.',
          'Hàm `updateRange(node, l, r, ql, qr, val)`: nếu đoạn con nằm trọn trong [ql, qr], áp dụng lazy và return. Ngược lại gọi push rồi đệ quy sang 2 nửa.',
          'Hàm `queryRange(node, l, r, ql, qr)`: tương tự, gọi push trước khi đệ quy.'
        ],
        complexity: {
          time: 'Cập nhật đoạn O(log N), Truy vấn đoạn O(log N)',
          space: '4 * N phần tử'
        },
        pitfalls: [
          'Quên gọi `push(node)` ở đầu hàm update và query: dẫn đến dữ liệu con bị lỗi thời (stale data).',
          'Khai báo mảng Segment Tree kích thước < 4 * N gây tràn bộ nhớ (Out of Bounds / SIGSEGV).'
        ],
        practiceProblems: [
          { name: 'Range Update Queries', oj: 'CSES', diff: 'Trung bình', linkHint: 'Lazy propagation cộng đoạn truy vấn điểm' },
          { name: 'Polynomial Queries', oj: 'CSES', diff: 'HSGQG', linkHint: 'Lazy propagation với cấp số cộng' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
long long tree[4 * MAXN], lazy[4 * MAXN];

void push(int node, int l, int r) {
    if (lazy[node] == 0) return;
    int mid = (l + r) / 2;

    tree[2 * node] += lazy[node] * (mid - l + 1);
    lazy[2 * node] += lazy[node];

    tree[2 * node + 1] += lazy[node] * (r - mid);
    lazy[2 * node + 1] += lazy[node];

    lazy[node] = 0;
}

void update(int node, int l, int r, int ql, int qr, long long val) {
    if (ql <= l && r <= qr) {
        tree[node] += val * (r - l + 1);
        lazy[node] += val;
        return;
    }
    push(node, l, r);
    int mid = (l + r) / 2;
    if (ql <= mid) update(2 * node, l, mid, ql, qr, val);
    if (qr > mid) update(2 * node + 1, mid + 1, r, ql, qr, val);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
}

long long query(int node, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return tree[node];
    push(node, l, r);
    int mid = (l + r) / 2;
    long long res = 0;
    if (ql <= mid) res += query(2 * node, l, mid, ql, qr);
    if (qr > mid) res += query(2 * node + 1, mid + 1, r, ql, qr);
    return res;
}

int main() {
    int n = 5;
    // Cong 10 vao doan [1, 3]
    update(1, 1, n, 1, 3, 10);
    // Cong 5 vao doan [2, 5]
    update(1, 1, n, 2, 5, 5);

    // Gia tri cac vi tri: [10, 15, 15, 5, 5]
    cout << "Tong doan [1, 3]: " << query(1, 1, n, 1, 3) << "\\n"; // 10 + 15 + 15 = 40
    cout << "Tong doan [4, 5]: " << query(1, 1, n, 4, 5) << "\\n"; // 5 + 5 = 10
    return 0;
}`
    },
    {
      id: '7-4',
      title: 'Cây tiền tố Trie (Xâu ký tự & Binary Trie)',
      xp: 45,
      subtitle: 'Tìm kiếm tiền tố xâu và tìm cặp có phép XOR lớn nhất trong O(30)',
      theory: 'Cấu trúc cây tìm kiếm đa nhánh biểu diễn tập hợp các xâu hoặc dãy bit. Mỗi đường đi từ gốc đến nút lá tạo thành một phần tử.',
      theoryDeep: {
        intuition: 'Với xâu: các từ có chung tiền tố sẽ dùng chung các nút ban đầu, tiết kiệm không gian và kiểm tra tiền tố trong O(Length). Với số nguyên: Binary Trie duyệt từ bit 30 xuống 0, tại mỗi bước tham lam chọn nhánh rẽ có bit đảo ngược `bit ^ 1` để cực đại hóa phép XOR.',
        mathInvariant: 'Bit cao nhất có trọng số lớn hơn tổng tất cả các bit thấp hơn: 2^k > 2^(k-1) + ... + 2^0.',
        steps: [
          'Mỗi nút chứa mảng con trỏ `child[26]` (hoặc `child[2]` cho binary trie) và biến đếm `cnt` hoặc `isEnd`.',
          'Thao tác Insert: duyệt từng ký tự/bit, tạo nút mới nếu chưa tồn tại.',
          'Thao tác Query Max XOR: duyệt từ bit cao xuống thấp, ưu tiên rẽ sang nhánh `bit ^ 1` nếu nhánh đó tồn tại.'
        ],
        complexity: {
          time: 'Chèn và truy vấn O(L) với L là độ dài xâu hoặc 31 bit',
          space: 'O(Tổng số ký tự / bit * Alphabet)'
        },
        pitfalls: [
          'Cấp phát quá nhiều nút động bằng con trỏ `new Node` gây chậm: nên dùng mảng tĩnh `int trie[MAX_NODES][2]` để tăng tốc bộ nhớ cache.'
        ],
        practiceProblems: [
          { name: 'Word Combinations', oj: 'CSES', diff: 'Nâng cao', linkHint: 'Trie kết hợp DP đếm số cách ghép từ' },
          { name: 'Maximum XOR Subarray', oj: 'CSES', diff: 'Nâng cao', linkHint: 'Binary Trie tìm đoạn con có XOR lớn nhất' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

// Binary Trie tìm cặp XOR lớn nhất
struct BinaryTrie {
    static const int MAX_BITS = 30;
    struct Node {
        int next[2];
        Node() { next[0] = next[1] = 0; }
    };
    vector<Node> t;

    BinaryTrie() { t.emplace_back(); }

    void insert(int val) {
        int u = 0;
        for (int i = MAX_BITS; i >= 0; i--) {
            int bit = (val >> i) & 1;
            if (!t[u].next[bit]) {
                t[u].next[bit] = t.size();
                t.emplace_back();
            }
            u = t[u].next[bit];
        }
    }

    int getMaxXOR(int val) {
        int u = 0, res = 0;
        for (int i = MAX_BITS; i >= 0; i--) {
            int bit = (val >> i) & 1;
            int want = bit ^ 1; // Uu tien bit nguoc lai de XOR = 1
            if (t[u].next[want]) {
                res |= (1 << i);
                u = t[u].next[want];
            } else {
                u = t[u].next[bit];
            }
        }
        return res;
    }
};

int main() {
    BinaryTrie bt;
    vector<int> a = {3, 10, 5, 25, 2, 8};
    for (int x : a) bt.insert(x);

    int maxXOR = 0;
    for (int x : a) maxXOR = max(maxXOR, bt.getMaxXOR(x));
    cout << "Cap so co XOR lon nhat: " << maxXOR << "\\n"; // 5 ^ 25 = 28
    return 0;
}`
    },
    {
      id: '7-5',
      title: 'Policy-Based Data Structures (pb_ds · tree)',
      xp: 45,
      subtitle: 'Order Statistic Tree tích hợp sẵn trong GCC hỗ trợ find_by_order & order_of_key O(log N)',
      theory: 'Thư viện mở rộng của GNU C++ cung cấp cây đỏ đen (Red-Black Tree) bổ sung hai hàm cực mạnh: tìm phần tử nhỏ thứ k và đếm số phần tử nhỏ hơn x trong O(log N).',
      theoryDeep: {
        intuition: '`std::set` trong C++ STL không hỗ trợ truy cập phần tử theo chỉ số thứ hạng. Muốn tìm phần tử nhỏ thứ k phải lặp `std::advance` tốn O(K). PBDS duy trì kích thước của mỗi cây con, cho phép truy cập theo thứ hạng trong O(log N) mà không cần tự viết cây Treap hay Fenwick nén tọa độ.',
        mathInvariant: '`find_by_order(k)`: trả về iterator đến phần tử có thứ hạng k (0-indexed). `order_of_key(x)`: trả về số lượng phần tử nhỏ hơn x nghiêm ngặt.',
        steps: [
          'Khai báo hai header đặc biệt: `#include <ext/pb_ds/assoc_container.hpp>` và `#include <ext/pb_ds/tree_policy.hpp>`.',
          'Định nghĩa alias: `using namespace __gnu_pbds;` và kiểu `ordered_set = tree<int, null_type, less<int>, rb_tree_tag, tree_order_statistics_node_update>`.',
          'Nếu cần multiset (chứa phần tử trùng lặp), dùng `less_equal<int>` hoặc lưu cặp `pair<int, int>`.'
        ],
        complexity: {
          time: 'Mọi thao tác Insert, Erase, find_by_order, order_of_key đều là O(log N)',
          space: 'O(N)'
        },
        pitfalls: [
          'Dùng `less_equal<int>` để làm multiset thì hàm `erase(val)` sẽ bị lỗi xóa nhầm toàn bộ hoặc không tìm thấy: giải pháp tốt nhất là lưu `pair<int, int>{val, unique_id}`.'
        ],
        practiceProblems: [
          { name: 'List Removals', oj: 'CSES', diff: 'Trung bình', linkHint: 'Dùng ordered_set xóa phần tử thứ k liên tục' },
          { name: 'Salary Queries with PBDS', oj: 'CSES', diff: 'Trung bình', linkHint: 'order_of_key đếm số người trong khoảng lương' }
        ]
      },
      code: `#include <bits/stdc++.h>
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>

using namespace std;
using namespace __gnu_pbds;

// Dinh nghia ordered_set
template <typename T>
using ordered_set = tree<T, null_type, less<T>, rb_tree_tag, tree_order_statistics_node_update>;

int main() {
    ordered_set<int> os;
    os.insert(2);
    os.insert(5);
    os.insert(9);
    os.insert(14);
    os.insert(20);

    // 1. Tim phan tu nho thu k (0-indexed)
    cout << "Phan tu nho thu 0: " << *os.find_by_order(0) << "\\n"; // 2
    cout << "Phan tu nho thu 3: " << *os.find_by_order(3) << "\\n"; // 14

    // 2. Dem so phan tu nho hon x
    cout << "So phan tu nho hon 10: " << os.order_of_key(10) << "\\n"; // 3 (2, 5, 9)
    cout << "So phan tu nho hon 2: " << os.order_of_key(2) << "\\n";   // 0

    return 0;
}`
    }
  ]
};
