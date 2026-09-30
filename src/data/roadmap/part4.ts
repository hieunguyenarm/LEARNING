import { RoadmapModule } from '../../types';

export const PART_4: RoadmapModule = {
  key: 'part-4',
  title: 'Phần 4 (Đệ quy & Quay lui) · Divide & Conquer & Backtracking',
  icon: '🧩',
  description: 'Chia để trị (Lũy thừa nhanh, Nhân ma trận), Quay lui (N-Queens, Sudoku) và kỹ thuật Cắt tỉa nhánh cận tối ưu không gian trạng thái.',
  lessons: [
    {
      id: '4-1',
      title: 'Chia để trị: Lũy thừa nhanh & Nhân ma trận',
      xp: 40,
      subtitle: 'Binary Exponentiation tính A^B mod M trong O(log B)',
      theory: 'Chiến lược chia bài toán lớn thành hai bài toán con bằng một nửa kích thước: a^b = (a^(b/2))^2.',
      theoryDeep: {
        intuition: 'Thay vì nhân b lần tốn O(b) với b lên tới 10^18, ta chia đôi số mũ: nếu b chẵn, a^b = (a^2)^(b/2); nếu b lẻ, a^b = a * a^(b-1). Số phép nhân giảm xuống còn tối đa 60 phép tính!',
        mathInvariant: 'Tính chất: a^b = (a^(b/2))^2 nếu b chẵn; a * a^(b-1) nếu b lẻ.',
        steps: [
          'Khởi tạo res = 1, a = a % mod.',
          'Vòng lặp while (b > 0): nếu b & 1 thì res = (res * a) % mod.',
          'a = (a * a) % mod, b >>= 1.',
          'Mở rộng cho ma trận: thay phép nhân số bằng hàm nhân ma trận KxK trong O(K^3 * log B).'
        ],
        complexity: {
          time: 'Số học: O(log B); Ma trận: O(K^3 * log B)',
          space: 'O(1)'
        },
        pitfalls: [
          'Quên thực hiện `a %= mod` ở đầu hàm: nếu a ban đầu >= mod thì phép nhân đầu tiên có thể bị sai.'
        ],
        practiceProblems: [
          { name: 'Exponentiation', oj: 'CSES', diff: 'Dễ', linkHint: 'Tính a^b mod (10^9+7)' },
          { name: 'Fibonacci Numbers', oj: 'CSES', diff: 'Trung bình', linkHint: 'Nhân ma trận 2x2 tính số Fibonacci thứ 10^18' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

long long power(long long a, long long b, long long mod = 1e9 + 7) {
    long long res = 1;
    a %= mod;
    while (b > 0) {
        if (b & 1) res = (res * a) % mod;
        a = (a * a) % mod;
        b >>= 1;
    }
    return res;
}

int main() {
    long long a = 2, b = 10;
    cout << "2^10 = " << power(a, b) << "\\n"; // 1024
    cout << "2^1000000000 mod 10^9+7 = " << power(2, 1000000000) << "\\n";
    return 0;
}`
    },
    {
      id: '4-2',
      title: 'Quay lui (Backtracking): N-Queens & Sudoku',
      xp: 40,
      subtitle: 'Duyệt không gian nghiệm có hoàn tác trạng thái (Undo state)',
      theory: 'Quay lui thử mọi khả năng có thể của bài toán và lập tức lùi lại (backtrack) khi phát hiện nhánh tìm kiếm không dẫn tới nghiệm hợp lệ.',
      theoryDeep: {
        intuition: 'Không gian tìm kiếm có thể lên tới N! hoặc 2^N. Bằng cách kiểm tra điều kiện an toàn trước khi đặt quân cờ, ta loại bỏ hàng tỷ nhánh rác.',
        mathInvariant: 'Luôn khôi phục lại trạng thái cũ sau khi gọi đệ quy xong để nhánh tiếp theo không bị sai lệch.',
        steps: [
          'Kiểm tra điều kiện dừng: nếu đã đặt đủ N phần tử -> ghi nhận nghiệm.',
          'Thử đặt từng giá trị có thể tại bước hiện tại.',
          'Nếu hợp lệ: đánh dấu -> gọi đệ quy sang bước tiếp theo -> hủy đánh dấu (Backtrack).'
        ],
        complexity: {
          time: 'Tồi nhất O(N!), thực tế rất nhanh nhờ tỉa nhánh',
          space: 'O(N) độ sâu ngăn xếp đệ quy'
        },
        pitfalls: [
          'Quên hoàn tác biến trạng thái (used[i] = false) khiến các nhánh sau bị thiếu nghiệm.'
        ],
        practiceProblems: [
          { name: 'Chessboard and Queens', oj: 'CSES', diff: 'Trung bình', linkHint: 'Đặt 8 quân hậu trên bàn cờ có chướng ngại vật' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int n = 8, solutions = 0;
bool col[20], diag1[40], diag2[40];

void backtrack(int row) {
    if (row == n) {
        solutions++;
        return;
    }
    for (int c = 0; c < n; c++) {
        if (col[c] || diag1[row + c] || diag2[row - c + n]) continue;
        // Đặt quân hậu
        col[c] = diag1[row + c] = diag2[row - c + n] = true;
        backtrack(row + 1);
        // Hoàn tác
        col[c] = diag1[row + c] = diag2[row - c + n] = false;
    }
}

int main() {
    backtrack(0);
    cout << "So cach dat 8 quan hau: " << solutions << "\\n"; // 92
    return 0;
}`
    },
    {
      id: '4-3',
      title: 'Cắt tỉa nhánh cận (Branch and Bound & State Pruning)',
      xp: 45,
      subtitle: 'Thiết lập cận trên / cận dưới để hủy bỏ sớm các nhánh không tối ưu',
      theory: 'Kỹ thuật nhánh cận tính toán một chặn (bound) ước tính tại mỗi nút trung gian: nếu ngay cả trong trường hợp lý tưởng nhất mà nhánh đó vẫn kém hơn kỷ lục hiện tại, lập tức bỏ qua.',
      theoryDeep: {
        intuition: 'Trong bài toán tối ưu hóa (như tìm đường đi ngắn nhất hoặc chọn tập vật phẩm giá trị cao nhất), ta luôn duy trì một biến `best_ans`. Nếu chi phí hiện tại + cận dưới ước tính >= `best_ans`, ta cắt tỉa toàn bộ cây con bên dưới.',
        mathInvariant: 'Chi phí ước tính tối ưu luôn là cận dưới (Admissible Lower Bound) của chi phí thực tế.',
        steps: [
          'Tìm nghiệm tham lam ban đầu để có một `best_ans` tương đối tốt.',
          'Tại mỗi bước đệ quy, tính hàm cận h(state).',
          'Nếu cost(state) + h(state) >= best_ans: return ngay lập tức.'
        ],
        complexity: {
          time: 'Phụ thuộc vào độ chặt của hàm cận, giảm hàng triệu phép tính',
          space: 'O(N)'
        },
        pitfalls: [
          'Hàm cận tính sai (cận dưới lớn hơn chi phí thực tế) sẽ làm thuật toán cắt tỉa nhầm nhánh chứa nghiệm tối ưu!'
        ],
        practiceProblems: [
          { name: 'Branch and Bound Knapsack', oj: 'Codeforces', diff: 'Nâng cao', linkHint: 'Nhánh cận cho bài toán ba lô' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int best_ans = 1e9;
int n = 4;
int cost[4][4] = {
    {0, 10, 15, 20},
    {10, 0, 35, 25},
    {15, 35, 0, 30},
    {20, 25, 30, 0}
};
bool visited[4];

void branchAndBound(int u, int count, int current_cost) {
    // Tỉa nhánh: nếu chi phí hiện tại đã lớn hơn kỷ lục thì dừng ngay
    if (current_cost >= best_ans) return;

    if (count == n) {
        best_ans = min(best_ans, current_cost + cost[u][0]);
        return;
    }

    for (int v = 0; v < n; v++) {
        if (!visited[v]) {
            visited[v] = true;
            branchAndBound(v, count + 1, current_cost + cost[u][v]);
            visited[v] = false;
        }
    }
}

int main() {
    visited[0] = true;
    branchAndBound(0, 1, 0);
    cout << "Chi phi toi uu nho nhat: " << best_ans << "\\n"; // 80
    return 0;
}`
    }
  ]
};
