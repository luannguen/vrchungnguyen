# AI CODING RULES

> **BẮT BUỘC**: AI phải đọc file này trước khi generate code.
> Mọi code vi phạm RULE phải được sửa lại trước khi hoàn tất.

---

## 📐 1. Kiến trúc Tổng Quan (3 Lớp)

```
┌─────────────────────────────────────────────────────────────┐
│                         UI LAYER                            │
│   (Components - Chỉ render, nhận props, emit events)        │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FEATURE LOGIC LAYER                      │
│   (Hooks - State, business logic, orchestration)            │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA/SERVICE LAYER                       │
│   (Services - API calls, DTO mapping, Result<T>)            │
└─────────────────────────────────────────────────────────────┘
```

### Nguyên tắc:
- **UI** → Chỉ render, KHÔNG gọi API trực tiếp
- **Feature Logic** → State, validate, xử lý nghiệp vụ, gọi service
- **Data/Service** → Gọi API, map dữ liệu, trả về `Result<T>`

### ❌ KHÔNG ĐƯỢC:
```javascript
// Trong component UI
const ProductList = () => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    base44.entities.Product.list().then(setProducts); // ❌ SAI
  }, []);
}
```

### ✅ ĐÚNG:
```javascript
// UI Component
const ProductList = () => {
  const { products, isLoading } = useProductList(); // ✅ Dùng hook
  return <ProductGrid products={products} />;
}

// Hook
const useProductList = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productAPI.list(), // ✅ Gọi service
  });
}

// Service
const productAPI = {
  list: async () => base44.entities.Product.list(), // ✅ API call
}
```

---

## 🎨 2. Quy Tắc UI Layer

### 2.1. UI là Presentation Only
- ❌ KHÔNG dùng `fetch`, `axios`, `base44.entities.*` trong component
- ❌ KHÔNG chứa business logic phức tạp
- ❌ KHÔNG tự xử lý validation phức tạp
- ✅ Chỉ render props, emit events qua callbacks

### 2.2. Sử dụng Component Chuẩn
```javascript
// ✅ ĐÚNG - Dùng component từ UI System
import { Button } from "@/components/ui/button";
import { BaseModal } from "@/components/shared/modal";
import { LoadingState, EmptyState } from "@/components/shared/ui";

// ❌ SAI - Tự viết lại
const MyButton = ({ children }) => <button className="...">{children}</button>;
```

### 2.3. Giới Hạn Kích Thước
- Component > 300 dòng → **PHẢI TÁCH NHỎ**
- Component làm > 1 nhiệm vụ → **PHẢI TÁCH NHỎ**

### 2.4. Đặt Tên Rõ Ràng
```javascript
// ✅ ĐÚNG
ProductListTable, OrderFormDialog, UserFilterBar, ReviewCard

// ❌ SAI
List, Form, Card, Item, Component1
```

---

## 🧠 3. Quy Tắc Feature Logic (Hooks)

### 3.1. Vị Trí Code
- Mọi state, business logic, orchestration → **hooks/features**
- Mỗi hook chỉ có **1 mục tiêu chính (Single Goal)**

```javascript
// ✅ ĐÚNG - Single goal
useProductList()    // Chỉ lo list
useProductForm()    // Chỉ lo form create/edit
useProductDetail()  // Chỉ lo detail view

// ❌ SAI - Làm quá nhiều việc
useProductEverything() // List + Detail + Form + Filter + Export
```

### 3.2. Tách Hook Khi Cần
Nếu hook đang xử lý quá nhiều:
```javascript
// ❌ SAI - Hook quá lớn
useProducts() {
  // 200 dòng: list + filter + pagination + CRUD + detail + export
}

// ✅ ĐÚNG - Tách nhỏ
useProductList()   // List + filter + pagination
useProductCRUD()   // Create/Update/Delete
useProductExport() // Export logic
```

### 3.3. Reuse Base Hooks
Trước khi tạo hook mới, kiểm tra:
1. `useCaseRegistry` có use case tương tự?
2. Có base hook có thể extend?

```javascript
// ✅ ĐÚNG - Reuse base hook
import { useItemListBase } from "@/components/shared/hooks";

export function useProductList() {
  return useItemListBase({
    entityName: 'Product',
    queryKey: 'products',
    // Chỉ config khác biệt
  });
}
```

### 3.4. Không Duplicate Logic Client/Admin
```javascript
// ✅ ĐÚNG - Base hook dùng chung
// shared/hooks/useItemListBase.js
export function useItemListBase(options) { /* logic chung */ }

// admin/hooks/useProducts.js
export function useProducts() {
  const base = useItemListBase({ activeOnly: false });
  // Thêm CRUD cho admin
}

// client/hooks/useProducts.js  
export function useProducts() {
  const base = useItemListBase({ activeOnly: true });
  // Thêm ratings cho client
}
```

