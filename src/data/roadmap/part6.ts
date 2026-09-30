import { RoadmapModule } from '../../types';

export const PART_6: RoadmapModule = {
  key: 'part-6',
  title: 'Phần 6 (Đồ thị) · Graph Algorithms Masterclass',
  icon: '🕸️',
  description: 'BFS/DFS, Tarjan & Kosaraju (SCC), Cầu & Khớp, Dijkstra, Bellman-Ford, Floyd-Warshall, Kruskal & Prim (MST), Binary Lifting (LCA) và Dinic (Max Flow).',
  lessons: [
    {
      id: '6-1',
      title: 'Duyệt đồ thị: BFS & DFS',
      xp: 35,
      subtitle: 'Breadth-First Search (Queue) & Depth-First Search (Ngăn xếp/Đệ quy)',
      theory: 'Hai thuật toán cơ bản duyệt toàn bộ các đỉnh và cạnh của đồ thị trong O(V + E). BFS tìm đường đi ngắn nhất không trọng số, DFS dùng cho sắp xếp topo, phát hiện chu trình.',
      theoryDeep: {
        intuition: 'BFS lan truyền theo từng lớp đồng tâm (làn sóng), bảo đảm đỉnh nào đến trước thì có số cạnh đi qua ít nhất. DFS đào sâu tối đa theo từng nhánh cho tới khi gặp ngõ cụt rồi mới quay lui, rất thích hợp để khám phá cấu trúc cây con và thời gian vào/ra.',
        mathInvariant: 'BFS: Khoảng cách từ đỉnh nguồn S đến đỉnh u trong hàng đợi luôn đơn điệu không giảm. DFS: Phân loại cạnh thành Tree Edge, Back Edge, Forward Edge, Cross Edge.',
        steps: [
          'Biểu diễn đồ thị bằng danh sách kề `vector<int> adj[MAXN]`.',
          'Khởi tạo mảng `visited` hoặc `dist` (đặt ban đầu là -1 hoặc INF).',
          'Với BFS: dùng `queue<int>`, push đỉnh gốc, vòng lặp `while (!q.empty())` thăm các đỉnh kề chưa đến.',
          'Với DFS: gọi đệ quy `dfs(u)`, đánh dấu `visited[u] = true`, duyệt mọi đỉnh v trong `adj[u]`.'
        ],
        complexity: {
          time: 'O(V + E) trên danh sách kề',
          space: 'O(V) cho mảng visited và queue/call stack'
        },
        pitfalls: [
          'Quên đánh dấu `visited[v] = true` ngay khi PUSH vào queue của BFS: làm cho đỉnh v bị thêm nhiều lần, bùng nổ bộ nhớ và TLE/MLE.',
          'Dùng ma trận kề V x V khi V = 10^5 gây tràn 40GB RAM (MLE).'
        ],
        practiceProblems: [
          { name: 'Message Route', oj: 'CSES', diff: 'Dễ', linkHint: 'BFS tìm đường đi ngắn nhất không trọng số và truy vết' },
          { name: 'Building Roads', oj: 'CSES', diff: 'Dễ', linkHint: 'DFS đếm số thành phần liên thông' },
          { name: 'Round Trip', oj: 'CSES', diff: 'Trung bình', linkHint: 'DFS tìm chu trình trong đồ thị vô hướng' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
vector<int> adj[MAXN];
int distBFS[MAXN];
int parentBFS[MAXN];
bool visitedDFS[MAXN];

void bfs(int startNode) {
    memset(distBFS, -1, sizeof(distBFS));
    queue<int> q;
    q.push(startNode);
    distBFS[startNode] = 0;

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        for (int v : adj[u]) {
            if (distBFS[v] == -1) {
                distBFS[v] = distBFS[u] + 1;
                parentBFS[v] = u;
                q.push(v);
            }
        }
    }
}

void dfs(int u) {
    visitedDFS[u] = true;
    for (int v : adj[u]) {
        if (!visitedDFS[v]) {
            dfs(v);
        }
    }
}

int main() {
    int n = 5;
    adj[1].push_back(2); adj[2].push_back(1);
    adj[2].push_back(3); adj[3].push_back(2);
    adj[3].push_back(4); adj[4].push_back(3);
    adj[4].push_back(5); adj[5].push_back(4);

    bfs(1);
    cout << "Khoang cach tu 1 den 5: " << distBFS[5] << "\\n"; // 4 canh
    return 0;
}`
    },
    {
      id: '6-2',
      title: 'Thành phần liên thông mạnh: Tarjan & Kosaraju (SCC)',
      xp: 45,
      subtitle: 'Strongly Connected Components trong đồ thị có hướng trong O(V + E)',
      theory: 'Phân rã đồ thị có hướng thành các SCC (tập đỉnh tối đại mà giữa 2 đỉnh bất kỳ đều có đường đi đến nhau) và cô đọng thành Đồ thị có hướng không chu trình (DAG).',
      theoryDeep: {
        intuition: 'Trong đồ thị có hướng, tính liên thông không có tính đối xứng. Coi mỗi SCC như một "siêu đỉnh", đồ thị cô đọng (condensation graph) sẽ luôn là một DAG, cho phép áp dụng Quy hoạch động và Sắp xếp Topo.',
        mathInvariant: 'Thuật toán Tarjan dùng 1 lần DFS với mảng `num` (thời điểm vào) và `low` (thời điểm nhỏ nhất tới được qua cạnh ngược). Đỉnh u là gốc của SCC khi và chỉ khi `low[u] == num[u]`.',
        steps: [
          'Duy trì biến đếm thời gian `timer` và một `stack` lưu các đỉnh đang nằm trong nhánh DFS.',
          'Khi thăm đỉnh u: gán `num[u] = low[u] = ++timer`, push u vào stack.',
          'Duyệt đỉnh kề v: nếu chưa thăm thì gọi dfs(v) rồi `low[u] = min(low[u], low[v])`. Nếu v đã trong stack thì `low[u] = min(low[u], num[v])`.',
          'Nếu `low[u] == num[u]`: pop stack liên tục cho đến u để thu được trọn vẹn 1 SCC.'
        ],
        complexity: {
          time: 'O(V + E) - đúng 1 lần duyệt DFS',
          space: 'O(V) cho stack và các mảng đánh số'
        },
        pitfalls: [
          'Cập nhật `low[u] = min(low[u], low[v])` cho đỉnh đã thăm thay vì kiểm tra đỉnh đó có còn nằm trong stack (in_stack) hay không.'
        ],
        practiceProblems: [
          { name: 'Flight Routes Check', oj: 'CSES', diff: 'Trung bình', linkHint: 'Kiểm tra đồ thị có tạo thành 1 SCC duy nhất không' },
          { name: 'Planets and Kingdoms', oj: 'CSES', diff: 'Trung bình', linkHint: 'Gán ID vương quốc cho từng SCC' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
vector<int> adj[MAXN];
int num[MAXN], low[MAXN], timer = 0, sccCount = 0;
bool inStack[MAXN];
stack<int> st;

void dfsTarjan(int u) {
    num[u] = low[u] = ++timer;
    st.push(u);
    inStack[u] = true;

    for (int v : adj[u]) {
        if (!num[v]) {
            dfsTarjan(v);
            low[u] = min(low[u], low[v]);
        } else if (inStack[v]) {
            low[u] = min(low[u], num[v]);
        }
    }

    if (low[u] == num[u]) {
        sccCount++;
        cout << "SCC #" << sccCount << ": ";
        while (true) {
            int v = st.top(); st.pop();
            inStack[v] = false;
            cout << v << " ";
            if (u == v) break;
        }
        cout << "\\n";
    }
}

int main() {
    int n = 4;
    adj[1].push_back(2);
    adj[2].push_back(3);
    adj[3].push_back(1);
    adj[3].push_back(4); // 4 là SCC riêng

    for (int i = 1; i <= n; i++) {
        if (!num[i]) dfsTarjan(i);
    }
    return 0;
}`
    },
    {
      id: '6-3',
      title: 'Cầu & Khớp (Bridges & Articulation Points)',
      xp: 45,
      subtitle: 'Tìm cạnh và đỉnh xung yếu mà việc xóa chúng sẽ làm tăng số thành phần liên thông',
      theory: 'Kỹ thuật cây DFS và mảng num/low để tìm các điểm khớp (Cut Vertices) và cạnh cầu (Bridges) trong đồ thị vô hướng trong O(V + E).',
      theoryDeep: {
        intuition: 'Một cạnh (u, v) là cầu nếu từ v và cây con của v không hề có cạnh ngược nào vươn lên trên u hoặc chạm tới u. Tức là `low[v] > num[u]`. Tương tự đỉnh u là khớp nếu tồn tại con v sao cho `low[v] >= num[u]` (với gốc cây thì cần >= 2 con nhánh độc lập).',
        mathInvariant: 'Cầu (u, v): `low[v] > num[u]`. Khớp u không phải gốc: tồn tại v thỏa `low[v] >= num[u]`. Gốc u là khớp: số nhánh con trong cây DFS >= 2.',
        steps: [
          'Duyệt DFS trên đồ thị vô hướng, bỏ qua cạnh đi ngược lại cha `parent`.',
          'Cập nhật `low[u] = min(low[u], low[v])` cho cạnh xuôi và `low[u] = min(low[u], num[v])` cho cạnh ngược.',
          'Kiểm tra điều kiện cầu và khớp ngay khi kết thúc duyệt nhánh con v.'
        ],
        complexity: {
          time: 'O(V + E)',
          space: 'O(V)'
        },
        pitfalls: [
          'Đỉnh gốc cây DFS bị nhầm là khớp khi chỉ có 1 con: gốc cây chỉ là khớp khi có từ 2 con độc lập trở lên trong cây DFS.'
        ],
        practiceProblems: [
          { name: 'Critical Connections in a Network', oj: 'LeetCode 1192', diff: 'Trung bình', linkHint: 'Tìm toàn bộ các cầu trong mạng server' },
          { name: 'Necessary Roads', oj: 'CSES', diff: 'Trung bình', linkHint: 'Tìm mọi cây cầu nối giữa các thành phố' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
vector<int> adj[MAXN];
int num[MAXN], low[MAXN], timer = 0;
vector<pair<int, int>> bridges;
bool isCut[MAXN];

void dfsBridges(int u, int p) {
    num[u] = low[u] = ++timer;
    int children = 0;

    for (int v : adj[u]) {
        if (v == p) continue;
        if (num[v]) {
            low[u] = min(low[u], num[v]);
        } else {
            children++;
            dfsBridges(v, u);
            low[u] = min(low[u], low[v]);

            // Kiem tra cau
            if (low[v] > num[u]) {
                bridges.push_back({u, v});
            }
            // Kiem tra khop
            if (p != 0 && low[v] >= num[u]) {
                isCut[u] = true;
            }
        }
    }
    if (p == 0 && children > 1) isCut[u] = true;
}

int main() {
    adj[1].push_back(2); adj[2].push_back(1);
    adj[2].push_back(3); adj[3].push_back(2);
    adj[3].push_back(4); adj[4].push_back(3);

    dfsBridges(1, 0);
    cout << "So luong cau tim duoc: " << bridges.size() << "\\n";
    for (auto [u, v] : bridges) cout << u << " - " << v << "\\n";
    return 0;
}`
    },
    {
      id: '6-4',
      title: 'Thuật toán Dijkstra (Đường đi ngắn nhất nguồn đơn)',
      xp: 40,
      subtitle: 'Tìm đường đi ngắn nhất trên đồ thị có trọng số không âm với Min-Heap',
      theory: 'Thuật toán tham lam tối ưu sử dụng priority_queue (hàng đợi ưu tiên) để mở rộng đỉnh có khoảng cách tạm thời nhỏ nhất trong O((V + E) log V).',
      theoryDeep: {
        intuition: 'Do mọi trọng số cạnh đều không âm w(u, v) >= 0, khi ta rút ra đỉnh u có `dist[u]` nhỏ nhất từ Min-Heap, khoảng cách này đã đạt trạng thái tối ưu cuối cùng (không thể có đường đi nào vòng qua đỉnh khác mà ngắn hơn được).',
        mathInvariant: 'Mỗi đỉnh được chốt khoảng cách tối ưu (finalized) đúng một lần theo thứ tự tăng dần của khoảng cách.',
        steps: [
          'Khởi tạo mảng `dist` gán vô cùng (INF = 1e18), đặt `dist[source] = 0`.',
          'Đưa cặp `{0, source}` vào `priority_queue<pair<long long, int>, vector<...>, greater<...>>`.',
          'Lấy đỉnh u có `d` nhỏ nhất: nếu `d > dist[u]` thì bỏ qua (stale entry).',
          'Thực hiện thư giãn (relaxation): với mỗi cạnh (u, v, w), nếu `dist[u] + w < dist[v]`, cập nhật `dist[v]` và push `{dist[v], v}` vào heap.'
        ],
        complexity: {
          time: 'O((V + E) log V)',
          space: 'O(V + E)'
        },
        pitfalls: [
          'Chạy Dijkstra trên đồ thị có trọng số âm: vòng lặp có thể rơi vào lặp vô hạn hoặc cho đáp án sai.',
          'Quên kiểm tra `if (d > dist[u]) continue;` làm tăng số lần thư giãn lên O(E log V) và tốn bộ nhớ.'
        ],
        practiceProblems: [
          { name: 'Shortest Routes I', oj: 'CSES', diff: 'Dễ', linkHint: 'Dijkstra nguồn đơn cơ bản' },
          { name: 'Flight Discount', oj: 'CSES', diff: 'Trung bình', linkHint: 'Dijkstra trên đồ thị mở rộng trạng thái 2 tầng (đã dùng phiếu giảm giá hay chưa)' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

const long long INF = 1e18;

struct Edge {
    int to;
    long long weight;
};

vector<long long> dijkstra(int n, int src, const vector<vector<Edge>>& adj) {
    vector<long long> dist(n + 1, INF);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> pq;

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue; // Bo qua phan tu cu

        for (const auto& edge : adj[u]) {
            if (dist[u] + edge.weight < dist[edge.to]) {
                dist[edge.to] = dist[u] + edge.weight;
                pq.push({dist[edge.to], edge.to});
            }
        }
    }
    return dist;
}

int main() {
    int n = 4;
    vector<vector<Edge>> adj(n + 1);
    adj[1].push_back({2, 4});
    adj[1].push_back({3, 2});
    adj[3].push_back({2, 1});
    adj[2].push_back({4, 5});

    auto d = dijkstra(n, 1, adj);
    cout << "Khoang cach tu 1 den 4: " << d[4] << "\\n"; // 8 (1 -> 3 -> 2 -> 4: 2 + 1 + 5 = 8)
    return 0;
}`
    },
    {
      id: '6-5',
      title: 'Bellman-Ford & SPFA (Trọng số âm & Chu trình âm)',
      xp: 45,
      subtitle: 'Tìm đường đi ngắn nhất và phát hiện chu trình âm trong O(V * E)',
      theory: 'Bellman-Ford lặp thư giãn toàn bộ E cạnh đúng V - 1 lần. Nếu lần thứ V vẫn còn cạnh thư giãn được, đồ thị chắc chắn chứa chu trình âm tới được.',
      theoryDeep: {
        intuition: 'Đường đi đơn giản ngắn nhất không qua chu trình chứa tối đa V - 1 cạnh. Do đó sau V - 1 vòng lặp thư giãn tất cả các cạnh, khoảng cách tới mọi đỉnh đều phải hội tụ nếu không có chu trình âm.',
        mathInvariant: 'Sau k vòng lặp, `dist[u]` là độ dài đường đi ngắn nhất từ nguồn đến u sử dụng tối đa k cạnh.',
        steps: [
          'Khởi tạo dist gán INF, `dist[src] = 0`.',
          'Lặp V - 1 lần: với mỗi cạnh (u, v, w), nếu `dist[u] < INF` và `dist[u] + w < dist[v]` thì `dist[v] = dist[u] + w`.',
          'Lần lặp thứ V: nếu vẫn tồn tại cạnh có `dist[u] + w < dist[v]`, ghi nhận có chu trình âm.'
        ],
        complexity: {
          time: 'O(V * E)',
          space: 'O(V + E)'
        },
        pitfalls: [
          'Tràn số khi so sánh `dist[u] + w < dist[v]`: nếu `dist[u] == INF` mà cộng w âm thì sẽ bị tràn số. Phải kiểm tra `if (dist[u] != INF)` trước.'
        ],
        practiceProblems: [
          { name: 'Cycle Finding', oj: 'CSES', diff: 'Trung bình', linkHint: 'Bellman-Ford tìm và in ra chu trình âm' },
          { name: 'High Score', oj: 'CSES', diff: 'Trung bình', linkHint: 'Đường đi dài nhất đổi dấu trọng số và kiểm tra chu trình dương' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

const long long INF = 1e18;

struct Edge {
    int u, v;
    long long w;
};

int main() {
    int n = 4;
    vector<Edge> edges = {
        {1, 2, 1},
        {2, 3, -3},
        {3, 4, 2},
        {3, 1, 1} // Chu trinh 1->2->3->1 co tong = 1 - 3 + 1 = -1 (Am!)
    };

    vector<long long> dist(n + 1, INF);
    dist[1] = 0;

    for (int iter = 1; iter <= n - 1; iter++) {
        for (const auto& e : edges) {
            if (dist[e.u] < INF && dist[e.u] + e.w < dist[e.v]) {
                dist[e.v] = dist[e.u] + e.w;
            }
        }
    }

    bool hasNegativeCycle = false;
    for (const auto& e : edges) {
        if (dist[e.u] < INF && dist[e.u] + e.w < dist[e.v]) {
            hasNegativeCycle = true;
            break;
        }
    }

    cout << (hasNegativeCycle ? "Phat hien chu trinh am!" : "Do thi khong co chu trinh am") << "\\n";
    return 0;
}`
    },
    {
      id: '6-6',
      title: 'Thuật toán Floyd-Warshall (All-Pairs Shortest Path)',
      xp: 40,
      subtitle: 'Tìm đường đi ngắn nhất giữa mọi cặp đỉnh trong O(V³)',
      theory: 'Thuật toán quy hoạch động 3 vòng lặp kinh điển tính đường đi ngắn nhất giữa mọi cặp (i, j) đi qua tập đỉnh trung gian {1..k}.',
      theoryDeep: {
        intuition: 'Xét từng đỉnh k làm trạm trung chuyển. Khoảng cách trực tiếp `d[i][j]` được cập nhật nếu việc đi vòng qua trạm k ngắn hơn: `d[i][j] = min(d[i][j], d[i][k] + d[k][j])`.',
        mathInvariant: 'Tại bước lặp k, ma trận dist chứa đường đi ngắn nhất giữa mọi cặp đỉnh chỉ sử dụng các đỉnh trung gian từ tập {1..k}.',
        steps: [
          'Khởi tạo ma trận `d[N][N]` với `d[i][i] = 0`, các cạnh trực tiếp gán trọng số, các ô khác gán INF.',
          'Vòng lặp k từ 1 đến N (đỉnh trung gian BẮT BUỘC ở ngoài cùng).',
          'Hai vòng lặp i và j từ 1 đến N: cập nhật `d[i][j] = min(d[i][j], d[i][k] + d[k][j])`.'
        ],
        complexity: {
          time: 'O(V^3) - cực kỳ dễ cài đặt với 3 vòng lặp',
          space: 'O(V^2)'
        },
        pitfalls: [
          'Đặt vòng lặp k ở trong cùng: đây là lỗi sai tai hại phổ biến nhất! k BẮT BUỘC phải là vòng lặp ngoài cùng.'
        ],
        practiceProblems: [
          { name: 'Shortest Routes II', oj: 'CSES', diff: 'Trung bình', linkHint: 'Floyd-Warshall trả lời Q truy vấn mọi cặp' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

const long long INF = 1e18;

int main() {
    int n = 4;
    vector<vector<long long>> d(n + 1, vector<long long>(n + 1, INF));

    for (int i = 1; i <= n; i++) d[i][i] = 0;
    // Them cac canh
    d[1][2] = 5; d[2][3] = 3; d[1][3] = 9; d[3][4] = 1;

    // Floyd-Warshall: k o ngoai cung!
    for (int k = 1; k <= n; k++) {
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                if (d[i][k] < INF && d[k][j] < INF) {
                    d[i][j] = min(d[i][j], d[i][k] + d[k][j]);
                }
            }
        }
    }

    cout << "Khoang cach ngan nhat 1 den 3: " << d[1][3] << "\\n"; // 8 (qua 2: 5 + 3 = 8)
    return 0;
}`
    },
    {
      id: '6-7',
      title: 'Cây khung nhỏ nhất: Kruskal & Prim (MST)',
      xp: 45,
      subtitle: 'Tìm tập V - 1 cạnh liên thông toàn bộ đồ thị với tổng trọng số nhỏ nhất',
      theory: 'Kruskal dùng Disjoint Set Union (DSU) duyệt cạnh tăng dần; Prim dùng Min-Heap mở rộng tập đỉnh liên thông tương tự Dijkstra.',
      theoryDeep: {
        intuition: 'Định lý Cắt (Cut Property): Với bất kỳ nhát cắt nào chia đồ thị làm 2 phần, cạnh nhẹ nhất nối giữa 2 phần luôn luôn thuộc về một Cây khung nhỏ nhất (MST).',
        mathInvariant: 'Kruskal duy trì một rừng cây không chu trình bằng DSU, mỗi bước thêm cạnh nhẹ nhất nối hai thành phần rời rạc.',
        steps: [
          'Kruskal: Gom toàn bộ cạnh vào danh sách, sắp xếp theo trọng số tăng dần.',
          'Khởi tạo DSU kích thước N.',
          'Duyệt từng cạnh (u, v, w): nếu `find(u) != find(v)` thì kết nạp cạnh vào MST, cộng trọng số w và gọi `union(u, v)`.',
          'Dừng lại khi đã kết nạp đủ N - 1 cạnh.'
        ],
        complexity: {
          time: 'Kruskal: O(E log E); Prim: O(E log V)',
          space: 'O(V + E)'
        },
        pitfalls: [
          'Đồ thị không liên thông: số cạnh kết nạp được sẽ < N - 1. Cần kiểm tra để in ra -1 hoặc "IMPOSSIBLE".'
        ],
        practiceProblems: [
          { name: 'Road Reparation', oj: 'CSES', diff: 'Trung bình', linkHint: 'Kruskal MST chuẩn với DSU' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

struct Edge {
    int u, v;
    long long w;
    bool operator<(const Edge& other) const { return w < other.w; }
};

struct DSU {
    vector<int> parent;
    DSU(int n) : parent(n + 1) { iota(parent.begin(), parent.end(), 0); }
    int find(int i) { return parent[i] == i ? i : parent[i] = find(parent[i]); }
    bool unite(int i, int j) {
        int rootI = find(i), rootJ = find(j);
        if (rootI != rootJ) { parent[rootI] = rootJ; return true; }
        return false;
    }
};

int main() {
    int n = 4;
    vector<Edge> edges = {
        {1, 2, 1}, {2, 3, 4}, {1, 3, 2}, {3, 4, 3}, {2, 4, 5}
    };

    sort(edges.begin(), edges.end());
    DSU dsu(n);
    long long totalMST = 0;
    int edgesCount = 0;

    for (const auto& e : edges) {
        if (dsu.unite(e.u, e.v)) {
            totalMST += e.w;
            edgesCount++;
            if (edgesCount == n - 1) break;
        }
    }

    cout << "Trong so cay khung nho nhat: " << totalMST << "\\n"; // 6 (1-2: 1, 1-3: 2, 3-4: 3)
    return 0;
}`
    },
    {
      id: '6-8',
      title: 'Binary Lifting & Tổ tiên chung gần nhất (LCA)',
      xp: 50,
      subtitle: 'Lowest Common Ancestor và truy vấn trên cây trong O(log N) sau tiền xử lý O(N log N)',
      theory: 'Kỹ thuật nhảy nhị phân lưu bảng up[u][i] là tổ tiên thứ 2^i của đỉnh u, cho phép tìm LCA và khoảng cách giữa 2 nút bất kỳ trên cây trong O(log N).',
      theoryDeep: {
        intuition: 'Mọi số nguyên đều phân tích được thành tổng các lũy thừa của 2. Thay vì nhảy từng bước 1 lên cha tốn O(N), ta nhảy theo bước 2^19, 2^18, ..., 2^0 giúp đưa hai đỉnh về cùng độ sâu và tiến sát tới tổ tiên chung trong O(log N).',
        mathInvariant: 'up[u][i] = up[ up[u][i-1] ][i-1]: tổ tiên thứ 2^i là tổ tiên thứ 2^(i-1) của tổ tiên thứ 2^(i-1).',
        steps: [
          'Chạy DFS từ gốc tính độ sâu `depth[u]` và cha trực tiếp `up[u][0] = parent`.',
          'Quy hoạch động tính bảng `up[u][i]` với i từ 1 đến LOGN.',
          'Hàm `lca(u, v)`: Nhảy đỉnh sâu hơn lên cùng độ sâu với đỉnh kia.',
          'Nếu u == v return u. Sau đó nhảy đồng thời cả hai đỉnh lên cao nhất có thể sao cho `up[u][i] != up[v][i]`. Cuối cùng trả về `up[u][0]`.'
        ],
        complexity: {
          time: 'Tiền xử lý O(N log N), mỗi truy vấn LCA O(log N)',
          space: 'O(N log N)'
        },
        pitfalls: [
          'Không đưa hai đỉnh về cùng độ sâu trước khi nhảy đồng thời.',
          'Khoảng cách giữa hai nút trên cây: `dist(u, v) = depth[u] + depth[v] - 2 * depth[lca(u, v)]`.'
        ],
        practiceProblems: [
          { name: 'Company Queries II', oj: 'CSES', diff: 'Trung bình', linkHint: 'LCA cơ bản trên cây nhân sự' },
          { name: 'Distance Queries', oj: 'CSES', diff: 'Trung bình', linkHint: 'Tính khoảng cách giữa 2 nút qua LCA' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
const int LOGN = 18;
vector<int> adj[MAXN];
int up[MAXN][LOGN];
int depth[MAXN];

void dfsLCA(int u, int p, int d) {
    depth[u] = d;
    up[u][0] = p;
    for (int i = 1; i < LOGN; i++) {
        up[u][i] = up[ up[u][i - 1] ][i - 1];
    }
    for (int v : adj[u]) {
        if (v != p) dfsLCA(v, u, d + 1);
    }
}

int getLCA(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    // Nhay u len cung do sau voi v
    for (int i = LOGN - 1; i >= 0; i--) {
        if (depth[u] - (1 << i) >= depth[v]) {
            u = up[u][i];
        }
    }
    if (u == v) return u;

    // Nhay dong thoi ca 2
    for (int i = LOGN - 1; i >= 0; i--) {
        if (up[u][i] != up[v][i]) {
            u = up[u][i];
            v = up[v][i];
        }
    }
    return up[u][0];
}

int main() {
    int n = 5;
    // 1-2, 1-3, 2-4, 2-5
    adj[1].push_back(2); adj[2].push_back(1);
    adj[1].push_back(3); adj[3].push_back(1);
    adj[2].push_back(4); adj[4].push_back(2);
    adj[2].push_back(5); adj[5].push_back(2);

    dfsLCA(1, 1, 0);
    cout << "LCA cua 4 va 5: " << getLCA(4, 5) << "\\n"; // 2
    cout << "LCA cua 4 va 3: " << getLCA(4, 3) << "\\n"; // 1
    return 0;
}`
    },
    {
      id: '6-9',
      title: 'Thuật toán Dinic (Luồng cực đại trong mạng - Max Flow)',
      xp: 55,
      subtitle: 'Tìm luồng cực đại với đồ thị phân tầng (Level Graph) và DFS chặn luồng (Blocking Flow) O(V²E)',
      theory: 'Thuật toán Dinic kết hợp BFS chia tầng và DFS tìm luồng chặn, đạt độ phức tạp O(V²E) tổng quát và O(E√V) trên mạng đơn vị (Unit Network / Cặp ghép bipartite matching).',
      theoryDeep: {
        intuition: 'Edmonds-Karp chỉ tìm từng đường tăng luồng ngắn nhất tốn O(V E²). Dinic dùng BFS xây dựng đồ thị phân tầng (Level Graph), sau đó dùng một lượt DFS đẩy được nhiều luồng đồng thời (blocking flow) dọc theo các cạnh đi xuống tầng tiếp theo `level[v] == level[u] + 1`. Con trỏ `ptr[u]` giúp không bao giờ duyệt lại các cạnh đã bão hòa.',
        mathInvariant: 'Định lý Luồng cực đại - Lát cắt hẹp nhất (Max-Flow Min-Cut Theorem): Giá trị luồng cực đại từ S đến T bằng dung lượng lát cắt nhỏ nhất ngăn cách S và T.',
        steps: [
          'Xây dựng mạng thặng dư: mỗi cạnh thuận có dung lượng C, cạnh nghịch tương ứng có dung lượng 0.',
          'BFS tìm đường đi từ S đến T: xác định mảng tầng `level` của từng đỉnh. Nếu không tới được T thì kết thúc.',
          'Reset mảng con trỏ cạnh `ptr[u] = 0`.',
          'DFS đẩy luồng dọc theo các cạnh có `level[v] == level[u] + 1` và thặng dư > 0.',
          'Lặp lại cho đến khi không còn đường tăng luồng.'
        ],
        complexity: {
          time: 'O(V^2 * E) trường hợp tổng quát; O(E * sqrt(V)) trên đồ thị cặp ghép Bipartite Matching',
          space: 'O(V + E)'
        },
        pitfalls: [
          'Quên thêm cạnh ngược có dung lượng 0 vào danh sách kề.',
          'Không dùng mảng con trỏ `ptr` (current edge pointer) sẽ làm thoái hóa về O(V E^2).'
        ],
        practiceProblems: [
          { name: 'Download Speed', oj: 'CSES', diff: 'Nâng cao', linkHint: 'Max Flow cơ bản' },
          { name: 'Police Chase', oj: 'CSES', diff: 'Nâng cao', linkHint: 'Min-Cut tìm các cạnh trong lát cắt nhỏ nhất' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

struct Edge {
    int to;
    long long cap, flow;
    int rev;
};

struct Dinic {
    int n, s, t;
    vector<vector<Edge>> adj;
    vector<int> level, ptr;

    Dinic(int n, int s, int t) : n(n), s(s), t(t), adj(n + 1), level(n + 1), ptr(n + 1) {}

    void addEdge(int from, int to, long long cap) {
        adj[from].push_back({to, cap, 0, (int)adj[to].size()});
        adj[to].push_back({from, 0, 0, (int)adj[from].size() - 1});
    }

    bool bfs() {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (auto& edge : adj[u]) {
                if (edge.cap - edge.flow > 0 && level[edge.to] == -1) {
                    level[edge.to] = level[u] + 1;
                    q.push(edge.to);
                }
            }
        }
        return level[t] != -1;
    }

    long long dfs(int u, long long pushed) {
        if (pushed == 0 || u == t) return pushed;
        for (int& cid = ptr[u]; cid < (int)adj[u].size(); cid++) {
            auto& edge = adj[u][cid];
            int trg = edge.to;
            if (level[u] + 1 != level[trg] || edge.cap - edge.flow == 0) continue;
            long long tr = dfs(trg, min(pushed, edge.cap - edge.flow));
            if (tr == 0) continue;
            edge.flow += tr;
            adj[trg][edge.rev].flow -= tr;
            return tr;
        }
        return 0;
    }

    long long maxFlow() {
        long long flow = 0;
        while (bfs()) {
            fill(ptr.begin(), ptr.end(), 0);
            while (long long pushed = dfs(s, 1e18)) {
                flow += pushed;
            }
        }
        return flow;
    }
};

int main() {
    Dinic dinic(4, 1, 4);
    dinic.addEdge(1, 2, 10);
    dinic.addEdge(1, 3, 10);
    dinic.addEdge(2, 4, 10);
    dinic.addEdge(3, 4, 10);
    dinic.addEdge(2, 3, 2);

    cout << "Luong cuc dai S=1 -> T=4: " << dinic.maxFlow() << "\\n"; // 20
    return 0;
}`
    }
  ]
};
