import { RoadmapModule } from '../../types';

export const PART_0: RoadmapModule = {
  key: 'part-0',
  title: 'Phần 0 (Nhập môn) · C++ Cơ bản & Nền tảng lập trình',
  icon: '🌱',
  description: 'Cấu trúc chương trình C++, Biến, Kiểu dữ liệu, Điều kiện rẽ nhánh, Vòng lặp, Hàm và Mảng 1D/2D cơ bản.',
  lessons: [
    {
      id: '0-1',
      title: 'Cấu trúc chương trình C++ & Tối ưu I/O',
      xp: 20,
      subtitle: 'Header <bits/stdc++.h>, main(), std::cin/cout fast I/O',
      theory: 'Hiểu cấu trúc của một file mã nguồn C++ chuẩn thi đấu, cách viết hàm main và tối ưu vào ra nhanh để tránh TLE.',
      theoryDeep: {
        intuition: 'Trong các kỳ thi, dữ liệu đầu vào có thể lên tới 10^6 dòng. Dùng cin/cout mặc định sẽ bị đồng bộ với stdio của C, khiến tốc độ đọc chậm gấp 10 lần. Hai lệnh tắt đồng bộ là bắt buộc đối với mọi lập trình viên thi đấu.',
        mathInvariant: 'cin.tie(NULL) hủy liên kết giữa cin và cout; ios_base::sync_with_stdio(false) ngắt đồng bộ C và C++ buffer.',
        steps: [
          'Khai báo thư viện toàn năng #include <bits/stdc++.h>.',
          'Sử dụng không gian tên using namespace std;.',
          'Đặt hai lệnh tối ưu I/O ở đầu hàm int main().',
          'Dùng "\\n" thay vì std::endl để tránh flush bộ đệm liên tục gây chậm trễ.'
        ],
        complexity: {
          time: 'O(1) cho thiết lập I/O',
          space: 'O(1)'
        },
        pitfalls: [
          'Dùng std::endl sau mỗi lần in số trong vòng lặp 10^5 lần sẽ gây TLE chắc chắn.',
          'Dùng kết hợp cả scanf/printf và cin/cout sau khi đã sync_with_stdio(false) sẽ làm xáo trộn thứ tự dữ liệu.'
        ],
        practiceProblems: [
          { name: 'Watermelon & Fast I/O', oj: 'Codeforces 4A', diff: 'Dễ', linkHint: 'Đọc và kiểm tra tính chẵn lẻ', url: 'https://codeforces.com/problemset/problem/4/A' },
          { name: 'A + B Problem (Fast I/O)', oj: 'CSES 1068', diff: 'Dễ', linkHint: 'Xử lý dữ liệu lớn với Fast I/O', url: 'https://cses.fi/problemset/task/1068' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Tối ưu I/O bắt buộc
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    long long a, b;
    if (cin >> a >> b) {
        cout << a + b << "\\n";
    }
    return 0;
}`
    },
    {
      id: '0-2',
      title: 'Biến, Kiểu dữ liệu & Giới hạn tràn số',
      xp: 20,
      subtitle: 'int, long long, double, char, bool và ép kiểu số lớn',
      theory: 'Nắm vững miền giá trị của các kiểu dữ liệu số nguyên và số thực, tránh các lỗi tràn số (overflow) chết người trong CP.',
      theoryDeep: {
        intuition: 'Kiểu int 32-bit chỉ lưu được tối đa khoảng 2×10^9. Các bài toán có kết quả vượt quá 2×10^9 (ví dụ tổng mảng, tích số) phải dùng long long 64-bit (lên đến ~9×10^18).',
        mathInvariant: 'Miền giá trị: int [-2^31, 2^31 - 1]; long long [-2^63, 2^63 - 1]. Khi nhân hai số int, kết quả là int trước khi gán cho long long nên cần ép kiểu (1LL * a * b).',
        steps: [
          'Xác định giá trị tối đa của kết quả bài toán.',
          'Chọn int cho kích thước mảng và biến đếm thông thường.',
          'Chọn long long cho tổng, tích, khoảng cách, chi phí.',
          'Ép kiểu 1LL khi nhân hai số nguyên.'
        ],
        complexity: {
          time: 'O(1)',
          space: 'O(1)'
        },
        pitfalls: [
          'Viết `long long ans = a * b;` với a, b là int: phép nhân vẫn bị tràn int trước khi gán vào ans! Phải viết `(long long)a * b` hoặc `1LL * a * b`.'
        ],
        practiceProblems: [
          { name: 'Multiplication Overflow', oj: 'CSES 1083', diff: 'Dễ', linkHint: 'Phép nhân số lớn dùng long long', url: 'https://cses.fi/problemset/task/1083' },
          { name: 'Elephant (Modulo & Division)', oj: 'Codeforces 617A', diff: 'Dễ', linkHint: 'Tính toán chia làm tròn lên', url: 'https://codeforces.com/problemset/problem/617/A' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int a = 1000000;
    int b = 1000000;
    // Sai: long long c = a * b; // Tràn số!
    // Đúng:
    long long c = 1LL * a * b;
    cout << "Tich khong tran so: " << c << "\\n"; // 1000000000000
    return 0;
}`
    },
    {
      id: '0-3',
      title: 'Cấu trúc điều kiện & Vòng lặp',
      xp: 20,
      subtitle: 'if-else, switch-case, for, while, do-while',
      theory: 'Điều khiển luồng thực thi chương trình, kiểm tra điều kiện lặp và cấu trúc rẽ nhánh tối ưu.',
      theoryDeep: {
        intuition: 'Mọi thuật toán phức tạp đều được xây dựng từ các phép rẽ nhánh logic và vòng lặp. Cần chú ý điều kiện dừng của vòng lặp để tránh loop vô hạn.',
        mathInvariant: 'Bất biến vòng lặp: Một mệnh đề luôn đúng trước và sau mỗi bước lặp của thuật toán.',
        steps: [
          'Dùng if-else lồng nhau hoặc toán tử 3 ngôi (condition ? a : b).',
          'Dùng vòng lặp for khi biết trước số lần lặp, while khi điều kiện dừng phụ thuộc vào trạng thái.'
        ],
        complexity: {
          time: 'Tùy số lần lặp O(N)',
          space: 'O(1)'
        },
        pitfalls: [
          'Dùng vòng lặp while với điều kiện không bao giờ sai gây vòng lặp vô hạn (TLE).'
        ],
        practiceProblems: [
          { name: 'Weird Algorithm (Collatz)', oj: 'CSES 1068', diff: 'Dễ', linkHint: 'Vòng lặp while cho dãy Collatz', url: 'https://cses.fi/problemset/task/1068' },
          { name: 'Bear and Big Brother', oj: 'Codeforces 791A', diff: 'Dễ', linkHint: 'Vòng lặp while so sánh tăng trưởng', url: 'https://codeforces.com/problemset/problem/791/A' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    long long n = 3;
    cout << n;
    while (n > 1) {
        if (n % 2 == 0) n /= 2;
        else n = 3 * n + 1;
        cout << " -> " << n;
    }
    cout << "\\n";
    return 0;
}`
    },
    {
      id: '0-4',
      title: 'Hàm & Truyền tham chiếu (Pass by Reference)',
      xp: 25,
      subtitle: 'void, return type, tham trị vs tham chiếu (&), const reference',
      theory: 'Tổ chức mã nguồn thành các module độc lập, truyền vector/string lớn bằng const reference để tránh sao chép tốn O(N) thời gian.',
      theoryDeep: {
        intuition: 'Khi truyền một vector<int> gồm 10^5 phần tử vào hàm dạng `void solve(vector<int> a)`, C++ sẽ sao chép toàn bộ 10^5 phần tử vào vùng nhớ mới, tốn O(N) thời gian và bộ nhớ. Thêm dấu `&` (`const vector<int>& a`) chỉ truyền con trỏ 8-byte, mất O(1)!',
        mathInvariant: 'Tham chiếu `&` là một bí danh (alias) của biến gốc, không tạo bản sao trong RAM.',
        steps: [
          'Hàm thay đổi giá trị gốc: dùng `T& var`.',
          'Hàm chỉ đọc dữ liệu lớn (vector, string): dùng `const T& var`.',
          'Biến cơ bản nhỏ (int, bool, char): truyền trực tiếp bằng giá trị.'
        ],
        complexity: {
          time: 'O(1) cho truyền tham chiếu',
          space: 'O(1)'
        },
        pitfalls: [
          'Quên dấu & khi truyền mảng động trong hàm đệ quy: gây TLE và MLE ngay lập tức!'
        ],
        practiceProblems: [
          { name: 'Custom Swap & Utils', oj: 'Codeforces 1335A', diff: 'Dễ', linkHint: 'Hàm hoán vị 2 số dùng tham chiếu', url: 'https://codeforces.com/problemset/problem/1335/A' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

// Hoán vị 2 số bằng tham chiếu
void mySwap(int &a, int &b) {
    int tmp = a;
    a = b;
    b = tmp;
}

// Đọc mảng lớn không sao chép bộ nhớ
long long sumArray(const vector<int>& a) {
    long long total = 0;
    for (int x : a) total += x;
    return total;
}

int main() {
    int x = 5, y = 10;
    mySwap(x, y);
    cout << "x=" << x << ", y=" << y << "\\n"; // x=10, y=5
    return 0;
}`
    },
    {
      id: '0-5',
      title: 'Mảng 1D & 2D cơ bản',
      xp: 25,
      subtitle: 'Static array, vector, ma trận lưới 2 chiều, tràn chỉ số',
      theory: 'Quản lý dãy phần tử liên tục, thao tác trên ma trận và bảng dữ liệu 2 chiều trong các bài toán đồ thị lưới.',
      theoryDeep: {
        intuition: 'Mảng là cấu trúc dữ liệu nền tảng lưu các phần tử liên tiếp trong bộ nhớ. Với mảng 2 chiều, hàng và cột thường được dùng để duyệt các hướng di chuyển trên lưới ô vuông (dx/dy array).',
        mathInvariant: 'Địa chỉ của ô A[i][j] trong mảng liên tục là: Base + (i * COLS + j) * sizeof(T).',
        steps: [
          'Khai báo mảng toàn cục khi kích thước N ≥ 10^5 để tránh tràn stack.',
          'Dùng mảng hướng di chuyển `const int dx[] = {-1, 1, 0, 0};` và `dy[] = {0, 0, -1, 1};`.',
          'Luôn kiểm tra giới hạn chỉ số: `0 <= x && x < n && 0 <= y && y < m`.'
        ],
        complexity: {
          time: 'Truy cập O(1)',
          space: 'O(N) hoặc O(N * M)'
        },
        pitfalls: [
          'Khai báo mảng cục bộ `int a[1000000];` bên trong main() gây lỗi Crash (Stack Overflow).',
          'Tràn chỉ số biên âm `a[-1]` hoặc `a[n]`.'
        ],
        practiceProblems: [
          { name: 'Counting Rooms (Lưới 2D)', oj: 'CSES 1192', diff: 'Dễ', linkHint: 'Duyệt ma trận 2D với mảng dx, dy', url: 'https://cses.fi/problemset/task/1192' },
          { name: 'Grid Paths & Traversal', oj: 'CSES 1625', diff: 'Trung bình', linkHint: 'Duyệt lưới ô vuông 2D cơ bản', url: 'https://cses.fi/problemset/task/1625' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

// 4 hướng di chuyển: Lên, Xuống, Trái, Phải
const int dx[] = {-1, 1, 0, 0};
const int dy[] = {0, 0, -1, 1};

int main() {
    int n = 3, m = 3;
    vector<vector<int>> grid(n, vector<int>(m, 0));
    int val = 1;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            grid[i][j] = val++;

    cout << "Ma tran 3x3:\\n";
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) cout << grid[i][j] << " ";
        cout << "\\n";
    }
    return 0;
}`
    }
  ]
};
