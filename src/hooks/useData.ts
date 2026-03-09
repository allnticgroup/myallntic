import { useLocalStorage } from './useLocalStorage';
import { Prospect, Devis, Intervention, Material, Payment, Expense, Invoice, Supplier, Purchase, Employee, Salary } from '@/types';

export function useProspects() {
  const [prospects, setProspects] = useLocalStorage<Prospect[]>('allntic_prospects', []);

  const addProspect = (prospect: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProspect: Prospect = {
      ...prospect,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setProspects((prev) => [...prev, newProspect]);
    return newProspect;
  };

  const updateProspect = (id: string, updates: Partial<Prospect>) => {
    setProspects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
  };

  const deleteProspect = (id: string) => {
    setProspects((prev) => prev.filter((p) => p.id !== id));
  };

  const getProspect = (id: string) => prospects.find((p) => p.id === id);

  return { prospects, addProspect, updateProspect, deleteProspect, getProspect };
}

export function useDevis() {
  const [devisList, setDevisList] = useLocalStorage<Devis[]>('allntic_devis', []);

  const addDevis = (devis: Omit<Devis, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newDevis: Devis = {
      ...devis,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setDevisList((prev) => [...prev, newDevis]);
    return newDevis;
  };

  const updateDevis = (id: string, updates: Partial<Devis>) => {
    setDevisList((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      )
    );
  };

  const deleteDevis = (id: string) => {
    setDevisList((prev) => prev.filter((d) => d.id !== id));
  };

  const getDevisForProspect = (prospectId: string) =>
    devisList.filter((d) => d.prospectId === prospectId);

  return { devisList, addDevis, updateDevis, deleteDevis, getDevisForProspect };
}

export function useInterventions() {
  const [interventions, setInterventions] = useLocalStorage<Intervention[]>(
    'allntic_interventions',
    []
  );

  const addIntervention = (
    intervention: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date().toISOString();
    const newIntervention: Intervention = {
      ...intervention,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setInterventions((prev) => [...prev, newIntervention]);
    return newIntervention;
  };

  const updateIntervention = (id: string, updates: Partial<Intervention>) => {
    setInterventions((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
      )
    );
  };

  const deleteIntervention = (id: string) => {
    setInterventions((prev) => prev.filter((i) => i.id !== id));
  };

  const getInterventionsForProspect = (prospectId: string) =>
    interventions.filter((i) => i.prospectId === prospectId);

  return {
    interventions,
    addIntervention,
    updateIntervention,
    deleteIntervention,
    getInterventionsForProspect,
  };
}

export function useMaterials() {
  const [materials, setMaterials] = useLocalStorage<Material[]>('allntic_materials', []);

  const addMaterial = (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newMaterial: Material = {
      ...material,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setMaterials((prev) => [...prev, newMaterial]);
    return newMaterial;
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      )
    );
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const getMaterial = (id: string) => materials.find((m) => m.id === id);

  const getMaterialsByCategory = (category: string) =>
    materials.filter((m) => m.categorie === category);

  const deductStockForDevis = (lignes: { materialId: string; quantite: number }[]) => {
    setMaterials((prev) =>
      prev.map((material) => {
        const ligne = lignes.find((l) => l.materialId === material.id);
        if (ligne) {
          const newStock = Math.max(0, material.stockQuantite - ligne.quantite);
          return { ...material, stockQuantite: newStock, updatedAt: new Date().toISOString() };
        }
        return material;
      })
    );
  };

  const restoreStockForDevis = (lignes: { materialId: string; quantite: number }[]) => {
    setMaterials((prev) =>
      prev.map((material) => {
        const ligne = lignes.find((l) => l.materialId === material.id);
        if (ligne) {
          const newStock = material.stockQuantite + ligne.quantite;
          return { ...material, stockQuantite: newStock, updatedAt: new Date().toISOString() };
        }
        return material;
      })
    );
  };

  return {
    materials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getMaterial,
    getMaterialsByCategory,
    deductStockForDevis,
    restoreStockForDevis,
  };
}

export function usePayments() {
  const [payments, setPayments] = useLocalStorage<Payment[]>('allntic_payments', []);

  const addPayment = (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPayment: Payment = {
      ...payment,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setPayments((prev) => [...prev, newPayment]);
    return newPayment;
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
  };

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const getPaymentsForDevis = (devisId: string) =>
    payments.filter((p) => p.devisId === devisId);

  return { payments, addPayment, updatePayment, deletePayment, getPaymentsForDevis };
}

export function useExpenses() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('allntic_expenses', []);

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setExpenses((prev) => [...prev, newExpense]);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      )
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return { expenses, addExpense, updateExpense, deleteExpense };
}

export function useInvoices() {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('allntic_invoices', []);

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newInvoice: Invoice = {
      ...invoice,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setInvoices((prev) => [...prev, newInvoice]);
    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
      )
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const getInvoicesForProspect = (prospectId: string) =>
    invoices.filter((i) => i.prospectId === prospectId);

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.filter((i) => i.numero.startsWith(`FAC-${year}`)).length + 1;
    return `FAC-${year}-${String(count).padStart(4, '0')}`;
  };

  return { invoices, addInvoice, updateInvoice, deleteInvoice, getInvoicesForProspect, generateInvoiceNumber };
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('allntic_suppliers', []);

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newSupplier: Supplier = {
      ...supplier,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      )
    );
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const getSupplier = (id: string) => suppliers.find((s) => s.id === id);

  return { suppliers, addSupplier, updateSupplier, deleteSupplier, getSupplier };
}

export function usePurchases() {
  const [purchases, setPurchases] = useLocalStorage<Purchase[]>('allntic_purchases', []);

  const addPurchase = (purchase: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPurchase: Purchase = {
      ...purchase,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setPurchases((prev) => [...prev, newPurchase]);
    return newPurchase;
  };

  const updatePurchase = (id: string, updates: Partial<Purchase>) => {
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
  };

  const deletePurchase = (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  const getPurchasesForSupplier = (supplierId: string) =>
    purchases.filter((p) => p.supplierId === supplierId);

  const getTotalPurchasesForSupplier = (supplierId: string) =>
    purchases
      .filter((p) => p.supplierId === supplierId && p.statut !== 'annulee')
      .reduce((sum, p) => sum + p.montant, 0);

  return { purchases, addPurchase, updatePurchase, deletePurchase, getPurchasesForSupplier, getTotalPurchasesForSupplier };
}

export function useEmployees() {
  const [employees, setEmployees] = useLocalStorage<Employee[]>('allntic_employees', []);

  const addEmployee = (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEmployee: Employee = {
      ...employee,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setEmployees((prev) => [...prev, newEmployee]);
    return newEmployee;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      )
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const getEmployee = (id: string) => employees.find((e) => e.id === id);

  return { employees, addEmployee, updateEmployee, deleteEmployee, getEmployee };
}
