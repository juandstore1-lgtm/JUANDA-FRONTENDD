import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Landmark,
  TrendingUp,
  DollarSign,
  Package,
  HandCoins,
  CalendarCheck,
  BarChart3,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Building2,
  ArrowRight,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
  Users,
  Check,
  RefreshCw
} from 'lucide-react';
import {
  FinancialService,
  FinancialData,
  FinancialExpense,
  RecurringExpense,
  SupplierDebt,
  BankDebt,
  Receivable,
  CalendarItem
} from '../../services/financialService';

export default function FinancialAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'resumen';

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // State
  const [data, setData] = useState<FinancialData>(() => FinancialService.getFinancialData());
  const [selectedMonth, setSelectedMonth] = useState('Noviembre 2026');
  const [selectedStore, setSelectedStore] = useState('Todas las sedes');

  // Search & filter states
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseFilterCategory, setExpenseFilterCategory] = useState('Todas');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [receivableSearch, setReceivableSearch] = useState('');
  const [calendarViewMode, setCalendarViewMode] = useState<'mes' | 'semana' | 'lista'>('mes');
  const [calendarFilterType, setCalendarFilterType] = useState('Todos');

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSupplierDebtModalOpen, setIsSupplierDebtModalOpen] = useState(false);
  const [isSupplierAbonoModalOpen, setIsSupplierAbonoModalOpen] = useState(false);
  const [selectedSupplierDebt, setSelectedSupplierDebt] = useState<SupplierDebt | null>(null);
  const [isBankDebtModalOpen, setIsBankDebtModalOpen] = useState(false);
  const [isBankQuotaModalOpen, setIsBankQuotaModalOpen] = useState(false);
  const [selectedBankDebt, setSelectedBankDebt] = useState<BankDebt | null>(null);
  const [isReceivableModalOpen, setIsReceivableModalOpen] = useState(false);
  const [isReceivableAbonoModalOpen, setIsReceivableAbonoModalOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isActionChoiceModalOpen, setIsActionChoiceModalOpen] = useState(false);

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    concept: '',
    category: 'Arriendo' as FinancialExpense['category'],
    store: 'República' as FinancialExpense['store'],
    amount: 0,
    date: '2026-11-21',
    status: 'Pagado' as FinancialExpense['status'],
    notes: ''
  });

  const [supplierDebtForm, setSupplierDebtForm] = useState({
    supplier: '',
    concept: '',
    store: 'República' as SupplierDebt['store'],
    initialDebt: 0,
    abonado: 0,
    dueDate: '2026-11-30'
  });

  const [abonoForm, setAbonoForm] = useState({
    amount: 0,
    paymentMethod: 'Transferencia Bancolombia',
    notes: ''
  });

  const [bankDebtForm, setBankDebtForm] = useState({
    bank: 'Bancolombia',
    debtType: 'Préstamo comercial',
    totalAmount: 0,
    abonado: 0,
    monthlyQuota: 0,
    dueDate: '2026-11-25'
  });

  const [receivableForm, setReceivableForm] = useState({
    debtor: '',
    concept: '',
    store: 'República' as Receivable['store'],
    totalAmount: 0,
    abonado: 0,
    createdDate: '2026-11-21',
    dueDate: '2026-11-30'
  });

  const [recurringForm, setRecurringForm] = useState({
    title: '',
    period: 'Mensual',
    nextDue: '01 Dic',
    amount: 0
  });

  const refreshData = () => {
    setData(FinancialService.getFinancialData());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const formatCOP = (val: number) => {
    return '$' + Math.round(val).toLocaleString('es-CO');
  };

  const getMonthYearKey = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 2) return '';
    const y = parts[0];
    const m = parts[1];
    const monthMap: Record<string, string> = {
      '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
      '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
      '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    };
    return `${monthMap[m] || m} ${y}`;
  };

  // Filtered Expenses by Store & Month
  const filteredExpenses = useMemo(() => {
    return data.expenses.filter(exp => {
      let matchMonth = true;
      if (selectedMonth.includes('Año Completo')) {
        matchMonth = exp.date ? exp.date.startsWith('2026') : true;
      } else {
        matchMonth = !exp.date || getMonthYearKey(exp.date) === selectedMonth;
      }

      const matchStore = selectedStore === 'Todas las sedes' || exp.store === selectedStore || exp.store === 'Todas las sedes';
      const matchSearch = exp.concept.toLowerCase().includes(expenseSearch.toLowerCase()) ||
                          exp.category.toLowerCase().includes(expenseSearch.toLowerCase());
      const matchCategory = expenseFilterCategory === 'Todas' || exp.category === expenseFilterCategory;
      return matchMonth && matchStore && matchSearch && matchCategory;
    });
  }, [data.expenses, selectedMonth, selectedStore, expenseSearch, expenseFilterCategory]);

  // Expenses KPIs
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredExpenses]);

  const paidExpenses = useMemo(() => {
    return filteredExpenses.filter(e => e.status === 'Pagado').reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredExpenses]);

  const pendingExpenses = useMemo(() => {
    return filteredExpenses.filter(e => e.status === 'Pendiente').reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredExpenses]);

  const recurringTotal = useMemo(() => {
    return data.recurringExpenses.filter(r => r.isActive).reduce((acc, curr) => acc + curr.amount, 0);
  }, [data.recurringExpenses]);

  // Totales dinámicos por categoría
  const categoryTotals = useMemo(() => {
    const cats: Record<string, number> = {
      'Arriendo': 0,
      'Servicios públicos': 0,
      'Nómina': 0,
      'Logística': 0,
      'Otros': 0
    };
    filteredExpenses.forEach(e => {
      if (cats[e.category] !== undefined) {
        cats[e.category] += e.amount;
      } else {
        cats['Otros'] += e.amount;
      }
    });
    return cats;
  }, [filteredExpenses]);

  // Totales dinámicos por sede
  const storeTotals = useMemo(() => {
    const stores: Record<string, number> = {
      'República': 0,
      'Ciudad Modelo': 0,
      'Quality': 0,
      'Sede Mariano': 0
    };
    filteredExpenses.forEach(e => {
      if (stores[e.store] !== undefined) {
        stores[e.store] += e.amount;
      } else if (e.store === 'Todas las sedes' || e.store === 'Todas') {
        const quarter = e.amount / 4;
        stores['República'] += quarter;
        stores['Ciudad Modelo'] += quarter;
        stores['Quality'] += quarter;
        stores['Sede Mariano'] += quarter;
      }
    });
    const total = Object.values(stores).reduce((a, b) => a + b, 0) || 1;
    return [
      { name: 'República', amount: stores['República'], pct: Math.round((stores['República'] / total) * 100) },
      { name: 'Ciudad Modelo', amount: stores['Ciudad Modelo'], pct: Math.round((stores['Ciudad Modelo'] / total) * 100) },
      { name: 'Quality', amount: stores['Quality'], pct: Math.round((stores['Quality'] / total) * 100) },
      { name: 'Sede Mariano', amount: stores['Sede Mariano'], pct: Math.round((stores['Sede Mariano'] / total) * 100) },
    ];
  }, [filteredExpenses]);

  // Historial dinámico de meses para la gráfica de 6 meses
  const monthlyHistory = useMemo(() => {
    const months = ['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'];
    const codes = ['06', '07', '08', '09', '10', '11'];
    const monthNames: Record<string, string> = {
      '06': 'Junio', '07': 'Julio', '08': 'Agosto', '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre'
    };
    return months.map((m, idx) => {
      const c = codes[idx];
      const sum = data.expenses
        .filter(e => e.date && e.date.startsWith(`2026-${c}`))
        .reduce((acc, curr) => acc + curr.amount, 0);
      const isSelected = selectedMonth.includes(monthNames[c]);
      return {
        m,
        code: c,
        fullName: `${monthNames[c]} 2026`,
        amount: sum,
        val: sum > 0 ? sum / 1000000 : 15,
        highlight: isSelected
      };
    });
  }, [data.expenses, selectedMonth]);

  // Supplier Debts KPIs
  const filteredSupplierDebts = useMemo(() => {
    return data.supplierDebts.filter(d => {
      const matchStore = selectedStore === 'Todas las sedes' || d.store === selectedStore || d.store === 'Todas';
      const matchSearch = d.supplier.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                          d.concept.toLowerCase().includes(supplierSearch.toLowerCase());
      return matchStore && matchSearch;
    });
  }, [data.supplierDebts, selectedStore, supplierSearch]);

  const totalSupplierDebt = useMemo(() => {
    return filteredSupplierDebts.reduce((acc, curr) => acc + curr.initialDebt, 0);
  }, [filteredSupplierDebts]);

  const totalSupplierAbonado = useMemo(() => {
    return filteredSupplierDebts.reduce((acc, curr) => acc + curr.abonado, 0);
  }, [filteredSupplierDebts]);

  const totalSupplierPending = useMemo(() => {
    return filteredSupplierDebts.reduce((acc, curr) => acc + curr.pendingBalance, 0);
  }, [filteredSupplierDebts]);

  // Bank Debts KPIs
  const filteredBankDebts = useMemo(() => {
    return data.bankDebts.filter(d => {
      return d.bank.toLowerCase().includes(bankSearch.toLowerCase()) ||
             d.debtType.toLowerCase().includes(bankSearch.toLowerCase());
    });
  }, [data.bankDebts, bankSearch]);

  const totalBankDebt = useMemo(() => {
    return filteredBankDebts.reduce((acc, curr) => acc + curr.totalAmount, 0);
  }, [filteredBankDebts]);

  const totalBankAbonado = useMemo(() => {
    return filteredBankDebts.reduce((acc, curr) => acc + curr.abonado, 0);
  }, [filteredBankDebts]);

  const totalBankPending = useMemo(() => {
    return filteredBankDebts.reduce((acc, curr) => acc + curr.pendingBalance, 0);
  }, [filteredBankDebts]);

  const totalBankMonthlyQuota = useMemo(() => {
    return filteredBankDebts.reduce((acc, curr) => acc + curr.monthlyQuota, 0);
  }, [filteredBankDebts]);

  // Receivables KPIs
  const filteredReceivables = useMemo(() => {
    return data.receivables.filter(r => {
      const matchStore = selectedStore === 'Todas las sedes' || r.store === selectedStore || r.store === 'Todas las sedes';
      const matchSearch = r.debtor.toLowerCase().includes(receivableSearch.toLowerCase()) ||
                          r.concept.toLowerCase().includes(receivableSearch.toLowerCase());
      return matchStore && matchSearch;
    });
  }, [data.receivables, selectedStore, receivableSearch]);

  const totalReceivables = useMemo(() => {
    return filteredReceivables.reduce((acc, curr) => acc + curr.totalAmount, 0);
  }, [filteredReceivables]);

  const totalReceivablesRecovered = useMemo(() => {
    return filteredReceivables.reduce((acc, curr) => acc + curr.abonado, 0);
  }, [filteredReceivables]);

  const totalReceivablesPending = useMemo(() => {
    return filteredReceivables.reduce((acc, curr) => acc + curr.pendingBalance, 0);
  }, [filteredReceivables]);

  // Calendar KPIs
  const calendarTotalMonth = 21390000;
  const calendarPaid = 5389000;
  const calendarPending = 14201000;
  const calendarVencidos = 1800000;

  // Handlers
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.concept || expenseForm.amount <= 0) {
      Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingresa un concepto y un monto válido.' });
      return;
    }
    FinancialService.addExpense(expenseForm);
    refreshData();
    setIsExpenseModalOpen(false);
    setExpenseForm({
      concept: '',
      category: 'Arriendo',
      store: 'República',
      amount: 0,
      date: '2026-11-21',
      status: 'Pagado',
      notes: ''
    });
    Swal.fire({ icon: 'success', title: 'Gasto registrado', text: 'El gasto se guardó correctamente.', timer: 1500, showConfirmButton: false });
  };

  const handleCreateSupplierDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierDebtForm.supplier || supplierDebtForm.initialDebt <= 0) {
      Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingresa el nombre del proveedor y la deuda inicial.' });
      return;
    }
    FinancialService.addSupplierDebt(supplierDebtForm);
    refreshData();
    setIsSupplierDebtModalOpen(false);
    setSupplierDebtForm({
      supplier: '',
      concept: '',
      store: 'República',
      initialDebt: 0,
      abonado: 0,
      dueDate: '2026-11-30'
    });
    Swal.fire({ icon: 'success', title: 'Deuda registrada', text: 'La deuda del proveedor fue guardada.', timer: 1500, showConfirmButton: false });
  };

  const handleSaveSupplierAbono = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierDebt || abonoForm.amount <= 0) return;
    if (abonoForm.amount > selectedSupplierDebt.pendingBalance) {
      Swal.fire({ icon: 'warning', title: 'Monto excesivo', text: 'El abono no puede superar el saldo pendiente.' });
      return;
    }
    FinancialService.recordSupplierAbono(selectedSupplierDebt.id, abonoForm.amount, abonoForm.paymentMethod, abonoForm.notes);
    refreshData();
    setIsSupplierAbonoModalOpen(false);
    setSelectedSupplierDebt(null);
    setAbonoForm({ amount: 0, paymentMethod: 'Transferencia Bancolombia', notes: '' });
    Swal.fire({ icon: 'success', title: 'Abono registrado', text: 'Saldo recalculado en tiempo real.', timer: 1500, showConfirmButton: false });
  };

  const handleCreateBankDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankDebtForm.bank || bankDebtForm.totalAmount <= 0) {
      Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingresa el banco y el valor total.' });
      return;
    }
    FinancialService.addBankDebt(bankDebtForm);
    refreshData();
    setIsBankDebtModalOpen(false);
    setBankDebtForm({
      bank: 'Bancolombia',
      debtType: 'Préstamo comercial',
      totalAmount: 0,
      abonado: 0,
      monthlyQuota: 0,
      dueDate: '2026-11-25'
    });
    Swal.fire({ icon: 'success', title: 'Deuda bancaria registrada', text: 'Obligación bancaria registrada.', timer: 1500, showConfirmButton: false });
  };

  const handleSaveBankQuota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankDebt || abonoForm.amount <= 0) return;
    FinancialService.recordBankQuotaPayment(selectedBankDebt.id, abonoForm.amount, abonoForm.paymentMethod, abonoForm.notes);
    refreshData();
    setIsBankQuotaModalOpen(false);
    setSelectedBankDebt(null);
    setAbonoForm({ amount: 0, paymentMethod: 'Transferencia Bancolombia', notes: '' });
    Swal.fire({ icon: 'success', title: 'Pago registrado', text: 'Se registró el pago de cuota bancaria.', timer: 1500, showConfirmButton: false });
  };

  const handleCreateReceivable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivableForm.debtor || receivableForm.totalAmount <= 0) {
      Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingresa el deudor y el monto total.' });
      return;
    }
    FinancialService.addReceivable(receivableForm);
    refreshData();
    setIsReceivableModalOpen(false);
    setReceivableForm({
      debtor: '',
      concept: '',
      store: 'República',
      totalAmount: 0,
      abonado: 0,
      createdDate: '2026-11-21',
      dueDate: '2026-11-30'
    });
    Swal.fire({ icon: 'success', title: 'Cuenta por cobrar registrada', text: 'Cliente o tercero registrado.', timer: 1500, showConfirmButton: false });
  };

  const handleSaveReceivableAbono = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable || abonoForm.amount <= 0) return;
    FinancialService.recordReceivableAbono(selectedReceivable.id, abonoForm.amount, abonoForm.paymentMethod, abonoForm.notes);
    refreshData();
    setIsReceivableAbonoModalOpen(false);
    setSelectedReceivable(null);
    setAbonoForm({ amount: 0, paymentMethod: 'Transferencia Bancolombia', notes: '' });
    Swal.fire({ icon: 'success', title: 'Cobro registrado', text: 'Abono recuperado con éxito.', timer: 1500, showConfirmButton: false });
  };

  const handleCreateRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recurringForm.title || recurringForm.amount <= 0) return;
    FinancialService.addRecurringExpense({ ...recurringForm, isActive: true });
    refreshData();
    setIsRecurringModalOpen(false);
    setRecurringForm({ title: '', period: 'Mensual', nextDue: '01 Dic', amount: 0 });
    Swal.fire({ icon: 'success', title: 'Gasto recurrente creado', text: 'Se activará automáticamente cada período.', timer: 1500, showConfirmButton: false });
  };

  const handleDeleteExpense = (id: string) => {
    Swal.fire({
      title: '¿Eliminar este gasto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    }).then(res => {
      if (res.isConfirmed) {
        FinancialService.deleteExpense(id);
        refreshData();
      }
    });
  };

  const handleDeleteSupplierDebt = (id: string) => {
    Swal.fire({
      title: '¿Eliminar deuda con proveedor?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    }).then(res => {
      if (res.isConfirmed) {
        FinancialService.deleteSupplierDebt(id);
        refreshData();
      }
    });
  };

  const handleDeleteReceivable = (id: string) => {
    Swal.fire({
      title: '¿Eliminar cuenta por cobrar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    }).then(res => {
      if (res.isConfirmed) {
        FinancialService.deleteReceivable(id);
        refreshData();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* =========================================================================
          ENCABEZADO GLOBAL CONTROL FINANCIERO
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Landmark className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-gray-900 tracking-tight">Control Financiero</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Gestión Integral
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {activeTab === 'resumen' && 'Administra tus gastos, deudas, cuentas por cobrar y flujo de caja de todas tus sedes.'}
                {activeTab === 'gastos' && 'Gastos Mensuales · Registra, categoriza y controla todos los gastos del mes por sede.'}
                {activeTab === 'proveedores' && 'Deudas a Proveedores · Registra, controla y realiza abonos a tus proveedores.'}
                {activeTab === 'bancos' && 'Deudas Bancarias · Administra tus créditos, préstamos y obligaciones con entidades financieras.'}
                {activeTab === 'cobrar' && 'Cuentas por Cobrar · Administra el dinero que te deben clientes, terceros o aliados comerciales.'}
                {activeTab === 'calendario' && 'Calendario de Pagos · Controla y organiza todos tus pagos, vencimientos y cobros en un solo lugar.'}
                {activeTab === 'reportes' && 'Reportes Financieros · Balances consolidados, flujo neto y estados comparativos.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer hover:bg-gray-100"
            >
              <option value="Noviembre 2026">Noviembre 2026 (Mes Actual)</option>
              <option value="Octubre 2026">Octubre 2026</option>
              <option value="Septiembre 2026">Septiembre 2026</option>
              <option value="Agosto 2026">Agosto 2026</option>
              <option value="Julio 2026">Julio 2026</option>
              <option value="Junio 2026">Junio 2026</option>
              <option value="Mayo 2026">Mayo 2026</option>
              <option value="Abril 2026">Abril 2026</option>
              <option value="Marzo 2026">Marzo 2026</option>
              <option value="Febrero 2026">Febrero 2026</option>
              <option value="Enero 2026">Enero 2026</option>
              <option value="Diciembre 2026">Diciembre 2026</option>
              <option value="Año Completo 2026 (Consolidado)">Año Completo 2026 (Consolidado)</option>
            </select>

            <select
              value={selectedStore}
              onChange={e => setSelectedStore(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer hover:bg-gray-100"
            >
              <option value="Todas las sedes">Todas las sedes (Consolidado)</option>
              <option value="República">Sede República</option>
              <option value="Ciudad Modelo">Sede Ciudad Modelo</option>
              <option value="Quality">Sede Quality</option>
              <option value="Sede Mariano">Sede Mariano</option>
            </select>

            {activeTab === 'resumen' && (
              <button
                onClick={() => setIsActionChoiceModalOpen(true)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Registrar movimiento
              </button>
            )}

            {activeTab === 'gastos' && (
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Registrar gasto
              </button>
            )}

            {activeTab === 'proveedores' && (
              <button
                onClick={() => setIsSupplierDebtModalOpen(true)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Registrar deuda
              </button>
            )}

            {activeTab === 'bancos' && (
              <button
                onClick={() => setIsBankDebtModalOpen(true)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Registrar deuda
              </button>
            )}

            {activeTab === 'cobrar' && (
              <button
                onClick={() => setIsReceivableModalOpen(true)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Registrar cuenta por cobrar
              </button>
            )}

            {activeTab === 'calendario' && (
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Registrar pago
              </button>
            )}

            {activeTab === 'reportes' && (
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir reporte
              </button>
            )}
          </div>
        </div>

        {/* Barra de pestañas horizontal */}
        <div className="flex items-center gap-1.5 mt-5 pt-3 border-t border-gray-100 overflow-x-auto custom-scrollbar text-xs">
          {[
            { id: 'resumen', label: 'Resumen', icon: TrendingUp },
            { id: 'gastos', label: 'Gastos mensuales', icon: DollarSign },
            { id: 'proveedores', label: 'Deudas proveedores', icon: Package },
            { id: 'bancos', label: 'Deudas bancarias', icon: Landmark },
            { id: 'cobrar', label: 'Cuentas por cobrar', icon: HandCoins },
            { id: 'calendario', label: 'Calendario de pagos', icon: CalendarCheck },
            { id: 'reportes', label: 'Reportes', icon: BarChart3 },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-semibold'
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: RESUMEN FINANCIERO
          ========================================================================= */}
      {activeTab === 'resumen' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 5 KPIs Principales */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Gastos del mes</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalExpenses)}</p>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                ▲ +8.2% vs. mes anterior
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Deuda a proveedores</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalSupplierDebt)}</p>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                Saldo: {formatCOP(totalSupplierPending)}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Deuda bancaria</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalBankDebt)}</p>
              <span className="text-[10px] font-bold text-gray-500 mt-1 inline-block">
                3 entidades activas
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Por cobrar (a mí)</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <HandCoins className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalReceivables)}</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                Recuperado: {formatCOP(totalReceivablesRecovered)}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Flujo de caja del mes</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">$6.240.000</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                Positivo
              </span>
            </div>
          </div>

          {/* Fila Central: Flujo de caja, Distribución y Próximos vencimientos */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Flujo de caja Chart */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Flujo de caja ({selectedMonth})</h3>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500 font-bold">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Entradas (Ventas, abonos)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block"></span> Salidas (Gastos, pagos)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-900 inline-block"></span> Saldo acumulado</span>
                  </div>
                </div>
              </div>

              {/* SVG Flujo de Caja */}
              <div className="pt-2 relative">
                <div className="absolute top-2 right-10 bg-emerald-900 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow">
                  $6.240.000
                </div>
                <svg viewBox="0 0 320 140" className="w-full h-36 overflow-visible">
                  {/* Grid lines */}
                  {[0, 10, 20, 30, 40].map(v => {
                    const y = 115 - (v / 40) * 95;
                    return (
                      <g key={v}>
                        <line x1="25" y1={y} x2="315" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                        <text x="20" y={y + 3} textAnchor="end" fontSize="8" fill="#9ca3af" fontWeight="bold">{v}M</text>
                      </g>
                    );
                  })}

                  {/* Bars Sem 1 - 4 */}
                  {[
                    { sem: 'Sem 1', x: 50, inVal: 24, outVal: 18, balanceY: 85 },
                    { sem: 'Sem 2', x: 120, inVal: 28, outVal: 20, balanceY: 76 },
                    { sem: 'Sem 3', x: 190, inVal: 32, outVal: 22, balanceY: 68 },
                    { sem: 'Sem 4', x: 260, inVal: 35, outVal: 23, balanceY: 58 }
                  ].map(item => {
                    const hIn = (item.inVal / 40) * 95;
                    const hOut = (item.outVal / 40) * 95;
                    return (
                      <g key={item.sem}>
                        {/* Entradas bar */}
                        <rect x={item.x - 12} y={115 - hIn} width="11" height={hIn} rx="3" fill="#059669" />
                        {/* Salidas bar */}
                        <rect x={item.x + 1} y={115 - hOut} width="11" height={hOut} rx="3" fill="#cbd5e1" />
                        <text x={item.x} y="130" textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="bold">{item.sem}</text>
                      </g>
                    );
                  })}

                  {/* Line Trend Saldo */}
                  <polyline
                    points="50,85 120,76 190,68 260,58"
                    fill="none"
                    stroke="#064e3b"
                    strokeWidth="2.5"
                  />
                  {[
                    { x: 50, y: 85 },
                    { x: 120, y: 76 },
                    { x: 190, y: 68 },
                    { x: 260, y: 58 }
                  ].map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#064e3b" stroke="#ffffff" strokeWidth="1.5" />
                  ))}
                </svg>
              </div>
            </div>

            {/* Donut Distribución de Gastos */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900">Distribución de gastos</h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
                {/* SVG Donut */}
                <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
                    {/* Arriendo 34% */}
                    <circle cx="50" cy="50" r="38" stroke="#047857" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="0" />
                    {/* Servicios 14% */}
                    <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="157.5" />
                    {/* Nómina 18% */}
                    <circle cx="50" cy="50" r="38" stroke="#34d399" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="114.6" />
                    {/* Logística 7% */}
                    <circle cx="50" cy="50" r="38" stroke="#06b6d4" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="71.6" />
                    {/* Otros 27% */}
                    <circle cx="50" cy="50" r="38" stroke="#94a3b8" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="54.9" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-black text-gray-900 leading-tight">{formatCOP(totalExpenses)}</span>
                    <span className="text-[8px] font-bold text-gray-400">Total {selectedMonth.includes('Año') ? 'del año' : 'del mes'}</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-1.5 text-[11px] w-full">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span> Arriendo
                    </span>
                    <span className="font-bold text-gray-900">
                      {totalExpenses > 0 ? Math.round((categoryTotals['Arriendo'] / totalExpenses) * 100) : 0}% <span className="text-gray-400 font-normal">· {formatCOP(categoryTotals['Arriendo'])}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Servicios públicos
                    </span>
                    <span className="font-bold text-gray-900">
                      {totalExpenses > 0 ? Math.round((categoryTotals['Servicios públicos'] / totalExpenses) * 100) : 0}% <span className="text-gray-400 font-normal">· {formatCOP(categoryTotals['Servicios públicos'])}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Nómina
                    </span>
                    <span className="font-bold text-gray-900">
                      {totalExpenses > 0 ? Math.round((categoryTotals['Nómina'] / totalExpenses) * 100) : 0}% <span className="text-gray-400 font-normal">· {formatCOP(categoryTotals['Nómina'])}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Logística
                    </span>
                    <span className="font-bold text-gray-900">
                      {totalExpenses > 0 ? Math.round((categoryTotals['Logística'] / totalExpenses) * 100) : 0}% <span className="text-gray-400 font-normal">· {formatCOP(categoryTotals['Logística'])}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Otros
                    </span>
                    <span className="font-bold text-gray-900">
                      {totalExpenses > 0 ? Math.round((categoryTotals['Otros'] / totalExpenses) * 100) : 0}% <span className="text-gray-400 font-normal">· {formatCOP(categoryTotals['Otros'])}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Próximos Vencimientos */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-emerald-700" /> Próximos vencimientos
                  </h3>
                  <button onClick={() => setActiveTab('calendario')} className="text-[10px] font-bold text-emerald-700 hover:underline">
                    Ver todo &gt;
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Landmark className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block leading-tight">Cuota bancaria</span>
                        <span className="text-[10px] text-gray-400">25 Nov 2026</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-gray-900 block">$1.250.000</span>
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">En 4 días</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block leading-tight">Proveedor Open Mind</span>
                        <span className="text-[10px] text-gray-400">28 Nov 2026</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-gray-900 block">$2.400.000</span>
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">En 7 días</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block leading-tight">Arriendo Sede República</span>
                        <span className="text-[10px] text-gray-400">01 Dic 2026</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-gray-900 block">$1.800.000</span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">En 10 días</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('calendario')}
                className="w-full mt-3 py-2 bg-gray-50 hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" /> Ver calendario completo
              </button>
            </div>
          </div>

          {/* Fila Inferior: Estado general por concepto y Sedes - Gastos */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Estado general por concepto */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900">Estado general por concepto</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                      <th className="py-2">Concepto</th>
                      <th className="py-2 text-right">Total</th>
                      <th className="py-2 text-right">Pagado</th>
                      <th className="py-2 text-right">Pendiente</th>
                      <th className="py-2 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-2.5 flex items-center gap-2 font-bold text-gray-900">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> Gastos mensuales
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold">{formatCOP(totalExpenses)}</td>
                      <td className="py-2.5 text-right font-mono text-emerald-700">{formatCOP(paidExpenses)}</td>
                      <td className="py-2.5 text-right font-mono text-red-600 font-bold">{formatCOP(pendingExpenses)}</td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pendingExpenses === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {pendingExpenses === 0 ? 'Al día' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50/50">
                      <td className="py-2.5 flex items-center gap-2 font-bold text-gray-900">
                        <Package className="w-3.5 h-3.5 text-purple-700" /> Deuda a proveedores
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold">$12.200.000</td>
                      <td className="py-2.5 text-right font-mono text-emerald-700">$0</td>
                      <td className="py-2.5 text-right font-mono text-red-600 font-bold">$12.200.000</td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Pendiente
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50/50">
                      <td className="py-2.5 flex items-center gap-2 font-bold text-gray-900">
                        <Landmark className="w-3.5 h-3.5 text-blue-700" /> Deuda bancaria
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold">$35.000.000</td>
                      <td className="py-2.5 text-right font-mono text-emerald-700">$10.000.000</td>
                      <td className="py-2.5 text-right font-mono text-gray-900 font-bold">$25.000.000</td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Vigente
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50/50">
                      <td className="py-2.5 flex items-center gap-2 font-bold text-gray-900">
                        <HandCoins className="w-3.5 h-3.5 text-teal-700" /> Cuentas por cobrar
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold">$8.500.000</td>
                      <td className="py-2.5 text-right font-mono text-emerald-700">$2.000.000</td>
                      <td className="py-2.5 text-right font-mono text-blue-700 font-bold">$6.500.000</td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          Por cobrar
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sedes - Gastos del mes */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-extrabold text-gray-900">Sedes – Gastos {selectedMonth.includes('Año') ? 'del año' : 'del mes'}</h3>
                <button onClick={() => setActiveTab('gastos')} className="text-[10px] font-bold text-emerald-700 hover:underline">
                  Ver detalle &gt;
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {storeTotals.map(store => (
                  <div key={store.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-800">{store.name}</span>
                      <span className="text-gray-900 font-mono">{formatCOP(store.amount)} <span className="text-gray-400 font-normal">({store.pct}%)</span></span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-800 rounded-full" style={{ width: `${store.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-gray-200/80 flex items-center justify-between group transition-all text-left shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">Registrar gasto</h4>
                  <p className="text-[11px] text-gray-500">Arriendo, servicios, nómina, etc.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => setIsSupplierDebtModalOpen(true)}
              className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-gray-200/80 flex items-center justify-between group transition-all text-left shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">Registrar deuda</h4>
                  <p className="text-[11px] text-gray-500">Proveedor o banco</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-700 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => setIsReceivableModalOpen(true)}
              className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-gray-200/80 flex items-center justify-between group transition-all text-left shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <HandCoins className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">Registrar cuenta por cobrar</h4>
                  <p className="text-[11px] text-gray-500">Clientes o terceros</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-700 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GASTOS MENSUALES
          ========================================================================= */}
      {activeTab === 'gastos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 4 KPIs de Gastos */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Total gastos del mes</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalExpenses)}</p>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                ▲ +8.2% vs. mes anterior
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Gastos pagados</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(paidExpenses)}</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                {totalExpenses > 0 ? Math.round((paidExpenses / totalExpenses) * 100) : 31}% del total
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Gastos pendientes</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(pendingExpenses)}</p>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                {totalExpenses > 0 ? Math.round((pendingExpenses / totalExpenses) * 100) : 69}% del total
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Gastos recurrentes</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(recurringTotal)}</p>
              <span className="text-[10px] font-bold text-gray-500 mt-1 inline-block">
                {data.recurringExpenses.length} registros activos
              </span>
            </div>
          </div>

          {/* Fila Media: Donut, Gráfico últimos 6 meses, Gastos por sede */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Donut Distribución */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900">Distribución por categoría</h3>
              <div className="flex items-center justify-center pt-2">
                <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
                    <circle cx="50" cy="50" r="38" stroke="#047857" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="157.5" />
                    <circle cx="50" cy="50" r="38" stroke="#34d399" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="114.6" />
                    <circle cx="50" cy="50" r="38" stroke="#06b6d4" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="71.6" />
                    <circle cx="50" cy="50" r="38" stroke="#94a3b8" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="54.9" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-black text-gray-900 leading-tight">{formatCOP(totalExpenses)}</span>
                    <span className="text-[8px] font-bold text-gray-400">Total {selectedMonth.includes('Año') ? 'del año' : 'del mes'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 text-[11px] pt-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-700"></span> Arriendo
                  </span>
                  <span className="font-bold text-gray-900">
                    {totalExpenses > 0 ? Math.round((categoryTotals['Arriendo'] / totalExpenses) * 100) : 0}% <span className="text-gray-400 font-normal">· {formatCOP(categoryTotals['Arriendo'])}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Servicios públicos
                  </span>
                  <span className="font-bold text-gray-900">
                    {totalExpenses > 0 ? Math.round((categoryTotals['Servicios públicos'] / totalExpenses) * 100) : 0}% <span className="text-gray-400 font-normal">· {formatCOP(categoryTotals['Servicios públicos'])}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Nómina
                  </span>
                  <span className="font-bold text-gray-900">
                    {totalExpenses > 0 ? Math.round((categoryTotals['Nómina'] / totalExpenses) * 100) : 0}% <span className="text-gray-400 font-normal">· {formatCOP(categoryTotals['Nómina'])}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Logística
                  </span>
                  <span className="font-bold text-gray-900">
                    {totalExpenses > 0 ? Math.round((categoryTotals['Logística'] / totalExpenses) * 100) : 0}% <span className="text-gray-400 font-normal">· {formatCOP(categoryTotals['Logística'])}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> Otros
                  </span>
                  <span className="font-bold text-gray-900">
                    {totalExpenses > 0 ? Math.round((categoryTotals['Otros'] / totalExpenses) * 100) : 0}% <span className="text-gray-400 font-normal">· {formatCOP(categoryTotals['Otros'])}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Gastos Mensuales (Últimos 6 meses) Bar Chart */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900">Gastos mensuales (Últimos 6 meses)</h3>
              <div className="relative pt-2">
                <div className="absolute top-1 right-4 bg-emerald-900 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded shadow">
                  {formatCOP(totalExpenses)}
                </div>
                <svg viewBox="0 0 320 140" className="w-full h-44 overflow-visible">
                  {[0, 5, 10, 15, 20, 25].map(v => {
                    const y = 115 - (v / 25) * 95;
                    return (
                      <g key={v}>
                        <line x1="25" y1={y} x2="310" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                        <text x="20" y={y + 3} textAnchor="end" fontSize="8" fill="#9ca3af" fontWeight="bold">{v}M</text>
                      </g>
                    );
                  })}

                  {monthlyHistory.map((item, idx) => {
                    const xs = [45, 92, 139, 186, 233, 280];
                    const x = xs[idx];
                    const h = Math.min(95, Math.max(10, (item.val / 25) * 95));
                    return (
                      <g
                        key={item.m}
                        className="cursor-pointer group"
                        onClick={() => setSelectedMonth(item.fullName)}
                      >
                        <rect
                          x={x - 10}
                          y={115 - h}
                          width="20"
                          height={h}
                          rx="4"
                          fill={item.highlight ? '#064e3b' : '#a7f3d0'}
                          className="transition-all hover:opacity-80"
                        />
                        <text x={x} y="130" textAnchor="middle" fontSize="9" fill={item.highlight ? '#064e3b' : '#64748b'} fontWeight="bold">
                          {item.m}
                        </text>
                      </g>
                    );
                  })}

                  <polyline
                    points="45,60 92,57 139,54 186,55 233,53 280,48"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2"
                  />
                  {[45, 92, 139, 186, 233, 280].map((x, i) => (
                    <circle key={i} cx={x} cy={[60, 57, 54, 55, 53, 48][i]} r="3" fill="#059669" stroke="#fff" strokeWidth="1.5" />
                  ))}
                </svg>
              </div>
            </div>

            {/* Gastos por Sede */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900">Gastos por sede ({selectedMonth})</h3>
              <div className="space-y-3 pt-2">
                {storeTotals.map(store => (
                  <div key={store.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" /> {store.name}
                      </span>
                      <span className="text-gray-900 font-mono">{formatCOP(store.amount)} <span className="text-gray-400 font-normal">({store.pct}%)</span></span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-800 rounded-full" style={{ width: `${store.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fila Inferior: Tabla Detalle de Gastos + Gastos Recurrentes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Tabla Detalle */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <h3 className="text-sm font-extrabold text-gray-900">Detalle de gastos – {selectedMonth}</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar gasto..."
                      value={expenseSearch}
                      onChange={e => setExpenseSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold outline-none w-44"
                    />
                  </div>
                  <select
                    value={expenseFilterCategory}
                    onChange={e => setExpenseFilterCategory(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 outline-none cursor-pointer"
                  >
                    <option value="Todas">Filtros: Categoría</option>
                    <option value="Arriendo">Arriendo</option>
                    <option value="Servicios públicos">Servicios públicos</option>
                    <option value="Internet">Internet</option>
                    <option value="Nómina">Nómina</option>
                    <option value="Logística">Logística</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto max-h-96 custom-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                      <th className="py-2">Fecha</th>
                      <th className="py-2">Concepto</th>
                      <th className="py-2">Categoría</th>
                      <th className="py-2">Sede</th>
                      <th className="py-2 text-right">Monto</th>
                      <th className="py-2 text-center">Estado</th>
                      <th className="py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                    {filteredExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                          {exp.date.split('-').reverse().join('/')}
                        </td>
                        <td className="py-2.5 font-bold text-gray-900">{exp.concept}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-600">{exp.store}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-gray-900">{formatCOP(exp.amount)}</td>
                        <td className="py-2.5 text-center">
                          <button
                            onClick={() => {
                              FinancialService.toggleExpenseStatus(exp.id);
                              refreshData();
                            }}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                              exp.status === 'Pagado'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            {exp.status === 'Pagado' ? '✓ Pagado' : '⏳ Pendiente'}
                          </button>
                        </td>
                        <td className="py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-400">
                            <button
                              onClick={() => Swal.fire({ title: exp.concept, html: `<div class="text-xs text-left"><b>Monto:</b> ${formatCOP(exp.amount)}<br><b>Sede:</b> ${exp.store}<br><b>Fecha:</b> ${exp.date}<br><b>Notas:</b> ${exp.notes || 'Sin notas'}</div>` })}
                              className="p-1 hover:text-emerald-700 cursor-pointer"
                              title="Ver detalle"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1 hover:text-red-600 cursor-pointer"
                              title="Eliminar gasto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gastos Recurrentes */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                  <h3 className="text-sm font-extrabold text-gray-900">Gastos recurrentes</h3>
                  <button onClick={() => setIsRecurringModalOpen(true)} className="text-[10px] font-bold text-emerald-700 hover:underline">
                    Gestionar &gt;
                  </button>
                </div>

                <div className="space-y-2.5">
                  {data.recurringExpenses.map(rec => (
                    <div key={rec.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                          {rec.title.includes('Arriendo') && <Building2 className="w-4 h-4" />}
                          {rec.title.includes('Servicios') && <DollarSign className="w-4 h-4" />}
                          {rec.title.includes('Internet') && <BarChart3 className="w-4 h-4" />}
                          {rec.title.includes('Nómina') && <Users className="w-4 h-4" />}
                          {!rec.title.includes('Arriendo') && !rec.title.includes('Servicios') && !rec.title.includes('Internet') && !rec.title.includes('Nómina') && <DollarSign className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-900 block leading-tight">{rec.title}</span>
                          <span className="text-[10px] text-gray-400">{rec.period} · Próximo: {rec.nextDue}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-black text-gray-900">{formatCOP(rec.amount)}</span>
                        {/* Custom Switch */}
                        <button
                          onClick={() => {
                            FinancialService.toggleRecurringExpense(rec.id);
                            refreshData();
                          }}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                            rec.isActive ? 'bg-emerald-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              rec.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsRecurringModalOpen(true)}
                className="w-full mt-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Nuevo gasto recurrente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: DEUDAS PROVEEDORES
          ========================================================================= */}
      {activeTab === 'proveedores' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 4 KPIs Proveedores */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Deuda total con proveedores</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalSupplierDebt)}</p>
              <span className="text-[10px] font-bold text-gray-500 mt-1 inline-block">Monto compras a crédito</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Total abonado</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalSupplierAbonado)}</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                {totalSupplierDebt > 0 ? Math.round((totalSupplierAbonado / totalSupplierDebt) * 100) : 39}% del total
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Saldo pendiente</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalSupplierPending)}</p>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                {totalSupplierDebt > 0 ? Math.round((totalSupplierPending / totalSupplierDebt) * 100) : 61}% del total
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Proveedores activos</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{filteredSupplierDebts.length}</p>
              <span className="text-[10px] font-bold text-gray-500 mt-1 inline-block">Con saldo por pagar</span>
            </div>
          </div>

          {/* Tabla Deudas por Proveedor + Lateral Donut / Próximos Pagos */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Tabla */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <h3 className="text-sm font-extrabold text-gray-900">Deudas por proveedor</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar proveedor..."
                      value={supplierSearch}
                      onChange={e => setSupplierSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold outline-none w-48"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto max-h-96 custom-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                      <th className="py-2">Proveedor</th>
                      <th className="py-2">Concepto</th>
                      <th className="py-2">Sede</th>
                      <th className="py-2 text-right">Deuda inicial</th>
                      <th className="py-2 text-right">Abonado</th>
                      <th className="py-2 text-right">Saldo pendiente</th>
                      <th className="py-2">Vencimiento</th>
                      <th className="py-2 text-center">Estado</th>
                      <th className="py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                    {filteredSupplierDebts.map(debt => {
                      const pct = debt.initialDebt > 0 ? Math.round((debt.abonado / debt.initialDebt) * 100) : 0;
                      return (
                        <tr key={debt.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
                              <Package className="w-3 h-3" />
                            </div>
                            {debt.supplier}
                          </td>
                          <td className="py-2.5 text-gray-600 text-[11px]">{debt.concept}</td>
                          <td className="py-2.5 text-gray-500">{debt.store}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-gray-900">{formatCOP(debt.initialDebt)}</td>
                          <td className="py-2.5 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-mono text-emerald-700 font-bold">{formatCOP(debt.abonado)}</span>
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${pct}%` }}></div>
                              </div>
                              <span className="text-[9px] text-gray-400 font-mono">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold text-red-600">{formatCOP(debt.pendingBalance)}</td>
                          <td className="py-2.5 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                            {debt.dueDate.split('-').reverse().join('/')}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              debt.status === 'Pagada' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {debt.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {debt.pendingBalance > 0 && (
                                <button
                                  onClick={() => {
                                    setSelectedSupplierDebt(debt);
                                    setAbonoForm({ amount: 0, paymentMethod: 'Transferencia Bancolombia', notes: '' });
                                    setIsSupplierAbonoModalOpen(true);
                                  }}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold cursor-pointer"
                                >
                                  + Abono
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteSupplierDebt(debt.id)}
                                className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                                title="Eliminar deuda"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lateral Donut & Próximos Pagos */}
            <div className="lg:col-span-4 space-y-5">
              {/* Donut Distribución de la deuda */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-extrabold text-gray-900">Distribución de la deuda</h3>
                <div className="flex items-center justify-center pt-2">
                  <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
                      <circle cx="50" cy="50" r="38" stroke="#047857" strokeWidth="14" fill="transparent"
                        strokeDasharray="238.76" strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="14" fill="transparent"
                        strokeDasharray="238.76" strokeDashoffset="140.8" />
                      <circle cx="50" cy="50" r="38" stroke="#34d399" strokeWidth="14" fill="transparent"
                        strokeDasharray="238.76" strokeDashoffset="78.7" />
                      <circle cx="50" cy="50" r="38" stroke="#6ee7b7" strokeWidth="14" fill="transparent"
                        strokeDasharray="238.76" strokeDashoffset="31.0" />
                      <circle cx="50" cy="50" r="38" stroke="#94a3b8" strokeWidth="14" fill="transparent"
                        strokeDasharray="238.76" strokeDashoffset="7.1" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[11px] font-black text-gray-900 leading-tight">$12.200.000</span>
                      <span className="text-[8px] font-bold text-gray-400">Total deuda</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] pt-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-800"></span> Open Mind
                    </span>
                    <span className="font-bold text-gray-900">41%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Pedro Liliana
                    </span>
                    <span className="font-bold text-gray-900">26%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-300"></span> Juliana Impacto
                    </span>
                    <span className="font-bold text-gray-900">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-200"></span> Trend Textil
                    </span>
                    <span className="font-bold text-gray-900">10%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Urban Clothes
                    </span>
                    <span className="font-bold text-gray-900">3%</span>
                  </div>
                </div>
              </div>

              {/* Próximos Pagos */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-emerald-700" /> Próximos pagos
                  </h3>
                  <button onClick={() => setActiveTab('calendario')} className="text-[10px] font-bold text-emerald-700 hover:underline">
                    Ver calendario &gt;
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">Open Mind</span>
                      <span className="text-[10px] text-gray-500">$3.350.000 · 28 Nov 2026</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">En 7 días</span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">Pedro Liliana</span>
                      <span className="text-[10px] text-gray-500">$2.200.000 · 30 Nov 2026</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">En 9 días</span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">Juliana Impacto</span>
                      <span className="text-[10px] text-gray-500">$1.600.000 · 05 Dic 2026</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">En 14 días</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const pendingFirst = data.supplierDebts.find(d => d.pendingBalance > 0);
                    if (pendingFirst) {
                      setSelectedSupplierDebt(pendingFirst);
                      setIsSupplierAbonoModalOpen(true);
                    } else {
                      Swal.fire({ icon: 'info', title: 'Sin deudas pendientes', text: 'No hay deudas con saldo pendiente.' });
                    }
                  }}
                  className="w-full mt-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Registrar abono
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: DEUDAS BANCARIAS
          ========================================================================= */}
      {activeTab === 'bancos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 4 KPIs Bancos */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Deuda total bancaria</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalBankDebt)}</p>
              <span className="text-[10px] font-bold text-gray-500 mt-1 inline-block">Obligaciones financieras</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Total abonado</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalBankAbonado)}</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                {totalBankDebt > 0 ? Math.round((totalBankAbonado / totalBankDebt) * 100) : 29}% del total
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Saldo pendiente</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalBankPending)}</p>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                {totalBankDebt > 0 ? Math.round((totalBankPending / totalBankDebt) * 100) : 71}% del total
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Cuotas del mes</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalBankMonthlyQuota)}</p>
              <span className="text-[10px] font-bold text-gray-500 mt-1 inline-block">1 cuota programada</span>
            </div>
          </div>

          {/* Tabla Bancaria y Composición */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Tabla Deudas Bancarias */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <h3 className="text-sm font-extrabold text-gray-900">Deudas bancarias registradas</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar deuda bancaria..."
                      value={bankSearch}
                      onChange={e => setBankSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold outline-none w-52"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto max-h-96 custom-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                      <th className="py-2">Entidad bancaria</th>
                      <th className="py-2">Tipo de deuda</th>
                      <th className="py-2 text-right">Valor total</th>
                      <th className="py-2 text-right">Abonado</th>
                      <th className="py-2 text-right">Saldo pendiente</th>
                      <th className="py-2 text-right">Cuota mensual</th>
                      <th className="py-2">Vencimiento</th>
                      <th className="py-2 text-center">Estado</th>
                      <th className="py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                    {filteredBankDebts.map(bank => {
                      const pct = bank.totalAmount > 0 ? Math.round((bank.abonado / bank.totalAmount) * 100) : 0;
                      return (
                        <tr key={bank.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            {bank.bank}
                          </td>
                          <td className="py-2.5 text-gray-600 text-[11px]">{bank.debtType}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-gray-900">{formatCOP(bank.totalAmount)}</td>
                          <td className="py-2.5 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-mono text-emerald-700 font-bold">{formatCOP(bank.abonado)}</span>
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${pct}%` }}></div>
                              </div>
                              <span className="text-[9px] text-gray-400 font-mono">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold text-red-600">{formatCOP(bank.pendingBalance)}</td>
                          <td className="py-2.5 text-right font-mono text-gray-700">{formatCOP(bank.monthlyQuota)}</td>
                          <td className="py-2.5 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                            {bank.dueDate.split('-').reverse().join('/')}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {bank.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedBankDebt(bank);
                                  setAbonoForm({ amount: bank.monthlyQuota, paymentMethod: 'Débito automático', notes: 'Pago cuota mensual' });
                                  setIsBankQuotaModalOpen(true);
                                }}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold cursor-pointer"
                              >
                                + Pagar cuota
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lateral Composición y Próximas Cuotas */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-extrabold text-gray-900">Composición de la deuda</h3>
                <div className="flex items-center justify-center pt-2">
                  <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
                      <circle cx="50" cy="50" r="38" stroke="#047857" strokeWidth="14" fill="transparent"
                        strokeDasharray="238.76" strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="14" fill="transparent"
                        strokeDasharray="238.76" strokeDashoffset="102.6" />
                      <circle cx="50" cy="50" r="38" stroke="#6ee7b7" strokeWidth="14" fill="transparent"
                        strokeDasharray="238.76" strokeDashoffset="33.4" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[11px] font-black text-gray-900 leading-tight">$35.000.000</span>
                      <span className="text-[8px] font-bold text-gray-400">Total bancario</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] pt-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-800"></span> Bancolombia
                    </span>
                    <span className="font-bold text-gray-900">57%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Davivienda
                    </span>
                    <span className="font-bold text-gray-900">29%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-300"></span> Banco de Bogotá
                    </span>
                    <span className="font-bold text-gray-900">14%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-emerald-700" /> Próximas cuotas
                  </h3>
                  <button onClick={() => setActiveTab('calendario')} className="text-[10px] font-bold text-emerald-700 hover:underline">
                    Ver calendario &gt;
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">Bancolombia</span>
                      <span className="text-[10px] text-gray-500">$750.000 · 25 Nov 2026</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">En 4 días</span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">Davivienda</span>
                      <span className="text-[10px] text-gray-500">$350.000 · 28 Nov 2026</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">En 7 días</span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">Banco de Bogotá</span>
                      <span className="text-[10px] text-gray-500">$150.000 · 05 Dic 2026</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">En 14 días</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const firstBank = data.bankDebts[0];
                    if (firstBank) {
                      setSelectedBankDebt(firstBank);
                      setAbonoForm({ amount: firstBank.monthlyQuota, paymentMethod: 'Débito automático', notes: 'Pago cuota programada' });
                      setIsBankQuotaModalOpen(true);
                    }
                  }}
                  className="w-full mt-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Registrar pago de cuota
                </button>
              </div>
            </div>
          </div>

          {/* Fila Inferior: Evolución Saldo y Calendario de Cuotas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900">Evolución del saldo pendiente</h3>
              <div className="relative pt-2">
                <div className="absolute top-1 right-4 bg-emerald-900 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded shadow">
                  $25.000.000
                </div>
                <svg viewBox="0 0 320 130" className="w-full h-36 overflow-visible">
                  {[0, 10, 20, 30, 40].map(v => {
                    const y = 110 - (v / 40) * 90;
                    return (
                      <g key={v}>
                        <line x1="25" y1={y} x2="310" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                        <text x="20" y={y + 3} textAnchor="end" fontSize="8" fill="#9ca3af" fontWeight="bold">{v}M</text>
                      </g>
                    );
                  })}

                  <defs>
                    <linearGradient id="bankGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <polygon
                    points="45,110 45,35 98,45 151,55 204,65 257,75 295,85 295,110"
                    fill="url(#bankGrad)"
                  />
                  <polyline
                    points="45,35 98,45 151,55 204,65 257,75 295,85"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                  />
                  {[
                    { x: 45, y: 35, m: 'Jun' },
                    { x: 98, y: 45, m: 'Jul' },
                    { x: 151, y: 55, m: 'Ago' },
                    { x: 204, y: 65, m: 'Sep' },
                    { x: 257, y: 75, m: 'Oct' },
                    { x: 295, y: 85, m: 'Nov' }
                  ].map(pt => (
                    <g key={pt.m}>
                      <circle cx={pt.x} cy={pt.y} r="3" fill="#059669" stroke="#fff" strokeWidth="1.5" />
                      <text x={pt.x} y="125" textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="bold">{pt.m}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900">Calendario de cuotas ({selectedMonth})</h3>
              <div className="space-y-2.5 pt-1">
                <div className="p-3 rounded-xl border border-gray-100 bg-emerald-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">25 Nov</span>
                    <span className="font-bold text-gray-900 text-xs">Bancolombia – Cuota</span>
                  </div>
                  <span className="font-mono font-black text-gray-900 text-xs">$750.000</span>
                </div>

                <div className="p-3 rounded-xl border border-gray-100 bg-emerald-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">28 Nov</span>
                    <span className="font-bold text-gray-900 text-xs">Davivienda – Cuota</span>
                  </div>
                  <span className="font-mono font-black text-gray-900 text-xs">$350.000</span>
                </div>

                <div className="p-3 rounded-xl border border-gray-100 bg-emerald-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">05 Dic</span>
                    <span className="font-bold text-gray-900 text-xs">Banco de Bogotá – Cuota</span>
                  </div>
                  <span className="font-mono font-black text-gray-900 text-xs">$150.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: CUENTAS POR COBRAR
          ========================================================================= */}
      {activeTab === 'cobrar' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 4 KPIs Cuentas por Cobrar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Total por cobrar</span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <HandCoins className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalReceivables)}</p>
              <span className="text-[10px] font-bold text-gray-500 mt-1 inline-block">Ventas y créditos a clientes</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Total recuperado</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalReceivablesRecovered)}</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                {totalReceivables > 0 ? Math.round((totalReceivablesRecovered / totalReceivables) * 100) : 24}% del total
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Saldo pendiente</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(totalReceivablesPending)}</p>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                {totalReceivables > 0 ? Math.round((totalReceivablesPending / totalReceivables) * 100) : 76}% del total
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Cuentas activas</span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{filteredReceivables.length}</p>
              <span className="text-[10px] font-bold text-gray-500 mt-1 inline-block">Deudores registrados</span>
            </div>
          </div>

          {/* Fila Media: Gráficos de Evolución, Antigüedad de Cartera y Estado de Cobro */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Evolución Cuentas por Cobrar */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900">Evolución de cuentas por cobrar</h3>
              <div className="relative pt-2">
                <div className="absolute top-1 right-4 bg-emerald-900 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded shadow">
                  $8.500.000
                </div>
                <svg viewBox="0 0 320 130" className="w-full h-36 overflow-visible">
                  {[0, 2, 4, 6, 8, 10].map(v => {
                    const y = 110 - (v / 10) * 90;
                    return (
                      <g key={v}>
                        <line x1="25" y1={y} x2="310" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                        <text x="20" y={y + 3} textAnchor="end" fontSize="8" fill="#9ca3af" fontWeight="bold">{v}M</text>
                      </g>
                    );
                  })}

                  <defs>
                    <linearGradient id="cobrarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <polygon
                    points="45,110 45,80 98,70 151,60 204,50 257,40 295,30 295,110"
                    fill="url(#cobrarGrad)"
                  />
                  <polyline
                    points="45,80 98,70 151,60 204,50 257,40 295,30"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                  />
                  {[
                    { x: 45, y: 80, m: 'Jun' },
                    { x: 98, y: 70, m: 'Jul' },
                    { x: 151, y: 60, m: 'Ago' },
                    { x: 204, y: 50, m: 'Sep' },
                    { x: 257, y: 40, m: 'Oct' },
                    { x: 295, y: 30, m: 'Nov' }
                  ].map(pt => (
                    <g key={pt.m}>
                      <circle cx={pt.x} cy={pt.y} r="3" fill="#059669" stroke="#fff" strokeWidth="1.5" />
                      <text x={pt.x} y="125" textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="bold">{pt.m}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Antigüedad de la cartera Donut */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900">Antigüedad de la cartera</h3>
              <div className="flex items-center justify-center pt-2">
                <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
                    <circle cx="50" cy="50" r="38" stroke="#047857" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="128.9" />
                    <circle cx="50" cy="50" r="38" stroke="#34d399" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="54.9" />
                    <circle cx="50" cy="50" r="38" stroke="#6ee7b7" strokeWidth="14" fill="transparent"
                      strokeDasharray="238.76" strokeDashoffset="19.1" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-black text-gray-900 leading-tight">$6.500.000</span>
                    <span className="text-[8px] font-bold text-gray-400">Saldo pendiente</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] pt-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-800"></span> 0 – 30 días
                  </span>
                  <span className="font-bold text-gray-900">46% <span className="text-gray-400 font-normal">· $3.0M</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 31 – 60 días
                  </span>
                  <span className="font-bold text-gray-900">31% <span className="text-gray-400 font-normal">· $2.0M</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-300"></span> 61 – 90 días
                  </span>
                  <span className="font-bold text-gray-900">15% <span className="text-gray-400 font-normal">· $1.0M</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-200"></span> &gt; 90 días
                  </span>
                  <span className="font-bold text-gray-900">8% <span className="text-gray-400 font-normal">· $500K</span></span>
                </div>
              </div>
            </div>

            {/* Estado de Cobro */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
              <h3 className="text-sm font-extrabold text-gray-900">Estado de cobro</h3>
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-gray-800">Al día (pagadas)</span>
                  </div>
                  <span className="text-sm font-black text-emerald-800 font-mono">2</span>
                </div>

                <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-gray-800">Pendientes</span>
                  </div>
                  <span className="text-sm font-black text-amber-800 font-mono">3</span>
                </div>

                <div className="p-3 rounded-xl border border-red-100 bg-red-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-gray-800">Vencidas</span>
                  </div>
                  <span className="text-sm font-black text-red-600 font-mono">1</span>
                </div>
              </div>

              <button
                onClick={() => setIsReceivableModalOpen(true)}
                className="w-full mt-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar cuenta por cobrar
              </button>
            </div>
          </div>

          {/* Tabla Cuentas por Cobrar */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <h3 className="text-sm font-extrabold text-gray-900">Cuentas por cobrar registradas</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar deudor..."
                    value={receivableSearch}
                    onChange={e => setReceivableSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold outline-none w-48"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="py-2">Deudor / Cliente</th>
                    <th className="py-2">Concepto</th>
                    <th className="py-2">Sede</th>
                    <th className="py-2 text-right">Valor total</th>
                    <th className="py-2 text-right">Abonado</th>
                    <th className="py-2 text-right">Saldo pendiente</th>
                    <th className="py-2">Fecha creación</th>
                    <th className="py-2">Vencimiento</th>
                    <th className="py-2 text-center">Estado</th>
                    <th className="py-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                  {filteredReceivables.map(rec => (
                    <tr key={rec.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {rec.debtor}
                      </td>
                      <td className="py-2.5 text-gray-600 text-[11px]">{rec.concept}</td>
                      <td className="py-2.5 text-gray-500">{rec.store}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-gray-900">{formatCOP(rec.totalAmount)}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-emerald-700">{formatCOP(rec.abonado)}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-red-600">{formatCOP(rec.pendingBalance)}</td>
                      <td className="py-2.5 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                        {rec.createdDate.split('-').reverse().join('/')}
                      </td>
                      <td className="py-2.5 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                        {rec.dueDate.split('-').reverse().join('/')}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'Al día'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'Vencida'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {rec.pendingBalance > 0 && (
                            <button
                              onClick={() => {
                                setSelectedReceivable(rec);
                                setAbonoForm({ amount: 0, paymentMethod: 'Transferencia Bancolombia', notes: '' });
                                setIsReceivableAbonoModalOpen(true);
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold cursor-pointer"
                            >
                              + Cobro
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReceivable(rec.id)}
                            className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: CALENDARIO DE PAGOS
          ========================================================================= */}
      {activeTab === 'calendario' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 4 KPIs Calendario */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Total del mes</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(calendarTotalMonth)}</p>
              <span className="text-[10px] font-bold text-gray-500 mt-1 inline-block">Obligaciones programadas</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Pagados</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(calendarPaid)}</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                25% del total
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Pendientes</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(calendarPending)}</p>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                66% del total
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Vencidos</span>
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 mt-2">{formatCOP(calendarVencidos)}</p>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                9% del total
              </span>
            </div>
          </div>

          {/* Calendario Grid + Barra Lateral */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Cuadrícula de Calendario */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                  <h3 className="text-sm font-black text-gray-900">{selectedMonth}</h3>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                  {(['mes', 'semana', 'lista'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setCalendarViewMode(mode)}
                      className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                        calendarViewMode === mode ? 'bg-emerald-800 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de Noviembre 2026 */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Cabecera días de semana */}
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 text-center text-[11px] font-bold text-gray-500 py-2">
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mié</span>
                  <span>Jue</span>
                  <span>Vie</span>
                  <span>Sáb</span>
                  <span>Dom</span>
                </div>

                {/* Días del mes (35 celdas) */}
                <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 bg-white min-h-[380px]">
                  {/* Oct 26 - Oct 31 (greyed out) */}
                  {[26, 27, 28, 29, 30, 31].map(d => (
                    <div key={`prev-${d}`} className="p-1.5 bg-gray-50/40 text-gray-300 text-xs min-h-[75px]">
                      <span className="font-bold">{d}</span>
                    </div>
                  ))}

                  {/* Nov 1 (Dom) */}
                  <div className="p-1.5 text-xs min-h-[75px] hover:bg-gray-50/50">
                    <span className="font-bold text-gray-700">1</span>
                  </div>

                  {/* Nov 2 - 30 */}
                  {Array.from({ length: 30 }, (_, i) => i + 2).map(day => {
                    // Match events on this day
                    const eventsOnDay = data.calendarEvents.filter(ev => ev.day === day);
                    return (
                      <div key={day} className="p-1.5 text-xs min-h-[75px] hover:bg-gray-50/50 relative">
                        <span className="font-bold text-gray-700 block mb-1">{day}</span>
                        <div className="space-y-1">
                          {eventsOnDay.map(ev => {
                            let chipStyle = 'bg-blue-100 text-blue-900 border-blue-200';
                            if (ev.type === 'proveedor') chipStyle = 'bg-purple-100 text-purple-900 border-purple-200';
                            if (ev.type === 'banco') chipStyle = 'bg-rose-100 text-rose-900 border-rose-200';
                            if (ev.type === 'arriendo') chipStyle = 'bg-amber-100 text-amber-900 border-amber-200';
                            if (ev.status === 'pagado') chipStyle = 'bg-emerald-100 text-emerald-900 border-emerald-200';

                            return (
                              <div
                                key={ev.id}
                                onClick={() => {
                                  Swal.fire({
                                    title: ev.title,
                                    html: `<div class="text-xs text-left"><b>Monto:</b> ${formatCOP(ev.amount)}<br><b>Tipo:</b> ${ev.type}<br><b>Sede:</b> ${ev.store}<br><b>Estado:</b> ${ev.status}</div>`,
                                    showCancelButton: true,
                                    confirmButtonText: ev.status === 'pagado' ? 'Marcar Pendiente' : 'Marcar Pagado',
                                    cancelButtonText: 'Cerrar'
                                  }).then(r => {
                                    if (r.isConfirmed) {
                                      FinancialService.toggleCalendarEventStatus(ev.id);
                                      refreshData();
                                    }
                                  });
                                }}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border truncate cursor-pointer shadow-2xs ${chipStyle}`}
                                title={`${ev.title}: ${formatCOP(ev.amount)}`}
                              >
                                {ev.title} {formatCOP(ev.amount)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Dic 1 - Dic 5 filling row */}
                  {[1, 2, 3, 4, 5, 6].map(d => (
                    <div key={`next-${d}`} className="p-1.5 bg-gray-50/40 text-gray-300 text-xs min-h-[75px]">
                      <span className="font-bold">{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leyenda del Calendario */}
              <div className="flex items-center justify-center gap-4 text-xs font-bold pt-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Gasto mensual
                </span>
                <span className="flex items-center gap-1.5 text-purple-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Proveedor
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Deuda bancaria
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Arriendo / Fijo
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Pago realizado
                </span>
              </div>
            </div>

            {/* Lateral Próximos Pagos, Filtros y Resumen por Categoría */}
            <div className="lg:col-span-4 space-y-5">
              {/* Próximos Pagos */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-emerald-700" /> Próximos pagos
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400">Ver todos &gt;</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">Cuota bancaria (Bancolombia)</span>
                      <span className="text-[10px] text-gray-500">$1.250.000 · 25 Nov</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">En 4 días</span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">Proveedor Open Mind</span>
                      <span className="text-[10px] text-gray-500">$2.400.000 · Lote camisas</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">En 7 días</span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">Arriendo Sede República</span>
                      <span className="text-[10px] text-gray-500">$1.800.000 · Local comercial</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">En 10 días</span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">Servicios públicos</span>
                      <span className="text-[10px] text-gray-500">$320.000 · Energía y agua</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">En 15 días</span>
                  </div>
                </div>
              </div>

              {/* Filtros del Calendario */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-emerald-700" /> Filtros del calendario
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo de pago</label>
                    <select
                      value={calendarFilterType}
                      onChange={e => setCalendarFilterType(e.target.value)}
                      className="w-full mt-1 p-2 rounded-xl border border-gray-200 font-bold text-gray-700"
                    >
                      <option value="Todos">Todos</option>
                      <option value="gasto">Gasto mensual</option>
                      <option value="proveedor">Proveedor</option>
                      <option value="banco">Deuda bancaria</option>
                      <option value="arriendo">Arriendo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Sede</label>
                    <select
                      value={selectedStore}
                      onChange={e => setSelectedStore(e.target.value)}
                      className="w-full mt-1 p-2 rounded-xl border border-gray-200 font-bold text-gray-700"
                    >
                      <option value="Todas las sedes">Todas las sedes</option>
                      <option value="República">República</option>
                      <option value="Ciudad Modelo">Ciudad Modelo</option>
                      <option value="Quality">Quality</option>
                      <option value="Sede Mariano">Sede Mariano</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Resumen por Categoría */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-extrabold text-gray-900">Resumen por categoría ({selectedMonth})</h3>
                <div className="space-y-2.5 text-xs pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Gastos fijos (arriendo, servicios)</span>
                    <span className="font-bold text-gray-900 font-mono">$6.605.000 <span className="text-gray-400 font-normal">31%</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Proveedores (compras crédito)</span>
                    <span className="font-bold text-gray-900 font-mono">$6.200.000 <span className="text-gray-400 font-normal">29%</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Deudas bancarias (cuotas)</span>
                    <span className="font-bold text-gray-900 font-mono">$1.250.000 <span className="text-gray-400 font-normal">6%</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Otros gastos (nómina, logística)</span>
                    <span className="font-bold text-gray-900 font-mono">$7.335.000 <span className="text-gray-400 font-normal">34%</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: REPORTES FINANCIEROS
          ========================================================================= */}
      {activeTab === 'reportes' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-black text-gray-900">Estado Financiero Consolidado</h2>
              <p className="text-xs text-gray-500">Balance general entre ingresos, gastos operativos, pagos a pasivos y flujo neto de caja.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  Swal.fire({ icon: 'success', title: 'Exportación lista', text: 'Se ha descargado el informe financiero en formato CSV.' });
                }}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Exportar CSV
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir
              </button>
            </div>
          </div>

          {/* Tarjetas de Resumen Ejecutivo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Total Gastos Operativos</span>
              <p className="text-lg font-black text-gray-900 mt-1">{formatCOP(totalExpenses)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Arriendos, nómina y servicios</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Pasivo Total (Proveedores + Bancos)</span>
              <p className="text-lg font-black text-red-600 mt-1">{formatCOP(totalSupplierDebt + totalBankDebt)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Saldo pendiente: {formatCOP(totalSupplierPending + totalBankPending)}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Cartera Total por Cobrar</span>
              <p className="text-lg font-black text-blue-700 mt-1">{formatCOP(totalReceivables)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Recuperado este mes: {formatCOP(totalReceivablesRecovered)}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-800 uppercase">Flujo Neto Estimado</span>
              <p className="text-lg font-black text-emerald-900 mt-1">$6.240.000</p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Balance saludable y positivo</p>
            </div>
          </div>

          {/* Tabla Comparativa de Sedes */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-gray-900">Distribución de Gastos por Sede Física</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5">Sede</th>
                    <th className="py-2.5 text-right">Gastos Operativos</th>
                    <th className="py-2.5 text-right">% del Gasto Total</th>
                    <th className="py-2.5 text-right">Deudas Asignadas</th>
                    <th className="py-2.5 text-right">Cuentas por Cobrar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 font-bold text-gray-900">Sede República</td>
                    <td className="py-3 text-right font-mono font-bold">$4.850.000</td>
                    <td className="py-3 text-right font-mono text-emerald-700">27%</td>
                    <td className="py-3 text-right font-mono">$3.200.000</td>
                    <td className="py-3 text-right font-mono text-blue-700">$3.500.000</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 font-bold text-gray-900">Sede Ciudad Modelo</td>
                    <td className="py-3 text-right font-mono font-bold">$4.320.000</td>
                    <td className="py-3 text-right font-mono text-emerald-700">25%</td>
                    <td className="py-3 text-right font-mono">$2.400.000</td>
                    <td className="py-3 text-right font-mono text-blue-700">$2.000.000</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 font-bold text-gray-900">Sede Quality</td>
                    <td className="py-3 text-right font-mono font-bold">$4.620.000</td>
                    <td className="py-3 text-right font-mono text-emerald-700">26%</td>
                    <td className="py-3 text-right font-mono">$1.250.000</td>
                    <td className="py-3 text-right font-mono text-blue-700">$1.200.000</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 font-bold text-gray-900">Sede Mariano</td>
                    <td className="py-3 text-right font-mono font-bold">$3.799.000</td>
                    <td className="py-3 text-right font-mono text-emerald-700">22%</td>
                    <td className="py-3 text-right font-mono">$500.000</td>
                    <td className="py-3 text-right font-mono text-blue-700">$800.000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALES DE ACCIÓN Y REGISTRO
          ========================================================================= */}

      {/* Modal Elección de Acción (Desde botón Registrar Movimiento en Resumen) */}
      {isActionChoiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900">¿Qué tipo de registro deseas realizar?</h3>
              <button onClick={() => setIsActionChoiceModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => {
                  setIsActionChoiceModalOpen(false);
                  setIsExpenseModalOpen(true);
                }}
                className="p-3.5 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center gap-3 transition-all text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Gasto mensual</h4>
                  <p className="text-[11px] text-gray-500">Arriendo, nómina, servicios públicos, fletes</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsActionChoiceModalOpen(false);
                  setIsSupplierDebtModalOpen(true);
                }}
                className="p-3.5 rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50/50 flex items-center gap-3 transition-all text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Deuda con proveedor</h4>
                  <p className="text-[11px] text-gray-500">Compras de mercancía o suministros a crédito</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsActionChoiceModalOpen(false);
                  setIsBankDebtModalOpen(true);
                }}
                className="p-3.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center gap-3 transition-all text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Deuda u obligación bancaria</h4>
                  <p className="text-[11px] text-gray-500">Créditos de capital, préstamos comerciales</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsActionChoiceModalOpen(false);
                  setIsReceivableModalOpen(true);
                }}
                className="p-3.5 rounded-xl border border-gray-200 hover:border-teal-500 hover:bg-teal-50/50 flex items-center gap-3 transition-all text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <HandCoins className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Cuenta por cobrar</h4>
                  <p className="text-[11px] text-gray-500">Mercancía entregada a crédito a clientes mayoristas</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Gasto */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-700" /> Registrar nuevo gasto
              </h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Concepto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Arriendo Local Central"
                  value={expenseForm.concept}
                  onChange={e => setExpenseForm({ ...expenseForm, concept: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Categoría</label>
                  <select
                    value={expenseForm.category}
                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                  >
                    <option value="Arriendo">Arriendo</option>
                    <option value="Servicios públicos">Servicios públicos</option>
                    <option value="Internet">Internet</option>
                    <option value="Nómina">Nómina</option>
                    <option value="Logística">Logística</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sede</label>
                  <select
                    value={expenseForm.store}
                    onChange={e => setExpenseForm({ ...expenseForm, store: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                  >
                    <option value="República">República</option>
                    <option value="Ciudad Modelo">Ciudad Modelo</option>
                    <option value="Quality">Quality</option>
                    <option value="Sede Mariano">Sede Mariano</option>
                    <option value="Todas las sedes">Todas las sedes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Monto ($) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={expenseForm.amount || ''}
                    onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Estado</label>
                  <select
                    value={expenseForm.status}
                    onChange={e => setExpenseForm({ ...expenseForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Deuda Proveedor */}
      {isSupplierDebtModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-700" /> Registrar deuda con proveedor
              </h3>
              <button onClick={() => setIsSupplierDebtModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplierDebt} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Proveedor *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Open Mind, Trend Textil"
                  value={supplierDebtForm.supplier}
                  onChange={e => setSupplierDebtForm({ ...supplierDebtForm, supplier: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Concepto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lote Camisas y Buzos"
                  value={supplierDebtForm.concept}
                  onChange={e => setSupplierDebtForm({ ...supplierDebtForm, concept: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sede</label>
                  <select
                    value={supplierDebtForm.store}
                    onChange={e => setSupplierDebtForm({ ...supplierDebtForm, store: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                  >
                    <option value="República">República</option>
                    <option value="Ciudad Modelo">Ciudad Modelo</option>
                    <option value="Quality">Quality</option>
                    <option value="Sede Mariano">Sede Mariano</option>
                    <option value="Todas">Todas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Vencimiento</label>
                  <input
                    type="date"
                    value={supplierDebtForm.dueDate}
                    onChange={e => setSupplierDebtForm({ ...supplierDebtForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Deuda Inicial ($) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={supplierDebtForm.initialDebt || ''}
                    onChange={e => setSupplierDebtForm({ ...supplierDebtForm, initialDebt: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Abono Inicial ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={supplierDebtForm.abonado || ''}
                    onChange={e => setSupplierDebtForm({ ...supplierDebtForm, abonado: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSupplierDebtModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold"
                >
                  Guardar Deuda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Abono Proveedor */}
      {isSupplierAbonoModalOpen && selectedSupplierDebt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900">Registrar abono: {selectedSupplierDebt.supplier}</h3>
                <p className="text-[11px] text-gray-500">Saldo pendiente: {formatCOP(selectedSupplierDebt.pendingBalance)}</p>
              </div>
              <button onClick={() => setIsSupplierAbonoModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplierAbono} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Monto del abono ($) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedSupplierDebt.pendingBalance}
                  value={abonoForm.amount || ''}
                  onChange={e => setAbonoForm({ ...abonoForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Método de pago</label>
                <select
                  value={abonoForm.paymentMethod}
                  onChange={e => setAbonoForm({ ...abonoForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                >
                  <option value="Transferencia Bancolombia">Transferencia Bancolombia</option>
                  <option value="Efectivo">Efectivo en caja</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Bold">Bold</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Notas / Referencia</label>
                <input
                  type="text"
                  placeholder="Ej. Comprobante #10492"
                  value={abonoForm.notes}
                  onChange={e => setAbonoForm({ ...abonoForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSupplierAbonoModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold"
                >
                  Confirmar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Deuda Bancaria */}
      {isBankDebtModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-700" /> Registrar obligación bancaria
              </h3>
              <button onClick={() => setIsBankDebtModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBankDebt} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Entidad bancaria *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Bancolombia, Davivienda, Banco de Bogotá"
                  value={bankDebtForm.bank}
                  onChange={e => setBankDebtForm({ ...bankDebtForm, bank: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipo de deuda *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Préstamo comercial, Línea de crédito"
                  value={bankDebtForm.debtType}
                  onChange={e => setBankDebtForm({ ...bankDebtForm, debtType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Valor Total ($) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={bankDebtForm.totalAmount || ''}
                    onChange={e => setBankDebtForm({ ...bankDebtForm, totalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cuota Mensual ($) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={bankDebtForm.monthlyQuota || ''}
                    onChange={e => setBankDebtForm({ ...bankDebtForm, monthlyQuota: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Abonado a capital ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={bankDebtForm.abonado || ''}
                    onChange={e => setBankDebtForm({ ...bankDebtForm, abonado: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Día de vencimiento</label>
                  <input
                    type="date"
                    value={bankDebtForm.dueDate}
                    onChange={e => setBankDebtForm({ ...bankDebtForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBankDebtModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold"
                >
                  Guardar Obligación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pagar Cuota Bancaria */}
      {isBankQuotaModalOpen && selectedBankDebt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900">Pagar cuota: {selectedBankDebt.bank}</h3>
                <p className="text-[11px] text-gray-500">Saldo pendiente: {formatCOP(selectedBankDebt.pendingBalance)}</p>
              </div>
              <button onClick={() => setIsBankQuotaModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBankQuota} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Valor de la cuota ($) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={abonoForm.amount || ''}
                  onChange={e => setAbonoForm({ ...abonoForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Método de débito / pago</label>
                <select
                  value={abonoForm.paymentMethod}
                  onChange={e => setAbonoForm({ ...abonoForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                >
                  <option value="Débito automático">Débito automático cuenta corriente</option>
                  <option value="Transferencia Bancolombia">Transferencia Bancolombia</option>
                  <option value="PSE">Pago por PSE</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBankQuotaModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold"
                >
                  Registrar Pago Cuota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Cuenta por Cobrar */}
      {isReceivableModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-teal-700" /> Registrar cuenta por cobrar
              </h3>
              <button onClick={() => setIsReceivableModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReceivable} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Deudor / Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Distribuciones La 14, Cliente Mayorista"
                  value={receivableForm.debtor}
                  onChange={e => setReceivableForm({ ...receivableForm, debtor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Concepto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mercancía (20 camisas)"
                  value={receivableForm.concept}
                  onChange={e => setReceivableForm({ ...receivableForm, concept: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sede</label>
                  <select
                    value={receivableForm.store}
                    onChange={e => setReceivableForm({ ...receivableForm, store: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                  >
                    <option value="República">República</option>
                    <option value="Ciudad Modelo">Ciudad Modelo</option>
                    <option value="Quality">Quality</option>
                    <option value="Sede Mariano">Sede Mariano</option>
                    <option value="Todas las sedes">Todas las sedes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Vencimiento</label>
                  <input
                    type="date"
                    value={receivableForm.dueDate}
                    onChange={e => setReceivableForm({ ...receivableForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Valor Total ($) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={receivableForm.totalAmount || ''}
                    onChange={e => setReceivableForm({ ...receivableForm, totalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Abonado ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={receivableForm.abonado || ''}
                    onChange={e => setReceivableForm({ ...receivableForm, abonado: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsReceivableModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold"
                >
                  Guardar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Cobro (Abono) de Cuenta por Cobrar */}
      {isReceivableAbonoModalOpen && selectedReceivable && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900">Registrar cobro: {selectedReceivable.debtor}</h3>
                <p className="text-[11px] text-gray-500">Saldo pendiente: {formatCOP(selectedReceivable.pendingBalance)}</p>
              </div>
              <button onClick={() => setIsReceivableAbonoModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReceivableAbono} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Monto recaudado ($) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedReceivable.pendingBalance}
                  value={abonoForm.amount || ''}
                  onChange={e => setAbonoForm({ ...abonoForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Método de recepción</label>
                <select
                  value={abonoForm.paymentMethod}
                  onChange={e => setAbonoForm({ ...abonoForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                >
                  <option value="Transferencia Bancolombia">Transferencia Bancolombia</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsReceivableAbonoModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold"
                >
                  Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Gasto Recurrente */}
      {isRecurringModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" /> Nuevo gasto recurrente
              </h3>
              <button onClick={() => setIsRecurringModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecurring} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre / Título *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Arriendo Sede Norte"
                  value={recurringForm.title}
                  onChange={e => setRecurringForm({ ...recurringForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Monto recurrente ($) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={recurringForm.amount || ''}
                  onChange={e => setRecurringForm({ ...recurringForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Frecuencia</label>
                  <select
                    value={recurringForm.period}
                    onChange={e => setRecurringForm({ ...recurringForm, period: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                  >
                    <option value="Mensual">Mensual</option>
                    <option value="Quincenal">Quincenal</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Próximo vencimiento</label>
                  <input
                    type="text"
                    placeholder="Ej. 05 Dic"
                    value={recurringForm.nextDue}
                    onChange={e => setRecurringForm({ ...recurringForm, nextDue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRecurringModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold"
                >
                  Crear Recurrente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