---

## 📡 4. Quy Tắc Data/Service Layer

### 4.1. Vị Trí API Calls
- **TẤT CẢ** API calls phải nằm trong service layer
- Không hardcode URL trong UI/hook

```javascript
// ✅ ĐÚNG - Service layer
// services/productService.js
export const productAPI = {
  list: () => base44.entities.Product.list(),
  create: (data) => base44.entities.Product.create(data),
};

// ❌ SAI - Trong component/hook
base44.entities.Product.list(); // Không được gọi trực tiếp
```

### 4.2. Trả Về Result<T>
```javascript
// ✅ ĐÚNG - Dùng Result wrapper
import { success, failure, ErrorCodes } from "@/components/data/types";

export const productAPI = {
  create: async (data) => {
    try {
      if (!data.name) {
        return failure('Tên không được trống', ErrorCodes.VALIDATION_ERROR);
      }
      const product = await base44.entities.Product.create(data);
      return success(product);
    } catch (err) {
      return failure(err.message, ErrorCodes.SERVER_ERROR);
    }
  }
};

// ❌ SAI - Trả dữ liệu raw
create: async (data) => {
  return await base44.entities.Product.create(data);
}
```

### 4.3. Mapping DTO Tại Service
```javascript
// ✅ ĐÚNG - Map tại service
const productAPI = {
  list: async () => {
    const raw = await base44.entities.Product.list();
    return raw.map(mapToProductDTO); // Map ở đây
  }
};

// ❌ SAI - Map rải rác trong component
products.map(p => ({ ...p, displayPrice: formatPrice(p.price) }));
```

### 4.4. Khi Thêm Service Mới
1. Tạo DTO input/output trong `types.js`
2. Xử lý lỗi bằng `ErrorCodes`
3. Export qua `components/data/index.js`

---

## ⚠️ 5. Quy Tắc Error & Result

### 5.1. Luôn Dùng Result<T>
```javascript
import { success, failure, ErrorCodes } from "@/components/data/types";

// ✅ ĐÚNG
return success(data);
return failure('Lỗi validation', ErrorCodes.VALIDATION_ERROR);

// ❌ SAI
throw new Error("Lỗi gì đó");
return { error: "random message" };
```

### 5.2. Error Codes Chuẩn
```javascript
// Dùng ErrorCodes đã định nghĩa
ErrorCodes.VALIDATION_ERROR  // Lỗi validate input
ErrorCodes.NOT_FOUND         // Không tìm thấy
ErrorCodes.UNAUTHORIZED      // Chưa đăng nhập
ErrorCodes.FORBIDDEN         // Không có quyền
ErrorCodes.NETWORK_ERROR     // Lỗi mạng
ErrorCodes.SERVER_ERROR      // Lỗi server
```

### 5.3. UI Không Tự Bịa Message
```javascript
// ✅ ĐÚNG - Dùng error mapping
import { mapError } from "@/components/shared/errors";

const { userMessage, displayType } = mapError(result.code, { domain: 'product' });
toast.error(userMessage);

// ❌ SAI - Hardcode message
toast.error("Có lỗi xảy ra khi tạo sản phẩm");
alert("Lỗi không xác định");
```

---

## 🆕 6. Quy Tắc Thêm Feature Mới

Khi tạo tính năng mới (vd: `review`, `category`), làm theo thứ tự:

### Bước 1: DTO & Types
```javascript
// components/data/types.js
/**
 * @typedef {Object} ReviewCreateDTO
 * @property {string} item_id
 * @property {number} rating
 * @property {string} comment
 */
```

### Bước 2: Service
```javascript
// services/reviewService.js
export const reviewAPI = {
  create: async (data) => {
    // Validate
    if (!data.rating) return failure('...', ErrorCodes.VALIDATION_ERROR);
    // Call API
    const review = await base44.entities.Review.create(data);
    return success(review);
  }
};
```

### Bước 3: Hook
```javascript
// hooks/useReviewForm.js
export function useReviewForm() {
  const mutation = useMutation({
    mutationFn: reviewAPI.create,
  });
  // Return state + handlers
}
```

### Bước 4: UI
```javascript
// components/ReviewForm.jsx
export function ReviewForm() {
  const { submit, isLoading, error } = useReviewForm();
  return <form onSubmit={submit}>...</form>;
}
```

### Bước 5: Update UseCaseRegistry (BẮT BUỘC)
```javascript
// components/data/useCaseRegistry.js
{
  id: 'review.create',
  domain: 'review',
  description: 'Tạo đánh giá mới',
  input: 'ReviewCreateDTO',
  output: 'Result<Review>',
  service: 'reviewAPI.create',
  hook: 'useReviewForm',
}
```

