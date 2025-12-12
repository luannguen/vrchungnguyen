import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import AppLink from "@/components/ui/app-link";
import { productService } from "@/services/productService";
import { Product, Category } from "@/components/data/types";
import { Loader2 } from "lucide-react";

const Products = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          console.error("Failed to fetch categories:", categoriesResult.error);
        }

        if (productsResult.success) {
          setProducts(productsResult.data);
        } else {
          setError(productsResult.error.message);
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

  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter(product => product.category && product.category.slug === activeCategory);

  // Group categories for tabs (optional, or just list them all)
  // For now, let's just list the categories we fetched

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
    <main className="flex-grow">
      {/* Banner */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">Sản Phẩm</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
            VRC cung cấp các giải pháp và thiết bị kỹ thuật lạnh đa dạng, từ hệ thống điều hòa không khí, kho lạnh đến các giải pháp làm lạnh công nghiệp tiên tiến
          </p>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="container mx-auto py-12 px-4">
        <Tabs defaultValue="all" className="mb-10" onValueChange={setActiveCategory}>
          <TabsList className="grid w-full h-auto grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-8 gap-2">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.slug}>{cat.name}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-10">
                  Không tìm thấy sản phẩm nào trong danh mục này.
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden transition-all hover:shadow-lg flex flex-col">
                    <div className="h-60 w-full bg-gray-100 flex items-center justify-center relative overflow-hidden shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform hover:scale-105" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-200">
                          No Image
                        </div>
                      )}

                      {product.is_new && (
                        <Badge className="absolute top-3 right-3 bg-green-600">Mới</Badge>
                      )}
                      {product.is_bestseller && (
                        <Badge className="absolute top-3 left-3 bg-amber-600">Bán chạy</Badge>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-xl line-clamp-2">{product.name}</CardTitle>
                        {product.price && (
                          <div className="text-primary font-semibold whitespace-nowrap">{product.price}</div>
                        )}
                      </div>
                      <CardDescription className="line-clamp-3">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {product.features && product.features.length > 0 && (
                        <>
                          <h4 className="font-medium mb-2">Tính năng nổi bật:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {product.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="line-clamp-1">{feature}</li>
                            ))}
                            {product.features.length > 3 && (
                              <li className="text-xs text-muted-foreground">Xem thêm...</li>
                            )}
                          </ul>
                        </>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2 mt-auto">
                      <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)} className="w-full">
                        Thông số
                      </Button>
                      <Button size="sm" className="w-full">
                        <AppLink routeKey="CONTACT" query={{ product: product.id.toString() }}>
                          Báo giá
                        </AppLink>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Thông số kỹ thuật Modal */}
        {selectedProduct && selectedProduct.specifications && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-primary">{selectedProduct.name}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                    Đóng
                  </Button>
                </div>
                {selectedProduct.description && (
                  <p className="mb-6 text-gray-600">{selectedProduct.description}</p>
                )}

                {selectedProduct.features && selectedProduct.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2 text-lg">Tính năng chi tiết</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedProduct.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <h4 className="font-medium mb-4 text-lg">Thông số kỹ thuật</h4>
                <div className="overflow-hidden rounded border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(selectedProduct.specifications).map(([key, value], index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-3 text-sm font-medium">{key}</td>
                          <td className="px-6 py-3 text-sm">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => setSelectedProduct(null)}>
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Đăng ký tư vấn */}
        <section className="mt-16 bg-gradient-to-r from-primary/10 to-transparent p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6 text-primary">Yêu cầu tư vấn sản phẩm</h2>
          <p className="mb-6 text-muted-foreground">
            Bạn cần tư vấn về giải pháp kỹ thuật lạnh phù hợp cho công trình hay doanh nghiệp của mình?
            Đội ngũ kỹ sư và chuyên gia của VRC sẵn sàng hỗ trợ bạn lựa chọn giải pháp tối ưu.
          </p>
          <Button size="lg" variant="default">
            <AppLink routeKey="CONTACT">
              Liên hệ tư vấn
            </AppLink>
          </Button>
        </section>

        {/* Câu hỏi thường gặp */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-primary">Câu hỏi thường gặp</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Làm thế nào để chọn công suất điều hòa phù hợp?</AccordionTrigger>
              <AccordionContent>
                Để chọn công suất điều hòa phù hợp, bạn cần tính toán dựa trên diện tích phòng, số người sử dụng, hướng phòng,
                thiết bị sinh nhiệt trong phòng và vị trí địa lý. Thông thường, cần 9.000 BTU cho phòng 15m²,
                12.000 BTU cho phòng 20m², 18.000 BTU cho phòng 30m². Với không gian công nghiệp hoặc thương mại,
                VRC có đội ngũ kỹ sư sẽ tính toán chi tiết và đề xuất giải pháp tối ưu.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Thời gian bảo hành cho các sản phẩm của VRC là bao lâu?</AccordionTrigger>
              <AccordionContent>
                VRC cung cấp chế độ bảo hành 24 tháng cho tất cả các sản phẩm điều hòa dân dụng,
                36 tháng đối với máy nén của hệ thống VRV/VRF, và 12 tháng đối với các thiết bị công nghiệp.
                Ngoài ra, chúng tôi có các gói bảo trì và gia hạn bảo hành để đảm bảo hệ thống của bạn
                luôn vận hành ổn định và hiệu quả trong suốt vòng đời sản phẩm.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Chi phí lắp đặt hệ thống kho lạnh phụ thuộc vào yếu tố nào?</AccordionTrigger>
              <AccordionContent>
                Chi phí lắp đặt kho lạnh phụ thuộc vào nhiều yếu tố như: diện tích kho, nhiệt độ yêu cầu,
                loại hàng hóa cần bảo quản, độ dày panel cách nhiệt, hệ thống điện, hệ thống giám sát,
                và các trang thiết bị đi kèm. VRC cung cấp giải pháp kho lạnh theo yêu cầu cụ thể
                của từng khách hàng với mức giá cạnh tranh nhất trên thị trường.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Làm thế nào để tiết kiệm điện năng khi sử dụng điều hòa?</AccordionTrigger>
              <AccordionContent>
                Để tiết kiệm điện năng khi sử dụng điều hòa, bạn nên:
                (1) Chọn điều hòa có công nghệ Inverter,
                (2) Đặt nhiệt độ ở mức 25-26°C,
                (3) Bảo dưỡng định kỳ 6 tháng/lần,
                (4) Sử dụng quạt kết hợp với điều hòa,
                (5) Tắt điều hòa khi không sử dụng,
                (6) Cách nhiệt tốt cho phòng/công trình, và
                (7) Lắp đặt hệ thống điều khiển thông minh để tối ưu hóa việc sử dụng.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>VRC có cung cấp dịch vụ bảo trì định kỳ không?</AccordionTrigger>
              <AccordionContent>
                Có, VRC cung cấp các gói dịch vụ bảo trì định kỳ cho tất cả các sản phẩm kỹ thuật lạnh.
                Chúng tôi có đội ngũ kỹ thuật viên được đào tạo chuyên nghiệp, sẵn sàng phục vụ 24/7.
                Các gói bảo trì bao gồm vệ sinh thiết bị, kiểm tra an toàn, tối ưu hóa vận hành,
                và thay thế vật tư tiêu hao theo định kỳ. Hợp đồng bảo trì dài hạn sẽ được hưởng
                chính sách ưu đãi đặc biệt và ưu tiên xử lý sự cố.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </main>
  );
};

export default Products;