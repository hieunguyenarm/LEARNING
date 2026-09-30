import { RoadmapModule } from '../../types';

export const PART_3: RoadmapModule = {
  key: 'part-3',
  title: 'Phần 3 (Sắp xếp & Tìm kiếm) · Sorting & Searching',
  icon: '🔍',
  description: 'So sánh các thuật toán sắp xếp, std::sort Introsort, Binary Search on Answer và Ternary Search tìm cực trị hàm lồi/lõm.',
  lessons: [
    {
      id: '3-1',
      title: 'So sánh các thuật toán sắp xếp & Custom Comparator',
      xp: 30,
      subtitle: 'Merge Sort, Quick Sort, Introsort std::sort, Strict Weak Ordering',
      theory: 'std::sort trong C++ dùng Introsort (kết hợp Quicksort, Heapsort và Insertion Sort) đảm bảo O(N log N) trong mọi trường hợp xấu nhất.',
      theoryDeep: {
        intuition: 'Quicksort có thể suy biến thành O(N^2) nếu chọn pivot xấu. Introsort tự động chuyển sang Heapsort nếu độ sâu đệ quy vượt quá 2 * log(N), do đó luôn an toàn tuyệt đối.',
        mathInvariant: 'Hàm so sánh `cmp(a, b)` phải thỏa mãn Strict Weak Ordering: `cmp(a, a) == false` (không được trả về true khi a == b).',
        steps: [
          'Dùng `std::sort(a.begin(), a.end())` cho mảng hoặc vector.',
          'Viết lambda hoặc hàm `bool cmp(const T& a, const T& b)` khi sắp xếp struct nhiều trường.',
          'Dùng `std::stable_sort` khi cần bảo toàn thứ tự ban đầu của các phần tử bằng nhau.'
        ],
        complexity: {
          time: 'O(N log N)',
          space: 'O(log N) cho ngăn xếp'
        },
        pitfalls: [
          'Viết `return a <= b;` trong hàm cmp: vi phạm Strict Weak Ordering, gây tràn bộ nhớ hoặc crash chương trình (Segmentation Fault)!'
        ],
        practiceProblems: [
          { name: 'Movie Festival', oj: 'CSES', diff: 'Dễ', linkHint: 'Sắp xếp đoạn theo thời điểm kết thúc' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

struct Item {
    int id;
    int score;
    int time;
};

// Điểm cao hơn đứng trước; nếu bằng điểm thì thời gian ít hơn đứng trước
bool cmp(const Item& a, const Item& b) {
    if (a.score != b.score) return a.score > b.score;
    return a.time < b.time;
}

int main() {
    vector<Item> items = {{1, 100, 20}, {2, 100, 15}, {3, 90, 10}};
    sort(items.begin(), items.end(), cmp);
    for (auto& it : items) {
        cout << "ID: " << it.id << ", Score: " << it.score << ", Time: " << it.time << "\\n";
    }
    return 0;
}`
    },
    {
      id: '3-2',
      title: 'Tìm kiếm nhị phân trên tập kết quả (BS on Answer)',
      xp: 40,
      subtitle: 'Chuyển bài toán tối ưu thành bài toán kiểm tra tính khả thi check(mid)',
      theory: 'Kỹ thuật tìm kiếm nhị phân trên không gian đáp án [low, high] khi hàm kiểm tra khả thi check(x) có tính chất đơn điệu (Monotonicity).',
      theoryDeep: {
        intuition: 'Nếu với thời gian T ta có thể hoàn thành công việc, thì với mọi thời gian > T ta cũng chắc chắn hoàn thành. Tính chất đơn điệu này cho phép chia đôi không gian tìm kiếm đáp án trong O(log(MAX_ANS)).',
        mathInvariant: 'check(x) có dạng: false, false, ..., false, true, true, ... -> Điểm chuyển giao chính là đáp án nhỏ nhất.',
        steps: [
          'Xác định miền giá trị của đáp án: `low` và `high`.',
          'Viết hàm `bool check(mid)` kiểm tra xem giá trị mid có thỏa mãn đề bài không.',
          'Trong vòng lặp: nếu `check(mid)` thỏa mãn, lưu đáp án và thu hẹp không gian tìm kiếm.'
        ],
        complexity: {
          time: 'O(log(Range) * Time_Check)',
          space: 'O(1)'
        },
        pitfalls: [
          'Tràn số khi tính `mid = (low + high) / 2`: nên viết `mid = low + (high - low) / 2`.',
          'Đặt `high` quá nhỏ khiến bỏ sót nghiệm tối ưu.'
        ],
        practiceProblems: [
          { name: 'Factory Machines', oj: 'CSES', diff: 'Trung bình', linkHint: 'Chặt nhị phân tìm thời gian nhỏ nhất làm xong T sản phẩm' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

// Kiểm tra xem trong thời gian timeSec có làm đủ T sản phẩm không
bool check(long long timeSec, const vector<long long>& k, long long T) {
    long long total = 0;
    for (long long machine : k) {
        total += timeSec / machine;
        if (total >= T) return true; // Tránh tràn số
    }
    return total >= T;
}

int main() {
    long long n = 3, T = 7;
    vector<long long> k = {3, 2, 5};

    long long low = 1, high = 1e18, ans = high;
    while (low <= high) {
        long long mid = low + (high - low) / 2;
        if (check(mid, k, T)) {
            ans = mid;
            high = mid - 1; // Thử tìm thời gian ngắn hơn
        } else {
            low = mid + 1;
        }
    }

    cout << "Thoi gian nho nhat lam xong " << T << " san pham: " << ans << "\\n"; // 8
    return 0;
}`
    },
    {
      id: '3-3',
      title: 'Tìm kiếm tam phân (Ternary Search)',
      xp: 45,
      subtitle: 'Tìm cực trị (cực đại/cực tiểu) của hàm đơn đỉnh (Unimodal function)',
      theory: 'Ternary Search chia không gian tìm kiếm thành 3 phần bằng 2 điểm m1 và m2 để tìm điểm cực trị của hàm số lồi hoặc lõm trong O(log N).',
      theoryDeep: {
        intuition: 'Hàm số không đơn điệu một chiều mà tăng rồi giảm (hoặc giảm rồi tăng). Chia đoạn [L, R] thành 3 phần bằng m1 = L + (R-L)/3 và m2 = R - (R-L)/3. So sánh f(m1) và f(m2) cho phép loại bỏ 1/3 khoảng tìm kiếm chắc chắn không chứa đỉnh.',
        mathInvariant: 'Sau mỗi bước lặp, độ dài khoảng tìm kiếm giảm đi 1/3: (R - L) * (2/3).',
        steps: [
          'Chọn m1 = l + (r - l) / 3 và m2 = r - (r - l) / 3.',
          'Nếu f(m1) < f(m2) (tìm cực đại): cực đại không thể nằm trong [l, m1] -> l = m1.',
          'Ngược lại: r = m2.',
          'Với số thực: lặp cố định 80-100 lần để đảm bảo độ chính xác 10^-9.'
        ],
        complexity: {
          time: 'O(log_{1.5}(Range))',
          space: 'O(1)'
        },
        pitfalls: [
          'Hàm số có nhiều hơn 1 cực trị (đa đỉnh) thì Ternary Search sẽ bị rơi vào cực trị cục bộ sai lầm.'
        ],
        practiceProblems: [
          { name: 'Weakness and Poorness', oj: 'Codeforces', diff: 'Nâng cao', linkHint: 'Ternary search trên số thực tìm điểm nghèo nàn nhỏ nhất' }
        ]
      },
      code: `#include <bits/stdc++.h>
using namespace std;

// Hàm bậc 2 có cực tiểu: f(x) = (x - 3)^2 + 5
double f(double x) {
    return (x - 3.0) * (x - 3.0) + 5.0;
}

int main() {
    double l = -100.0, r = 100.0;
    // Lặp 100 lần đảm bảo độ chính xác tuyệt đối
    for (int iter = 0; iter < 100; iter++) {
        double m1 = l + (r - l) / 3.0;
        double m2 = r - (r - l) / 3.0;
        if (f(m1) > f(m2)) {
            l = m1;
        } else {
            r = m2;
        }
    }
    cout << fixed << setprecision(6);
    cout << "Diem cuc tieu x = " << l << ", f(x) = " << f(l) << "\\n"; // x ≈ 3.0, f(x) ≈ 5.0
    return 0;
}`
    }
  ]
};