---

## ⚡ 7. Quy Tắc Performance

### 7.1. Debounce Search/Filter
```javascript
// ✅ ĐÚNG
import { useDebouncedValue } from "@/components/shared/utils";

const debouncedSearch = useDebouncedValue(searchTerm, 300);

// ❌ SAI - Gọi API mỗi keystroke
useEffect(() => {
  fetchProducts(searchTerm);
}, [searchTerm]);
```

### 7.2. Pagination
```javascript
// ✅ ĐÚNG - Có pagination
const { data, page, setPage } = usePaginatedList();

// ❌ SAI - Load all
const allProducts = await productAPI.list(10000);
```

### 7.3. Cache & Stale Time
```javascript
// ✅ ĐÚNG
useQuery({
  queryKey: ['products'],
  queryFn: productAPI.list,
  staleTime: 30 * 1000, // 30s cache
});
```

### 7.4. Loading States
```javascript
// ✅ ĐÚNG - Dùng component chuẩn
import { LoadingState, EmptyState, ErrorState } from "@/components/shared/ui";

if (isLoading) return <LoadingState />;
if (error) return <ErrorState error={error} />;
if (!data.length) return <EmptyState message="Chưa có dữ liệu" />;
```

---

## 📁 8. Quy Tắc Kích Thước File

### 8.1. Single Goal Per File
- Mỗi file chỉ giải quyết **1 nhiệm vụ rõ ràng**
- 1 component chính / 1 hook chính / 1 service logic

### 8.2. Giới Hạn Dòng
| Loại File | Giới Hạn | Hành Động |
|-----------|----------|-----------|
| Component | 300 dòng | Tách component con |
| Hook | 200 dòng | Tách logic riêng |
| Service | 250 dòng | Tách theo domain |

### 8.3. Tự Động Tách
Khi file vượt giới hạn, AI **PHẢI**:
1. Xác định các phần có thể tách
2. Tạo file mới với tên rõ ràng
3. Import/export đúng cách

```javascript
// ❌ SAI - File quá lớn
// ProductPage.jsx (500 dòng)
// Chứa: List + Form + Detail + Filters + Export

// ✅ ĐÚNG - Tách nhỏ
// ProductPage.jsx (100 dòng) - Orchestrator
// ProductList.jsx (150 dòng)
// ProductForm.jsx (120 dòng)
// ProductFilters.jsx (80 dòng)
```

### 8.4. Tên File Rõ Nghĩa
```javascript
// ✅ ĐÚNG
ProductListTable.jsx
OrderFormDialog.jsx
useProductCRUD.js

// ❌ SAI
index.js (trong mọi folder)
utils.js (quá chung chung)
helpers.js
```

---

## ♻️ 9. Quy Tắc Coding Style & Reuse

### 9.1. Ưu Tiên Reuse
Trước khi tạo mới, kiểm tra:
1. `useCaseRegistry` có use case tương tự?
2. `components/shared/` có component dùng được?
3. `services/` có API method sẵn?

### 9.2. Không Copy-Paste
```javascript
// ❌ SAI - Copy logic
// useProductList.js
const filteredProducts = products.filter(p => p.name.includes(search));

// useServiceList.js
const filteredServices = services.filter(s => s.name.includes(search)); // Copy

// ✅ ĐÚNG - Tách thành helper
// utils/filterBySearch.js
export const filterBySearch = (items, search, field = 'name') => 
  items.filter(item => item[field]?.toLowerCase().includes(search.toLowerCase()));
```

### 9.3. Không Hardcode
```javascript
// ❌ SAI
if (status === 'pending') // Magic string
const PAGE_SIZE = 20; // Trong component

// ✅ ĐÚNG
// constants/orderStatus.js
export const ORDER_STATUS = { PENDING: 'pending', ... };

// config/pagination.js
export const DEFAULT_PAGE_SIZE = 20;
```

### 9.4. Hạn Chế `any`
```javascript
// ❌ SAI
const handleData = (data: any) => { ... }

// ✅ ĐÚNG
/** @param {Product[]} products */
const handleData = (products) => { ... }
```

---

## 🧪 10. Quy Tắc Testing

### 10.1. Khi Thêm Use Case Mới
Thêm ít nhất 1-2 test:
- Case thành công
- Case lỗi validate / lỗi nghiệp vụ

### 10.2. Tập Trung Test
- ✅ Service methods
- ✅ Use case logic
- ✅ Business rules
- ❌ Không test UI phức tạp

