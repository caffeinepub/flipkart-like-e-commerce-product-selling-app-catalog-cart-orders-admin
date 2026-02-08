import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddProduct, useUpdateProduct, useListCategories } from '../../hooks/useQueries';
import { validateProductForm } from '../../lib/validation';
import { toast } from 'sonner';
import type { Product } from '../../backend';

interface ProductEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export default function ProductEditorDialog({ open, onOpenChange, product }: ProductEditorDialogProps) {
  const { data: categories = [] } = useListCategories();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setPrice((Number(product.price) / 100).toString());
      setStock(Number(product.stock).toString());
      setCategoryId(product.categoryId.toString());
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategoryId('');
    }
    setErrors({});
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateProductForm({ title, description, price, stock, categoryId });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const priceInCents = BigInt(Math.round(parseFloat(price) * 100));
    const stockBigInt = BigInt(parseInt(stock));
    const categoryIdBigInt = BigInt(categoryId);

    try {
      if (product) {
        await updateProduct.mutateAsync({
          productId: product.id,
          title,
          description,
          price: priceInCents,
          stock: stockBigInt,
          categoryId: categoryIdBigInt,
        });
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync({
          title,
          description,
          price: priceInCents,
          stock: stockBigInt,
          categoryId: categoryIdBigInt,
        });
        toast.success('Product added successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({});
              }}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({});
              }}
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setErrors({});
                }}
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  setErrors({});
                }}
                className={errors.stock ? 'border-destructive' : ''}
              />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={(value) => {
              setCategoryId(value);
              setErrors({});
            }}>
              <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id.toString()} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addProduct.isPending || updateProduct.isPending}>
              {addProduct.isPending || updateProduct.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
