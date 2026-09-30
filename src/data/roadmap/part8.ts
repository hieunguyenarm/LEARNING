import { RoadmapModule } from '../../types';

export const PART_8: RoadmapModule = {
  key: 'part-8',
  title: 'Phần 8 (Hình học & Số học) · Geometry & Number Theory',
  icon: '📐',
  description: 'Segmented Sieve, Extended Euclidean, Modular Inverse, Matrix Exponentiation, Vector Geometry và Convex Hull (Graham Scan).',
  lessons: [
    {
      id: '8-1',
      title: 'Sàng phân đoạn (Segmented Sieve)',
      xp: 45,
      subtitle: 'Tìm và đếm số nguyên tố trong đoạn [L, R] với R ≤ 10¹² và R - L ≤ 10⁶',
      theory: 'Kỹ thuật chia nhỏ khoảng sàng nguyên tố: chỉ cần sàng trước các số nguyên tố nhỏ hơn hoặc bằng √R, sau đó dùng chúng để đánh dấu hợp số trên đoạn [L, R].',
      theoryDeep: {
        intuition: 'Nếu R lên đến 10^12, ta không thể cấp phát mảng 10^12 boolean. Tuy nhiên, mọi hợp số x <= R đều phải có ít nhất một ước nguyên tố p <= √R (<= 10^6). Ta chỉ cần sàng nguyên tố cơ bản đến 10^6, rồi ánh xạ đoạn [L, R] về mảng kích thước R - L + 1 để gạch bỏ các bội số.',
        mathInvariant: 'Một số n trong [L, R] là hợp số khi và chỉ khi tồn tại p <= √R sao cho p | n.',
        steps: [
          'Dùng sàng Eratosthenes chuẩn tìm mọi số nguyên tố p <= √R.',
          'Khởi tạo mảng boolean `isPrime[R - L + 1]` gán toàn bộ là true.',
          'Với mỗi số nguyên tố p: tìm bội số nhỏ nhất của p trong [L, R]: `start = max(p * p, ((L + p - 1) / p) * p)`.',
          'Đánh dấu `isPrime[x - L] = false` cho mọi bội số `x = start, start + p, ... <= R`.',
          'Đặc biệt nếu L = 1, đánh dấu `isPrime[0] = false` (1 không là số nguyên tố).'
        ],
        complexity: {
          time: 'O(√R log log √R + (R - L + 1) log log √R)',
          space: 'O(√R + (R - L + 1)) - chỉ khoảng vài megabytes'
        },
        pitfalls: [
          'Tràn số khi tính `p * p`: với p = 10^6 thì p * p = 10^12, nếu để kiểu int sẽ tràn số âm! Bắt buộc dùng `1LL * p * p`.',
          'Bội số đầu tiên bị gạch bỏ có thể chính là p (ví dụ p = 3, L = 2 thì bội là 3), không được gạch bỏ chính số nguyên tố p.'
        ],
        practiceProblems: [
          { name: 'Prime Generator', oj: 'SPOJ - PRIME1', diff: 'Trung bình', linkHint: 'Sàng phân đoạn cơ bản' },
          { name: 'Counting Primes in Range', oj: 'Codeforces', diff: 'Trung bình', linkHint: 'Sàng [L, R] với R <= 10^12' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

// Sang phan doan [L, R]
vector<long long> segmentedSieve(long long L, long long R) {
    long long lim = sqrt(R);
    vector<bool> mark(lim + 1, false);
    vector<long long> primes;

    for (long long i = 2; i <= lim; i++) {
        if (!mark[i]) {
            primes.push_back(i);
            for (long long j = i * i; j <= lim; j += i) mark[j] = true;
        }
    }

    vector<bool> isPrime(R - L + 1, true);
    for (long long p : primes) {
        long long start = max(p * p, ((L + p - 1) / p) * p);
        for (long long j = start; j <= R; j += p) {
            isPrime[j - L] = false;
        }
    }

    if (L == 1) isPrime[0] = false;

    vector<long long> res;
    for (long long i = L; i <= R; i++) {
        if (isPrime[i - L]) res.push_back(i);
    }
    return res;
}

int main() {
    long long L = 100, R = 150;
    auto primes = segmentedSieve(L, R);
    cout << "So nguyen to trong [" << L << ", " << R << "]:\\n";
    for (long long p : primes) cout << p << " ";
    cout << "\\n";
    return 0;
}`
    },
    {
      id: '8-2',
      title: 'Thuật toán Euclid mở rộng (Extended Euclidean)',
      xp: 45,
      subtitle: 'Tìm nghiệm nguyên (x, y) của phương trình Diophantine ax + by = gcd(a, b)',
      theory: 'Định lý Bézout khẳng định luôn tồn tại các số nguyên x, y sao cho a*x + b*y = gcd(a, b). Thuật toán Euclid mở rộng tìm cặp nghiệm này trong O(log(min(a, b))).',
      theoryDeep: {
        intuition: 'Khi tính gcd(a, b) = gcd(b, a % b), ta biểu diễn ngược lại: nếu đã tìm được x1, y1 thỏa b*x1 + (a % b)*y1 = g, vì a % b = a - ⌊a/b⌋ * b, thay vào ta được a*(y1) + b*(x1 - ⌊a/b⌋ * y1) = g. Đây chính là bước truy hồi nghiệm.',
        mathInvariant: 'Bất biến Bézout: Tại mọi tầng đệ quy, luôn duy trì đẳng thức a*x + b*y = gcd(a, b).',
        steps: [
          'Điều kiện dừng: nếu b == 0, gcd = a, x = 1, y = 0.',
          'Gọi đệ quy `extGCD(b, a % b, x1, y1)`.',
          'Cập nhật: `x = y1` và `y = x1 - (a / b) * y1`.'
        ],
        complexity: {
          time: 'O(log(min(a, b)))',
          space: 'O(log(min(a, b))) ngăn xếp'
        },
        pitfalls: [
          'Phương trình tổng quát `ax + by = c` chỉ có nghiệm khi và chỉ khi `c % gcd(a, b) == 0`.'
        ],
        practiceProblems: [
          { name: 'Common Divisors', oj: 'CSES', diff: 'Dễ', linkHint: 'GCD cơ bản' },
          { name: 'Linear Diophantine Equations', oj: 'Codeforces', diff: 'Trung bình', linkHint: 'Tìm nghiệm nguyên dương của ax + by = c' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

// Giai ax + by = gcd(a, b)
long long extGCD(long long a, long long b, long long &x, long long &y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }
    long long x1, y1;
    long long d = extGCD(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return d;
}

int main() {
    long long a = 35, b = 15, x, y;
    long long g = extGCD(a, b, x, y);
    cout << "gcd(" << a << ", " << b << ") = " << g << "\\n"; // 5
    cout << a << "*(" << x << ") + " << b << "*(" << y << ") = " << g << "\\n"; // 35*(1) + 15*(-2) = 5
    return 0;
}`
    },
    {
      id: '8-3',
      title: 'Nghịch đảo Modular (Modular Inverse)',
      xp: 45,
      subtitle: 'Thực hiện phép chia theo modulo: (A / B) mod M = A * B⁻¹ mod M',
      theory: 'Tìm số nguyên x sao cho (B * x) ≡ 1 (mod M). Tồn tại nghịch đảo khi và chỉ khi gcd(B, M) = 1. Tính bằng Fermat nhỏ (khi M nguyên tố) hoặc Euclid mở rộng.',
      theoryDeep: {
        intuition: 'Phép chia không có tính chất đóng trên vành số nguyên modulo: `(a / b) % m != (a % m) / (b % m)`. Để chia cho b, ta nhân với phần tử nghịch đảo b^(-1). Theo định lý Fermat nhỏ: nếu M là số nguyên tố thì b^(M-1) ≡ 1 (mod M), suy ra b * b^(M-2) ≡ 1 (mod M). Vậy nghịch đảo chính là b^(M-2) mod M!',
        mathInvariant: '`B * inv(B) ≡ 1 (mod M)`. Tính bằng lũy thừa nhanh `power(B, M - 2, M)`.',
        steps: [
          'Trường hợp M là số nguyên tố (thường là 10^9 + 7 hoặc 998244353): Dùng lũy thừa nhanh tính `power(b, M - 2, M)`.',
          'Trường hợp M bất kỳ: Dùng Euclid mở rộng giải phương trình `b * x + M * y = 1`, sau đó lấy `x = (x % M + M) % M`.',
          'Tiền tính nghịch đảo giai thừa từ N lùi về 0 trong O(N) để tính tổ hợp C(n, k).'
        ],
        complexity: {
          time: 'O(log M) cho 1 phép tính; O(N) tiền tính toàn bộ dãy nghịch đảo',
          space: 'O(N) nếu lưu bảng giai thừa'
        },
        pitfalls: [
          'Áp dụng công thức Fermat nhỏ `b^(M - 2)` khi M không phải là số nguyên tố: kết quả sẽ hoàn toàn sai!',
          'Chia cho số là bội của M: không tồn tại nghịch đảo modulo.'
        ],
        practiceProblems: [
          { name: 'Binomial Coefficients', oj: 'CSES', diff: 'Trung bình', linkHint: 'Tính C(n, k) mod 10^9+7 bằng nghịch đảo giai thừa' },
          { name: 'Creating Strings II', oj: 'CSES', diff: 'Trung bình', linkHint: 'Hoán vị lặp với nghịch đảo modulo' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

const long long MOD = 1e9 + 7;

long long power(long long a, long long b, long long m = MOD) {
    long long res = 1;
    a %= m;
    while (b > 0) {
        if (b & 1) res = (res * a) % m;
        a = (a * a) % m;
        b >>= 1;
    }
    return res;
}

// Nghich dao modulo theo Fermat nho
long long modInverse(long long n, long long m = MOD) {
    return power(n, m - 2, m);
}

int main() {
    long long a = 14, b = 2; // (14 / 2) mod MOD = 7
    long long invB = modInverse(b, MOD);
    long long ans = (a % MOD * invB) % MOD;
    cout << "(14 / 2) mod " << MOD << " = " << ans << "\\n"; // 7
    return 0;
}`
    },
    {
      id: '8-4',
      title: 'Nhân ma trận & Lũy thừa ma trận (Matrix Exponentiation)',
      xp: 50,
      subtitle: 'Tìm số Fibonacci thứ 10¹⁸ và đếm đường đi độ dài K trên đồ thị trong O(K³ log N)',
      theory: 'Kỹ thuật biểu diễn hệ thức truy hồi tuyến tính dưới dạng phương trình ma trận v_{n+1} = M * v_n, sau đó dùng lũy thừa nhị phân tính M^N trong O(log N).',
      theoryDeep: {
        intuition: 'Dãy Fibonacci: F(n+1) = F(n) + F(n-1). Ta xây dựng vector trạng thái [F(n+1), F(n)]^T = [[1, 1], [1, 0]] * [F(n), F(n-1)]^T. Nhân ma trận lặp lại N lần đưa bài toán về tính ma trận [[1, 1], [1, 0]]^N trong O(2^3 * log N) ≈ 200 phép tính!',
        mathInvariant: 'Ma trận kề A của đồ thị: phần tử (A^k)[u][v] chính là số lượng đường đi độ dài đúng k từ đỉnh u đến v.',
        steps: [
          'Định nghĩa cấu trúc ma trận kích thước K x K và toán tử nhân ma trận modulo M trong O(K^3).',
          'Viết hàm lũy thừa ma trận nhị phân `power(Matrix A, long long b)`.',
          'Nhân ma trận lũy thừa với vector trạng thái ban đầu để nhận đáp án.'
        ],
        complexity: {
          time: 'O(K^3 * log N) với K là số lượng biến truy hồi',
          space: 'O(K^2)'
        },
        pitfalls: [
          'Không khởi tạo ma trận đơn vị (Identity Matrix - đường chéo chính bằng 1, các ô khác bằng 0) khi bắt đầu tính lũy thừa.'
        ],
        practiceProblems: [
          { name: 'Fibonacci Numbers', oj: 'CSES', diff: 'Trung bình', linkHint: 'Lũy thừa ma trận 2x2 tính F(10^18)' },
          { name: 'Graph Paths I', oj: 'CSES', diff: 'Nâng cao', linkHint: 'Lũy thừa ma trận kề đếm số đường đi độ dài K' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

const long long MOD = 1e9 + 7;

typedef vector<vector<long long>> Matrix;

Matrix multiply(const Matrix& a, const Matrix& b, int k) {
    Matrix c(k, vector<long long>(k, 0));
    for (int i = 0; i < k; i++) {
        for (int m = 0; m < k; m++) {
            if (a[i][m] == 0) continue;
            for (int j = 0; j < k; j++) {
                c[i][j] = (c[i][j] + a[i][m] * b[m][j]) % MOD;
            }
        }
    }
    return c;
}

Matrix powerMatrix(Matrix a, long long p, int k) {
    Matrix res(k, vector<long long>(k, 0));
    for (int i = 0; i < k; i++) res[i][i] = 1; // Ma tran don vi

    while (p > 0) {
        if (p & 1) res = multiply(res, a, k);
        a = multiply(a, a, k);
        p >>= 1;
    }
    return res;
}

int main() {
    long long n = 10; // Tinh F(10)
    Matrix T = {{1, 1}, {1, 0}};
    Matrix Tn = powerMatrix(T, n - 1, 2);
    // [F(n), F(n-1)]^T = Tn * [F(1), F(0)]^T (F(1)=1, F(0)=0)
    long long fn = Tn[0][0]; // 55
    cout << "So Fibonacci thu " << n << ": " << fn << "\\n";
    return 0;
}`
    },
    {
      id: '8-5',
      title: 'Hình học Vector 2D (Cross & Dot Product)',
      xp: 45,
      subtitle: 'Tích có hướng, diện tích đa giác, kiểm tra rẽ trái/phải và điểm thuộc đoạn thẳng',
      theory: 'Kỹ thuật biểu diễn tọa độ bằng Point / Vector 2D và sử dụng Cross Product (Tích có hướng) để xác định vị trí tương đối giữa điểm và đường thẳng mà không cần tính góc số thực.',
      theoryDeep: {
        intuition: 'Tích có hướng của 2 vector AB và AC: cross = AB.x * AC.y - AB.y * AC.x. Nếu cross > 0: điểm C nằm bên trái tia AB (rẽ trái theo chiều ngược kim đồng hồ CCW). Nếu cross < 0: rẽ phải. Nếu cross == 0: 3 điểm thẳng hàng. Diện tích đa giác n đỉnh tính bằng công thức Shoelace (dây giày).',
        mathInvariant: 'Diện tích tam giác có hướng: S = 1/2 * (AB × AC). Điểm P thuộc đoạn AB khi cross(AB, AP) == 0 và dot(PA, PB) <= 0.',
        steps: [
          'Xây dựng struct `Point { long long x, y; }`.',
          'Viết hàm tính tích có hướng `cross(Point a, Point b, Point c) = (b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x)`.',
          'Áp dụng giải các bài toán: Xác định 2 đoạn thẳng có cắt nhau không, tính diện tích đa giác lồi/lõm.'
        ],
        complexity: {
          time: 'O(1) cho mỗi phép kiểm tra; O(N) cho diện tích đa giác',
          space: 'O(1)'
        },
        pitfalls: [
          'Dùng hàm atan2 hoặc góc số thực double: dễ bị sai số dấu phẩy động! Luôn ưu tiên dùng phép nhân số nguyên trên Vector.'
        ],
        practiceProblems: [
          { name: 'Point Location Test', oj: 'CSES', diff: 'Dễ', linkHint: 'Kiểm tra điểm nằm bên trái, phải hay trên đường thẳng' },
          { name: 'Polygon Area', oj: 'CSES', diff: 'Trung bình', linkHint: 'Tính 2 lần diện tích đa giác bằng Cross Product' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

struct Point {
    long long x, y;
};

// Tich co huong cua vector AB va AC: (B - A) x (C - A)
long long crossProduct(Point a, Point b, Point c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

int main() {
    Point a = {0, 0}, b = {4, 0}, c1 = {2, 3}, c2 = {2, -3};

    long long cp1 = crossProduct(a, b, c1);
    if (cp1 > 0) cout << "C1 nam ben TRAI duong thang AB (Re trai CCW)\\n";
    else if (cp1 < 0) cout << "C1 nam ben PHAI duong thang AB (Re phai CW)\\n";

    long long cp2 = crossProduct(a, b, c2);
    if (cp2 < 0) cout << "C2 nam ben PHAI duong thang AB (Re phai CW)\\n";

    return 0;
}`
    },
    {
      id: '8-6',
      title: 'Bao lồi hình học (Convex Hull - Graham Scan)',
      xp: 55,
      subtitle: 'Tìm đa giác lồi nhỏ nhất bao bọc toàn bộ tập N điểm trong O(N log N)',
      theory: 'Thuật toán Monotone Chain (biến thể chuẩn hóa của Graham Scan) sắp xếp các điểm theo tọa độ x rồi dựng nửa bao lồi dưới (Lower Hull) và nửa bao lồi trên (Upper Hull).',
      theoryDeep: {
        intuition: 'Hãy hình dung các điểm như những chiếc đinh đóng trên mặt phẳng và ta căng một sợi dây chun bao bọc xung quanh chúng. Khi thả tay, dây chun sẽ co lại tạo thành Bao lồi. Bằng cách dùng ngăn xếp kiểm tra xem 3 điểm liên tiếp có tạo thành góc rẽ trái (CCW) hay không, ta loại bỏ mọi điểm bị thụt vào bên trong.',
        mathInvariant: 'Mọi góc tại các đỉnh liên tiếp của Bao lồi đều phải là góc rẽ trái nghiêm ngặt (hoặc rẽ phải tùy hướng duyệt).',
        steps: [
          'Sắp xếp N điểm theo hoành độ x tăng dần, nếu bằng x thì theo y tăng dần.',
          'Dựng nửa bao dưới (Lower Hull): Duyệt từng điểm, nếu 2 điểm cuối trong ngăn xếp và điểm mới tạo góc rẽ phải (`cross <= 0`), pop điểm cuối khỏi ngăn xếp.',
          'Dựng nửa bao trên (Upper Hull): Duyệt ngược lại từ N - 1 về 0 tương tự.',
          'Ghép hai nửa bao lồi lại thành đa giác khép kín.'
        ],
        complexity: {
          time: 'O(N log N) cho sắp xếp + O(N) duyệt ngăn xếp',
          space: 'O(N)'
        },
        pitfalls: [
          'Các điểm thẳng hàng (Collinear Points): cần đọc kỹ đề bài xem có tính các điểm nằm trên cạnh của bao lồi hay chỉ tính các điểm cực trị ở góc.'
        ],
        practiceProblems: [
          { name: 'Convex Hull', oj: 'CSES', diff: 'Trung bình', linkHint: 'Dựng bao lồi và in ra tọa độ các đỉnh' },
          { name: 'Minimum Perimeter Polygon', oj: 'Codeforces', diff: 'Nâng cao', linkHint: 'Bao lồi kết hợp tính chu vi nhỏ nhất' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

struct Point {
    long long x, y;
    bool operator<(const Point& p) const {
        return x < p.x || (x == p.x && y < p.y);
    }
};

long long cross(Point a, Point b, Point c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

vector<Point> convexHull(vector<Point>& pts) {
    int n = pts.size(), k = 0;
    if (n <= 2) return pts;
    vector<Point> h(2 * n);

    sort(pts.begin(), pts.end());

    // Nua bao duoi
    for (int i = 0; i < n; i++) {
        while (k >= 2 && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--;
        h[k++] = pts[i];
    }

    // Nua bao tren
    for (int i = n - 2, t = k + 1; i >= 0; i--) {
        while (k >= t && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--;
        h[k++] = pts[i];
    }

    h.resize(k - 1);
    return h;
}

int main() {
    vector<Point> pts = {{0, 3}, {2, 2}, {1, 1}, {2, 1}, {3, 0}, {0, 0}, {3, 3}};
    auto hull = convexHull(pts);

    cout << "Cac dinh cua Bao loi (" << hull.size() << " dinh):\\n";
    for (auto p : hull) {
        cout << "(" << p.x << ", " << p.y << ")\\n";
    }
    return 0;
}`
    }
  ]
};
