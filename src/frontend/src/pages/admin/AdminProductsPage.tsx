import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminRouteGuard from '../../components/auth/AdminRouteGuard';
import ProductEditorDialog from '../../components/admin/ProductEditorDialog';
import { useListProducts, useDeleteProduct, useInitialize } from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { Product } from '../../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminProductsPage() {
  const { data: products = [], isLoading } = useListProducts(0, 1000);
  const deleteProduct = useDeleteProduct();
  const initialize = useInitialize();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditorOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setEditorOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct.mutateAsync(productToDelete.id);
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleInitialize = async () => {
    try {
      await initialize.mutateAsync();
      toast.success('Demo data initialized successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize data');
    }
  };

  return (
    <AdminRouteGuard>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Manage Products</h1>
          <div className="flex gap-2">
            {products.length === 0 && (
              <Button variant="outline" onClick={handleInitialize} disabled={initialize.isPending}>
                {initialize.isPending ? 'Initializing...' : 'Initialize Demo Data'}
              </Button>
            )}
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products yet. Add your first product or initialize demo data.</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Purchases</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const price = Number(product.price) / 100;
                  const isOutOfStock = Number(product.stock) === 0;
                  return (
                    <TableRow key={product.id.toString()}>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>${price.toFixed(2)}</TableCell>
                      <TableCell>
                        {isOutOfStock ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : (
                          <span>{Number(product.stock)}</span>
                        )}
                      </TableCell>
                      <TableCell>{Number(product.views)}</TableCell>
                      <TableCell>{Number(product.purchases)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                            disabled={deleteProduct.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <ProductEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          product={editingProduct}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{productToDelete?.title}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminRouteGuard>
  );
}
