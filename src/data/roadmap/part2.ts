import { RoadmapModule } from '../../types';

export const PART_2: RoadmapModule = {
  key: 'part-2',
  title: 'Phần 2 (Xâu ký tự) · String Algorithms',
  icon: '🔤',
  description: 'std::string chuyên sâu, String Hashing đa tầng chống va chạm, Thuật toán KMP (mảng pi), Z-Algorithm và Thuật toán Manacher.',
  lessons: [
    {
      id: '2-1',
      title: 'std::string & Kỹ thuật xử lý xâu cơ bản',
      xp: 25,
      subtitle: 'Thao tác ghép xâu, substr, find, chuyển đổi số to_string / stoi',
      theory: 'Nắm vững các phương thức tối ưu của std::string trong C++20, tránh sao chép xâu tốn O(N) khi gọi hàm.',
      theoryDeep: {
        intuition: 'std::string trong C++ quản lý bộ nhớ động. Các phép nối xâu `s += c` tốn O(1) khấu hao, nhưng `s = s + c` tạo bản sao mới tốn O(N).',
        mathInvariant: 'Truy cập s[i] trong O(1). Phép gán và tạo xâu con s.substr(pos, len) tốn O(len).',
        steps: [
          'Dùng `s += c` hoặc `s.push_back(c)` thay vì `s = s + c`.',
          'Truyền string vào hàm dưới dạng `const string& s`.',
          'Dùng `std::string_view` trong C++17/20 khi chỉ đọc chuỗi con không tốn bộ nhớ.'
        ],
        complexity: {
          time: 'Nối xâu O(1) amortized, substr O(K)',
          space: 'O(N)'
        },
        pitfalls: [
          'Viết `s = s + c` trong vòng lặp 10^5 lần sẽ biến độ phức tạp thành O(N^2) gây TLE!'
        ],
        practiceProblems: [
          { name: 'Word Capitalization', oj: 'Codeforces 281A', diff: 'Dễ', linkHint: 'Biến đổi xâu ký tự cơ bản', url: 'https://codeforces.com/problemset/problem/281/A' },
          { name: 'String Task', oj: 'Codeforces 118A', diff: 'Dễ', linkHint: 'Xóa nguyên âm và chèn dấu chấm', url: 'https://codeforces.com/problemset/problem/118/A' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string s = "vietnam";
    s += "_pro";
    cout << s << "\\n"; // vietnam_pro
    cout << s.substr(0, 7) << "\\n"; // vietnam
    return 0;
}`
    },
    {
      id: '2-2',
      title: 'String Hashing (Băm đa tầng chống va chạm)',
      xp: 40,
      subtitle: 'Double Hashing với cơ số nguyên tố và modulo 10⁹+7, 10⁹+9',
      theory: 'Kỹ thuật Rolling Hash biểu diễn mỗi xâu con dưới dạng số nguyên, cho phép so sánh hai xâu con bất kỳ trong O(1) sau tiền xử lý O(N).',
      theoryDeep: {
        intuition: 'Theo nguyên lý ngày sinh (Birthday Paradox), dùng 1 modulo 10^9+7 sẽ bị trùng mã băm sau khoảng sqrt(10^9) = 30,000 lần so sánh. Bắt buộc dùng Double Hashing với 2 cặp (Base, Modulo) khác nhau để xác suất va chạm là 1 / (10^18) ≈ 0.',
        mathInvariant: 'Hash(L, R) = (H[R] - H[L - 1] * Base^(R - L + 1)) mod Modulo.',
        steps: [
          'Tiền tính mảng luỹ thừa Base^i và mã băm tiền tố H[i].',
          'Hàm getHash(L, R) trả về cặp pair<long long, long long> trong O(1).',
          'Xử lý số âm khi trừ: `(val % MOD + MOD) % MOD`.'
        ],
        complexity: {
          time: 'Tiền xử lý O(N), mỗi truy vấn so sánh O(1)',
          space: 'O(N)'
        },
        pitfalls: [
          'Chỉ dùng 1 modulo đơn lẻ sẽ bị đối thủ Hack trên Codeforces hoặc dính test bẫy ở các kỳ thi lớn.'
        ],
        practiceProblems: [
          { name: 'String Matching (Hash)', oj: 'CSES 1753', diff: 'Trung bình', linkHint: 'Đếm số lần xuất hiện xâu mẫu bằng Double Hash', url: 'https://cses.fi/problemset/task/1753' },
          { name: 'Wavio / Password Substring', oj: 'Codeforces 126B', diff: 'Khó', linkHint: 'Tìm tiền tố cũng là hậu tố và ở giữa', url: 'https://codeforces.com/problemset/problem/126/B' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

struct DoubleHash {
    const long long M1 = 1e9 + 7, M2 = 1e9 + 9;
    const long long B1 = 311, B2 = 317;
    vector<long long> h1, h2, p1, p2;

    DoubleHash(const string& s) {
        int n = s.size();
        h1.assign(n + 1, 0); h2.assign(n + 1, 0);
        p1.assign(n + 1, 1); p2.assign(n + 1, 1);
        for (int i = 0; i < n; i++) {
            h1[i + 1] = (h1[i] * B1 + s[i]) % M1;
            h2[i + 1] = (h2[i] * B2 + s[i]) % M2;
            p1[i + 1] = (p1[i] * B1) % M1;
            p2[i + 1] = (p2[i] * B2) % M2;
        }
    }

    pair<long long, long long> get(int l, int r) {
        long long v1 = (h1[r + 1] - h1[l] * p1[r - l + 1]) % M1;
        if (v1 < 0) v1 += M1;
        long long v2 = (h2[r + 1] - h2[l] * p2[r - l + 1]) % M2;
        if (v2 < 0) v2 += M2;
        return {v1, v2};
    }
};

int main() {
    string s = "abcabc";
    DoubleHash dh(s);
    cout << "Doan [0..2] ('abc') giong [3..5] ('abc')? " 
         << (dh.get(0, 2) == dh.get(3, 5) ? "Dung" : "Sai") << "\\n";
    return 0;
}`
    },
    {
      id: '2-3',
      title: 'Thuật toán KMP & Xây dựng mảng pi (LPS)',
      xp: 45,
      subtitle: 'Knuth-Morris-Pratt tìm kiếm mẫu trong văn bản trong O(N + M)',
      theory: 'KMP tính mảng pi (tiền tố dài nhất cũng là hậu tố) để nhảy con trỏ mẫu khi không khớp mà không bao giờ quay lui trên văn bản.',
      theoryDeep: {
        intuition: 'Khi không khớp ở vị trí j trên xâu mẫu, các ký tự trước đó đã khớp. Mảng pi[j - 1] cho biết tiền tố dài nhất có thể tiếp tục thử khớp mà không cần xét lại văn bản từ đầu.',
        mathInvariant: 'Con trỏ i trên văn bản chỉ tăng nghiêm ngặt từ 0 đến N - 1 -> Tuyến tính tuyệt đối O(N + M).',
        steps: [
          'Tính mảng pi (LPS) của xâu mẫu P trong O(M).',
          'Duyệt con trỏ i trên T và j trên P.',
          'Khi khớp đủ M ký tự: ghi nhận vị trí xuất hiện và nhảy `j = pi[j - 1]`.'
        ],
        complexity: {
          time: 'O(N + M) thời gian thực thi nghiêm ngặt',
          space: 'O(M) cho mảng pi'
        },
        pitfalls: [
          'Quên gán `j = pi[j - 1]` sau khi tìm thấy 1 lần khớp khiến vòng lặp sau đó bị sai chỉ số.'
        ],
        practiceProblems: [
          { name: 'Finding Borders', oj: 'CSES 1732', diff: 'Trung bình', linkHint: 'Mảng pi của KMP', url: 'https://cses.fi/problemset/task/1732' },
          { name: 'Password (KMP)', oj: 'Codeforces 126B', diff: 'Nâng cao', linkHint: 'Ứng dụng LPS tìm xâu con lớn nhất', url: 'https://codeforces.com/problemset/problem/126/B' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

vector<int> buildPi(const string& p) {
    int m = p.size();
    vector<int> pi(m, 0);
    for (int i = 1, j = 0; i < m; i++) {
        while (j > 0 && p[i] != p[j]) j = pi[j - 1];
        if (p[i] == p[j]) j++;
        pi[i] = j;
    }
    return pi;
}

int main() {
    string p = "ABABCABAB";
    auto pi = buildPi(p);
    cout << "Mang pi cua " << p << ":\\n";
    for (int x : pi) cout << x << " ";
    cout << "\\n";
    return 0;
}`
    },
    {
      id: '2-4',
      title: 'Z-Algorithm (Thuật toán Z)',
      xp: 40,
      subtitle: 'Mảng Z[i] = độ dài tiền tố chung dài nhất giữa S và S[i..N-1]',
      theory: 'Thuật toán Z tính tiền tố chung dài nhất giữa chuỗi ban đầu và mọi hậu tố bắt đầu từ i trong O(N).',
      theoryDeep: {
        intuition: 'Duy trì đoạn [L, R] là đoạn khớp xa nhất sang phải đã từng tìm thấy. Khi tính Z[i], nếu i <= R, ta có thể tận dụng giá trị Z[i - L] đã tính trước đó để bỏ qua nhiều phép so sánh trùng lặp.',
        mathInvariant: 'Đoạn [L, R] luôn thỏa mãn S[L..R] == S[0..R - L].',
        steps: [
          'Ghép xâu: S = Pattern + "$" + Text.',
          'Duyệt tính mảng Z trong O(N).',
          'Mỗi vị trí i có Z[i] == Pattern.length() tương ứng với một lần xuất hiện.'
        ],
        complexity: {
          time: 'O(N) tuyến tính',
          space: 'O(N)'
        },
        pitfalls: [
          'Ký tự phân cách "$" phải là ký tự không bao giờ xuất hiện trong cả Pattern và Text.'
        ],
        practiceProblems: [
          { name: 'String Matching with Z', oj: 'CSES 1753', diff: 'Trung bình', linkHint: 'Z-algorithm tìm kiếm mẫu', url: 'https://cses.fi/problemset/task/1753' },
          { name: 'Prefix-Suffix Palindrome', oj: 'Codeforces 1326D2', diff: 'Khó', linkHint: 'Z-algorithm tìm tiền tố đối xứng', url: 'https://codeforces.com/problemset/problem/1326/D2' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

vector<int> zAlgorithm(const string& s) {
    int n = s.size();
    vector<int> z(n, 0);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i <= r) z[i] = min(r - i + 1, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] - 1 > r) {
            l = i;
            r = i + z[i] - 1;
        }
    }
    return z;
}

int main() {
    string s = "aabzaa";
    auto z = zAlgorithm(s);
    for (int x : z) cout << x << " "; // 0 1 0 0 2 1
    cout << "\\n";
    return 0;
}`
    },
    {
      id: '2-5',
      title: 'Thuật toán Manacher (Palindrome O(N))',
      xp: 45,
      subtitle: 'Tìm xâu con đối xứng dài nhất trong thời gian tuyến tính O(N)',
      theory: 'Thuật toán Manacher tìm độ dài xâu đối xứng dài nhất tại mọi tâm đối xứng trong O(N), vượt trội hoàn toàn so với O(N²) mở rộng tâm.',
      theoryDeep: {
        intuition: 'Bằng cách chèn ký tự đặc biệt `#` giữa các ký tự (ví dụ "aba" -> "#a#b#a#"), ta biến mọi palindrome chẵn lẻ thành palindrome lẻ. Tương tự Z-algorithm, tính đối xứng qua tâm giúp tái sử dụng bán kính đối xứng của nửa trái sang nửa phải trong O(1).',
        mathInvariant: 'Tâm đối xứng C và biên phải R = C + P[C]. Nếu i < R, P[i] >= min(R - i, P[2 * C - i]).',
        steps: [
          'Biến đổi xâu S thành T có dạng `^#a#b#c#$`.',
          'Duyệt tính mảng bán kính P[i].',
          'Độ dài palindrome gốc dài nhất = max(P[i]).'
        ],
        complexity: {
          time: 'O(N) tuyến tính',
          space: 'O(N)'
        },
        pitfalls: [
          'Chỉ số trong xâu biến đổi gấp đôi xâu ban đầu, cần quy đổi lại chỉ số gốc cẩn thận khi in xâu con.'
        ],
        practiceProblems: [
          { name: 'Longest Palindrome Substring', oj: 'CSES 1111', diff: 'Nâng cao', linkHint: 'Thuật toán Manacher O(N)', url: 'https://cses.fi/problemset/task/1111' },
          { name: 'Palindromic Characteristics', oj: 'Codeforces 835D', diff: 'HSGQG', linkHint: 'Manacher kết hợp DP', url: 'https://codeforces.com/problemset/problem/835/D' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

int longestPalindrome(const string& s) {
    string t = "^";
    for (char c : s) { t += "#"; t += c; }
    t += "#$";

    int n = t.size();
    vector<int> p(n, 0);
    int c = 0, r = 0, maxLen = 0;

    for (int i = 1; i < n - 1; i++) {
        int i_mirror = 2 * c - i;
        if (r > i) p[i] = min(r - i, p[i_mirror]);
        while (t[i + 1 + p[i]] == t[i - 1 - p[i]]) p[i]++;
        if (i + p[i] > r) { c = i; r = i + p[i]; }
        maxLen = max(maxLen, p[i]);
    }
    return maxLen;
}

int main() {
    string s = "abacaba";
    cout << "Do dai xau doi xung dai nhat: " << longestPalindrome(s) << "\\n"; // 7
    return 0;
}`
    }
  ]
};
