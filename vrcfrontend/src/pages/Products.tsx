import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { AppLink } from '../components/common/AppLink';
import FAQSection from "@/components/FAQSection";
import { productService } from "@/services/productService";
import { Product, Category } from "@/components/data/types";
import { Loader2, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Add animation library if available, specifically requested "better UI/AES"
// If frame-motion isn't installed, standard CSS transitions will be used, but let's assume standard React for now to avoid dependency errors if not present.
// I will use standard CSS classes for animations to be safe.

const Products = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesResult, productsResult] = await Promise.all([
          productService.getCategories(),
          productService.getProducts()
        ]);

        if (categoriesResult.success) {
          setCategories(categoriesResult.data);
        } else {
          // Explicitly narrow to failure
          const failure = categoriesResult as unknown as { success: false; error: { message: string } };
          console.error("Failed to fetch categories:", failure.error);
        }

        if (productsResult.success) {
          setProducts(productsResult.data);
        } else {
          const failure = productsResult as unknown as { success: false; error: { message: string } };
          setError(failure.error.message || "Failed to load products");
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = activeCategory === "all" || (product.category && product.category.slug === activeCategory);
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <main className="flex-grow min-h-screen bg-gray-50/50">
      {/* Modern Gradient Banner with Framer Motion */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-primary via-primary/90 to-blue-600 py-16 md:py-24 text-white overflow-hidden"
      >
        {/* Optional pattern removed */}
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight"
          >
            Danh Mục Sản Phẩm
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-light"
          >
            Giải pháp kỹ thuật lạnh toàn diện, từ điều hòa dân dụng đến hệ thống công nghiệp tiên tiến.
          </motion.p>
        </div>
      </motion.div>

      {/* Search & Filter Section */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Tabs (Desktop) */}
            <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <div className="flex space-x-2">
                <Button
                  variant={activeCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setActiveCategory('all')}
                  className="rounded-full px-6"
                >
                  Tất cả
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.slug ? 'default' : 'outline'}
                    onClick={() => setActiveCategory(cat.slug)}
                    className="rounded-full px-6 whitespace-nowrap"
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 mt-2">Vui lòng thử từ khóa hoặc danh mục khác.</p>
                <Button variant="link" onClick={() => { setSearchTerm(""); setActiveCategory("all"); }} className="mt-4 text-primary">
                  Xóa bộ lọc
                </Button>
              </motion.div>
            ) : (
              filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group h-full"
                >
                  <Card className="h-full flex flex-col overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-50">
                          <span className="text-sm">No Image</span>
                        </div>
                      )}

                      {/* Overlays / Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {product.is_new && <Badge className="bg-green-500 hover:bg-green-600 shadow-sm backdrop-blur-sm">Mới</Badge>}
                        {product.is_bestseller && <Badge className="bg-amber-500 hover:bg-amber-600 shadow-sm backdrop-blur-sm">Hot</Badge>}
                      </div>

                      {/* Quick Actions Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <Button variant="secondary" size="sm" onClick={() => setSelectedProduct(product)} className="rounded-full shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          {product.category && (
                            <span className="text-xs font-medium text-primary uppercase tracking-wider">
                              {product.category.name}
                            </span>
                          )}
                          <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {product.name}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow pt-0">
                      <div className="mt-2 text-primary font-bold text-lg">
                        {product.price || "Liên hệ"}
                      </div>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    </CardContent>

                    <CardFooter className="pt-0 pb-6 px-6">
                      <Button className="w-full rounded-lg font-medium shadow-md shadow-primary/20 hover:shadow-primary/40 transition-shadow" asChild>
                        <AppLink routeKey="CONTACT" query={{ product: product.id.toString() }}>
                          Báo giá ngay
                        </AppLink>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Thông số kỹ thuật Modal - Styled Check */}
      <AnimatePresence>
        {selectedProduct && selectedProduct.specifications && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative z-10"
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h3>
                <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)} className="rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </Button>
              </div>


              <div className="p-6 md:p-8 space-y-8">
                {/* Features */}
                {selectedProduct.features && selectedProduct.features.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                      <span className="w-1 h-6 bg-primary rounded-full"></span>
                      Tính năng nổi bật
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedProduct.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                          <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specifications Table */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    Thông số kỹ thuật
                  </h4>
                  <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {Object.entries(selectedProduct.specifications).map(([key, value], index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50'}>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-700 w-1/3 border-r border-gray-100">{key}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                  Đóng
                </Button>
                <Button asChild>
                  <AppLink routeKey="CONTACT" query={{ product: selectedProduct.id.toString() }}>
                    Liên hệ báo giá
                  </AppLink>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Đăng ký tư vấn section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-primary rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Bạn cần giải pháp thiết kế riêng?</h2>
            <p className="text-blue-100 text-lg">
              Đội ngũ kỹ sư của VRC sẵn sàng khảo sát và tư vấn giải pháp tối ưu nhất cho công trình của bạn.
            </p>
            <Button size="lg" variant="secondary" className="font-bold px-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105" asChild>
              <AppLink routeKey="CONTACT">Liên hệ tư vấn ngay</AppLink>
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection category="product" />
    </main>
  );
};

export default Products;