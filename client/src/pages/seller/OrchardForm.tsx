import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orchardService } from '@/services/orchard.service';
import { Button, Input, Textarea, Select, Card, Badge } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/apiClient';
import type { FilterOptions, Orchard } from '@/types';
import { titleCase } from '@/lib/format';
import { cn } from '@/lib/cn';

const empty = {
  gardenName: '',
  description: '',
  district: '',
  state: '',
  fruitTypes: [] as string[],
  totalTrees: 0,
  averageFruitPerTree: 0,
  expectedYield: 0,
  totalArea: 0,
  areaUnit: 'acre',
  rentType: 'season',
  price: 0,
  amenities: [] as string[],
  available: true,
};

export default function OrchardForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ ...empty });
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    orchardService.getFilterOptions().then(setOptions).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    // load via mine list (simplest) then find — or fetch by id through update flow
    orchardService
      .listMine({ page: 1 })
      .then((res) => {
        const found = res.data.find((o) => o._id === id);
        if (found) hydrate(found);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const hydrate = (o: Orchard) =>
    setForm({
      gardenName: o.gardenName,
      description: o.description || '',
      district: o.district,
      state: o.state,
      fruitTypes: o.fruitTypes,
      totalTrees: o.totalTrees,
      averageFruitPerTree: o.averageFruitPerTree,
      expectedYield: o.expectedYield,
      totalArea: o.totalArea,
      areaUnit: o.areaUnit,
      rentType: o.rentType,
      price: o.price,
      amenities: o.amenities,
      available: o.available,
    });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k: 'fruitTypes' | 'amenities', v: string) =>
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v],
    }));

  const submit = async (status: 'draft' | 'pending') => {
    if (!form.gardenName || !form.state || !form.district || form.fruitTypes.length === 0 || !form.price) {
      toast.error('Please fill name, location, fruit and price');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await orchardService.update(id!, form);
        toast.success('Orchard updated');
      } else {
        await orchardService.create({ ...form, status } as Partial<Orchard>);
        toast.success(status === 'draft' ? 'Draft saved' : 'Submitted for review');
      }
      navigate('/seller/orchards');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-faint">Loading…</p>;

  const chip = (active: boolean) =>
    cn(
      'cursor-pointer rounded-full border px-3.5 py-[7px] text-[12.5px] font-semibold transition-all',
      active ? 'border-forest bg-forest text-cream' : 'border-sand text-sub hover:border-faint'
    );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1.5 font-serif text-2xl font-semibold">{isEdit ? 'Edit orchard' : 'New orchard'}</h1>
      <p className="mb-6 text-sm text-faint">Provide accurate details — listings are reviewed before going live.</p>

      <div className="space-y-5">
        <Card className="space-y-4 p-6">
          <Input label="Garden name" value={form.gardenName} onChange={(e) => set('gardenName', e.target.value)} />
          <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="District" value={form.district} onChange={(e) => set('district', e.target.value)} />
            <Input label="State" value={form.state} onChange={(e) => set('state', e.target.value)} />
          </div>
        </Card>

        <Card className="p-6">
          <p className="mb-2 text-sm font-semibold">Fruit types</p>
          <div className="mb-5 flex flex-wrap gap-2">
            {options?.fruitTypes.map((f) => (
              <span key={f} onClick={() => toggle('fruitTypes', f)} className={chip(form.fruitTypes.includes(f))}>
                {titleCase(f)}
              </span>
            ))}
          </div>
          <p className="mb-2 text-sm font-semibold">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {options?.amenities.map((a) => (
              <span key={a} onClick={() => toggle('amenities', a)} className={chip(form.amenities.includes(a))}>
                {titleCase(a)}
              </span>
            ))}
          </div>
        </Card>

        <Card className="grid gap-4 p-6 sm:grid-cols-2">
          <Input label="Total trees" type="number" value={form.totalTrees} onChange={(e) => set('totalTrees', Number(e.target.value))} />
          <Input label="Avg fruit / tree" type="number" value={form.averageFruitPerTree} onChange={(e) => set('averageFruitPerTree', Number(e.target.value))} />
          <Input label="Expected yield (kg)" type="number" value={form.expectedYield} onChange={(e) => set('expectedYield', Number(e.target.value))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Total area" type="number" value={form.totalArea} onChange={(e) => set('totalArea', Number(e.target.value))} />
            <Select label="Unit" value={form.areaUnit} onChange={(e) => set('areaUnit', e.target.value)}>
              {options?.areaUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </div>
          <Input label="Price (₹)" type="number" value={form.price} onChange={(e) => set('price', Number(e.target.value))} />
          <Select label="Rent type" value={form.rentType} onChange={(e) => set('rentType', e.target.value)}>
            {options?.rentTypes.map((r) => (
              <option key={r} value={r}>
                {titleCase(r)}
              </option>
            ))}
          </Select>
        </Card>

        <div className="flex items-center justify-between">
          <Badge tone={form.available ? 'green' : 'gray'}>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={form.available} onChange={(e) => set('available', e.target.checked)} />
              Available
            </label>
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => submit('draft')} loading={saving}>
              Save as draft
            </Button>
            <Button onClick={() => submit('pending')} loading={saving}>
              {isEdit ? 'Save changes' : 'Submit for review'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