### 10.3. Cấu Trúc Test
```javascript
// __tests__/productService.test.js
export const testProductCreateValidation = async () => {
  const result = await productAPI.create({ price: 0 });
  assertFalse(result.success);
  assertEqual(result.code, ErrorCodes.VALIDATION_ERROR);
};
```

---

## 📖 11. Quy Tắc Đọc RULE Trước Khi Code

### Workflow Bắt Buộc:

```
┌─────────────────────────────────────────┐
│ 1. Đọc AI-CODING-RULES.md               │
├─────────────────────────────────────────┤
│ 2. Đọc useCaseRegistry                  │
├─────────────────────────────────────────┤
│ 3. Tìm use case/service/hook có thể    │
│    reuse trong codebase                 │
├─────────────────────────────────────────┤
│ 4. Chỉ tạo code mới khi:               │
│    - Không có node phù hợp, HOẶC       │
│    - Reuse làm code phức tạp hơn       │
├─────────────────────────────────────────┤
│ 5. Tự kiểm tra code theo RULE          │
│    - Sửa nếu vi phạm                   │
└─────────────────────────────────────────┘
```

### Checklist Trước Khi Hoàn Tất:

- [ ] Code theo đúng 3 lớp (UI → Hook → Service)?
- [ ] UI không gọi API trực tiếp?
- [ ] Dùng `Result<T>` và `ErrorCodes`?
- [ ] File không quá dài?
- [ ] Đã update `useCaseRegistry` (nếu thêm use case)?
- [ ] Có reuse được gì từ codebase không?
- [ ] Error messages dùng `mapError()`?

---

## 📂 Cấu Trúc Folder Chuẩn

```
components/
├── admin/
│   ├── hooks/          # Admin-specific hooks
│   ├── services/       # Admin services
│   └── pages/          # Admin page components
├── client/
│   ├── hooks/          # Client-specific hooks
│   └── products/       # Client product components
├── shared/
│   ├── hooks/          # Base hooks (useItemListBase, useAdminCRUD)
│   ├── errors/         # Error mapping
│   ├── ui/             # Shared UI components
│   └── utils/          # Utilities (debounce, formatters)
├── data/
│   ├── types.js        # DTOs, Result types
│   ├── useCaseRegistry.js
│   ├── services/       # Data services
│   └── index.js        # Central exports
└── ui/                 # Shadcn components
```

---

## 🚫 Những Điều TUYỆT ĐỐI KHÔNG LÀM

1. ❌ Gọi API trong component UI
2. ❌ Hardcode error messages
3. ❌ Copy-paste logic giữa các file
4. ❌ Tạo file > 300 dòng
5. ❌ Bỏ qua `useCaseRegistry` khi thêm feature
6. ❌ Dùng `throw new Error("random text")`
7. ❌ Tạo component/hook mới khi đã có sẵn
8. ❌ Load all data không pagination
9. ❌ Không dùng debounce cho search
10. ❌ Dùng `window.location.search` hoặc `window.location.pathname` - Dùng react-router-dom thay thế

---

## 🔗 12. Quy Tắc Routing (React Router DOM)

### 12.1. LUÔN Dùng react-router-dom
Để đảm bảo SPA navigation reactive và hoạt động đúng:

```javascript
// ❌ SAI - Không reactive, gây bug khi navigate
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const path = window.location.pathname;

// ✅ ĐÚNG - Reactive với URL changes
import { useSearchParams, useLocation, useParams } from 'react-router-dom';

const [searchParams] = useSearchParams();
const id = searchParams.get('id');
const location = useLocation();
const { slug } = useParams();
```

### 12.2. Hooks Routing Chuẩn
| Mục đích | Hook |
|----------|------|
| Query params (?id=123) | `useSearchParams()` |
| Route params (/post/:id) | `useParams()` |
| Current location | `useLocation()` |
| Programmatic navigate | `useNavigate()` |

### 12.3. Lý Do
- `window.location.*` **KHÔNG reactive** - component không re-render khi URL thay đổi trong SPA
- `useSearchParams`, `useParams` là reactive - tự động trigger re-render khi URL thay đổi
- Đảm bảo navigation trong SPA hoạt động mượt mà

---

## ✅ Checklist Nhanh

Khi tạo feature mới:
```
□ Types/DTO defined
□ Service với Result<T>
□ Hook gọi service
□ UI dùng hook
□ useCaseRegistry updated
□ Error dùng ErrorCodes
□ File size OK (<300 lines)
□ Reuse checked
```

---

> **Ghi nhớ**: Code sạch, tách biệt, dễ maintain. 
> Reuse trước, tạo mới sau.
> Mọi lỗi phải có ErrorCode, mọi kết quả phải là Result<T>.