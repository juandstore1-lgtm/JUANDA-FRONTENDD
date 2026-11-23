import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  UploadCloud, 
  Edit3, 
  History, 
  Calendar, 
  BarChart3, 
  DollarSign, 
  Boxes, 
  ArrowLeftRight, 
  CalendarCheck, 
  FileSpreadsheet, 
  FileText, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown,
  Store, 
  Sparkles, 
  Filter, 
  Download, 
  Printer, 
  RefreshCw, 
  Check, 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Tag, 
  CreditCard, 
  Eye, 
  ShieldCheck,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Info,
  Layers,
  RotateCcw
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  CommercialService, 
  CommercialProduct, 
  CommercialDailyCuadre, 
  CommercialSaleLine, 
  CommercialMovement, 
  CommercialExpense, 
  CommercialDebt, 
  STORES_LIST, 
  PAYMENT_METHODS 
} from '../../services/commercialService';
import { formatPrice } from '../../utils/format';

type StoreId = 'republica' | 'modelo' | 'quality' | 'mariano';

export default function CommercialAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'resumen';

  const setActiveTab = (tab: string) => {
    if (tab === 'cargar-ia') {
      setSearchParams({ tab: 'registro-manual' });
      return;
    }
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (searchParams.get('tab') === 'cargar-ia') {
      setSearchParams({ tab: 'registro-manual' });
    }
  }, [searchParams]);

  // Filtros globales: Mes, Año y Sede (para reportes y análisis)
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all'); // 'all' | 'republica' | 'modelo' | 'quality' | 'mariano'

  // Master Data state from service
  const [data, setData] = useState(() => CommercialService.getData());

  const refreshData = () => {
    setData(CommercialService.getData());
  };

  // Nombres de meses en español
  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // =========================================================================
  // TAB 1: RESUMEN GENERAL (DASHBOARD DINÁMICO)
  // =========================================================================
  const monthlyMetrics = useMemo(() => {
    const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const relevantCuadres = data.cuadres.filter(c => {
      const matchesMonth = c.dateStr.startsWith(monthPrefix);
      const matchesStore = selectedStoreId === 'all' || c.storeId === selectedStoreId;
      return matchesMonth && matchesStore && c.status === 'REGISTERED';
    });

    const totalVentas = relevantCuadres.reduce((acc, c) => acc + c.totalSales, 0);
    const totalCosto = relevantCuadres.reduce((acc, c) => acc + c.totalCost, 0);
    const gananciaBruta = totalVentas - totalCosto;
    const prendasVendidas = relevantCuadres.reduce((acc, c) => acc + c.totalItems, 0);
    const margenPct = totalVentas > 0 ? ((gananciaBruta / totalVentas) * 100).toFixed(1) : '0';

    return { totalVentas, totalCosto, gananciaBruta, prendasVendidas, margenPct, countCuadres: relevantCuadres.length };
  }, [data.cuadres, selectedMonth, selectedYear, selectedStoreId]);

  // =========================================================================
  // TAB 2: CARGAR VENTAS CON IA (LECTURA DE FOTO DE LIBRETA POR SEDE)
  // =========================================================================
  const [aiStoreId, setAiStoreId] = useState<string>('republica');
  const [aiDateStr, setAiDateStr] = useState<string>(now.toISOString().split('T')[0]);
  const [aiImages, setAiImages] = useState<string[]>([]);
  const [aiIsProcessing, setAiIsProcessing] = useState<boolean>(false);
  const [aiVerifiedSales, setAiVerifiedSales] = useState<CommercialSaleLine[]>([]);

  const handleSimulateAiRead = () => {
    if (aiImages.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Fotos requeridas',
        text: 'Por favor sube al menos una fotografía de la libreta de ventas de la sede.',
        confirmButtonColor: '#007A33'
      });
      return;
    }

    setAiIsProcessing(true);
    setTimeout(() => {
      setAiIsProcessing(false);
      const sample1 = data.products[0];
      const sample2 = data.products[4] || sample1; // Jeans
      const sample3 = data.products[7] || sample1; // Pantaloneta NBA

      const detected: CommercialSaleLine[] = [
        {
          id: `ai-${Date.now()}-1`,
          productId: sample1?.id || 'p-1',
          productName: sample1?.name || 'CAMISAS ALTA GAMA',
          quantity: 2,
          costPrice: sample1?.costPrice || 40000,
          sellingPrice: 70000,
          subtotal: 140000,
          costTotal: 2 * (sample1?.costPrice || 40000),
          profit: 140000 - (2 * (sample1?.costPrice || 40000)),
          paymentMethod: 'Bold',
          hour: '11:15 a. m.',
          verified: true
        },
        {
          id: `ai-${Date.now()}-2`,
          productId: sample2?.id || 'p-5',
          productName: sample2?.name || 'JEANS',
          quantity: 1,
          costPrice: sample2?.costPrice || 100000,
          sellingPrice: 140000,
          subtotal: 140000,
          costTotal: sample2?.costPrice || 100000,
          profit: 40000,
          paymentMethod: 'Efectivo',
          hour: '12:30 p. m.',
          verified: true
        },
        {
          id: `ai-${Date.now()}-3`,
          productId: sample3?.id || 'p-8',
          productName: sample3?.name || 'PANTALONETA NBA',
          quantity: 2,
          costPrice: sample3?.costPrice || 33000,
          sellingPrice: 65000,
          subtotal: 130000,
          costTotal: 2 * (sample3?.costPrice || 33000),
          profit: 130000 - (2 * (sample3?.costPrice || 33000)),
          paymentMethod: 'Nequi',
          hour: '03:45 p. m.',
          verified: true
        }
      ];

      setAiVerifiedSales(detected);
      Swal.fire({
        icon: 'success',
        title: 'Lectura con IA completada',
        text: `Se detectaron ${detected.length} partidas de venta en la libreta. Verifica antes de confirmar el cierre.`,
        confirmButtonColor: '#007A33'
      });
    }, 1200);
  };

  const aiTotals = useMemo(() => {
    const totalSales = aiVerifiedSales.reduce((acc, s) => acc + s.subtotal, 0);
    const totalCost = aiVerifiedSales.reduce((acc, s) => acc + s.costTotal, 0);
    const totalProfit = totalSales - totalCost;
    const totalItems = aiVerifiedSales.reduce((acc, s) => acc + s.quantity, 0);

    const byMethod: { [key: string]: number } = {};
    PAYMENT_METHODS.forEach(pm => { byMethod[pm.id] = 0; });
    aiVerifiedSales.forEach(s => {
      byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] || 0) + s.subtotal;
    });

    return { totalSales, totalCost, totalProfit, totalItems, byMethod };
  }, [aiVerifiedSales]);

  const handleSaveAiCuadre = () => {
    if (aiVerifiedSales.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay ventas para guardar',
        text: 'Debes escanear o agregar al menos una venta antes de cerrar el cuadre.',
        confirmButtonColor: '#007A33'
      });
      return;
    }

    const storeObj = STORES_LIST.find(s => s.id === aiStoreId)!;
    const cuadre: CommercialDailyCuadre = {
      id: `cuadre-${aiDateStr}-${aiStoreId}`,
      dateStr: aiDateStr,
      storeId: aiStoreId,
      storeName: storeObj.shortName,
      status: 'REGISTERED',
      sales: aiVerifiedSales,
      totalSales: aiTotals.totalSales,
      totalCost: aiTotals.totalCost,
      totalProfit: aiTotals.totalProfit,
      totalItems: aiTotals.totalItems,
      totalsByMethod: aiTotals.byMethod,
      images: aiImages,
      updatedAt: new Date().toISOString()
    };

    CommercialService.saveCuadre(cuadre);
    refreshData();

    Swal.fire({
      icon: 'success',
      title: '¡Cierre de Ventas Registrado!',
      html: `
        <p class="text-sm">Se guardó el cuadre oficial de <b>${storeObj.shortName}</b> para el <b>${aiDateStr}</b>.</p>
        <p class="text-xs text-emerald-700 font-bold mt-2">Total ventas: ${formatPrice(aiTotals.totalSales)} (${aiTotals.totalItems} prendas)</p>
        <p class="text-[11px] text-gray-500 mt-1">El stock se ha descontado automáticamente del inventario de esta sede.</p>
      `,
      confirmButtonColor: '#007A33'
    });

    setAiVerifiedSales([]);
    setAiImages([]);
  };

  // =========================================================================
  // TAB 3: REGISTRO MANUAL DE VENTAS (EL PRECIO DE VENTA SE INGRESA AL VENDER)
  // =========================================================================
  const [manualStoreId, setManualStoreId] = useState<string>('republica');
  const [manualDateStr, setManualDateStr] = useState<string>(now.toISOString().split('T')[0]);
  const [manualSales, setManualSales] = useState<CommercialSaleLine[]>([]);

  // Integración de Cargar Ventas con IA dentro de Anotar Ventas / Cierre
  const [isAiInlineOpen, setIsAiInlineOpen] = useState(false);
  const [aiInlineImages, setAiInlineImages] = useState<string[]>([]);
  const [aiInlineIsScanning, setAiInlineIsScanning] = useState(false);
  const [aiInlineExtractedSales, setAiInlineExtractedSales] = useState<CommercialSaleLine[]>([]);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem('juand_gemini_api_key') || '');
  const aiFileInputRef = useRef<HTMLInputElement>(null);

  // Buscador de productos en select de Anotar Ventas
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const productSelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productSelectRef.current && !productSelectRef.current.contains(event.target as Node)) {
        setIsProductSelectOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ÚNICAMENTE productos que EXISTEN y tienen STOCK > 0 en la sede seleccionada
  const availableProductsInStore = useMemo(() => {
    return data.products.filter(p => (p.stocks[manualStoreId] || 0) > 0);
  }, [data.products, manualStoreId]);

  const aiInlineTotals = useMemo(() => {
    const totalSales = aiInlineExtractedSales.reduce((acc, s) => acc + s.subtotal, 0);
    const totalItems = aiInlineExtractedSales.reduce((acc, s) => acc + s.quantity, 0);
    return { totalSales, totalItems };
  }, [aiInlineExtractedSales]);

  const handleInlineFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          setAiInlineImages(prev => [...prev, loadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (aiFileInputRef.current) {
      aiFileInputRef.current.value = '';
    }
  };

  const handleConfigureGeminiKey = () => {
    const currentKey = geminiApiKey || localStorage.getItem('juand_gemini_api_key') || '';
    Swal.fire({
      title: '🔑 Configurar Gemini API Key',
      html: `
        <div class="text-left text-xs text-gray-700 space-y-3">
          <p>Para examinar y extraer en vivo cualquier foto o libreta manuscrita con <b>Google Gemini Vision</b>, ingresa tu API Key gratuita de Google AI Studio:</p>
          <div class="p-2.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1.5">
            <p class="font-bold text-purple-950 text-xs">¿Cómo obtenerla gratis en 10 segundos?</p>
            <ol class="list-decimal list-inside text-[11px] text-purple-800 space-y-1">
              <li>Haz clic aquí para abrir <a href="https://aistudio.google.com/app/apikey" target="_blank" class="font-black text-purple-700 underline">Google AI Studio</a>.</li>
              <li>Inicia sesión con tu cuenta de Google y pulsa <b>"Create API key"</b>.</li>
              <li>Copia la clave generada y pégala aquí abajo:</li>
            </ol>
          </div>
          <input id="swal-gemini-key" type="password" class="swal2-input text-xs" placeholder="AIzaSy..." value="${currentKey}" style="width: 100%; box-sizing: border-box; font-size: 13px; margin: 8px 0;" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Clave',
      cancelButtonText: 'Cancelar',
      showDenyButton: !!currentKey,
      denyButtonText: 'Eliminar Clave',
      denyButtonColor: '#dc2626',
      confirmButtonColor: '#7c3aed',
      preConfirm: () => {
        const val = (document.getElementById('swal-gemini-key') as HTMLInputElement)?.value?.trim() || '';
        return val;
      }
    }).then(res => {
      if (res.isConfirmed) {
        if (res.value) {
          localStorage.setItem('juand_gemini_api_key', res.value);
          setGeminiApiKey(res.value);
          Swal.fire({
            icon: 'success',
            title: 'API Key Guardada',
            text: '¡Listo! Ahora la IA examinará y extraerá en tiempo real cualquier foto de cuaderno o libreta que subas.',
            confirmButtonColor: '#059669'
          });
        }
      } else if (res.isDenied) {
        localStorage.removeItem('juand_gemini_api_key');
        setGeminiApiKey('');
        Swal.fire({
          icon: 'info',
          title: 'API Key Eliminada',
          text: 'Se eliminó la clave de Gemini de este navegador.',
          confirmButtonColor: '#059669'
        });
      }
    });
  };

  const handleScanInlineImages = async () => {
    if (aiInlineImages.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Fotos requeridas',
        text: 'Por favor sube al menos una fotografía de la libreta de ventas de la sede.',
        confirmButtonColor: '#059669'
      });
      return;
    }

    let activeKey = geminiApiKey || localStorage.getItem('juand_gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

    if (!activeKey) {
      const result = await Swal.fire({
        title: '🔑 Activar Inteligencia Artificial en Vivo',
        html: `
          <div class="text-left text-xs text-gray-700 space-y-3">
            <p>Para examinar y extraer <b>cualquier cuaderno o libreta nueva en tiempo real</b>, la IA de visión necesita conectarse con Google Gemini.</p>
            <div class="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
              <p class="font-bold text-purple-950 text-xs">¿Cómo activarla gratis en 10 segundos?</p>
              <ol class="list-decimal list-inside text-[11px] text-purple-800 space-y-1">
                <li>Abre <a href="https://aistudio.google.com/app/apikey" target="_blank" class="font-bold text-purple-700 underline">Google AI Studio</a> con tu cuenta de Google.</li>
                <li>Pulsa el botón azul <b>"Create API key"</b> y cópiala.</li>
                <li>Pégala aquí abajo y pulsa Guardar:</li>
              </ol>
            </div>
            <input id="swal-prompt-inline-key" type="password" class="swal2-input text-xs" placeholder="Pega tu API Key de Gemini aquí (AIzaSy...)" style="width: 100%; box-sizing: border-box; font-size: 13px; margin: 8px 0;" />
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: '⚡ Guardar y Examinar Libreta',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#7c3aed',
        preConfirm: () => {
          const val = (document.getElementById('swal-prompt-inline-key') as HTMLInputElement)?.value?.trim();
          if (!val) {
            Swal.showValidationMessage('Por favor pega tu API Key para poder examinar la libreta');
            return false;
          }
          return val;
        }
      });

      if (!result.isConfirmed || !result.value) {
        return;
      }

      activeKey = result.value;
      localStorage.setItem('juand_gemini_api_key', activeKey);
      setGeminiApiKey(activeKey);
    }

    setAiInlineIsScanning(true);

    try {
      let allExtracted: CommercialSaleLine[] = [];
      const catalogNames = data.products.map(p => `- ${p.name} (Ref. costo: $${p.costPrice})`).join('\n');

      const prompt = `Actúa como un contador y auditor de inventario experto en tiendas de ropa de Colombia.
Analiza con total fidelidad y precisión la fotografía adjunta de la libreta física de ventas manuscritas.
Examina CADA FILA escrita a mano. NO inventes renglones y NO omitas ninguna fila visible en la imagen.

Catálogo oficial de productos disponible en la tienda:
${catalogNames}

Para cada renglón de venta manuscrito que detectes en la página, extrae:
1. productName: Empareja la prenda manuscrita con el producto más similar del catálogo oficial anterior.
   Ejemplos habituales en libretas de ropa:
   - "Camis 1.1", "Camisa 1.1" -> CAMISAS ALTA GAMA
   - "Saco 1.1" -> SACOS 1.1
   - "Camisa FB", "Camisa" -> CAMISAS FB
   - "Jean", "Jeans" -> JEANS
   - "Zapatillas", "Tenis" -> ZAPATILLAS
   - "mocho", "Mochos" -> MOCHOS
   - "Sudadera" -> SUDADERAS
   - "media", "Medias" -> MEDIAS
   - "Esqueleto FB", "Esqueleto" -> ESQUELETO FB
   - "Chaqueta" -> CHAQUETAS
   - "Conjunto" -> CONJUNTOS
   - "Gorra" -> GORRAS
2. quantity: Cantidad de prendas (número entero, default 1).
3. sellingPrice: Precio de venta unitario en pesos colombianos como número entero sin puntos ni signos (ej: 75000, 125000, 45000, 5000, 60000, 115000). Si varias prendas suman un total conjunto agrupado con una llave o flecha, calcula o divide el precio unitario correspondiente.
4. paymentMethod: Uno de los siguientes métodos oficiales: "Efectivo", "Bold", "Addi", "Datáfono", "Nequi", "Daviplata", "Sistecrédito". Si en el renglón dice "Tarjeta", asígnalo como "Datáfono". Si la casilla de método está en blanco, usa "Efectivo".
5. hour: Hora de la venta si está escrita (ej: "07:45 a. m.", "02:40 p. m.", "11:33 a. m."). Si no aparece, deja "".

Devuelve ÚNICAMENTE un array JSON con esta estructura exacta, sin texto introductorio ni bloques markdown:
[
  {
    "productName": "CAMISAS ALTA GAMA",
    "quantity": 1,
    "sellingPrice": 75000,
    "paymentMethod": "Efectivo",
    "hour": "07:45 a. m."
  }
]`;

      const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-2.5-flash'];

      for (let i = 0; i < aiInlineImages.length; i++) {
        const base64Image = aiInlineImages[i];
        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const mimeType = base64Image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

        let responseText = '';
        let lastErrorMsg = '';

        for (const modelName of candidateModels) {
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${activeKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: prompt },
                    { inline_data: { mime_type: mimeType, data: cleanBase64 } }
                  ]
                }],
                generationConfig: {
                  temperature: 0.1,
                  responseMimeType: 'application/json'
                }
              })
            });

            if (res.ok) {
              const resJson = await res.json();
              responseText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (responseText) break;
            } else {
              const errObj = await res.json().catch(() => ({}));
              lastErrorMsg = errObj?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
              if (res.status === 400 || res.status === 403) {
                throw new Error(lastErrorMsg);
              }
            }
          } catch (modelErr: any) {
            lastErrorMsg = modelErr.message;
            if (lastErrorMsg.toLowerCase().includes('api_key') || lastErrorMsg.toLowerCase().includes('key not valid')) {
              throw modelErr;
            }
          }
        }

        if (!responseText) {
          throw new Error(lastErrorMsg || 'No se pudo obtener respuesta del modelo de Gemini Vision.');
        }

        const cleanJsonStr = responseText.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/gi, '').trim();
        const jsonMatch = cleanJsonStr.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('La IA no devolvió un formato de filas válido para esta imagen.');
        }

        const parsedRows = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsedRows)) {
          parsedRows.forEach((l: any, idx: number) => {
            const rawName = String(l.productName || '').trim();
            const cleanSearch = rawName.toUpperCase();

            let matchedProd = data.products.find(p => p.name.toUpperCase() === cleanSearch) ||
                              data.products.find(p => p.name.toUpperCase().includes(cleanSearch) || cleanSearch.includes(p.name.toUpperCase()));
            if (!matchedProd) {
              const words = cleanSearch.split(/[\s-]+/).filter(w => w.length > 2);
              matchedProd = data.products.find(p => words.some(w => p.name.toUpperCase().includes(w)));
            }
            if (!matchedProd) {
              matchedProd = data.products[0];
            }

            const q = Math.max(1, Number(l.quantity) || 1);
            let sp = Number(String(l.sellingPrice || '').replace(/[^\d]/g, '')) || matchedProd.costPrice || 50000;
            if (sp < 1000) sp = sp * 1000;

            let pm = 'Efectivo';
            const pmLower = String(l.paymentMethod || '').toLowerCase();
            if (pmLower.includes('bold')) pm = 'Bold';
            else if (pmLower.includes('addi')) pm = 'Addi';
            else if (pmLower.includes('tarjeta') || pmLower.includes('datafono') || pmLower.includes('datáfono')) pm = 'Datáfono';
            else if (pmLower.includes('nequi')) pm = 'Nequi';
            else if (pmLower.includes('daviplata')) pm = 'Daviplata';
            else if (pmLower.includes('siste')) pm = 'Sistecrédito';
            else pm = 'Efectivo';

            allExtracted.push({
              id: `ai-live-${Date.now()}-${i}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
              productId: matchedProd.id,
              productName: matchedProd.name,
              quantity: q,
              costPrice: matchedProd.costPrice,
              sellingPrice: sp,
              subtotal: q * sp,
              costTotal: q * matchedProd.costPrice,
              profit: (q * sp) - (q * matchedProd.costPrice),
              paymentMethod: pm,
              hour: l.hour || new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true }),
              verified: true
            });
          });
        }
      }

      setAiInlineIsScanning(false);

      if (allExtracted.length > 0) {
        setAiInlineExtractedSales(allExtracted);
        const totalPesos = allExtracted.reduce((acc, s) => acc + s.subtotal, 0);
        Swal.fire({
          icon: 'success',
          title: '¡Lectura de Libreta Exitosa!',
          html: `
            <div class="text-left text-xs text-gray-700 space-y-2">
              <p class="font-bold text-gray-900">La IA examinó tu libreta en vivo:</p>
              <div class="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-[11px]">
                <p>• Ventas extraídas: <b>${allExtracted.length} filas</b></p>
                <p>• Total del cuaderno: <b>${formatPrice(totalPesos)}</b></p>
              </div>
              <p class="text-gray-500 text-[11px]">Revisa y edita cualquier renglón en la tabla de la derecha antes de confirmar.</p>
            </div>
          `,
          confirmButtonColor: '#059669',
          confirmButtonText: 'Verificar Partidas'
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'No se detectaron ventas',
          text: 'La IA no pudo identificar filas legibles de venta en la foto subida. Verifica la iluminación y el enfoque.',
          confirmButtonColor: '#059669'
        });
      }
    } catch (err: any) {
      setAiInlineIsScanning(false);
      Swal.fire({
        icon: 'error',
        title: 'Error de análisis con Gemini Vision',
        html: `
          <div class="text-left text-xs text-gray-700 space-y-2">
            <p>No se pudo procesar la fotografía con Google Gemini:</p>
            <div class="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded font-mono text-[11px] break-words">
              ${err?.message || 'Error desconocido'}
            </div>
            <p class="text-[11px] text-gray-500 mt-2">
              Verifica tu API Key de Gemini o genérala gratis en Google AI Studio.
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: '🔑 Configurar API Key',
        cancelButtonText: 'Cerrar',
        confirmButtonColor: '#7c3aed'
      }).then(res => {
        if (res.isConfirmed) {
          handleConfigureGeminiKey();
        }
      });
    }
  };

  const handleUpdateInlineExtractedSale = (
    index: number,
    field: 'productId' | 'quantity' | 'sellingPrice' | 'paymentMethod',
    value: any
  ) => {
    setAiInlineExtractedSales(prev => prev.map((item, idx) => {
      if (idx !== index) return item;

      if (field === 'productId') {
        const prod = data.products.find(p => p.id === value);
        if (!prod) return item;
        const subtotal = item.quantity * item.sellingPrice;
        const costTotal = item.quantity * prod.costPrice;
        return {
          ...item,
          productId: prod.id,
          productName: prod.name,
          costPrice: prod.costPrice,
          costTotal,
          profit: subtotal - costTotal
        };
      }

      if (field === 'quantity') {
        const q = Math.max(1, Number(value) || 1);
        const subtotal = q * item.sellingPrice;
        const costTotal = q * item.costPrice;
        return {
          ...item,
          quantity: q,
          subtotal,
          costTotal,
          profit: subtotal - costTotal
        };
      }

      if (field === 'sellingPrice') {
        const sp = Number(value) || 0;
        const subtotal = item.quantity * sp;
        return {
          ...item,
          sellingPrice: sp,
          subtotal,
          profit: subtotal - item.costTotal
        };
      }

      if (field === 'paymentMethod') {
        return {
          ...item,
          paymentMethod: value
        };
      }

      return item;
    }));
  };

  const handleAddRowToInlineExtracted = () => {
    const prod = availableProductsInStore[0] || data.products[0];
    if (!prod) return;
    const newLine: CommercialSaleLine = {
      id: `ai-manual-row-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      quantity: 1,
      costPrice: prod.costPrice,
      sellingPrice: 75000,
      subtotal: 75000,
      costTotal: prod.costPrice,
      profit: 75000 - prod.costPrice,
      paymentMethod: 'Bold',
      hour: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true }),
      verified: true
    };
    setAiInlineExtractedSales(prev => [...prev, newLine]);
  };

  const handleConfirmInlineExtractedSales = () => {
    if (isAlreadyClosed && isClosureSecurityLocked) {
      Swal.fire({
        icon: 'info',
        title: '🔒 Cierre de Caja Protegido',
        text: 'Este día ya cuenta con un cierre oficial registrado. Para agregar ventas extraídas con IA, primero pulsa "Desbloquear para Modificar" en el banner superior.',
        confirmButtonColor: '#059669',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (aiInlineExtractedSales.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay ventas para confirmar',
        text: 'Escanea al menos una fotografía o agrega partidas en la vista previa.',
        confirmButtonColor: '#059669'
      });
      return;
    }

    setManualSales(prev => [...prev, ...aiInlineExtractedSales]);
    const addedCount = aiInlineExtractedSales.length;
    const addedTotal = aiInlineTotals.totalSales;
    const addedItems = aiInlineTotals.totalItems;

    setAiInlineExtractedSales([]);
    setAiInlineImages([]);
    setIsAiInlineOpen(false);

    Swal.fire({
      icon: 'success',
      title: '¡Ventas Agregadas con Éxito!',
      html: `
        <p class="text-xs text-gray-700">Se agregaron <b>${addedCount} ventas</b> (${addedItems} prendas) por un total de <b>${formatPrice(addedTotal)}</b> a la lista del día.</p>
        <p class="text-[11px] text-emerald-800 font-bold mt-2">El cuadre de caja y el desglose de pagos se han actualizado automáticamente.</p>
      `,
      confirmButtonColor: '#059669'
    });
  };

  const [newManualSale, setNewManualSale] = useState({
    productId: '',
    quantity: 1,
    sellingPrice: '' as string | number, // Se digita al momento de vender
    paymentMethod: 'Bold',
    hour: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  });

  // Si cambia la sede o los productos, garantizar que el producto activo tenga stock > 0
  useEffect(() => {
    if (availableProductsInStore.length > 0) {
      const exists = availableProductsInStore.some(p => p.id === newManualSale.productId);
      if (!exists) {
        setNewManualSale(prev => ({
          ...prev,
          productId: availableProductsInStore[0].id
        }));
      }
    } else {
      setNewManualSale(prev => ({
        ...prev,
        productId: ''
      }));
    }
  }, [availableProductsInStore, manualStoreId]);

  // Filtrado en vivo del buscador del select (solo con stock > 0)
  const filteredProductsForSelect = useMemo(() => {
    if (!productSearchQuery.trim()) return availableProductsInStore;
    const q = productSearchQuery.toLowerCase();
    return availableProductsInStore.filter(p => p.name.toLowerCase().includes(q));
  }, [availableProductsInStore, productSearchQuery]);

  // Tendencia de ventas de los últimos 7 días en la sede seleccionada
  const storeSalesTrend = useMemo(() => {
    const days: { dateStr: string; label: string; count: number; total: number }[] = [];
    const baseDate = new Date(manualDateStr + 'T12:00:00');
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayNum = d.getDate();
      const monthShort = d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
      const label = `${dayNum} ${monthShort}`;

      if (dStr === manualDateStr) {
        const count = manualSales.reduce((acc, s) => acc + s.quantity, 0);
        const total = manualSales.reduce((acc, s) => acc + s.subtotal, 0);
        days.push({ dateStr: dStr, label, count, total });
      } else {
        const c = data.cuadres.find(x => x.dateStr === dStr && x.storeId === manualStoreId);
        const count = c?.sales ? c.sales.reduce((acc, s) => acc + s.quantity, 0) : (c?.totalItems || 0);
        const total = c?.totalSales || 0;
        days.push({ dateStr: dStr, label, count, total });
      }
    }
    const maxVal = Math.max(...days.map(d => d.count), 10);
    return { days, maxVal };
  }, [data.cuadres, manualDateStr, manualStoreId, manualSales]);

  const existingCuadre = useMemo(() => {
    return data.cuadres.find(c => c.dateStr === manualDateStr && c.storeId === manualStoreId && (c.status === 'REGISTERED' || c.status === 'NO_SALES'));
  }, [data.cuadres, manualDateStr, manualStoreId]);

  const isAlreadyClosed = !!existingCuadre;
  const [isClosureSecurityLocked, setIsClosureSecurityLocked] = useState<boolean>(true);

  useEffect(() => {
    const existing = data.cuadres.find(c => c.dateStr === manualDateStr && c.storeId === manualStoreId && (c.status === 'REGISTERED' || c.status === 'NO_SALES'));
    if (existing) {
      setIsClosureSecurityLocked(true);
      if (existing.sales && existing.sales.length > 0) {
        setManualSales(existing.sales);
      } else {
        setManualSales([]);
      }
    } else {
      setIsClosureSecurityLocked(false);
      setManualSales([]);
    }
  }, [manualDateStr, manualStoreId, data.cuadres]);

  const handleToggleClosureLock = () => {
    if (!isAlreadyClosed) return;

    if (isClosureSecurityLocked) {
      const storeObj = STORES_LIST.find(s => s.id === manualStoreId)!;
      Swal.fire({
        icon: 'warning',
        title: '🔒 ¿Desbloquear Cierre de Caja?',
        html: `
          <div class="text-left text-xs text-gray-700 space-y-2">
            <p>El cierre de ventas de <b>${storeObj.shortName}</b> para el <b>${manualDateStr}</b> ya fue registrado oficialmente:</p>
            <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <p><b>Total registrado:</b> ${existingCuadre ? formatPrice(existingCuadre.totalSales) : '$0'} (${existingCuadre?.totalItems || 0} prendas)</p>
              ${existingCuadre?.updatedAt ? `<p class="text-[10px] text-gray-500 font-mono">Última actualización: ${new Date(existingCuadre.updatedAt).toLocaleString('es-CO')}</p>` : ''}
            </div>
            <p class="text-amber-900 font-bold">
              Al desbloquear, podrás agregar o eliminar ventas y actualizar el cierre. Al guardar nuevamente, el inventario se ajustará automáticamente.
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sí, Desbloquear Cierre',
        cancelButtonText: 'Mantener Bloqueado',
        confirmButtonColor: '#d97706',
        cancelButtonColor: '#6b7280'
      }).then(res => {
        if (res.isConfirmed) {
          setIsClosureSecurityLocked(false);
        }
      });
    } else {
      setIsClosureSecurityLocked(true);
    }
  };

  const handleReopenClosure = () => {
    if (!existingCuadre) return;
    const storeObj = STORES_LIST.find(s => s.id === manualStoreId)!;

    Swal.fire({
      icon: 'warning',
      title: '¿Reabrir este Cierre de Caja?',
      html: `
        <div class="text-left text-xs text-gray-700 space-y-2">
          <p>Vas a revertir el cierre de <b>${storeObj.shortName}</b> del <b>${manualDateStr}</b>.</p>
          <div class="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1 text-red-900">
            <p>• Se devolverán las <b>${existingCuadre.totalItems} prendas</b> vendidas al stock de ${storeObj.shortName}.</p>
            <p>• El día volverá al estado <b>"Pendiente de Cierre"</b>.</p>
            <p>• Las ventas anotadas se mantendrán en pantalla para que puedas corregirlas o iniciar de nuevo.</p>
          </div>
          <p class="font-bold text-gray-900">¿Estás seguro de que deseas reabrir el cuadre?</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, Reabrir y Restaurar Stock',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280'
    }).then(res => {
      if (res.isConfirmed) {
        CommercialService.deleteCuadre(existingCuadre.id, true);
        refreshData();
        setIsClosureSecurityLocked(false);
        Swal.fire({
          icon: 'success',
          title: 'Cierre Reabierto',
          text: `El día ${manualDateStr} en ${storeObj.shortName} volvió a estado pendiente y el inventario fue restaurado con éxito.`,
          confirmButtonColor: '#059669'
        });
      }
    });
  };

  const handleRemoveManualSale = (saleId: string) => {
    if (isAlreadyClosed && isClosureSecurityLocked) {
      Swal.fire({
        icon: 'info',
        title: '🔒 Cierre de Caja Protegido',
        text: 'Este cierre ya fue registrado y está protegido. Desbloquea el cierre en el banner superior si necesitas eliminar o modificar ventas.',
        confirmButtonColor: '#059669',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    setManualSales(prev => prev.filter(x => x.id !== saleId));
  };

  const handleAddManualSale = () => {
    if (isAlreadyClosed && isClosureSecurityLocked) {
      Swal.fire({
        icon: 'info',
        title: '🔒 Cierre de Caja Protegido',
        text: 'Este cierre de caja ya fue registrado y está protegido. Si necesitas agregar más ventas a este día, desbloquea el cierre en la parte superior.',
        confirmButtonColor: '#059669',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    const prod = data.products.find(p => p.id === newManualSale.productId);
    if (!prod) return;

    const priceNum = Number(newManualSale.sellingPrice);
    if (!priceNum || priceNum <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Precio de venta requerido',
        text: 'Por favor ingresa el precio al que vendiste la prenda.',
        confirmButtonColor: '#007A33'
      });
      return;
    }

    const currentStock = prod.stocks[manualStoreId] || 0;
    if (currentStock < newManualSale.quantity) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock bajo en sede',
        text: `En ${STORES_LIST.find(s => s.id === manualStoreId)?.shortName} solo quedan ${currentStock} unidades de ${prod.name}. ¿Deseas continuar?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#007A33'
      }).then(res => {
        if (res.isConfirmed) {
          executeAddManualSale(prod, priceNum);
        }
      });
      return;
    }

    executeAddManualSale(prod, priceNum);
  };

  const executeAddManualSale = (prod: CommercialProduct, priceNum: number) => {
    const subtotal = newManualSale.quantity * priceNum;
    const costTotal = newManualSale.quantity * prod.costPrice;
    const profit = subtotal - costTotal;

    const line: CommercialSaleLine = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      productId: prod.id,
      productName: prod.name,
      quantity: newManualSale.quantity,
      costPrice: prod.costPrice,
      sellingPrice: priceNum,
      subtotal,
      costTotal,
      profit,
      paymentMethod: newManualSale.paymentMethod,
      hour: newManualSale.hour,
      verified: true
    };

    setManualSales(prev => [...prev, line]);
    setNewManualSale(prev => ({ ...prev, sellingPrice: '' }));
  };

  const manualTotals = useMemo(() => {
    const totalSales = manualSales.reduce((acc, s) => acc + s.subtotal, 0);
    const totalCost = manualSales.reduce((acc, s) => acc + s.costTotal, 0);
    const totalProfit = totalSales - totalCost;
    const totalItems = manualSales.reduce((acc, s) => acc + s.quantity, 0);

    const byMethod: { [key: string]: number } = {};
    PAYMENT_METHODS.forEach(pm => { byMethod[pm.id] = 0; });
    manualSales.forEach(s => {
      byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] || 0) + s.subtotal;
    });

    return { totalSales, totalCost, totalProfit, totalItems, byMethod };
  }, [manualSales]);

  const handleSaveManualCuadre = () => {
    const storeObj = STORES_LIST.find(s => s.id === manualStoreId)!;

    // Si ya está cerrado pero el modo seguro sigue bloqueado
    if (isAlreadyClosed && isClosureSecurityLocked) {
      Swal.fire({
        icon: 'info',
        title: '🔒 Cierre Bloqueado por Seguridad',
        html: `
          <div class="text-left text-xs text-gray-700 space-y-2">
            <p>Esta sede (<b>${storeObj.shortName}</b>) ya tiene un cierre oficial guardado para el <b>${manualDateStr}</b> por valor de <b>${existingCuadre ? formatPrice(existingCuadre.totalSales) : '$0'}</b>.</p>
            <p class="text-amber-800 font-bold">
              Para evitar modificaciones involuntarias y descuadres en el inventario, el botón está protegido.
            </p>
            <p class="text-gray-500">
              Para actualizar este cierre, haz clic en el botón <b>"Desbloquear para Modificar"</b> en el banner superior.
            </p>
          </div>
        `,
        confirmButtonColor: '#059669',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (manualSales.length === 0) {
      Swal.fire({
        icon: 'question',
        title: '¿No hubo ventas este día?',
        text: `No has anotado ventas en ${storeObj.shortName} para el ${manualDateStr}. ¿Deseas marcar este día como "Día sin ventas ($0)"?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, marcar sin ventas',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#eab308'
      }).then(res => {
        if (res.isConfirmed) {
          CommercialService.markNoSalesDay(manualDateStr, manualStoreId);
          refreshData();
          setIsClosureSecurityLocked(true);
          Swal.fire({
            icon: 'info',
            title: 'Día registrado sin ventas',
            text: `Se marcó el día ${manualDateStr} para ${storeObj.shortName} con $0 de venta.`,
            confirmButtonColor: '#059669'
          });
        }
      });
      return;
    }

    const executeSave = () => {
      const cuadre: CommercialDailyCuadre = {
        id: `cuadre-${manualDateStr}-${manualStoreId}`,
        dateStr: manualDateStr,
        storeId: manualStoreId,
        storeName: storeObj.shortName,
        status: 'REGISTERED',
        sales: manualSales,
        totalSales: manualTotals.totalSales,
        totalCost: manualTotals.totalCost,
        totalProfit: manualTotals.totalProfit,
        totalItems: manualTotals.totalItems,
        totalsByMethod: manualTotals.byMethod,
        updatedAt: new Date().toISOString()
      };

      CommercialService.saveCuadre(cuadre);
      refreshData();
      setIsClosureSecurityLocked(true);

      Swal.fire({
        icon: 'success',
        title: isAlreadyClosed ? '¡Cierre de Ventas Actualizado!' : '¡Cierre de Ventas Guardado!',
        html: `
          <p class="text-sm">El cierre de ventas de <b>${storeObj.shortName}</b> para el <b>${manualDateStr}</b> quedó registrado correctamente.</p>
          <p class="text-xs text-emerald-700 font-bold mt-2">Total vendido: ${formatPrice(manualTotals.totalSales)} (${manualTotals.totalItems} prendas)</p>
          <p class="text-[11px] text-gray-500 mt-1">El stock de ${storeObj.shortName} se actualizó automáticamente.</p>
        `,
        confirmButtonColor: '#059669'
      });
    };

    // Si ya existía un cierre y fue desbloqueado para editar, pedir confirmación con comparativa
    if (isAlreadyClosed) {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ ¿Confirmar actualización de cierre?',
        html: `
          <div class="text-left text-xs text-gray-700 space-y-2">
            <p>Vas a sobreescribir el cierre oficial de <b>${storeObj.shortName}</b> del <b>${manualDateStr}</b>.</p>
            <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <p><b>Cierre anterior:</b> ${existingCuadre ? formatPrice(existingCuadre.totalSales) : '$0'} (${existingCuadre?.totalItems || 0} prendas)</p>
              <p class="text-emerald-700 font-black"><b>Nuevo cierre a guardar:</b> ${formatPrice(manualTotals.totalSales)} (${manualTotals.totalItems} prendas)</p>
            </div>
            <p class="text-amber-800 font-medium">
              Al confirmar, el descuento de inventario anterior se revertirá y se aplicará el descuento de las nuevas ventas automáticamente.
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sí, Sobrescribir y Actualizar Cierre',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d97706',
        cancelButtonColor: '#6b7280'
      }).then(res => {
        if (res.isConfirmed) {
          executeSave();
        }
      });
      return;
    }

    // Si es un cierre nuevo, pedir confirmación antes de descontar stock
    Swal.fire({
      icon: 'question',
      title: '¿Realizar Cierre de Ventas Oficial?',
      html: `
        <div class="text-left text-xs text-gray-700 space-y-2">
          <p>¿Confirmas el cierre para <b>${storeObj.shortName}</b> el <b>${manualDateStr}</b>?</p>
          <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
            <p><b>Total ventas:</b> ${manualSales.length} ventas (${manualTotals.totalItems} prendas)</p>
            <p class="text-emerald-900 font-black text-sm"><b>Monto total:</b> ${formatPrice(manualTotals.totalSales)}</p>
          </div>
          <p class="text-gray-500 text-[11px]">
            Estas prendas se descontarán automáticamente del stock de <b>${storeObj.shortName}</b>.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, Realizar Cierre de Ventas',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280'
    }).then(res => {
      if (res.isConfirmed) {
        executeSave();
      }
    });
  };

  const handleMarkNoSalesDirectly = () => {
    const storeObj = STORES_LIST.find(s => s.id === manualStoreId)!;

    if (isAlreadyClosed && isClosureSecurityLocked) {
      Swal.fire({
        icon: 'info',
        title: '🔒 Cierre Bloqueado por Seguridad',
        text: 'Este día ya tiene un cierre oficial. Desbloquea el cierre en la parte superior si deseas marcarlo como día sin ventas.',
        confirmButtonColor: '#059669'
      });
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: '¿Marcar día sin ventas ($0)?',
      text: `Se marcará el día ${manualDateStr} para ${storeObj.shortName} como cerrado sin ventas.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar sin ventas',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#eab308'
    }).then(res => {
      if (res.isConfirmed) {
        CommercialService.markNoSalesDay(manualDateStr, manualStoreId);
        refreshData();
        setManualSales([]);
        setIsClosureSecurityLocked(true);
        Swal.fire({
          icon: 'info',
          title: 'Día registrado sin ventas',
          text: `Se marcó el día ${manualDateStr} para ${storeObj.shortName} como cerrado / sin ventas ($0).`,
          confirmButtonColor: '#059669'
        });
      }
    });
  };

  // =========================================================================
  // TAB 4: CUADRES DE VENTAS (CONTROL DE CUADRES POR DÍA Y SEDE)
  // =========================================================================
  const cuadresMatrixData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === (now.getMonth() + 1);
    const isPastMonth = selectedYear < now.getFullYear() || (selectedYear === now.getFullYear() && selectedMonth < (now.getMonth() + 1));
    const currentDay = now.getDate();

    let countConCuadre = 0;
    let countPendientes = 0;
    let countSinVentas = 0;
    const pendingList: { dateStr: string; storeId: string; storeName: string; day: number }[] = [];

    STORES_LIST.forEach(store => {
      daysArray.forEach(day => {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const found = data.cuadres.find(c => c.dateStr === dateStr && c.storeId === store.id);

        const isPastOrToday = isPastMonth || (isCurrentMonth && day <= currentDay);

        if (found) {
          if (found.status === 'REGISTERED') countConCuadre++;
          else if (found.status === 'NO_SALES') countSinVentas++;
          else if (isPastOrToday) {
            countPendientes++;
            pendingList.push({ dateStr, storeId: store.id, storeName: store.shortName, day });
          }
        } else if (isPastOrToday) {
          countPendientes++;
          pendingList.push({ dateStr, storeId: store.id, storeName: store.shortName, day });
        }
      });
    });

    const totalCalculated = countConCuadre + countPendientes + countSinVentas;
    const pct = totalCalculated > 0 ? Math.round(((countConCuadre + countSinVentas) / totalCalculated) * 100) : 100;

    return { daysArray, countConCuadre, countPendientes, countSinVentas, pct, pendingList, isCurrentMonth, currentDay };
  }, [data.cuadres, selectedMonth, selectedYear]);

  const handleOpenPendingCuadre = (storeId: string, dateStr: string) => {
    setManualStoreId(storeId);
    setManualDateStr(dateStr);
    setActiveTab('registro-manual');
  };

  // =========================================================================
  // TAB 6: 4 INVENTARIOS POR SEDE (SOLO 1 NOMBRE: CATEGORÍA/PRODUCTO, SIN PRECIO VENTA)
  // =========================================================================
  const [invStoreFilter, setInvStoreFilter] = useState<'republica' | 'modelo' | 'quality' | 'mariano' | 'all'>('republica');
  const [invSearch, setInvSearch] = useState('');
  const [selectedProductEdit, setSelectedProductEdit] = useState<CommercialProduct | null>(null);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editStoreTarget, setEditStoreTarget] = useState<StoreId>('republica');
  const [inventorySecurityLocked, setInventorySecurityLocked] = useState(false);
  const [editProductForm, setEditProductForm] = useState<{
    name: string;
    costPrice: string | number;
    stock: string | number;
  }>({
    name: '',
    costPrice: '',
    stock: ''
  });
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  const handleOpenEditProductModal = (product: CommercialProduct) => {
    if (inventorySecurityLocked) {
      Swal.fire({
        icon: 'info',
        title: '🔒 Modo Seguro Bloqueado',
        text: 'La edición está bloqueada para prevenir clics accidentales. Desactiva el candado de seguridad en la barra superior para continuar.',
        confirmButtonColor: '#059669',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const targetStore: StoreId = invStoreFilter === 'all' ? 'republica' : (invStoreFilter as StoreId);
    setSelectedProductEdit(product);
    setEditStoreTarget(targetStore);
    const storeStock = product.stocks[targetStore];
    setEditProductForm({
      name: product.name,
      costPrice: product.costPrice > 0 ? String(product.costPrice) : '',
      stock: (storeStock !== undefined && storeStock !== null && storeStock > 0) ? String(storeStock) : ''
    });
    setIsEditProductModalOpen(true);
  };

  const handleSwitchEditStoreTarget = (storeId: StoreId) => {
    setEditStoreTarget(storeId);
    if (selectedProductEdit) {
      const storeStock = selectedProductEdit.stocks[storeId];
      setEditProductForm(prev => ({
        ...prev,
        stock: (storeStock !== undefined && storeStock !== null && storeStock > 0) ? String(storeStock) : ''
      }));
    }
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductEdit) return;

    const newStock = Math.max(0, Number(editProductForm.stock) || 0);
    const newCost = Math.max(0, Number(editProductForm.costPrice) || 0);
    const newName = editProductForm.name.trim().toUpperCase();

    const currentStoreObj = STORES_LIST.find(s => s.id === editStoreTarget);
    const prevStock = selectedProductEdit.stocks[editStoreTarget] || 0;
    const prevCost = selectedProductEdit.costPrice;
    const prevName = selectedProductEdit.name;

    const stockDiff = newStock - prevStock;
    const costDiff = newCost - prevCost;

    // Si no hubo ningún cambio, cerrar sin alerta
    if (newStock === prevStock && newCost === prevCost && newName === prevName) {
      setIsEditProductModalOpen(false);
      setSelectedProductEdit(null);
      return;
    }

    const stockChangeBadge = stockDiff === 0 
      ? '<span style="color: #6b7280; font-weight: bold;">Sin cambio</span>' 
      : stockDiff > 0 
        ? `<span style="color: #059669; font-weight: bold; background-color: #ecfdf5; padding: 2px 6px; border-radius: 4px;">+${stockDiff} u (Aumento)</span>` 
        : `<span style="color: #dc2626; font-weight: bold; background-color: #fef2f2; padding: 2px 6px; border-radius: 4px;">${stockDiff} u (Disminución)</span>`;

    const costChangeBadge = costDiff === 0
      ? '<span style="color: #6b7280; font-weight: bold;">Sin cambio</span>'
      : costDiff > 0
        ? `<span style="color: #b45309; font-weight: bold; background-color: #fefce8; padding: 2px 6px; border-radius: 4px;">+${formatPrice(costDiff)}</span>`
        : `<span style="color: #059669; font-weight: bold; background-color: #ecfdf5; padding: 2px 6px; border-radius: 4px;">-${formatPrice(Math.abs(costDiff))}</span>`;

    Swal.fire({
      title: '🛡️ Confirmar Modificación de Inventario',
      html: `
        <div style="text-align: left; font-size: 12px; line-height: 1.5; color: #374151;">
          <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 12px; padding: 12px; margin-bottom: 12px;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #047857; margin-bottom: 2px;">
              Sede: ${currentStoreObj?.name}
            </div>
            <div style="font-size: 15px; font-weight: 900; color: #064e3b;">
              ${newName}
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px;">
            <thead>
              <tr style="background-color: #f3f4f6; text-align: left; font-size: 10px; color: #6b7280; text-transform: uppercase;">
                <th style="padding: 6px 8px; border-radius: 6px 0 0 6px;">Campo</th>
                <th style="padding: 6px 8px;">Antes</th>
                <th style="padding: 6px 8px;">Nuevo</th>
                <th style="padding: 6px 8px; border-radius: 0 6px 6px 0;">Ajuste</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 8px; font-weight: bold; color: #111827;">Stock (${currentStoreObj?.shortName})</td>
                <td style="padding: 8px; font-family: monospace;">${prevStock} u</td>
                <td style="padding: 8px; font-family: monospace; font-weight: 900; color: #047857;">${newStock} u</td>
                <td style="padding: 8px; font-size: 11px;">${stockChangeBadge}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #111827;">Costo unitario</td>
                <td style="padding: 8px; font-family: monospace;">${formatPrice(prevCost)}</td>
                <td style="padding: 8px; font-family: monospace; font-weight: 900; color: #1e40af;">${formatPrice(newCost)}</td>
                <td style="padding: 8px; font-size: 11px;">${costChangeBadge}</td>
              </tr>
            </tbody>
          </table>

          <p style="margin: 0; color: #4b5563; font-size: 11px; background-color: #f9fafb; padding: 8px; border-radius: 8px;">
            ⚠️ <i>Verifica los valores antes de confirmar. Esta actualización afectará las existencias en tiempo real de <strong>${currentStoreObj?.name}</strong>.</i>
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aplicar cambios',
      cancelButtonText: 'Revisar / Cancelar',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      focusConfirm: true,
    }).then(res => {
      if (res.isConfirmed) {
        const updated: CommercialProduct = {
          ...selectedProductEdit,
          name: newName,
          costPrice: newCost,
          stocks: {
            ...selectedProductEdit.stocks,
            [editStoreTarget]: newStock
          }
        };

        CommercialService.saveProduct(updated);
        refreshData();
        setIsEditProductModalOpen(false);
        setSelectedProductEdit(null);

        Swal.fire({
          icon: 'success',
          title: 'Inventario actualizado',
          text: `Se aplicaron los cambios de ${updated.name} en ${currentStoreObj?.name}.`,
          timer: 1600,
          showConfirmButton: false
        });
      }
    });
  };

  // Formulario nuevo producto: Solo 1 Nombre/Categoría, Costo de compra y Stock en las 4 sedes
  const [newProductForm, setNewProductForm] = useState<{
    name: string;
    costPrice: string | number;
    stockRepublica: string | number;
    stockModelo: string | number;
    stockQuality: string | number;
    stockMariano: string | number;
  }>({
    name: '',
    costPrice: '',
    stockRepublica: '',
    stockModelo: '',
    stockQuality: '',
    stockMariano: ''
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name.trim()) return;

    const prod: CommercialProduct = {
      id: `prod-${Date.now()}`,
      name: newProductForm.name.trim().toUpperCase(),
      costPrice: Number(newProductForm.costPrice) || 0,
      stocks: {
        republica: Number(newProductForm.stockRepublica) || 0,
        modelo: Number(newProductForm.stockModelo) || 0,
        quality: Number(newProductForm.stockQuality) || 0,
        mariano: Number(newProductForm.stockMariano) || 0
      }
    };

    CommercialService.saveProduct(prod);
    refreshData();
    setIsNewProductModalOpen(false);
    setNewProductForm({
      name: '',
      costPrice: '',
      stockRepublica: '',
      stockModelo: '',
      stockQuality: '',
      stockMariano: ''
    });

    Swal.fire({
      icon: 'success',
      title: 'Producto creado en inventario',
      text: `Se agregó ${prod.name} con existencias independientes para las 4 sedes.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleDeleteProduct = (product: CommercialProduct) => {
    if (inventorySecurityLocked) {
      Swal.fire({
        icon: 'info',
        title: '🔒 Modo Seguro Bloqueado',
        text: 'La eliminación está bloqueada para prevenir pérdidas accidentales de catálogo. Desactiva el candado de seguridad en la barra superior para continuar.',
        confirmButtonColor: '#059669',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const totalStock = STORES_LIST.reduce((acc, s) => acc + (product.stocks[s.id] || 0), 0);
    const storeBreakdown = STORES_LIST.map(s => `<b>${s.shortName}:</b> ${product.stocks[s.id] || 0} u`).join(' | ');

    Swal.fire({
      title: '⚠️ ¿Confirmar eliminación definitiva?',
      html: `
        <div style="text-align: left; font-size: 13px; line-height: 1.5; color: #374151;">
          <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 12px; margin-bottom: 12px;">
            <p style="font-weight: 900; color: #991b1b; margin: 0 0 4px 0; font-size: 14px;">
              ${product.name}
            </p>
            <p style="margin: 0; color: #b91c1c; font-size: 11px;">
              Existencias actuales en total: <strong>${totalStock} prendas</strong>
            </p>
            <p style="margin: 4px 0 0 0; color: #7f1d1d; font-size: 10px;">
              ${storeBreakdown}
            </p>
          </div>
          <p style="margin-bottom: 8px; color: #4b5563; font-size: 12px;">
            Esta acción <strong>eliminará por completo esta referencia</strong> del inventario de todas las 4 sedes y no se puede deshacer.
          </p>
          <p style="font-weight: 700; color: #111827; margin-bottom: 6px; font-size: 12px;">
            Para autorizar el borrado, escribe la palabra <span style="background-color: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 900;">ELIMINAR</span>:
          </p>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Escribe ELIMINAR',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar definitivamente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      focusCancel: true,
      preConfirm: (inputValue) => {
        if (!inputValue || inputValue.trim().toUpperCase() !== 'ELIMINAR') {
          Swal.showValidationMessage('Debes escribir exactamente la palabra "ELIMINAR" para continuar');
          return false;
        }
        return true;
      }
    }).then(res => {
      if (res.isConfirmed) {
        CommercialService.deleteProduct(product.id);
        refreshData();
        if (selectedProductEdit?.id === product.id) {
          setSelectedProductEdit(null);
          setIsEditProductModalOpen(false);
        }
        Swal.fire({
          icon: 'success',
          title: 'Producto eliminado',
          text: `La referencia ${product.name} fue removida del inventario de todas las sedes.`,
          timer: 1800,
          showConfirmButton: false
        });
      }
    });
  };

  const filteredInventory = useMemo(() => {
    return data.products.filter(p => {
      return p.name.toLowerCase().includes(invSearch.toLowerCase());
    });
  }, [data.products, invSearch]);

  const inventoryKpis = useMemo(() => {
    if (invStoreFilter === 'all') {
      const totalProds = data.products.length;
      let totalStockSede = 0;
      let valorInventarioCosto = 0;

      data.products.forEach(p => {
        STORES_LIST.forEach(s => {
          const st = p.stocks[s.id] || 0;
          totalStockSede += st;
          valorInventarioCosto += st * p.costPrice;
        });
      });

      const costoPromedio = totalStockSede > 0 ? Math.round(valorInventarioCosto / totalStockSede) : 0;
      return { totalProds, totalStockSede, valorInventarioCosto, costoPromedio };
    } else {
      const prodsWithStock = data.products.filter(p => (p.stocks[invStoreFilter] || 0) > 0).length;
      const totalStockSede = data.products.reduce((acc, p) => acc + (p.stocks[invStoreFilter] || 0), 0);
      const valorInventarioCosto = data.products.reduce((acc, p) => acc + (p.stocks[invStoreFilter] || 0) * p.costPrice, 0);
      const costoPromedio = totalStockSede > 0 ? Math.round(valorInventarioCosto / totalStockSede) : 0;

      return { totalProds: prodsWithStock || data.products.length, totalStockSede, valorInventarioCosto, costoPromedio };
    }
  }, [data.products, invStoreFilter]);

  // =========================================================================
  // TAB 7: MOVIMIENTOS DE MERCANCÍA (ENTRADA Y SALIDA VINCULADOS A INVENTARIO)
  // =========================================================================
  const [movementType, setMovementType] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [movementStoreId, setMovementStoreId] = useState<string>('republica');
  const [movementDateStr, setMovementDateStr] = useState<string>(now.toISOString().split('T')[0]);
  const [movementProductId, setMovementProductId] = useState<string>('');
  const [movementQuantity, setMovementQuantity] = useState<number | string>(1);
  const [movementDescription, setMovementDescription] = useState<string>('');
  const [isMovementSelectOpen, setIsMovementSelectOpen] = useState(false);
  const [movementProductSearch, setMovementProductSearch] = useState('');
  const movementSelectRef = useRef<HTMLDivElement>(null);

  // Filtros del historial de movimientos
  const [movementFilterStore, setMovementFilterStore] = useState<string>('all');
  const [movementFilterType, setMovementFilterType] = useState<'ALL' | 'ENTRADA' | 'SALIDA'>('ALL');
  const [movementHistorySearch, setMovementHistorySearch] = useState<string>('');

  useEffect(() => {
    function handleClickOutsideMovement(event: MouseEvent) {
      if (movementSelectRef.current && !movementSelectRef.current.contains(event.target as Node)) {
        setIsMovementSelectOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutsideMovement);
    return () => document.removeEventListener('mousedown', handleClickOutsideMovement);
  }, []);

  const movementSelectedProduct = useMemo(() => {
    return data.products.find(p => p.id === movementProductId) || null;
  }, [data.products, movementProductId]);

  const movementCurrentStock = useMemo(() => {
    if (!movementSelectedProduct) return 0;
    return movementSelectedProduct.stocks[movementStoreId] || 0;
  }, [movementSelectedProduct, movementStoreId]);

  const filteredMovementProducts = useMemo(() => {
    const q = movementProductSearch.trim().toLowerCase();
    return data.products.filter(p => {
      if (movementType === 'SALIDA') {
        const stock = p.stocks[movementStoreId] || 0;
        if (stock <= 0) return false;
      }
      if (!q) return true;
      return p.name.toLowerCase().includes(q);
    });
  }, [data.products, movementProductSearch, movementType, movementStoreId]);

  const handleRegisterMovement = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!movementProductId) {
      Swal.fire({
        icon: 'warning',
        title: 'Producto requerido',
        text: 'Por favor selecciona la prenda a la que deseas registrar el movimiento.',
        confirmButtonColor: '#059669'
      });
      return;
    }

    const prod = data.products.find(p => p.id === movementProductId);
    if (!prod) {
      Swal.fire({ icon: 'error', title: 'Producto no encontrado', text: 'El producto seleccionado no existe en el catálogo.' });
      return;
    }

    const qty = Math.floor(Number(movementQuantity));
    if (isNaN(qty) || qty <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Cantidad inválida',
        text: 'Ingresa una cantidad mayor a cero (0).',
        confirmButtonColor: '#059669'
      });
      return;
    }

    const currentStock = prod.stocks[movementStoreId] || 0;
    const storeObj = STORES_LIST.find(s => s.id === movementStoreId);
    const storeName = storeObj?.shortName || movementStoreId;

    if (movementType === 'SALIDA') {
      if (qty > currentStock) {
        Swal.fire({
          icon: 'error',
          title: 'Stock insuficiente',
          html: `
            <p class="text-xs text-gray-700">En <b>${storeName}</b> solo hay <b>${currentStock} unidades</b> disponibles de <b>${prod.name}</b>.</p>
            <p class="text-[11px] text-red-600 font-bold mt-2">No se puede realizar una salida por ${qty} unidades.</p>
          `,
          confirmButtonColor: '#dc2626'
        });
        return;
      }
    }

    const costSub = qty * prod.costPrice;

    const movement: CommercialMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: movementType,
      dateStr: movementDateStr,
      storeId: movementStoreId,
      storeName: storeName,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity: qty,
          costPrice: prod.costPrice,
          subtotal: costSub
        }
      ],
      totalUnits: qty,
      totalCost: costSub,
      reference: movementDescription.trim() || (movementType === 'ENTRADA' ? 'Entrada de mercancía' : 'Salida de mercancía'),
      observations: movementDescription.trim() || '',
      createdAt: new Date().toISOString()
    };

    CommercialService.saveMovement(movement);
    refreshData();

    // Resetear formulario
    setMovementQuantity(1);
    setMovementDescription('');

    const newStock = movementType === 'ENTRADA' ? currentStock + qty : currentStock - qty;

    Swal.fire({
      icon: 'success',
      title: movementType === 'ENTRADA' ? '¡Entrada Registrada!' : '¡Salida Registrada!',
      html: `
        <div class="text-left text-xs text-gray-700 space-y-2">
          <p>Se registraron <b>${qty} unidades</b> de <b>${prod.name}</b> en <b>${storeName}</b>.</p>
          <div class="p-2.5 ${movementType === 'ENTRADA' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'} rounded-xl border text-[11px] font-mono">
            <p>• Stock anterior: ${currentStock} u</p>
            <p class="font-bold">• Nuevo stock en sede: ${newStock} u ${movementType === 'ENTRADA' ? '(+ ' + qty + ')' : '(- ' + qty + ')'}</p>
          </div>
          <p class="text-[10px] text-gray-500">El inventario de la sede y el historial se actualizaron en tiempo real.</p>
        </div>
      `,
      confirmButtonColor: '#059669'
    });
  };

  const handleDeleteMovement = (mov: CommercialMovement) => {
    Swal.fire({
      title: '¿Eliminar movimiento?',
      html: `
        <p class="text-xs text-gray-600">Se eliminará el registro de <b>${mov.type}</b> de ${mov.totalUnits} prendas en <b>${mov.storeName}</b>.</p>
        <p class="text-[11px] text-amber-700 font-bold mt-2">El stock de la sede se revertirá automáticamente.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar y revertir stock',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    }).then(res => {
      if (res.isConfirmed) {
        CommercialService.deleteMovement(mov.id);
        refreshData();
        Swal.fire({
          icon: 'success',
          title: 'Movimiento eliminado',
          text: 'El movimiento ha sido eliminado y el stock fue revertido en la sede.',
          confirmButtonColor: '#059669'
        });
      }
    });
  };

  const filteredMovementsHistory = useMemo(() => {
    return data.movements.filter(m => {
      if (m.type === 'TRASLADO') return false;
      if (movementFilterStore !== 'all' && m.storeId !== movementFilterStore) return false;
      if (movementFilterType !== 'ALL' && m.type !== movementFilterType) return false;
      if (movementHistorySearch.trim()) {
        const q = movementHistorySearch.trim().toLowerCase();
        const matchProd = m.items.some(i => i.productName.toLowerCase().includes(q));
        const matchRef = (m.reference || '').toLowerCase().includes(q);
        const matchObs = (m.observations || '').toLowerCase().includes(q);
        const matchDate = m.dateStr.includes(q);
        const matchStore = m.storeName.toLowerCase().includes(q);
        return matchProd || matchRef || matchObs || matchDate || matchStore;
      }
      return true;
    });
  }, [data.movements, movementFilterStore, movementFilterType, movementHistorySearch]);

  const movementTotalsSummary = useMemo(() => {
    let totalEntradasUnits = 0;
    let totalEntradasCost = 0;
    let totalSalidasUnits = 0;
    let totalSalidasCost = 0;

    data.movements.forEach(m => {
      if (m.type === 'ENTRADA') {
        totalEntradasUnits += m.totalUnits;
        totalEntradasCost += m.totalCost;
      } else if (m.type === 'SALIDA') {
        totalSalidasUnits += m.totalUnits;
        totalSalidasCost += m.totalCost;
      }
    });

    return {
      totalEntradasUnits,
      totalEntradasCost,
      totalSalidasUnits,
      totalSalidasCost,
      totalRecords: data.movements.filter(m => m.type !== 'TRASLADO').length
    };
  }, [data.movements]);

  // =========================================================================
  // TAB 5: VENTAS MENSUALES (100% DINÁMICO DESDE CUADRES REALES)
  // =========================================================================
  const monthlyDetailedAnalytics = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

    const monthlyCuadres = data.cuadres.filter(c => {
      const matchMonth = c.dateStr.startsWith(monthPrefix);
      const matchStore = selectedStoreId === 'all' || c.storeId === selectedStoreId;
      return matchMonth && matchStore && c.status === 'REGISTERED';
    });

    const dailyEvolution = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dayDateStr = `${monthPrefix}-${String(dayNum).padStart(2, '0')}`;
      const dayCuadres = monthlyCuadres.filter(c => c.dateStr === dayDateStr);
      const sales = dayCuadres.reduce((acc, c) => acc + c.totalSales, 0);
      const profit = dayCuadres.reduce((acc, c) => acc + c.totalProfit, 0);
      return { day: dayNum, dateStr: dayDateStr, sales, profit };
    });

    const maxDaySale = Math.max(...dailyEvolution.map(d => d.sales), 1);

    const methodsSummary: { [method: string]: number } = {};
    PAYMENT_METHODS.forEach(pm => { methodsSummary[pm.id] = 0; });
    monthlyCuadres.forEach(c => {
      if (c.totalsByMethod) {
        Object.entries(c.totalsByMethod).forEach(([k, v]) => {
          methodsSummary[k] = (methodsSummary[k] || 0) + Number(v);
        });
      }
    });

    const totalVentasMonth = monthlyCuadres.reduce((acc, c) => acc + c.totalSales, 0);

    const productSalesMap: { [pId: string]: { name: string; units: number; sales: number; cost: number; profit: number } } = {};
    monthlyCuadres.forEach(c => {
      c.sales?.forEach(s => {
        if (!productSalesMap[s.productId]) {
          productSalesMap[s.productId] = { name: s.productName, units: 0, sales: 0, cost: 0, profit: 0 };
        }
        productSalesMap[s.productId].units += s.quantity;
        productSalesMap[s.productId].sales += s.subtotal;
        productSalesMap[s.productId].cost += s.costTotal;
        productSalesMap[s.productId].profit += s.profit;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    const q1Cuadres = monthlyCuadres.filter(c => {
      const day = parseInt(c.dateStr.split('-')[2]);
      return day <= 15;
    });
    const q2Cuadres = monthlyCuadres.filter(c => {
      const day = parseInt(c.dateStr.split('-')[2]);
      return day > 15;
    });

    const q1Sales = q1Cuadres.reduce((acc, c) => acc + c.totalSales, 0);
    const q1Cost = q1Cuadres.reduce((acc, c) => acc + c.totalCost, 0);
    const q1Profit = q1Sales - q1Cost;
    const q1Margin = q1Sales > 0 ? ((q1Profit / q1Sales) * 100).toFixed(1) : '0';

    const q2Sales = q2Cuadres.reduce((acc, c) => acc + c.totalSales, 0);
    const q2Cost = q2Cuadres.reduce((acc, c) => acc + c.totalCost, 0);
    const q2Profit = q2Sales - q2Cost;
    const q2Margin = q2Sales > 0 ? ((q2Profit / q2Sales) * 100).toFixed(1) : '0';

    return {
      dailyEvolution,
      maxDaySale,
      methodsSummary,
      totalVentasMonth,
      topProducts,
      q1: { sales: q1Sales, cost: q1Cost, profit: q1Profit, margin: q1Margin, cuadresCount: q1Cuadres.length },
      q2: { sales: q2Sales, cost: q2Cost, profit: q2Profit, margin: q2Margin, cuadresCount: q2Cuadres.length }
    };
  }, [data.cuadres, selectedMonth, selectedYear, selectedStoreId]);

  // =========================================================================
  // TAB 9: GASTOS Y DEUDAS
  // =========================================================================
  const [newExpenseConcept, setNewExpenseConcept] = useState('');
  const [newExpenseLocal, setNewExpenseLocal] = useState('Global');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number>(0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseConcept.trim() || newExpenseAmount <= 0) return;

    const exp: CommercialExpense = {
      id: `exp-${Date.now()}`,
      concept: newExpenseConcept.trim(),
      local: newExpenseLocal,
      monthlyAmount: Number(newExpenseAmount),
      category: 'FIJO',
      statusByMonth: { [selectedMonth]: 'PENDIENTE' }
    };

    CommercialService.saveExpense(exp);
    refreshData();
    setNewExpenseConcept('');
    setNewExpenseAmount(0);
  };

  const handleToggleExpense = (id: string) => {
    CommercialService.toggleExpenseMonth(id, selectedMonth);
    refreshData();
  };

  const [selectedDebtForAbono, setSelectedDebtForAbono] = useState<CommercialDebt | null>(null);
  const [abonoAmount, setAbonoAmount] = useState<number>(0);
  const [abonoNotes, setAbonoNotes] = useState<string>('');

  const handleSaveAbono = () => {
    if (!selectedDebtForAbono || abonoAmount <= 0) return;
    CommercialService.addAbono(selectedDebtForAbono.id, abonoAmount, now.toISOString().split('T')[0], abonoNotes);
    refreshData();
    setSelectedDebtForAbono(null);
    setAbonoAmount(0);
    setAbonoNotes('');
    Swal.fire({ icon: 'success', title: 'Abono registrado', text: 'El saldo pendiente se recalculó en tiempo real.' });
  };

  const handleResetToClean = () => {
    Swal.fire({
      title: '¿Limpiar ventas y cuadres?',
      text: 'Esto borrará los cuadres y movimientos registrados para dejar el historial en blanco. El inventario de las 4 sedes se mantendrá con todos los productos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, limpiar cuadres',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    }).then(res => {
      if (res.isConfirmed) {
        CommercialService.resetData();
        refreshData();
        Swal.fire({ icon: 'success', title: 'Limpieza completada', text: 'Los cuadres e historiales están limpios para tu registro diario.' });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* =====================================================================
          HEADER PRINCIPAL: CONTROL DE VENTAS Y FINANZAS
          ===================================================================== */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-gray-900">Control de Ventas y Finanzas</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  4 Sedes Activas
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Inventarios independientes por sede con los 43 productos reales del Excel, registro de venta con precio manual, y cierres de ventas.
              </p>
            </div>
          </div>

          {/* Selectores de Período y Filtro de Sede */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/80 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <select 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent font-bold cursor-pointer focus:outline-hidden"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="bg-transparent font-bold cursor-pointer focus:outline-hidden"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/80 text-xs font-bold">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <select 
                value={selectedStoreId} 
                onChange={e => setSelectedStoreId(e.target.value)}
                className="bg-transparent font-bold cursor-pointer focus:outline-hidden"
              >
                <option value="all">Todas las sedes (Consolidado)</option>
                {STORES_LIST.map(st => (
                  <option key={st.id} value={st.id}>{st.shortName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleResetToClean}
              className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              title="Limpiar datos de prueba"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Barra de pestañas horizontal */}
        <div className="flex items-center gap-1.5 mt-5 pt-3 border-t border-gray-100 overflow-x-auto custom-scrollbar text-xs">
          {[
            { id: 'resumen', label: 'Resumen general', icon: TrendingUp },
            { id: 'registro-manual', label: 'Anotar ventas / Cierre', icon: Edit3 },
            { id: 'historial', label: 'Historial de ventas', icon: History },
            { id: 'ventas-mensuales', label: 'Ventas mensuales', icon: BarChart3 },
            { id: 'inventario', label: '4 Inventarios (Por Sede)', icon: Boxes },
            { id: 'movimientos', label: 'Movimientos (Entradas / Salidas)', icon: ArrowLeftRight },
            { id: 'cuadres', label: 'Cuadres de ventas', icon: CalendarCheck },
            { id: 'reportes', label: 'Reportes', icon: FileText },
            { id: 'importar', label: 'Importar Excel', icon: FileSpreadsheet }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-700 text-white shadow-xs font-extrabold' 
                    : 'text-gray-600 hover:text-black hover:bg-gray-100/80'
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          VISTA 1: RESUMEN GENERAL (DASHBOARD)
          ===================================================================== */}
      {activeTab === 'resumen' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Total vendido</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">{formatPrice(monthlyMetrics.totalVentas)}</h3>
              <p className="text-[10px] text-gray-400 font-bold">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Costo mercancía</span>
                <Boxes className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">{formatPrice(monthlyMetrics.totalCosto)}</h3>
              <p className="text-[10px] text-gray-400 font-bold">Costo real de compra</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs space-y-1 bg-emerald-50/20">
              <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
                <span>Ganancia bruta</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-emerald-700">{formatPrice(monthlyMetrics.gananciaBruta)}</h3>
              <p className="text-[10px] text-emerald-600/80 font-bold">Venta real - Costo</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Prendas vendidas</span>
                <Tag className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">{monthlyMetrics.prendasVendidas} u</h3>
              <p className="text-[10px] text-gray-400 font-bold">{monthlyMetrics.countCuadres} cierres registrados</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-1 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Margen obtenido</span>
                <span className="text-[10px] font-bold text-emerald-600">ROI</span>
              </div>
              <h3 className="text-xl font-black text-emerald-700">{monthlyMetrics.margenPct}%</h3>
              <p className="text-[10px] text-gray-400 font-bold">Sobre ventas reales</p>
            </div>
          </div>

          {/* Estado de las 4 Sedes */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Rendimiento por Sede ({MONTH_NAMES[selectedMonth - 1]})</h3>
                <p className="text-xs text-gray-500">Cada sede opera con su propio inventario y sus propios cierres diarios.</p>
              </div>
              <button
                onClick={() => setActiveTab('ventas-mensuales')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                Ver gráficas mensuales <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STORES_LIST.map(st => {
                const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
                const storeCuadres = data.cuadres.filter(c => c.dateStr.startsWith(monthPrefix) && c.storeId === st.id && c.status === 'REGISTERED');
                const sVentas = storeCuadres.reduce((a, b) => a + b.totalSales, 0);
                const sCosto = storeCuadres.reduce((a, b) => a + b.totalCost, 0);
                const sGanancia = sVentas - sCosto;
                const sItems = storeCuadres.reduce((a, b) => a + b.totalItems, 0);
                const storeStockTotal = data.products.reduce((acc, p) => acc + (p.stocks[st.id] || 0), 0);

                return (
                  <div key={st.id} className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                        <h4 className="font-black text-xs text-gray-900 truncate">{st.shortName}</h4>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded-full">
                          {storeStockTotal} u en stock
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">Encargado(a): {st.manager}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-3">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Ventas</span>
                          <strong className="text-gray-900 font-bold">{formatPrice(sVentas)}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-700 block font-medium">Ganancia</span>
                          <strong className="text-emerald-700 font-bold">{formatPrice(sGanancia)}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Prendas vendidas</span>
                          <strong className="text-gray-800 font-bold">{sItems} u</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Cierres del mes</span>
                          <strong className="text-gray-800 font-bold">{storeCuadres.length}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setManualStoreId(st.id);
                        setActiveTab('registro-manual');
                      }}
                      className="w-full py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> Anotar Venta / Cierre
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 2: CARGAR VENTAS CON IA
          ===================================================================== */}
      {false && activeTab === 'cargar-ia' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-gray-900">Cargar ventas con IA (Foto de libreta)</h2>
              </div>
              <p className="text-xs text-gray-500">
                Sube las fotografías de los cuadernos de ventas físicas. La IA detectará los precios anotados y descontará el stock de la sede.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold">
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <select
                  value={aiStoreId}
                  onChange={e => setAiStoreId(e.target.value)}
                  className="bg-transparent font-bold cursor-pointer focus:outline-hidden"
                >
                  {STORES_LIST.map(st => (
                    <option key={st.id} value={st.id}>{st.shortName}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <input
                  type="date"
                  value={aiDateStr}
                  onChange={e => setAiDateStr(e.target.value)}
                  className="bg-transparent font-bold cursor-pointer focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 space-y-3">
              <label className="block text-xs font-bold text-gray-700">Fotografías de libreta (hasta 10)</label>
              <div 
                onClick={() => {
                  setAiImages(prev => [...prev, `https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80`]);
                }}
                className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-gray-50/50 hover:bg-emerald-50/20 transition-all"
              >
                <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">Arrastra o haz clic para subir</p>
                <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, HEIC de cuadernos</p>
              </div>

              {aiImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                    <span>{aiImages.length} fotos cargadas</span>
                    <button onClick={() => setAiImages([])} className="text-red-500 hover:underline text-[11px]">Limpiar</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {aiImages.map((img, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-gray-200 h-20 bg-gray-100">
                        <img src={img} alt="Libreta" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded font-mono">#{i + 1}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSimulateAiRead}
                    disabled={aiIsProcessing}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {aiIsProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Procesando con IA...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Escanear Libreta con IA
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-800">
                  Partidas detectadas en {STORES_LIST.find(s => s.id === aiStoreId)?.shortName} ({aiVerifiedSales.length} items)
                </h3>
                {aiVerifiedSales.length > 0 && (
                  <button
                    onClick={() => {
                      const prod = data.products[0];
                      if (prod) {
                        setAiVerifiedSales(prev => [
                          ...prev,
                          {
                            id: `ai-manual-${Date.now()}`,
                            productId: prod.id,
                            productName: prod.name,
                            quantity: 1,
                            costPrice: prod.costPrice,
                            sellingPrice: 50000,
                            subtotal: 50000,
                            costTotal: prod.costPrice,
                            profit: 50000 - prod.costPrice,
                            paymentMethod: 'Efectivo',
                            hour: '12:00 m.',
                            verified: true
                          }
                        ]);
                      }
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar fila
                  </button>
                )}
              </div>

              {aiVerifiedSales.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="text-xs font-medium">Sube una fotografía de la libreta y haz clic en "Escanear Libreta con IA" para validar las ventas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Producto / Categoría</th>
                          <th className="py-2.5 px-3">Cant.</th>
                          <th className="py-2.5 px-3">Precio venta anotado</th>
                          <th className="py-2.5 px-3">Subtotal</th>
                          <th className="py-2.5 px-3">Método pago</th>
                          <th className="py-2.5 px-3 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {aiVerifiedSales.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-gray-50/60">
                            <td className="py-2 px-3 font-mono text-gray-400 text-[11px]">{idx + 1}</td>
                            <td className="py-2 px-3">
                              <select
                                value={item.productId}
                                onChange={e => {
                                  const p = data.products.find(x => x.id === e.target.value);
                                  if (p) {
                                    setAiVerifiedSales(prev => prev.map((s, i) => i === idx ? {
                                      ...s,
                                      productId: p.id,
                                      productName: p.name,
                                      costPrice: p.costPrice,
                                      costTotal: s.quantity * p.costPrice,
                                      profit: s.subtotal - (s.quantity * p.costPrice)
                                    } : s));
                                  }
                                }}
                                className="w-full font-bold text-gray-900 border-none bg-transparent focus:outline-hidden"
                              >
                                {data.products.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={e => {
                                  const q = Math.max(1, Number(e.target.value));
                                  setAiVerifiedSales(prev => prev.map((s, i) => i === idx ? {
                                    ...s,
                                    quantity: q,
                                    subtotal: q * s.sellingPrice,
                                    costTotal: q * s.costPrice,
                                    profit: (q * s.sellingPrice) - (q * s.costPrice)
                                  } : s));
                                }}
                                className="w-12 px-1.5 py-0.5 border border-gray-200 rounded font-bold text-center"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="1000"
                                value={item.sellingPrice}
                                onChange={e => {
                                  const sp = Number(e.target.value);
                                  setAiVerifiedSales(prev => prev.map((s, i) => i === idx ? {
                                    ...s,
                                    sellingPrice: sp,
                                    subtotal: s.quantity * sp,
                                    profit: (s.quantity * sp) - s.costTotal
                                  } : s));
                                }}
                                className="w-24 px-1.5 py-0.5 border border-gray-200 rounded font-mono text-xs font-bold"
                              />
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-gray-900">{formatPrice(item.subtotal)}</td>
                            <td className="py-2 px-3">
                              <select
                                value={item.paymentMethod}
                                onChange={e => {
                                  const pm = e.target.value;
                                  setAiVerifiedSales(prev => prev.map((s, i) => i === idx ? { ...s, paymentMethod: pm } : s));
                                }}
                                className="px-2 py-0.5 rounded text-xs font-bold border border-gray-200 bg-white"
                              >
                                {PAYMENT_METHODS.map(pm => (
                                  <option key={pm.id} value={pm.id}>{pm.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => setAiVerifiedSales(prev => prev.filter((_, i) => i !== idx))}
                                className="text-gray-400 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        Total {aiTotals.totalItems} prendas por {formatPrice(aiTotals.totalSales)}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Al confirmar, se guardará el cierre de {STORES_LIST.find(s => s.id === aiStoreId)?.shortName} y se descontará el stock de esta sede.
                      </p>
                    </div>

                    <button
                      onClick={handleSaveAiCuadre}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Check className="w-4 h-4" /> Confirmar Cierre de Ventas
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 3: REGISTRO MANUAL DE VENTAS (PRECIO DE VENTA SE DEFINE AQUÍ)
          ===================================================================== */}
      {activeTab === 'registro-manual' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPIs del mes (Diseño limpio superior) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Ventas del mes</span>
                <strong className="text-xl font-black text-gray-900 block mt-1">{formatPrice(monthlyMetrics.totalVentas)}</strong>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                <span>{monthlyMetrics.countCuadres} {monthlyMetrics.countCuadres === 1 ? 'cierre' : 'cierres'}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Costo de ventas</span>
                <strong className="text-xl font-black text-gray-900 block mt-1">{formatPrice(monthlyMetrics.totalCosto)}</strong>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl">
                <span>{monthlyMetrics.prendasVendidas} prendas</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Ganancia bruta</span>
                <strong className="text-xl font-black text-emerald-700 block mt-1">{formatPrice(monthlyMetrics.gananciaBruta)}</strong>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                <span>{monthlyMetrics.gananciaBruta >= 0 ? 'Utilidad' : 'Déficit'}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Margen de ganancia</span>
                <strong className="text-xl font-black text-gray-900 block mt-1">{monthlyMetrics.margenPct}%</strong>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                <span>Margen</span>
              </div>
            </div>
          </div>

          {/* Sección principal: Anotar ventas y Cierre diario */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-gray-900">Anotar ventas y Cierre diario</h2>
                    {isAlreadyClosed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" /> Cierre Realizado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <Clock className="w-3 h-3 text-blue-600" /> Pendiente de Cierre
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Selecciona la prenda, digita el precio de venta al que se vendió y el medio de pago. Al cerrar, se descuenta de esa sede.
                  </p>
                </div>
              </div>

              {/* Selector de Sede, Fecha y Botón Cargar Ventas con IA */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Sede</span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/80 text-xs font-black text-gray-900">
                    <Store className="w-3.5 h-3.5 text-emerald-700" />
                    <select
                      value={manualStoreId}
                      onChange={e => setManualStoreId(e.target.value)}
                      className="bg-transparent font-black cursor-pointer focus:outline-hidden"
                    >
                      {STORES_LIST.map(st => (
                        <option key={st.id} value={st.id}>{st.shortName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Fecha</span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/80 text-xs font-bold text-gray-800">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="date"
                      value={manualDateStr}
                      onChange={e => setManualDateStr(e.target.value)}
                      className="bg-transparent font-bold cursor-pointer focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Banner de Estado de Cierre y Seguridad */}
            {isAlreadyClosed && existingCuadre && (
              <div className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs ${
                isClosureSecurityLocked
                  ? 'bg-amber-50/80 border-amber-200/90 text-amber-950'
                  : 'bg-emerald-50/80 border-emerald-200/90 text-emerald-950'
              }`}>
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isClosureSecurityLocked ? 'bg-amber-600 text-white' : 'bg-emerald-700 text-white'
                  }`}>
                    {isClosureSecurityLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white border border-amber-300 text-amber-900 shadow-2xs">
                        {existingCuadre.status === 'NO_SALES' ? 'Día Marcado Sin Ventas ($0)' : 'Cierre Oficial Registrado'}
                      </span>
                      <span className="text-xs font-bold text-gray-800">
                        {existingCuadre.status === 'NO_SALES' 
                          ? 'Esta sede no tuvo ventas registradas' 
                          : `${formatPrice(existingCuadre.totalSales)} · ${existingCuadre.totalItems} prendas vendidas`}
                      </span>
                      {existingCuadre.updatedAt && (
                        <span className="text-[10px] text-gray-500 font-mono">
                          (Guardado: {new Date(existingCuadre.updatedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      {isClosureSecurityLocked
                        ? '🔒 Este día ya cuenta con cierre de caja. El botón y las modificaciones están protegidos con candado para evitar sobreescrituras accidentales.'
                        : '🔓 Modo Edición Activo: Puedes realizar ajustes o registrar ventas adicionales. Recuerda presionar "Sobrescribir y Actualizar Cierre" al finalizar.'}
                    </p>
                  </div>
                </div>

                {/* Acciones de seguridad: Desbloquear / Rebloquear / Reabrir */}
                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={handleToggleClosureLock}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs ${
                      isClosureSecurityLocked
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {isClosureSecurityLocked ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Desbloquear para Modificar
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-gray-600" /> Volver a Bloquear
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReopenClosure}
                    title="Anular el cierre de este día y devolver las prendas al inventario"
                    className="px-3 py-2 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-600" /> Reabrir Cuadre
                  </button>
                </div>
              </div>
            )}

            {/* PANEL INTEGRADO: CARGAR VENTAS (IA) (DESACTIVADO TEMPORALMENTE) */}
            {false && isAiInlineOpen && (
              <div className="p-5 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 via-white to-emerald-50/30 shadow-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-5 h-5 text-amber-200" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                        Cargar ventas con IA (Fotos de libreta en {STORES_LIST.find(s => s.id === manualStoreId)?.shortName})
                      </h3>
                      <p className="text-xs text-gray-500">
                        Sube una o varias imágenes simultáneamente. La IA extraerá productos, cantidades, precios y métodos de pago.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAiInlineOpen(false)}
                    className="self-end sm:self-center p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                    title="Cerrar panel de IA"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Input oculto para subir una o varias imágenes simultáneamente */}
                <input
                  type="file"
                  ref={aiFileInputRef}
                  onChange={handleInlineFilesChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Columna Izquierda: Zona de carga y fotos simultáneas */}
                  <div className="lg:col-span-5 space-y-3">
                    <div
                      onClick={() => aiFileInputRef.current?.click()}
                      className="border-2 border-dashed border-purple-300 hover:border-purple-600 rounded-2xl p-5 text-center cursor-pointer bg-white hover:bg-purple-50/40 transition-all shadow-2xs group"
                    >
                      <UploadCloud className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-black text-gray-800">
                        Haz clic aquí para seleccionar fotos de libreta
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Puedes subir <b>una o varias imágenes simultáneamente</b> (PNG, JPG, HEIC)
                      </p>
                    </div>

                    {/* Previsualización de imágenes subidas */}
                    {aiInlineImages.length > 0 && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-black text-gray-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {aiInlineImages.length} {aiInlineImages.length === 1 ? 'foto lista' : 'fotos simultáneas listas'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => aiFileInputRef.current?.click()}
                              className="text-purple-700 hover:underline text-[11px] font-bold cursor-pointer"
                            >
                              + Agregar más
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              type="button"
                              onClick={() => {
                                setAiInlineImages([]);
                                setAiInlineExtractedSales([]);
                              }}
                              className="text-red-600 hover:underline text-[11px] font-bold cursor-pointer"
                            >
                              Limpiar
                            </button>
                          </div>
                        </div>

                        {/* Grid de miniaturas con botón eliminar individual */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1.5 bg-gray-50/70 rounded-xl border border-gray-100">
                          {aiInlineImages.map((imgSrc, idx) => (
                            <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 h-16 bg-white shadow-2xs">
                              <img src={imgSrc} alt={`Libreta ${idx + 1}`} className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 rounded font-mono font-bold">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAiInlineImages(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
                                title="Eliminar foto"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Botón para escanear con IA */}
                        <button
                          type="button"
                          onClick={handleScanInlineImages}
                          disabled={aiInlineIsScanning}
                          className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                        >
                          {aiInlineIsScanning ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" /> Procesando {aiInlineImages.length} fotos con IA...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-300" /> Escanear y Extraer Ventas ({aiInlineImages.length} fotos)
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleConfigureGeminiKey}
                          className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-between border transition-all cursor-pointer ${
                            geminiApiKey
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles className={`w-3.5 h-3.5 ${geminiApiKey ? 'text-emerald-600' : 'text-purple-600'}`} />
                            <span>{geminiApiKey ? '🟢 Gemini Vision Activo en vivo' : '⚡ Activar Gemini API Key (Gratis)'}</span>
                          </span>
                          <span className="text-[10px] underline font-medium">
                            {geminiApiKey ? 'Cambiar' : 'Activar (10s)'}
                          </span>
                        </button>
                      </div>
                    )}

                    {aiInlineImages.length === 0 && (
                      <button
                        type="button"
                        onClick={handleConfigureGeminiKey}
                        className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-between border transition-all cursor-pointer ${
                          geminiApiKey
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className={`w-3.5 h-3.5 ${geminiApiKey ? 'text-emerald-600' : 'text-purple-600'}`} />
                          <span>{geminiApiKey ? '🟢 Gemini Vision Activo en vivo' : '⚡ Activar Gemini API Key (Gratis)'}</span>
                        </span>
                        <span className="text-[10px] underline font-medium">
                          {geminiApiKey ? 'Cambiar' : 'Activar (10s)'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Columna Derecha: Vista previa para corregir y confirmar datos */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <h4 className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                        <span>Vista previa de ventas extraídas</span>
                        {aiInlineExtractedSales.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {aiInlineExtractedSales.length} partidas
                          </span>
                        )}
                      </h4>

                      {aiInlineExtractedSales.length > 0 && (
                        <button
                          type="button"
                          onClick={handleAddRowToInlineExtracted}
                          className="text-xs font-black text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Agregar fila
                        </button>
                      )}
                    </div>

                    {aiInlineExtractedSales.length === 0 ? (
                      <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 space-y-2 bg-white">
                        <FileSpreadsheet className="w-8 h-8 mx-auto text-purple-300" />
                        <p className="text-xs font-bold text-gray-600">Ninguna venta extraída todavía</p>
                        <p className="text-[11px] text-gray-400">
                          Sube las fotografías de la libreta física a la izquierda y pulsa "Escanear y Extraer Ventas".
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs bg-white max-h-60 overflow-y-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                                <th className="py-2 px-2.5">Producto / Categoría</th>
                                <th className="py-2 px-1 text-center w-14">Cant.</th>
                                <th className="py-2 px-2 w-28">Precio ($)</th>
                                <th className="py-2 px-2 w-24">Método</th>
                                <th className="py-2 px-2.5 text-right">Subtotal</th>
                                <th className="py-2 px-1 w-7"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {aiInlineExtractedSales.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-purple-50/20">
                                  {/* Producto editable */}
                                  <td className="py-1.5 px-2.5">
                                    <select
                                      value={item.productId}
                                      onChange={e => handleUpdateInlineExtractedSale(idx, 'productId', e.target.value)}
                                      className="w-full text-xs font-extrabold uppercase bg-transparent border border-gray-200 rounded-lg p-1 text-gray-900 focus:outline-emerald-600"
                                    >
                                      {data.products.map(p => (
                                        <option key={p.id} value={p.id}>
                                          {p.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>

                                  {/* Cantidad editable */}
                                  <td className="py-1.5 px-1 text-center">
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={e => handleUpdateInlineExtractedSale(idx, 'quantity', e.target.value)}
                                      className="w-12 text-center text-xs font-bold border border-gray-200 rounded-lg p-1 font-mono"
                                    />
                                  </td>

                                  {/* Precio venta editable */}
                                  <td className="py-1.5 px-2">
                                    <input
                                      type="number"
                                      step="500"
                                      value={item.sellingPrice}
                                      onChange={e => handleUpdateInlineExtractedSale(idx, 'sellingPrice', e.target.value)}
                                      className="w-full text-xs font-bold border border-gray-200 rounded-lg p-1 font-mono text-emerald-900"
                                    />
                                  </td>

                                  {/* Método de pago editable */}
                                  <td className="py-1.5 px-2">
                                    <select
                                      value={item.paymentMethod}
                                      onChange={e => handleUpdateInlineExtractedSale(idx, 'paymentMethod', e.target.value)}
                                      className="w-full text-xs font-bold border border-gray-200 rounded-lg p-1 bg-white"
                                    >
                                      {PAYMENT_METHODS.map(pm => (
                                        <option key={pm.id} value={pm.id}>{pm.label}</option>
                                      ))}
                                    </select>
                                  </td>

                                  {/* Subtotal */}
                                  <td className="py-1.5 px-2.5 text-right font-mono font-black text-gray-900">
                                    {formatPrice(item.subtotal)}
                                  </td>

                                  {/* Eliminar fila */}
                                  <td className="py-1.5 px-1 text-center">
                                    <button
                                      type="button"
                                      onClick={() => setAiInlineExtractedSales(prev => prev.filter((_, i) => i !== idx))}
                                      className="text-gray-300 hover:text-red-600 cursor-pointer"
                                      title="Eliminar partida"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Barra de confirmación y total */}
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-extrabold text-emerald-950 block">
                              Total extraído: <b>{aiInlineExtractedSales.length} ventas</b> ({aiInlineTotals.totalItems} prendas)
                            </span>
                            <span className="text-base font-black text-emerald-900 font-mono">
                              {formatPrice(aiInlineTotals.totalSales)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => setAiInlineExtractedSales([])}
                              className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Descartar
                            </button>
                            <button
                              type="button"
                              onClick={handleConfirmInlineExtractedSales}
                              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                            >
                              <Check className="w-4 h-4" /> Confirmar y Agregar a Ventas del Día
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Formulario rápido para anotar una venta con Select Buscable */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              {/* SELECT BUSCABLE: SOLO EL NOMBRE DEL PRODUCTO, SOLO CON STOCK > 0 */}
              <div className="sm:col-span-5 relative" ref={productSelectRef}>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                  Producto / Categoría (Stock en {STORES_LIST.find(s => s.id === manualStoreId)?.shortName}) *
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setIsProductSelectOpen(!isProductSelectOpen);
                    setProductSearchQuery('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-black text-left flex items-center justify-between hover:border-emerald-600 transition-colors cursor-pointer shadow-2xs"
                >
                  <span className="truncate text-gray-900 font-black uppercase tracking-wide">
                    {(() => {
                      const sel = data.products.find(p => p.id === newManualSale.productId);
                      return sel ? sel.name : (availableProductsInStore.length > 0 ? 'SELECCIONA UN PRODUCTO' : 'SIN EXISTENCIAS EN ESTA SEDE');
                    })()}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                </button>

                {/* Dropdown flotante con buscador */}
                {isProductSelectOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-gray-100 bg-gray-50/80">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Buscar producto por nombre..."
                          value={productSearchQuery}
                          onChange={e => setProductSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-bold focus:outline-emerald-600 focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
                      {filteredProductsForSelect.length === 0 ? (
                        <div className="p-3 text-center text-xs text-gray-400 font-medium">
                          {availableProductsInStore.length === 0 
                            ? 'No hay productos con existencias en esta sede' 
                            : 'No se encontraron coincidencias'}
                        </div>
                      ) : (
                        filteredProductsForSelect.map(p => {
                          const isSelected = p.id === newManualSale.productId;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setNewManualSale(prev => ({ ...prev, productId: p.id }));
                                setIsProductSelectOpen(false);
                                setProductSearchQuery('');
                              }}
                              className={`w-full px-3.5 py-2.5 text-left text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                                isSelected 
                                  ? 'bg-emerald-50 text-emerald-950 font-black' 
                                  : 'hover:bg-gray-50 text-gray-800'
                              }`}
                            >
                              {/* SOLO EL NOMBRE DEL PRODUCTO */}
                              <span className="uppercase tracking-wide font-extrabold">{p.name}</span>
                              {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cantidad con botones - y + */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Cantidad *</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setNewManualSale({ ...newManualSale, quantity: Math.max(1, newManualSale.quantity - 1) })}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 font-black text-xs text-gray-600 cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newManualSale.quantity}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                      setNewManualSale({ ...newManualSale, quantity: Math.max(1, Number(clean) || 1) });
                    }}
                    className="w-full text-center text-xs font-black font-mono text-gray-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setNewManualSale({ ...newManualSale, quantity: newManualSale.quantity + 1 })}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 font-black text-xs text-gray-600 cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Precio de venta manual sin ceros persistentes */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                  Precio de venta ($) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="75.000"
                  value={newManualSale.sellingPrice}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                    setNewManualSale({ ...newManualSale, sellingPrice: clean });
                  }}
                  className="w-full px-3 py-2 rounded-xl border-2 border-emerald-500/80 bg-emerald-50/20 text-xs font-black font-mono text-emerald-950 focus:outline-emerald-600 shadow-2xs"
                />
              </div>

              {/* Método de pago */}
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Método de pago *</label>
                <div className="flex items-center gap-2">
                  <select
                    value={newManualSale.paymentMethod}
                    onChange={e => setNewManualSale({ ...newManualSale, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold cursor-pointer shadow-2xs"
                  >
                    {PAYMENT_METHODS.map(pm => (
                      <option key={pm.id} value={pm.id}>{pm.label}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddManualSale}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4" /> Anotar
                  </button>
                </div>
              </div>
            </div>

            {/* Layout inferior de 2 columnas: Ventas del día + Gráfico de Tendencia a la izquierda, Cuadre de Caja a la derecha */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
              {/* Columna Izquierda: Tabla de ventas del día + Gráfico de tendencia */}
              <div className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                  {/* Tarjeta 1: Ventas del día */}
                  <div className="xl:col-span-7 bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-emerald-700" />
                        <h3 className="text-xs font-black text-gray-900">
                          Ventas del día en {STORES_LIST.find(s => s.id === manualStoreId)?.shortName}
                        </h3>
                      </div>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        {manualSales.length} ventas
                      </span>
                    </div>

                    {manualSales.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 space-y-1.5">
                        <Edit3 className="w-7 h-7 mx-auto text-gray-300" />
                        <p className="text-xs font-bold text-gray-600">Aún no hay ventas anotadas hoy</p>
                        <p className="text-[11px] text-gray-400">Selecciona el producto, ingresa el precio y presiona "Anotar".</p>
                      </div>
                    ) : (
                      <div className="border border-gray-100 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                              <th className="py-2 px-2.5">#</th>
                              <th className="py-2 px-2.5">Producto</th>
                              <th className="py-2 px-2 text-center">Cant.</th>
                              <th className="py-2 px-2.5">Precio venta</th>
                              <th className="py-2 px-2">Método</th>
                              <th className="py-2 px-2.5 text-right">Total</th>
                              <th className="py-2 px-2 w-6"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {manualSales.map((s, idx) => (
                              <tr key={s.id} className="hover:bg-gray-50/70">
                                <td className="py-1.5 px-2.5 font-mono text-gray-400 text-[10px]">{idx + 1}</td>
                                <td className="py-1.5 px-2.5 font-extrabold text-gray-900 uppercase text-[11px]">{s.productName}</td>
                                <td className="py-1.5 px-2 text-center font-bold">{s.quantity}</td>
                                <td className="py-1.5 px-2.5 font-mono font-bold text-emerald-800">{formatPrice(s.sellingPrice)}</td>
                                <td className="py-1.5 px-2">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                                    {s.paymentMethod}
                                  </span>
                                </td>
                                <td className="py-1.5 px-2.5 text-right font-mono font-black text-gray-900">{formatPrice(s.subtotal)}</td>
                                <td className="py-1.5 px-2 text-center">
                                  <button
                                    onClick={() => handleRemoveManualSale(s.id)}
                                    className="text-gray-300 hover:text-red-600 cursor-pointer"
                                    title="Remover venta"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Barra de total del día */}
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs">
                      <span className="font-extrabold text-emerald-950">
                        Total del día: <strong>{manualSales.length} ventas</strong>
                      </span>
                      <strong className="text-base font-black text-emerald-900 font-mono">
                        {formatPrice(manualTotals.totalSales)}
                      </strong>
                    </div>
                  </div>

                  {/* Tarjeta 2: Gráfico de Tendencia de Ventas (7 días) */}
                  <div className="xl:col-span-5 bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-700" />
                        <h3 className="text-xs font-black text-gray-900">
                          Tendencia de ventas ({STORES_LIST.find(s => s.id === manualStoreId)?.shortName})
                        </h3>
                      </div>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        {manualSales.reduce((acc, s) => acc + s.quantity, 0)} ventas
                      </span>
                    </div>

                    <div className="py-1">
                      <div className="flex justify-end mb-1">
                        <span className="text-[10px] font-black text-white bg-emerald-700 px-2 py-0.5 rounded-md shadow-2xs">
                          {manualSales.reduce((acc, s) => acc + s.quantity, 0)} ventas
                        </span>
                      </div>
                      <svg viewBox="0 0 300 110" className="w-full h-28 overflow-visible">
                        <defs>
                          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {[0, 10, 20, 30, 40].map((v) => {
                          const y = 85 - (v / 40) * 75;
                          return (
                            <g key={v}>
                              <line x1="25" y1={y} x2="295" y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
                              <text x="18" y={y + 3} textAnchor="end" fontSize="9" fill="#9ca3af" fontWeight="bold">{v}</text>
                            </g>
                          );
                        })}

                        {(() => {
                          const pts = storeSalesTrend.days.map((d, i) => {
                            const x = 35 + i * (255 / (storeSalesTrend.days.length - 1));
                            const y = 85 - (Math.min(40, d.count) / 40) * 75;
                            return `${x},${y}`;
                          });
                          const firstX = 35;
                          const lastX = 35 + (storeSalesTrend.days.length - 1) * (255 / (storeSalesTrend.days.length - 1));
                          return (
                            <polygon
                              points={`${firstX},85 ${pts.join(' ')} ${lastX},85`}
                              fill="url(#trendGrad)"
                            />
                          );
                        })()}

                        {(() => {
                          const pts = storeSalesTrend.days.map((d, i) => {
                            const x = 35 + i * (255 / (storeSalesTrend.days.length - 1));
                            const y = 85 - (Math.min(40, d.count) / 40) * 75;
                            return `${x},${y}`;
                          }).join(' ');
                          return (
                            <polyline
                              points={pts}
                              fill="none"
                              stroke="#059669"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          );
                        })()}

                        {storeSalesTrend.days.map((d, i) => {
                          const x = 35 + i * (255 / (storeSalesTrend.days.length - 1));
                          const y = 85 - (Math.min(40, d.count) / 40) * 75;
                          const isCurrent = i === storeSalesTrend.days.length - 1;
                          return (
                            <g key={d.dateStr}>
                              <circle
                                cx={x}
                                cy={y}
                                r={isCurrent ? 5 : 3.5}
                                fill={isCurrent ? '#047857' : '#10b981'}
                                stroke="#ffffff"
                                strokeWidth="1.5"
                              />
                              <text
                                x={x}
                                y="102"
                                textAnchor="middle"
                                fontSize="9"
                                fill={isCurrent ? '#047857' : '#9ca3af'}
                                fontWeight={isCurrent ? '900' : 'bold'}
                              >
                                {d.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Barra inferior: Conexión con inventario + Botón Realizar Cierre de Ventas */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Conexión con inventario: Estas ventas descontarán automáticamente del stock de <b>{STORES_LIST.find(s => s.id === manualStoreId)?.shortName}</b>.
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {isAlreadyClosed ? (
                      isClosureSecurityLocked ? (
                        <button
                          type="button"
                          onClick={handleSaveManualCuadre}
                          className="px-5 py-2.5 bg-amber-50/90 hover:bg-amber-100 text-amber-900 border-2 border-amber-300 rounded-xl text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer whitespace-nowrap transition-all"
                        >
                          <Lock className="w-4 h-4 text-amber-600" /> Cierre Realizado (Protegido con Candado)
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSaveManualCuadre}
                          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer whitespace-nowrap transition-all animate-pulse"
                        >
                          <RefreshCw className="w-4 h-4" /> Sobrescribir y Actualizar Cierre
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={handleSaveManualCuadre}
                        className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer whitespace-nowrap transition-all"
                      >
                        <Check className="w-4 h-4" /> Realizar Cierre de Ventas
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Tarjeta Cuadre de Caja */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-4 text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-black tracking-wide">
                    Cuadre de Caja ({STORES_LIST.find(s => s.id === manualStoreId)?.shortName})
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  {/* Dos tarjetas: TOTAL VENTAS y PRENDAS */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100/80">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 font-bold uppercase">
                        <DollarSign className="w-3 h-3 text-emerald-700" />
                        <span>Total Ventas</span>
                      </div>
                      <strong className="text-2xl font-black text-emerald-950 block mt-1">
                        {manualSales.length}
                      </strong>
                    </div>

                    <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 font-bold uppercase">
                        <Tag className="w-3 h-3 text-gray-600" />
                        <span>Prendas</span>
                      </div>
                      <strong className="text-2xl font-black text-gray-900 block mt-1">
                        {manualTotals.totalItems} u
                      </strong>
                    </div>
                  </div>

                  {/* Desglose por medio de pago */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      Desglose por medio de pago
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      {PAYMENT_METHODS.map(pm => {
                        const amt = manualTotals.byMethod[pm.id] || 0;
                        return (
                          <div key={pm.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100/50 transition-colors">
                            <span className="font-extrabold text-gray-700">{pm.label}</span>
                            <strong className="font-mono font-black text-gray-900">{formatPrice(amt)}</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 4: HISTORIAL DE VENTAS
          ===================================================================== */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-black text-gray-900">Historial completo de cierres</h2>
              <p className="text-xs text-gray-500">Consulta los cuadres registrados en el mes con desglose detallado.</p>
            </div>
            <button
              onClick={() => {
                Swal.fire({
                  icon: 'info',
                  title: 'Descargar reporte',
                  text: 'Generando archivo Excel con el historial consolidado de cierres...',
                  timer: 1500,
                  showConfirmButton: false
                });
              }}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Descargar Excel
            </button>
          </div>

          <div className="space-y-3">
            {data.cuadres.length === 0 ? (
              <div className="p-10 text-center text-gray-400 space-y-2">
                <History className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-medium">Aún no hay cuadres registrados en el sistema.</p>
                <p className="text-[11px] text-gray-400">Ve a "Anotar ventas / Cierre" para hacer el primer cierre de ventas.</p>
              </div>
            ) : (
              data.cuadres.filter(c => selectedStoreId === 'all' || c.storeId === selectedStoreId).map(cuadre => (
                <div key={cuadre.id} className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                        {cuadre.storeName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-gray-900">{cuadre.storeName} · {cuadre.dateStr}</h4>
                        <p className="text-[10px] text-gray-400">
                          {cuadre.status === 'NO_SALES' 
                            ? 'Día registrado sin ventas ($0)' 
                            : `Total: ${formatPrice(cuadre.totalSales)} · ${cuadre.totalItems} prendas vendidas`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {cuadre.status === 'REGISTERED' && (
                        <span className="text-xs font-bold text-emerald-700">
                          Ganancia: {formatPrice(cuadre.totalProfit)}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          Swal.fire({
                            title: '¿Eliminar este cierre?',
                            text: 'Se revertirá el stock de las prendas vendidas a la sede.',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Sí, eliminar',
                            cancelButtonText: 'Cancelar',
                            confirmButtonColor: '#dc2626'
                          }).then(res => {
                            if (res.isConfirmed) {
                              CommercialService.deleteCuadre(cuadre.id, true);
                              refreshData();
                            }
                          });
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                        title="Eliminar cuadre y revertir stock"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {cuadre.sales && cuadre.sales.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                      {cuadre.sales.map(s => (
                        <div key={s.id} className="p-2 bg-white rounded-lg border border-gray-100 flex items-center justify-between">
                          <span className="font-bold text-gray-800 truncate mr-2">{s.quantity}x {s.productName}</span>
                          <strong className="font-mono text-emerald-800">{formatPrice(s.subtotal)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 5: VENTAS MENSUALES (100% DINÁMICO)
          ===================================================================== */}
      {activeTab === 'ventas-mensuales' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Total vendido</span>
              <strong className="text-xl font-black text-gray-900 block mt-1">{formatPrice(monthlyMetrics.totalVentas)}</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Costo mercancía</span>
              <strong className="text-xl font-black text-blue-700 block mt-1">{formatPrice(monthlyMetrics.totalCosto)}</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs bg-emerald-50/20">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Ganancia bruta</span>
              <strong className="text-xl font-black text-emerald-700 block mt-1">{formatPrice(monthlyMetrics.gananciaBruta)}</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Prendas vendidas</span>
              <strong className="text-xl font-black text-gray-900 block mt-1">{monthlyMetrics.prendasVendidas} u</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Margen ganancia</span>
              <strong className="text-xl font-black text-emerald-700 block mt-1">{monthlyMetrics.margenPct}%</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Evolución diaria del mes</h3>
                  <p className="text-xs text-gray-400">Ventas y ganancias registradas en cada día del mes.</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-700"></span> Ventas</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-300"></span> Ganancia</span>
                </div>
              </div>

              <div className="h-56 flex items-end gap-1.5 pt-4 pb-2 px-1 overflow-x-auto custom-scrollbar">
                {monthlyDetailedAnalytics.dailyEvolution.map(d => {
                  const barHeight = d.sales > 0 
                    ? Math.max(12, Math.round((d.sales / monthlyDetailedAnalytics.maxDaySale) * 100)) 
                    : 0;

                  return (
                    <div key={d.day} className="flex-1 min-w-[18px] flex flex-col items-center justify-end h-full group relative">
                      {d.sales > 0 && (
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none">
                          Día {d.day}: {formatPrice(d.sales)}
                        </div>
                      )}
                      {d.sales > 0 ? (
                        <div 
                          style={{ height: `${barHeight}%` }} 
                          className="w-full bg-emerald-700 hover:bg-emerald-800 rounded-t-sm transition-all"
                        />
                      ) : (
                        <div className="w-full h-1 bg-gray-100 rounded-full" />
                      )}
                      <span className="text-[9px] font-mono text-gray-400 mt-1">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Métodos de pago del mes
              </h3>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(pm => {
                  const amt = monthlyDetailedAnalytics.methodsSummary[pm.id] || 0;
                  const pct = monthlyDetailedAnalytics.totalVentasMonth > 0 
                    ? ((amt / monthlyDetailedAnalytics.totalVentasMonth) * 100).toFixed(1) 
                    : '0';

                  return (
                    <div key={pm.id} className="p-2 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pm.color }} />
                        <span className="font-bold text-gray-700">{pm.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-gray-900 block">{formatPrice(amt)}</span>
                        <span className="text-[10px] text-gray-400">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Ventas por producto (Top 10)
              </h3>
              {monthlyDetailedAnalytics.topProducts.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No hay ventas registradas aún en este período.</p>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Producto</th>
                        <th className="py-2 px-3 text-center">Uds</th>
                        <th className="py-2 px-3">Total vendido</th>
                        <th className="py-2 px-3">Ganancia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {monthlyDetailedAnalytics.topProducts.map((tp, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/60">
                          <td className="py-2 px-3 font-mono text-gray-400 text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-gray-900">{tp.name}</td>
                          <td className="py-2 px-3 text-center font-bold">{tp.units}</td>
                          <td className="py-2 px-3 font-mono">{formatPrice(tp.sales)}</td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-700">{formatPrice(tp.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Resumen financiero por quincena
              </h3>
              <div className="space-y-3">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-gray-800 text-xs">1.ª Quincena (1 – 15 {MONTH_NAMES[selectedMonth - 1]})</span>
                    <span className="text-[10px] text-gray-400 font-bold">{monthlyDetailedAnalytics.q1.cuadresCount} cierres</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-200/60 text-[11px]">
                    <div><span className="text-gray-400 block text-[10px]">Ventas</span><strong>{formatPrice(monthlyDetailedAnalytics.q1.sales)}</strong></div>
                    <div><span className="text-gray-400 block text-[10px]">Costo</span><strong>{formatPrice(monthlyDetailedAnalytics.q1.cost)}</strong></div>
                    <div><span className="text-gray-400 block text-[10px]">Ganancia</span><strong className="text-emerald-700">{formatPrice(monthlyDetailedAnalytics.q1.profit)}</strong></div>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-gray-800 text-xs">2.ª Quincena (16 – fin de mes)</span>
                    <span className="text-[10px] text-gray-400 font-bold">{monthlyDetailedAnalytics.q2.cuadresCount} cierres</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-200/60 text-[11px]">
                    <div><span className="text-gray-400 block text-[10px]">Ventas</span><strong>{formatPrice(monthlyDetailedAnalytics.q2.sales)}</strong></div>
                    <div><span className="text-gray-400 block text-[10px]">Costo</span><strong>{formatPrice(monthlyDetailedAnalytics.q2.cost)}</strong></div>
                    <div><span className="text-gray-400 block text-[10px]">Ganancia</span><strong className="text-emerald-700">{formatPrice(monthlyDetailedAnalytics.q2.profit)}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 6: 4 INVENTARIOS POR SEDE (SOLO 1 NOMBRE: CATEGORÍA/PRODUCTO, SIN PRECIO VENTA)
          ===================================================================== */}
      {activeTab === 'inventario' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Inventario de la Sede</span>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {STORES_LIST.map(st => (
                  <button
                    key={st.id}
                    onClick={() => setInvStoreFilter(st.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      invStoreFilter === st.id 
                        ? 'bg-emerald-700 text-white shadow-xs' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Inventario {st.shortName}
                  </button>
                ))}
                <button
                  onClick={() => setInvStoreFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    invStoreFilter === 'all' 
                      ? 'bg-black text-white shadow-xs' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Consolidado (Todas)
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsNewProductModalOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Crear Producto
            </button>
          </div>

          {/* Top KPIs de inventario: Solo existencias y costos de compra */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Referencias activas</span>
              <strong className="text-xl font-black text-gray-900 block mt-1">{inventoryKpis.totalProds}</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">
                Stock total ({invStoreFilter === 'all' ? 'Todas las sedes' : STORES_LIST.find(s => s.id === invStoreFilter)?.shortName})
              </span>
              <strong className="text-xl font-black text-gray-900 block mt-1">{inventoryKpis.totalStockSede} u</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Valor inventario (costo compra)</span>
              <strong className="text-xl font-black text-blue-700 block mt-1">{formatPrice(inventoryKpis.valorInventarioCosto)}</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Costo promedio por prenda</span>
              <strong className="text-xl font-black text-gray-800 block mt-1">{formatPrice(inventoryKpis.costoPromedio)}</strong>
            </div>
          </div>

          {/* Tabla de Inventario (Ancho completo, modal emergente por sede) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de producto / categoría..."
                  value={invSearch}
                  onChange={e => setInvSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50/80 rounded-xl border border-gray-200 text-xs font-medium focus:outline-emerald-600 focus:bg-white transition-all"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const next = !inventorySecurityLocked;
                    setInventorySecurityLocked(next);
                    Swal.fire({
                      icon: next ? 'warning' : 'success',
                      title: next ? '🔒 Modo Seguro Activado' : '🔓 Edición Desbloqueada',
                      text: next 
                        ? 'Las acciones de modificar y eliminar quedaron bloqueadas contra toques accidentales.' 
                        : 'Acciones habilitadas. Toda modificación y eliminación requerirá confirmación de seguridad.',
                      timer: 1600,
                      showConfirmButton: false
                    });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    inventorySecurityLocked 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs hover:bg-amber-200' 
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 shadow-2xs'
                  }`}
                  title="Alternar bloqueo de seguridad contra clics accidentales"
                >
                  {inventorySecurityLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-800" />
                      <span>Edición Bloqueada 🔒</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Seguridad Activa 🛡️</span>
                    </>
                  )}
                </button>
                <div className="text-xs font-medium text-gray-500 hidden sm:block">
                  Mostrando <strong className="text-gray-900">{filteredInventory.length}</strong> de {data.products.length} productos
                </div>
              </div>
            </div>

            <div className="border border-gray-200/80 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Producto / Categoría</th>
                    <th className="py-2.5 px-3">Costo de compra</th>
                    {invStoreFilter === 'all' ? (
                      <>
                        <th className="py-2.5 px-2 text-center">Rep.</th>
                        <th className="py-2.5 px-2 text-center">Mod.</th>
                        <th className="py-2.5 px-2 text-center">Qual.</th>
                        <th className="py-2.5 px-2 text-center">Mar.</th>
                        <th className="py-2.5 px-2 text-center">Total Stock</th>
                        <th className="py-2.5 px-3">Valoración costo</th>
                      </>
                    ) : (
                      <>
                        <th className="py-2.5 px-3 text-center">Stock ({STORES_LIST.find(s => s.id === invStoreFilter)?.shortName})</th>
                        <th className="py-2.5 px-3">Valoración costo</th>
                      </>
                    )}
                    <th className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Acciones
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInventory.map((p, idx) => {
                    const stockVal = invStoreFilter === 'all' ? 0 : (p.stocks[invStoreFilter] || 0);
                    const totalAll = STORES_LIST.reduce((acc, s) => acc + (p.stocks[s.id] || 0), 0);

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-gray-400 text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-gray-900">{p.name}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-700">{formatPrice(p.costPrice)}</td>
                        {invStoreFilter === 'all' ? (
                          <>
                            <td className="py-2.5 px-2 text-center font-bold text-gray-700">{p.stocks.republica || 0}</td>
                            <td className="py-2.5 px-2 text-center font-bold text-gray-700">{p.stocks.modelo || 0}</td>
                            <td className="py-2.5 px-2 text-center font-bold text-gray-700">{p.stocks.quality || 0}</td>
                            <td className="py-2.5 px-2 text-center font-bold text-gray-700">{p.stocks.mariano || 0}</td>
                            <td className="py-2.5 px-2 text-center font-black text-emerald-800">{totalAll}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-gray-800">{formatPrice(totalAll * p.costPrice)}</td>
                          </>
                        ) : (
                          <>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${stockVal > 10 ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100'}`}>
                                {stockVal}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-gray-800">{formatPrice(stockVal * p.costPrice)}</td>
                          </>
                        )}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditProductModal(p)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title={`Modificar con seguridad en ${invStoreFilter === 'all' ? 'sede' : STORES_LIST.find(s => s.id === invStoreFilter)?.shortName}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar con código de seguridad"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* Modal para Editar Producto en la Sede Seleccionada */}
      {isEditProductModalOpen && selectedProductEdit && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Editar en Sede</h3>
                  <p className="text-[11px] text-gray-500 font-medium">Modifica costo y existencias en la sede seleccionada</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditProductModalOpen(false);
                  setSelectedProductEdit(null);
                }}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sede seleccionada */}
            {invStoreFilter === 'all' ? (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Selecciona la sede que deseas modificar:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {STORES_LIST.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSwitchEditStoreTarget(st.id)}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        editStoreTarget === st.id
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60'
                      }`}
                    >
                      <span>{st.shortName}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${editStoreTarget === st.id ? 'bg-emerald-800 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {selectedProductEdit.stocks[st.id] || 0}u
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-emerald-950">
                <Store className="w-4 h-4 text-emerald-700 shrink-0" />
                <div className="text-xs">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block tracking-wider">Sede seleccionada</span>
                  <span className="font-extrabold text-emerald-900">
                    {STORES_LIST.find(s => s.id === editStoreTarget)?.name}
                  </span>
                </div>
              </div>
            )}

            {/* Control de seguridad informativo */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-[11px] font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span><strong>Ajuste protegido:</strong> Al guardar, el sistema te mostrará una comparativa de seguridad antes/después para confirmar las existencias.</span>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Nombre del producto / categoría *
                </label>
                <input
                  type="text"
                  required
                  value={editProductForm.name}
                  onChange={e => setEditProductForm({ ...editProductForm, name: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold uppercase text-gray-900 focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Costo de compra ($) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  required
                  value={editProductForm.costPrice}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                    setEditProductForm({ ...editProductForm, costPrice: clean });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold text-gray-900 focus:outline-emerald-600 focus:border-emerald-600"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Valor unitario: {formatPrice(Number(editProductForm.costPrice) || 0)}
                </span>
              </div>

              {/* ÚNICO CAMPO DE STOCK: SOLO PARA LA SEDE SELECCIONADA */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-extrabold text-gray-700 uppercase">
                    Stock en {STORES_LIST.find(s => s.id === editStoreTarget)?.shortName} *
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Solo esta sede
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">
                  Existencias físicas disponibles en esta sede seleccionada.
                </p>
                <div className="relative mt-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    required
                    value={editProductForm.stock}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                      setEditProductForm({ ...editProductForm, stock: clean });
                    }}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border-2 border-emerald-600 font-mono font-black text-gray-900 text-base text-center focus:outline-hidden shadow-2xs"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    unidades
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditProductModalOpen(false);
                    setSelectedProductEdit(null);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" /> Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Crear Producto (SOLO 1 NOMBRE: CATEGORÍA/PRODUCTO Y COSTO) */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Crear Nuevo Producto en Inventario</h3>
              <button onClick={() => setIsNewProductModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nombre del producto / categoría *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: HOODIE OVERSIZE"
                  value={newProductForm.name}
                  onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Costo de compra ($) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  placeholder="0"
                  value={newProductForm.costPrice}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                    setNewProductForm({ ...newProductForm, costPrice: clean });
                  }}
                  className="w-full px-2.5 py-2 rounded-xl border border-gray-200 font-mono font-bold"
                />
              </div>

              {/* Stock inicial en las 4 sedes */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">Stock Inicial en las 4 Sedes</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <label className="text-[10px] font-bold text-gray-600 block">Sede República</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={newProductForm.stockRepublica}
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                        setNewProductForm({ ...newProductForm, stockRepublica: clean });
                      }}
                      className="w-full mt-1 px-2 py-1 bg-white rounded border border-gray-200 font-mono font-bold text-center"
                    />
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <label className="text-[10px] font-bold text-gray-600 block">Sede Ciudad Modelo</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={newProductForm.stockModelo}
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                        setNewProductForm({ ...newProductForm, stockModelo: clean });
                      }}
                      className="w-full mt-1 px-2 py-1 bg-white rounded border border-gray-200 font-mono font-bold text-center"
                    />
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <label className="text-[10px] font-bold text-gray-600 block">Sede Quality Store</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={newProductForm.stockQuality}
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                        setNewProductForm({ ...newProductForm, stockQuality: clean });
                      }}
                      className="w-full mt-1 px-2 py-1 bg-white rounded border border-gray-200 font-mono font-bold text-center"
                    />
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <label className="text-[10px] font-bold text-gray-600 block">Sede Mariano Ramos</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={newProductForm.stockMariano}
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                        setNewProductForm({ ...newProductForm, stockMariano: clean });
                      }}
                      className="w-full mt-1 px-2 py-1 bg-white rounded border border-gray-200 font-mono font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  Crear Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 7: MOVIMIENTOS DE MERCANCÍA (ENTRADA Y SALIDA VINCULADOS A STOCK)
          ===================================================================== */}
      {activeTab === 'movimientos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Tarjetas KPI de Resumen de Movimientos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Entradas</span>
                <strong className="text-xl font-black text-emerald-700 block mt-1">
                  +{movementTotalsSummary.totalEntradasUnits} prendas
                </strong>
                <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                  Costo: {formatPrice(movementTotalsSummary.totalEntradasCost)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Salidas / Bajas</span>
                <strong className="text-xl font-black text-red-600 block mt-1">
                  -{movementTotalsSummary.totalSalidasUnits} prendas
                </strong>
                <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                  Costo: {formatPrice(movementTotalsSummary.totalSalidasCost)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Movimientos Registrados</span>
                <strong className="text-xl font-black text-gray-900 block mt-1">
                  {movementTotalsSummary.totalRecords} registros
                </strong>
                <span className="text-[10px] text-gray-400 mt-0.5 block">Historial en tiempo real</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-bold">
                <History className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Inventarios Vinculados</span>
                <strong className="text-xl font-black text-gray-900 block mt-1">4 Sedes Activas</strong>
                <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">Descuento / Suma en vivo</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Boxes className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Formulario Principal de Registro: ENTRADA / SALIDA */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-5">
            {/* Selector de Tipo: Entrada o Salida */}
            <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  setMovementType('ENTRADA');
                  setMovementProductId('');
                }}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  movementType === 'ENTRADA'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" /> Entrada de Mercancía
              </button>

              <button
                type="button"
                onClick={() => {
                  setMovementType('SALIDA');
                  setMovementProductId('');
                }}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  movementType === 'SALIDA'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" /> Salida de Mercancía
              </button>
            </div>

            {/* Banner explicativo del tipo seleccionado */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
              movementType === 'ENTRADA'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-red-50/70 border-red-200 text-red-950'
            }`}>
              <div className="flex items-center gap-2">
                {movementType === 'ENTRADA' ? (
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>
                  {movementType === 'ENTRADA'
                    ? 'Las entradas sumarán unidades directamente al stock de la sede seleccionada.'
                    : 'Las salidas descontarán unidades del inventario de la sede. No se permite retirar más del stock disponible.'}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border">
                {movementType}
              </span>
            </div>

            {/* Campos del Formulario */}
            <form onSubmit={handleRegisterMovement} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end text-xs">
                {/* Sede */}
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Sede de destino / retiro *</label>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 font-bold">
                    <Store className="w-3.5 h-3.5 text-emerald-700" />
                    <select
                      value={movementStoreId}
                      onChange={e => {
                        setMovementStoreId(e.target.value);
                        setMovementProductId('');
                      }}
                      className="w-full bg-transparent font-bold cursor-pointer focus:outline-hidden"
                    >
                      {STORES_LIST.map(st => (
                        <option key={st.id} value={st.id}>{st.shortName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fecha */}
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Fecha de movimiento *</label>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="date"
                      value={movementDateStr}
                      onChange={e => setMovementDateStr(e.target.value)}
                      className="w-full bg-transparent font-bold cursor-pointer focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Producto (Select Buscable con Stock) */}
                <div className="sm:col-span-4 relative" ref={movementSelectRef}>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                    Producto * {movementSelectedProduct && (
                      <span className={`font-mono font-bold ${movementCurrentStock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        (Stock en sede: {movementCurrentStock} u)
                      </span>
                    )}
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMovementSelectOpen(!isMovementSelectOpen);
                      setMovementProductSearch('');
                    }}
                    className={`w-full px-3 py-2 border rounded-xl bg-white text-left font-bold flex items-center justify-between text-xs cursor-pointer ${
                      isMovementSelectOpen ? 'border-emerald-600 ring-2 ring-emerald-100' : 'border-gray-200'
                    }`}
                  >
                    <span className="truncate">
                      {movementSelectedProduct ? movementSelectedProduct.name : '— Seleccionar producto —'}
                    </span>
                    <span className="text-gray-400 text-[10px]">▼</span>
                  </button>

                  {/* Dropdown flotante con buscador */}
                  {isMovementSelectOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2 space-y-1.5">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Buscar producto..."
                          value={movementProductSearch}
                          onChange={e => setMovementProductSearch(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-emerald-600 bg-gray-50/50"
                          autoFocus
                        />
                      </div>

                      <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-0.5">
                        {filteredMovementProducts.length === 0 ? (
                          <div className="py-3 text-center text-xs text-gray-400">
                            {movementType === 'SALIDA' 
                              ? 'No hay productos con stock disponible para retirar.' 
                              : 'No se encontraron productos coincidentes.'}
                          </div>
                        ) : (
                          filteredMovementProducts.map(p => {
                            const pStock = p.stocks[movementStoreId] || 0;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setMovementProductId(p.id);
                                  setIsMovementSelectOpen(false);
                                  setMovementProductSearch('');
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-emerald-50 cursor-pointer ${
                                  movementProductId === p.id ? 'bg-emerald-100 font-extrabold text-emerald-950' : 'text-gray-800'
                                }`}
                              >
                                <span className="font-bold truncate">{p.name}</span>
                                <span className={`text-[11px] font-mono font-bold shrink-0 ml-2 px-1.5 py-0.2 rounded ${
                                  pStock > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {pStock} u
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cantidad */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                    Cantidad * {movementType === 'SALIDA' && movementSelectedProduct && (
                      <span className="text-red-600 font-mono">(Máx: {movementCurrentStock})</span>
                    )}
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setMovementQuantity(prev => Math.max(1, (Number(prev) || 1) - 1))}
                      className="w-8 h-8 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 hover:bg-gray-100 font-black text-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={movementType === 'SALIDA' ? movementCurrentStock : undefined}
                      value={movementQuantity}
                      onChange={e => setMovementQuantity(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                      className="w-full h-8 text-center border border-gray-200 font-bold font-mono text-xs focus:outline-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setMovementQuantity(prev => {
                        const val = (Number(prev) || 0) + 1;
                        if (movementType === 'SALIDA' && val > movementCurrentStock) return prev;
                        return val;
                      })}
                      className="w-8 h-8 rounded-r-xl border border-l-0 border-gray-200 bg-gray-50 hover:bg-gray-100 font-black text-xs flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Descripción / Motivo y Botón Submit */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end text-xs pt-2">
                <div className="sm:col-span-9">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                    Descripción / Motivo del movimiento *
                  </label>
                  <input
                    type="text"
                    placeholder={
                      movementType === 'ENTRADA'
                        ? 'Ej: Compra a proveedor, Reposición de lote, Ingreso de bodega...'
                        : 'Ej: Prenda con costura rota (avería), Dotación empleados, Pérdida...'
                    }
                    value={movementDescription}
                    onChange={e => setMovementDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-emerald-600 font-medium"
                  />
                  {/* Sugerencias rápidas */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-gray-400 font-bold">Sugerencias:</span>
                    {(movementType === 'ENTRADA' ? [
                      'Compra a proveedor',
                      'Reposición de stock',
                      'Devolución de cliente',
                      'Ajuste de inventario (+)'
                    ] : [
                      'Prenda averiada / merma',
                      'Uso interno / dotación',
                      'Devolución a proveedor',
                      'Ajuste de inventario (-)'
                    ]).map(sug => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setMovementDescription(sug)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer font-medium"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      movementType === 'ENTRADA'
                        ? 'bg-emerald-700 hover:bg-emerald-800'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {movementType === 'ENTRADA' ? (
                      <>
                        <ArrowDownLeft className="w-4 h-4" /> Registrar Entrada (+{movementQuantity || 0} u)
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4" /> Registrar Salida (-{movementQuantity || 0} u)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Historial de Movimientos */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-700" />
                  <span>Historial de Movimientos de Mercancía</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-gray-100 font-bold text-gray-700">
                    {filteredMovementsHistory.length} registros
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  Registro cronológico de entradas y salidas que modificaron el inventario de las sedes.
                </p>
              </div>

              {/* Filtros de Historial */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Filtro por Tipo */}
                <select
                  value={movementFilterType}
                  onChange={e => setMovementFilterType(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-gray-200 rounded-xl font-bold bg-gray-50 focus:outline-hidden text-xs"
                >
                  <option value="ALL">Todos los tipos</option>
                  <option value="ENTRADA">🟢 Solo Entradas</option>
                  <option value="SALIDA">🔴 Solo Salidas</option>
                </select>

                {/* Filtro por Sede */}
                <select
                  value={movementFilterStore}
                  onChange={e => setMovementFilterStore(e.target.value)}
                  className="px-2.5 py-1.5 border border-gray-200 rounded-xl font-bold bg-gray-50 focus:outline-hidden text-xs"
                >
                  <option value="all">Todas las sedes</option>
                  {STORES_LIST.map(st => (
                    <option key={st.id} value={st.id}>{st.shortName}</option>
                  ))}
                </select>

                {/* Buscador de texto */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar producto o motivo..."
                    value={movementHistorySearch}
                    onChange={e => setMovementHistorySearch(e.target.value)}
                    className="pl-8 pr-2.5 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-emerald-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {filteredMovementsHistory.length === 0 ? (
              <div className="p-10 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 space-y-2">
                <Boxes className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-bold text-gray-600">No hay movimientos registrados</p>
                <p className="text-[11px] text-gray-400">
                  Usa el formulario superior para registrar una entrada o salida de mercancía en cualquier sede.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar border border-gray-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                      <th className="py-2.5 px-3">Tipo</th>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Sede</th>
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-3 text-center">Cantidad</th>
                      <th className="py-2.5 px-3 text-right">Costo Total</th>
                      <th className="py-2.5 px-4">Descripción / Motivo</th>
                      <th className="py-2.5 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMovementsHistory.map(mov => {
                      const item = mov.items[0];
                      const isEntrada = mov.type === 'ENTRADA';
                      return (
                        <tr key={mov.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isEntrada 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {isEntrada ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                              {mov.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-gray-700 whitespace-nowrap">
                            {mov.dateStr}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-gray-900 px-2 py-0.5 rounded-md bg-gray-100 text-[11px]">
                              {mov.storeName}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-gray-900 uppercase">
                            {item ? item.productName : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-xs">
                            <span className={isEntrada ? 'text-emerald-700' : 'text-red-600'}>
                              {isEntrada ? `+${mov.totalUnits}` : `-${mov.totalUnits}`} u
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-700">
                            {formatPrice(mov.totalCost)}
                          </td>
                          <td className="py-2.5 px-4 text-gray-600 text-[11px]">
                            <span className="font-medium">{mov.reference || mov.observations || '—'}</span>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteMovement(mov)}
                              title="Eliminar movimiento y revertir inventario"
                              className="text-gray-300 hover:text-red-600 cursor-pointer p-1 rounded hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 8: CONTROL DE CUADRES PENDIENTES
          ===================================================================== */}
      {activeTab === 'cuadres' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Días con cuadre registrado</span>
              <strong className="text-xl font-black text-emerald-700 block mt-1">{cuadresMatrixData.countConCuadre}</strong>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-red-100 bg-red-50/20 shadow-2xs">
              <span className="text-[10px] text-red-600 font-bold uppercase block">Días pendientes</span>
              <strong className="text-xl font-black text-red-600 block mt-1">{cuadresMatrixData.countPendientes}</strong>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Días sin ventas ($0)</span>
              <strong className="text-xl font-black text-amber-600 block mt-1">{cuadresMatrixData.countSinVentas}</strong>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-emerald-100 bg-emerald-50/20 shadow-2xs">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Cumplimiento de cuadres</span>
              <strong className="text-xl font-black text-emerald-800 block mt-1">{cuadresMatrixData.pct}%</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Cuadre por sede ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})</h3>
                  <p className="text-xs text-gray-400">Seguimiento diario de cierres en las 4 tiendas físicas.</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-700">✓ Registrado</span>
                  <span className="flex items-center gap-1 text-amber-600">– Sin ventas</span>
                  <span className="flex items-center gap-1 text-red-600">🕒 Pendiente</span>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-center border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold">
                      <th className="text-left py-2 px-3 font-bold text-gray-700 w-32">Sede</th>
                      {cuadresMatrixData.daysArray.map(day => (
                        <th key={day} className="py-2 px-1 min-w-[24px] font-mono">{String(day).padStart(2, '0')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {STORES_LIST.map(st => (
                      <tr key={st.id} className="hover:bg-gray-50/60">
                        <td className="text-left py-3 px-3 font-bold text-gray-900 truncate">{st.shortName}</td>
                        {cuadresMatrixData.daysArray.map(day => {
                          const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const found = data.cuadres.find(c => c.dateStr === dateStr && c.storeId === st.id);
                          const isPastOrToday = cuadresMatrixData.isCurrentMonth ? day <= cuadresMatrixData.currentDay : true;

                          if (found && found.status === 'REGISTERED') {
                            return (
                              <td key={day} className="py-2 px-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenPendingCuadre(st.id, dateStr)}
                                  title={`${st.shortName} · ${dateStr}: ${formatPrice(found.totalSales)} (Clic para inspeccionar cierre)`}
                                  className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold inline-flex items-center justify-center text-[10px] hover:bg-emerald-200 cursor-pointer shadow-2xs transition-colors"
                                >
                                  ✓
                                </button>
                              </td>
                            );
                          } else if (found && found.status === 'NO_SALES') {
                            return (
                              <td key={day} className="py-2 px-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenPendingCuadre(st.id, dateStr)}
                                  title={`${st.shortName} · ${dateStr}: Sin ventas ($0) (Clic para inspeccionar cierre)`}
                                  className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold inline-flex items-center justify-center text-[10px] hover:bg-amber-200 cursor-pointer shadow-2xs transition-colors"
                                >
                                  –
                                </button>
                              </td>
                            );
                          } else if (isPastOrToday) {
                            return (
                              <td key={day} className="py-2 px-1">
                                <button
                                  onClick={() => handleOpenPendingCuadre(st.id, dateStr)}
                                  title={`Pendiente: Cargar ventas para ${st.shortName} del ${dateStr}`}
                                  className="w-5 h-5 rounded-full bg-red-100 text-red-600 font-bold inline-flex items-center justify-center text-[10px] hover:bg-red-200 cursor-pointer"
                                >
                                  🕒
                                </button>
                              </td>
                            );
                          } else {
                            return (
                              <td key={day} className="py-2 px-1 text-gray-200">·</td>
                            );
                          }
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span>Días pendientes de cierre</span>
                </h3>
                <span className="text-xs font-bold text-red-600">{cuadresMatrixData.pendingList.length}</span>
              </div>

              {cuadresMatrixData.pendingList.length === 0 ? (
                <div className="p-6 text-center text-emerald-700 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs font-bold space-y-1">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                  <p>¡Al día! No hay cuadres pendientes en ninguna de las 4 sedes.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {cuadresMatrixData.pendingList.map((p, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-red-100 bg-red-50/30 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-gray-900 block">{p.storeName}</strong>
                        <span className="text-[10px] text-gray-500 font-mono">{p.dateStr}</span>
                      </div>
                      <button
                        onClick={() => handleOpenPendingCuadre(p.storeId, p.dateStr)}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Cargar cuadre
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      {/* =====================================================================
          VISTA 10: REPORTES
          ===================================================================== */}
      {activeTab === 'reportes' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-black text-gray-900">Reportes comerciales y comparativos</h2>
              <p className="text-xs text-gray-500">Desempeño consolidado de ventas, costos y ganancias entre sedes.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => Swal.fire({ icon: 'info', title: 'Exportar Excel', text: 'Descargando consolidado comercial...' })}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Descargar Excel
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {STORES_LIST.map(st => {
              const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
              const sCuadres = data.cuadres.filter(c => c.dateStr.startsWith(monthPrefix) && c.storeId === st.id && c.status === 'REGISTERED');
              const ventas = sCuadres.reduce((a, b) => a + b.totalSales, 0);
              const costo = sCuadres.reduce((a, b) => a + b.totalCost, 0);
              const ganancia = ventas - costo;

              return (
                <div key={st.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <h4 className="font-extrabold text-xs text-gray-900">{st.shortName}</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-gray-600"><span>Ventas:</span><b className="font-mono">{formatPrice(ventas)}</b></div>
                    <div className="flex justify-between text-gray-600"><span>Costo:</span><b className="font-mono">{formatPrice(costo)}</b></div>
                    <div className="flex justify-between text-emerald-700"><span>Ganancia:</span><b className="font-mono">{formatPrice(ganancia)}</b></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 11: IMPORTAR EXCEL
          ===================================================================== */}
      {activeTab === 'importar' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-black text-gray-900">Importación inicial desde Excel</h2>
            <p className="text-xs text-gray-500">Carga los productos, costos de compra y existencias de tus 4 sedes en una sola vez.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-4 p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
              <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-xs font-bold text-center text-gray-800">Sube tu archivo de Excel</h4>
              <p className="text-[10px] text-gray-400 text-center">Formatos .xlsx o .csv con pestañas por sede.</p>
              <button
                onClick={() => {
                  Swal.fire({
                    icon: 'success',
                    title: 'Excel Reconocido',
                    text: 'Se detectaron las 4 sedes y 43 productos del inventario con sus costos de compra y existencias exactas.',
                    confirmButtonColor: '#007A33'
                  });
                }}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Seleccionar Excel
              </button>
            </div>

            <div className="md:col-span-8 p-5 rounded-2xl border border-gray-200 space-y-3">
              <h4 className="text-xs font-bold text-gray-800">Vista previa del archivo cargado</h4>
              <p className="text-xs text-gray-500">43 productos con inventarios independientes por sede sincronizados desde el archivo contable.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {STORES_LIST.map(st => (
                  <div key={st.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <strong className="block text-gray-900">{st.shortName}</strong>
                    <span className="text-[10px] text-emerald-700 font-bold">43 referencias</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
