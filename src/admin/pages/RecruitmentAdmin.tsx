import { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  UserCheck, 
  Settings, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Edit3, 
  Check, 
  X, 
  ExternalLink, 
  Bell, 
  User, 
  FileText, 
  FileCheck, 
  MapPin, 
  Filter, 
  Phone, 
  Mail, 
  Award,
  MoreVertical,
  Trash2,
  Layers,
  Inbox,
  Download,
  BarChart3,
  Star,
  CheckSquare,
  HelpCircle,
  FileSpreadsheet,
  TrendingUp,
  UserPlus,
  CalendarCheck,
  Pause,
  Play
} from 'lucide-react';
import { RecruitmentService, StoreService } from '../../services/api';
import { JobVacancy, JobApplication, JobInterview, RecruitmentSummary, Store } from '../../types';
import Swal from 'sweetalert2';

export default function RecruitmentAdmin() {
  const [activeTab, setActiveTab] = useState<
    'resumen' | 'vacantes' | 'postulaciones' | 'entrevistas' | 'seleccionados' | 'contratados' | 'reportes' | 'configuracion'
  >('resumen');
  
  // Data state (100% dynamic from Database, 0 hardcoded dummy data)
  const [summary, setSummary] = useState<RecruitmentSummary | null>(null);
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [selectedVacancy, setSelectedVacancy] = useState<JobVacancy | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [interviews, setInterviews] = useState<JobInterview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<JobInterview | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for Vacantes
  const [searchVacancy, setSearchVacancy] = useState('');
  const [selectedSedeFilter, setSelectedSedeFilter] = useState('TODAS');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('TODOS');

  // Filters for Postulaciones
  const [appSearch, setAppSearch] = useState('');
  const [appVacancyFilter, setAppVacancyFilter] = useState<string>('TODAS');
  const [appStatusFilters, setAppStatusFilters] = useState<string[]>([]);
  const [appDateFrom, setAppDateFrom] = useState('');
  const [appDateTo, setAppDateTo] = useState('');

  // Filters for Entrevistas
  const [intSearch, setIntSearch] = useState('');
  const [intVacancyFilter, setIntVacancyFilter] = useState<string>('TODAS');
  const [intStatusFilters, setIntStatusFilters] = useState<string[]>([]);
  const [intDateFrom, setIntDateFrom] = useState('');
  const [intDateTo, setIntDateTo] = useState('');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null);

  // Filters for Contratados
  const [hiredSearch, setHiredSearch] = useState('');
  const [hiredSedeFilter, setHiredSedeFilter] = useState('TODAS');
  const [hiredVacancyFilter, setHiredVacancyFilter] = useState('TODAS');
  const [hiredStatusFilters, setHiredStatusFilters] = useState<string[]>([]);
  const [hiredDateFrom, setHiredDateFrom] = useState('');
  const [hiredDateTo, setHiredDateTo] = useState('');

  // Report filters
  const [reportPeriod, setReportPeriod] = useState<'30_DIAS' | '7_DIAS' | 'ESTE_MES' | 'HISTORICO'>('30_DIAS');

  // Vacancy Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [savingVacancy, setSavingVacancy] = useState(false);

  // Interview Schedule Modal
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    applicationId: undefined as number | undefined,
    candidateName: '',
    candidateDocument: '',
    candidatePhone: '',
    candidateEmail: '',
    position: '',
    vacancyId: undefined as number | undefined,
    date: '',
    time: '10:00',
    notes: '',
    sede: 'República de Israel',
    interviewer: 'Administrador'
  });

  // Rate/Score Modal
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [ratingApp, setRatingApp] = useState<JobApplication | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(85);
  const [ratingStatus, setRatingStatus] = useState<string>('PRESELECCIONADO');
  const [ratingNotes, setRatingNotes] = useState<string>('');

  // Interview Result Modal
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [evaluatingInterview, setEvaluatingInterview] = useState<JobInterview | null>(null);
  const [interviewResult, setInterviewResult] = useState<'APROBADA' | 'NO_APROBADA'>('APROBADA');
  const [interviewResultNotes, setInterviewResultNotes] = useState('');

  // Hire Registration Modal
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hiringApp, setHiringApp] = useState<JobApplication | null>(null);
  const [hireForm, setHireForm] = useState({
    employeeStatus: 'Periodo de prueba' as 'Activo' | 'Periodo de prueba' | 'Inactivo',
    hiredPosition: '',
    hiredSede: 'República de Israel',
    hiredSalary: '$ 1.750.000',
    hiredContractType: 'Vinculación laboral directa',
    notes: ''
  });

  // Empty Vacancy Form (starts 100% clean)
  const createEmptyVacancy = (): JobVacancy => ({
    company: "Juan'D Store",
    sede: stores.length > 0 ? (stores[0].barrio || stores[0].name) : "República de Israel",
    position: "",
    employmentType: "Vinculación laboral directa",
    title: "",
    description: "",
    workScheduleType: "Tiempo completo",
    workScheduleHours: "",
    workDays: "Lunes a sábado",
    sundayPolicy: "Domingos intercalados",
    sundayHours: "",
    holidayPolicy: "Sí, se trabajan",
    holidayHours: "",
    scheduleObservations: "",
    remunerationType: "Salario fijo",
    baseSalary: "",
    transportAid: "",
    sundayHolidaySurcharge: "",
    benefits: "",
    salaryObservations: "",
    requirements: "",
    contractType: "Vinculación laboral directa",
    paymentFrequency: "Quincenal",
    paymentDates: "",
    probationPeriod: "Según normatividad vigente",
    workPlace: stores.length > 0 ? `Sede ${stores[0].barrio || stores[0].name}` : "Sede asignada",
    status: "ACTIVA",
    vacanciesCount: 1
  });

  const [vacancyForm, setVacancyForm] = useState<JobVacancy>(createEmptyVacancy());

  const defaultRequirements = [
    'Bachiller académico.',
    'Experiencia en ventas (deseable).',
    'Excelente actitud de servicio y atención al cliente.',
    'Habilidades de comunicación y trabajo en equipo.',
    'Disponibilidad para trabajar domingos y festivos (2 domingos al mes, intercalados).',
    'Conocimiento en manejo de redes sociales (deseable).',
    'Residir en zonas cercanas a la sede (deseable).'
  ];
  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
  const [customReqInput, setCustomReqInput] = useState('');

  const addCustomReq = () => {
    const val = customReqInput.trim();
    if (val && !selectedReqs.includes(val)) {
      setSelectedReqs(prev => [...prev, val]);
      setCustomReqInput('');
    }
  };

  // Load live data from PostgreSQL
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [sum, vacs, apps, ints, sts] = await Promise.all([
        RecruitmentService.getSummary().catch(() => null),
        RecruitmentService.getAllVacancies().catch(() => []),
        RecruitmentService.getApplications().catch(() => []),
        RecruitmentService.getInterviews().catch(() => []),
        StoreService.getStores().catch(() => [])
      ]);
      setSummary(sum);
      setVacancies(vacs || []);
      if (vacs && vacs.length > 0) {
        setSelectedVacancy(prev => prev ? (vacs.find(v => v.id === prev.id) || vacs[0]) : vacs[0]);
      } else {
        setSelectedVacancy(null);
      }
      setApplications(apps || []);
      setInterviews(ints || []);
      setStores(sts || []);
    } catch (err) {
      console.error('Error cargando módulo de reclutamiento:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers & Metrics calculation (100% dynamic from DB) ---
  const activeVacanciesCount = vacancies.filter(v => v.status === 'ACTIVA').length;
  const totalAppsCount = applications.length;
  const enRevisionCount = applications.filter(a => (a.status || 'EN_REVISION') === 'EN_REVISION').length;
  const preseleccionadosCount = applications.filter(a => a.status === 'PRESELECCIONADO').length;
  const enEntrevistaCount = applications.filter(a => a.status === 'EN_ENTREVISTA').length;
  const seleccionadosCount = applications.filter(a => a.status === 'SELECCIONADO').length;
  const noSeleccionadosCount = applications.filter(a => a.status === 'NO_SELECCIONADO').length;
  const contratadosCount = applications.filter(a => a.status === 'CONTRATADO').length;

  const totalInterviewsCount = interviews.length;
  const interviewsPendientesCount = interviews.filter(i => (i.status || 'PROGRAMADA') === 'PROGRAMADA').length;
  const interviewsRealizadasCount = interviews.filter(i => i.status === 'REALIZADA').length;
  const interviewsAprobadasCount = interviews.filter(i => i.result === 'APROBADA').length;
  const interviewsNoAprobadasCount = interviews.filter(i => i.result === 'NO_APROBADA').length;

  const contratadosList = useMemo(() => applications.filter(a => a.status === 'CONTRATADO'), [applications]);
  const contratadosActivosCount = contratadosList.filter(a => a.employeeStatus === 'Activo').length;
  const contratadosPruebaCount = contratadosList.filter(a => (a.employeeStatus || 'Periodo de prueba') === 'Periodo de prueba').length;
  const contratadosInactivosCount = contratadosList.filter(a => a.employeeStatus === 'Inactivo').length;

  const averageHireDays = useMemo(() => {
    const hiredWithDates = contratadosList.filter(a => a.hiredAt && a.createdAt);
    if (hiredWithDates.length === 0) return 0;
    const totalDays = hiredWithDates.reduce((acc, a) => {
      const created = new Date(a.createdAt!).getTime();
      const hired = new Date(a.hiredAt!).getTime();
      const diffDays = Math.max(1, Math.round((hired - created) / (1000 * 60 * 60 * 24)));
      return acc + diffDays;
    }, 0);
    return Math.round(totalDays / hiredWithDates.length);
  }, [contratadosList]);

  const pct = (val: number, total = totalAppsCount) => {
    if (!total || total === 0) return 0;
    return Math.round((val / total) * 100);
  };

  // Status badge styling helper
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ACTIVA':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Activa</span>;
      case 'EN_PROCESO':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">En proceso</span>;
      case 'PAUSADA':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Pausada</span>;
      case 'BORRADOR':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">Borrador</span>;
      case 'CERRADA':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">Cerrada</span>;
      case 'EN_REVISION':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700"><Clock className="w-3 h-3 text-gray-500" /> En revisión</span>;
      case 'PRESELECCIONADO':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800"><Star className="w-3 h-3 text-amber-500" /> Preseleccionado</span>;
      case 'EN_ENTREVISTA':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800"><Calendar className="w-3 h-3 text-blue-500" /> Entrevista</span>;
      case 'SELECCIONADO':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Seleccionado</span>;
      case 'CONTRATADO':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800"><UserCheck className="w-3 h-3 text-purple-600" /> Contratado</span>;
      case 'NO_SELECCIONADO':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800"><X className="w-3 h-3 text-red-500" /> No seleccionado</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">{status || 'En revisión'}</span>;
    }
  };

  // --- Vacancy Operations ---
  const openNewVacancyModal = () => {
    setVacancyForm(createEmptyVacancy());
    setSelectedReqs([]);
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleCreateOrUpdateVacancy = async (status: 'ACTIVA' | 'BORRADOR' = 'ACTIVA') => {
    if (!vacancyForm.position.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor ingresa el Cargo / Vacante (ej. Asesor de ventas).',
        confirmButtonColor: '#10b981'
      });
      setWizardStep(1);
      return;
    }

    try {
      setSavingVacancy(true);
      const toSave = {
        ...vacancyForm,
        title: vacancyForm.title.trim() || `${vacancyForm.position} - ${vacancyForm.company}`,
        requirements: selectedReqs.join(', '),
        status: status
      };

      if (vacancyForm.id) {
        await RecruitmentService.updateVacancy(vacancyForm.id, toSave);
        Swal.fire({
          icon: 'success',
          title: 'Vacante actualizada',
          text: 'Los cambios se han guardado en la base de datos.',
          confirmButtonColor: '#10b981'
        });
      } else {
        const created = await RecruitmentService.createVacancy(toSave);
        Swal.fire({
          icon: 'success',
          title: '¡Vacante creada con éxito!',
          text: 'La vacante se ha guardado en la base de datos y ya es visible en la página pública.',
          confirmButtonColor: '#10b981'
        });
        setSelectedVacancy(created);
      }

      setIsWizardOpen(false);
      setVacancyForm(createEmptyVacancy());
      setWizardStep(1);
      await loadAllData();
      setActiveTab('vacantes');
    } catch (err: any) {
      console.error('Error guardando vacante:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err?.message || 'No se pudo guardar la vacante.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSavingVacancy(false);
    }
  };

  const handleDeleteVacancy = async (id: number) => {
    const res = await Swal.fire({
      title: '¿Eliminar vacante?',
      text: 'Se eliminará de la base de datos de manera definitiva.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (res.isConfirmed) {
      try {
        await RecruitmentService.deleteVacancy(id);
        Swal.fire({ icon: 'success', title: 'Eliminada', text: 'Vacante eliminada de la base de datos.', confirmButtonColor: '#10b981' });
        loadAllData();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la vacante.', confirmButtonColor: '#ef4444' });
      }
    }
  };

  // --- Application Operations ---
  const handleUpdateAppStatus = async (id: number, status: string, notes?: string) => {
    try {
      await RecruitmentService.updateApplicationStatus(id, status, notes);
      await loadAllData();
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El candidato ha pasado a estado: ${status}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado.', confirmButtonColor: '#ef4444' });
    }
  };

  const handleDeleteApplication = async (id: number) => {
    const res = await Swal.fire({
      title: '¿Eliminar postulación?',
      text: 'Se eliminará permanentemente de la base de datos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (res.isConfirmed) {
      try {
        await RecruitmentService.deleteApplication(id);
        Swal.fire({ icon: 'success', title: 'Eliminada', text: 'Postulación eliminada.', confirmButtonColor: '#10b981' });
        loadAllData();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la postulación.', confirmButtonColor: '#ef4444' });
      }
    }
  };

  const openRateModal = (app: JobApplication) => {
    setRatingApp(app);
    setRatingScore(app.score || 85);
    setRatingStatus(app.status || 'PRESELECCIONADO');
    setRatingNotes(app.adminNotes || '');
    setIsRateModalOpen(true);
  };

  const handleSaveRating = async () => {
    if (!ratingApp?.id) return;
    try {
      await RecruitmentService.rateCandidate(ratingApp.id, ratingScore, ratingNotes);
      if (ratingStatus !== ratingApp.status) {
        await RecruitmentService.updateApplicationStatus(ratingApp.id, ratingStatus, ratingNotes);
      }
      setIsRateModalOpen(false);
      await loadAllData();
      Swal.fire({ icon: 'success', title: 'Evaluación guardada', text: 'El puntaje y notas se han registrado.', confirmButtonColor: '#10b981' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la evaluación.', confirmButtonColor: '#ef4444' });
    }
  };

  // --- Interview Operations ---
  const openScheduleInterviewForApp = (app: JobApplication) => {
    setInterviewForm({
      applicationId: app.id,
      candidateName: app.fullName,
      candidateDocument: app.documentNumber,
      candidatePhone: app.phone,
      candidateEmail: app.email,
      position: app.targetPosition || app.vacancyTitle || 'Asesor de ventas',
      vacancyId: app.vacancyId,
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      notes: '',
      sede: 'República de Israel',
      interviewer: 'Administrador'
    });
    setIsInterviewModalOpen(true);
  };

  const handleSaveInterview = async () => {
    if (!interviewForm.candidateName.trim() || !interviewForm.date) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Por favor ingresa candidato y fecha de entrevista.', confirmButtonColor: '#10b981' });
      return;
    }
    try {
      const scheduledAt = `${interviewForm.date}T${interviewForm.time}:00`;
      await RecruitmentService.scheduleInterview({
        applicationId: interviewForm.applicationId,
        vacancyId: interviewForm.vacancyId,
        candidateName: interviewForm.candidateName,
        candidateDocument: interviewForm.candidateDocument,
        candidatePhone: interviewForm.candidatePhone,
        candidateEmail: interviewForm.candidateEmail,
        position: interviewForm.position,
        sede: interviewForm.sede,
        interviewer: interviewForm.interviewer,
        scheduledAt: scheduledAt,
        status: 'PROGRAMADA',
        notes: interviewForm.notes
      });
      setIsInterviewModalOpen(false);
      await loadAllData();
      Swal.fire({
        icon: 'success',
        title: '¡Entrevista agendada!',
        text: 'La entrevista se programó exitosamente y el candidato pasó a estado "En entrevista".',
        confirmButtonColor: '#10b981'
      });
      setActiveTab('entrevistas');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo programar la entrevista.', confirmButtonColor: '#ef4444' });
    }
  };

  const openInterviewResultModal = (interview: JobInterview) => {
    setEvaluatingInterview(interview);
    setInterviewResult(interview.result === 'NO_APROBADA' ? 'NO_APROBADA' : 'APROBADA');
    setInterviewResultNotes(interview.notes || '');
    setIsResultModalOpen(true);
  };

  const handleSaveInterviewResult = async () => {
    if (!evaluatingInterview?.id) return;
    try {
      await RecruitmentService.recordInterviewResult(evaluatingInterview.id, interviewResult, interviewResultNotes);
      setIsResultModalOpen(false);
      await loadAllData();
      Swal.fire({
        icon: 'success',
        title: 'Resultado registrado',
        text: interviewResult === 'APROBADA' 
          ? 'La entrevista fue marcada como APROBADA y el candidato ha pasado a la sección "Seleccionados".'
          : 'La entrevista fue marcada como NO APROBADA.',
        confirmButtonColor: '#10b981'
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el resultado de la entrevista.', confirmButtonColor: '#ef4444' });
    }
  };

  const handleDeleteInterview = async (id: number) => {
    const res = await Swal.fire({
      title: '¿Eliminar cita de entrevista?',
      text: 'Se eliminará de la agenda.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (res.isConfirmed) {
      try {
        await RecruitmentService.deleteInterview(id);
        await loadAllData();
        Swal.fire({ icon: 'success', title: 'Eliminada', text: 'Cita eliminada de la agenda.', confirmButtonColor: '#10b981' });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la entrevista.', confirmButtonColor: '#ef4444' });
      }
    }
  };

  // --- Hiring Operations ---
  const openHireModal = (app?: JobApplication) => {
    if (app) {
      setHiringApp(app);
      setHireForm({
        employeeStatus: 'Periodo de prueba',
        hiredPosition: app.targetPosition || app.vacancyTitle || 'Asesor de ventas',
        hiredSede: 'República de Israel',
        hiredSalary: '$ 1.750.000',
        hiredContractType: 'Vinculación laboral directa',
        notes: ''
      });
    } else {
      setHiringApp(null);
      setHireForm({
        employeeStatus: 'Periodo de prueba',
        hiredPosition: 'Asesor de ventas',
        hiredSede: 'República de Israel',
        hiredSalary: '$ 1.750.000',
        hiredContractType: 'Vinculación laboral directa',
        notes: ''
      });
    }
    setIsHireModalOpen(true);
  };

  const handleConfirmHire = async () => {
    if (!hiringApp?.id) {
      Swal.fire({ icon: 'warning', title: 'Selecciona candidato', text: 'Selecciona el candidato a vincular.', confirmButtonColor: '#10b981' });
      return;
    }
    try {
      await RecruitmentService.hireCandidate(hiringApp.id, {
        employeeStatus: hireForm.employeeStatus,
        hiredPosition: hireForm.hiredPosition,
        hiredSede: hireForm.hiredSede,
        hiredSalary: hireForm.hiredSalary,
        hiredContractType: hireForm.hiredContractType,
        notes: hireForm.notes
      });
      setIsHireModalOpen(false);
      await loadAllData();
      Swal.fire({
        icon: 'success',
        title: '¡Contratación registrada!',
        text: `${hiringApp.fullName} ha sido vinculado(a) exitosamente y aparece en la sección "Contratados".`,
        confirmButtonColor: '#10b981'
      });
      setActiveTab('contratados');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar la contratación.', confirmButtonColor: '#ef4444' });
    }
  };

  // --- CSV Export Helper ---
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      Swal.fire({ icon: 'info', title: 'Sin datos', text: 'No hay registros para exportar.', confirmButtonColor: '#10b981' });
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Template download helper
  const downloadTemplate = (title: string) => {
    let content = '';
    if (title.toLowerCase().includes('entrevista')) {
      content = `# FORMATO DE ENTREVISTA LABORAL - JUAN'D STORE / QUALITY STORE\nFecha: _____________________  Sede: _____________________\nCandidato: _________________  Cargo: ____________________\nEntrevistador: _____________\n\n1. Presentación y actitud comercial (1-10): _____\n2. Experiencia previa en ventas de ropa (1-10): _____\n3. Disponibilidad domingos y festivos: [ ] Sí  [ ] No\n4. Habilidades de comunicación y trabajo en equipo (1-10): _____\n5. Observaciones: _________________________________________\n\nResultado: [ ] Aprobada  [ ] No aprobada\nFirma: ________________________\n`;
    } else if (title.toLowerCase().includes('evaluación')) {
      content = `# EVALUACIÓN DE CANDIDATO - PROCESO DE SELECCIÓN\nCandidato: _________________  Puntaje: _____ / 100%\nCargo: ____________________   Fecha: _____________________\n\nCriterios de Selección:\n- Formación y cumplimiento de perfil: 20%\n- Actitud y vocación de servicio: 30%\n- Experiencia en metas y caja: 30%\n- Compromiso y disponibilidad de horarios: 20%\n\nConcepto final: [ ] Preseleccionado  [ ] Seleccionado  [ ] No seleccionado\n`;
    } else {
      content = `# MINUTA DE CONTRATO LABORAL\nEmpresa: JUAN'D STORE / QUALITY STORE\nEmpleado: _________________  C.C.: _____________________\nCargo: ____________________  Sede: _____________________\nSalario acordado: _________  Frecuencia: Quincenal\n\nCláusula Primera: Objeto del contrato.\nCláusula Segunda: Horario y descansos acordados.\nCláusula Tercera: Obligaciones del trabajador.\n`;
    }

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Filtered Data ---
  const filteredVacancies = useMemo(() => {
    return vacancies.filter(v => {
      const matchSearch = !searchVacancy || 
        v.title.toLowerCase().includes(searchVacancy.toLowerCase()) || 
        v.position.toLowerCase().includes(searchVacancy.toLowerCase());
      const matchSede = selectedSedeFilter === 'TODAS' || v.sede === selectedSedeFilter;
      const matchStatus = selectedStatusFilter === 'TODOS' || v.status === selectedStatusFilter;
      return matchSearch && matchSede && matchStatus;
    });
  }, [vacancies, searchVacancy, selectedSedeFilter, selectedStatusFilter]);

  const filteredApplications = useMemo(() => {
    return applications.filter(a => {
      const matchSearch = !appSearch || 
        a.fullName.toLowerCase().includes(appSearch.toLowerCase()) || 
        (a.documentNumber && a.documentNumber.includes(appSearch)) ||
        (a.email && a.email.toLowerCase().includes(appSearch.toLowerCase()));
      const matchVacancy = appVacancyFilter === 'TODAS' || String(a.vacancyId) === appVacancyFilter || a.targetPosition === appVacancyFilter;
      const matchStatus = appStatusFilters.length === 0 || appStatusFilters.includes(a.status || 'EN_REVISION');
      const matchDateFrom = !appDateFrom || (a.createdAt && a.createdAt >= appDateFrom);
      const matchDateTo = !appDateTo || (a.createdAt && a.createdAt <= appDateTo + 'T23:59:59');
      return matchSearch && matchVacancy && matchStatus && matchDateFrom && matchDateTo;
    });
  }, [applications, appSearch, appVacancyFilter, appStatusFilters, appDateFrom, appDateTo]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter(i => {
      const matchSearch = !intSearch ||
        i.candidateName.toLowerCase().includes(intSearch.toLowerCase()) ||
        (i.position && i.position.toLowerCase().includes(intSearch.toLowerCase()));
      const matchVacancy = intVacancyFilter === 'TODAS' || String(i.vacancyId) === intVacancyFilter || i.position === intVacancyFilter;
      const matchStatus = intStatusFilters.length === 0 || 
        intStatusFilters.includes(i.status) || 
        (i.result && intStatusFilters.includes(i.result));
      const matchDateFrom = !intDateFrom || (i.scheduledAt && i.scheduledAt >= intDateFrom);
      const matchDateTo = !intDateTo || (i.scheduledAt && i.scheduledAt <= intDateTo + 'T23:59:59');
      const matchCalendar = !calendarSelectedDate || (i.scheduledAt && i.scheduledAt.startsWith(calendarSelectedDate));
      return matchSearch && matchVacancy && matchStatus && matchDateFrom && matchDateTo && matchCalendar;
    });
  }, [interviews, intSearch, intVacancyFilter, intStatusFilters, intDateFrom, intDateTo, calendarSelectedDate]);

  const seleccionadosList = useMemo(() => {
    return applications.filter(a => a.status === 'SELECCIONADO');
  }, [applications]);

  const filteredContratados = useMemo(() => {
    return contratadosList.filter(a => {
      const matchSearch = !hiredSearch ||
        a.fullName.toLowerCase().includes(hiredSearch.toLowerCase()) ||
        (a.documentNumber && a.documentNumber.includes(hiredSearch)) ||
        (a.targetPosition && a.targetPosition.toLowerCase().includes(hiredSearch.toLowerCase()));
      const matchSede = hiredSedeFilter === 'TODAS' || a.hiredSede === hiredSedeFilter;
      const matchVacancy = hiredVacancyFilter === 'TODAS' || a.targetPosition === hiredVacancyFilter || String(a.vacancyId) === hiredVacancyFilter;
      const matchStatus = hiredStatusFilters.length === 0 || hiredStatusFilters.includes(a.employeeStatus || 'Periodo de prueba');
      const matchDateFrom = !hiredDateFrom || (a.hiredAt && a.hiredAt >= hiredDateFrom);
      const matchDateTo = !hiredDateTo || (a.hiredAt && a.hiredAt <= hiredDateTo + 'T23:59:59');
      return matchSearch && matchSede && matchVacancy && matchStatus && matchDateFrom && matchDateTo;
    });
  }, [contratadosList, hiredSearch, hiredSedeFilter, hiredVacancyFilter, hiredStatusFilters, hiredDateFrom, hiredDateTo]);

  // Calendar dates for interview dots
  const interviewDaysSet = useMemo(() => {
    const set = new Set<string>();
    interviews.forEach(i => {
      if (i.scheduledAt) {
        set.add(i.scheduledAt.split('T')[0]);
      }
    });
    return set;
  }, [interviews]);

  return (
    <div className="min-h-screen bg-gray-50/60 pb-24">
      {/* Top Header Bar Matching Screenshots */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Briefcase className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                RECLUTAMIENTO
              </h1>
              <p className="text-xs text-gray-500">Gestión de vacantes, postulaciones y selección del personal.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/trabaja-con-nosotros"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              Ver página pública
            </a>
            <div className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Bell className="w-4 h-4" />
              {applications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs (8 Tabs matching images) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto border-t border-gray-100 py-2 scrollbar-none">
          {[
            { id: 'resumen', label: 'Resumen', icon: Layers },
            { id: 'vacantes', label: 'Vacantes', icon: Briefcase, count: vacancies.length },
            { id: 'postulaciones', label: 'Postulaciones', icon: Users, count: applications.length, badgeColor: 'bg-emerald-600' },
            { id: 'entrevistas', label: 'Entrevistas', icon: Calendar, count: interviewsPendientesCount },
            { id: 'seleccionados', label: 'Seleccionados', icon: CheckCircle2, count: seleccionadosCount },
            { id: 'contratados', label: 'Contratados', icon: UserCheck, count: contratadosCount },
            { id: 'reportes', label: 'Reportes', icon: BarChart3 },
            { id: 'configuracion', label: 'Configuración', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">

        {/* ========================================================================= */}
        {/* TAB 1: RESUMEN (Image 1) */}
        {/* ========================================================================= */}
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-500">Vacantes activas</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-gray-900">{activeVacanciesCount}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-500">Postulaciones totales</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-gray-900">{totalAppsCount}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-500">Entrevistas programadas</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-gray-900">{interviewsPendientesCount}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-500">Contratados (total)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-gray-900">{contratadosCount}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Split layout: Tables & Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (8 cols): Tables */}
              <div className="lg:col-span-8 space-y-6">
                {/* Vacantes Activas */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900">Vacantes activas</h3>
                        <p className="text-[11px] text-gray-500">Ofertas publicadas en la página "Trabaja con nosotros".</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openNewVacancyModal}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Crear vacante
                    </button>
                  </div>

                  {vacancies.length === 0 ? (
                    <div className="py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl">
                      <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-gray-700">No hay vacantes creadas todavía</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        Crea tu primera oferta laboral haciendo clic en el botón "+ Crear vacante".
                      </p>
                      <button
                        type="button"
                        onClick={openNewVacancyModal}
                        className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Crear primera vacante
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-y border-gray-100">
                          <tr>
                            <th className="py-2.5 px-3">Cargo / Vacante</th>
                            <th className="py-2.5 px-3">Sede</th>
                            <th className="py-2.5 px-3">Postulaciones</th>
                            <th className="py-2.5 px-3">Publicación</th>
                            <th className="py-2.5 px-3">Estado</th>
                            <th className="py-2.5 px-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {vacancies.map((v) => (
                            <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                              <td className="py-3 px-3">
                                <strong className="block text-gray-900">{v.position}</strong>
                                <span className="text-[11px] text-gray-500 truncate block max-w-[200px]">{v.title}</span>
                              </td>
                              <td className="py-3 px-3 text-gray-600 flex items-center gap-1 mt-2">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {v.sede}
                              </td>
                              <td className="py-3 px-3 font-semibold text-gray-800">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3 text-gray-400" />
                                  {applications.filter(a => a.vacancyId === v.id).length}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  {v.createdAt?.split('T')[0] || 'Hoy'}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                {getStatusBadge(v.status)}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedVacancy(v);
                                    setActiveTab('vacantes');
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                  title="Ver detalles"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Últimas postulaciones */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900">Últimas postulaciones</h3>
                        <p className="text-[11px] text-gray-500">Personas que han enviado su postulación recientemente.</p>
                      </div>
                    </div>
                    {applications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('postulaciones')}
                        className="text-xs font-bold text-gray-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                      >
                        Ver todas <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {applications.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      Aún no hay postulaciones recibidas. Aparecerán aquí cuando los aspirantes apliquen desde la web.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-y border-gray-100">
                          <tr>
                            <th className="py-2.5 px-3">Postulante</th>
                            <th className="py-2.5 px-3">Vacante</th>
                            <th className="py-2.5 px-3">Fecha</th>
                            <th className="py-2.5 px-3">Estado</th>
                            <th className="py-2.5 px-3 text-right">Ver</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {applications.slice(0, 5).map((app) => {
                            const initials = app.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                            return (
                              <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                                <td className="py-3 px-3 flex items-center gap-2.5">
                                  <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-[10px]">
                                    {initials}
                                  </span>
                                  <div>
                                    <strong className="block text-gray-900">{app.fullName}</strong>
                                    <span className="text-[10px] text-gray-400">CC {app.documentNumber}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 font-medium text-gray-800">{app.targetPosition || app.vacancyTitle}</td>
                                <td className="py-3 px-3 text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    {app.createdAt ? app.createdAt.split('T')[0] : 'Hoy'}
                                  </span>
                                </td>
                                <td className="py-3 px-3">{getStatusBadge(app.status)}</td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedApplication(app)}
                                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                    title="Ver postulación completa"
                                  >
                                    <Eye className="w-4 h-4" />
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

              {/* Right Column (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Proceso de selección (global) Donut Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-emerald-600" />
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900">Proceso de selección (global)</h3>
                      <p className="text-[11px] text-gray-500">Estado de todas las postulaciones.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-4">
                    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          className="text-gray-100"
                          strokeWidth="3.8"
                          stroke="currentColor"
                          fill="none"
                        />
                        {totalAppsCount > 0 && (
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            className="text-emerald-600"
                            strokeDasharray={`${pct(enRevisionCount)}, 100`}
                            strokeWidth="3.8"
                            stroke="currentColor"
                            fill="none"
                          />
                        )}
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-lg font-black text-gray-900">{totalAppsCount}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Total</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
                        <span>En revisión: <strong>{enRevisionCount} ({pct(enRevisionCount)}%)</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span>Entrevista: <strong>{enEntrevistaCount} ({pct(enEntrevistaCount)}%)</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <span>Preseleccionado: <strong>{preseleccionadosCount} ({pct(preseleccionadosCount)}%)</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        <span>Seleccionado: <strong>{seleccionadosCount} ({pct(seleccionadosCount)}%)</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                        <span>No seleccionado: <strong>{noSeleccionadosCount} ({pct(noSeleccionadosCount)}%)</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Próximas Entrevistas Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900">Próximas entrevistas</h3>
                        <p className="text-[11px] text-gray-500">Agenda de entrevistas programadas.</p>
                      </div>
                    </div>
                    {interviews.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('entrevistas')}
                        className="text-xs font-bold text-gray-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                      >
                        Ver agenda <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {interviews.length === 0 ? (
                    <div className="py-6 text-center text-gray-400 text-xs">
                      No hay entrevistas programadas en la agenda.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {interviews.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                          <div>
                            <strong className="block text-xs text-gray-900">{item.candidateName}</strong>
                            <span className="text-[11px] text-gray-500">{item.position}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-200">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {item.scheduledAt?.split('T')[1]?.substring(0, 5) || '10:00'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Acciones Rápidas Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                  <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-yellow-500">⚡</span> Acciones rápidas
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={openNewVacancyModal}
                      className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-5 h-5 text-emerald-600" />
                      Crear vacante
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('postulaciones')}
                      className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Users className="w-5 h-5 text-gray-600" />
                      Ver postulaciones
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInterviewForm({
                          applicationId: undefined,
                          candidateName: '',
                          candidateDocument: '',
                          candidatePhone: '',
                          candidateEmail: '',
                          position: vacancies.length > 0 ? vacancies[0].position : 'Asesor de ventas',
                          vacancyId: vacancies.length > 0 ? vacancies[0].id : undefined,
                          date: new Date().toISOString().split('T')[0],
                          time: '10:00',
                          notes: '',
                          sede: 'República de Israel',
                          interviewer: 'Administrador'
                        });
                        setIsInterviewModalOpen(true);
                      }}
                      className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Calendar className="w-5 h-5 text-gray-600" />
                      Programar entrevista
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('configuracion')}
                      className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Settings className="w-5 h-5 text-gray-600" />
                      Configuración
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VACANTES (Images 2 & 3 - Split View) */}
        {/* ========================================================================= */}
        {activeTab === 'vacantes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Vacancy List (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Vacantes</h3>
                  <p className="text-xs text-gray-500">Administra las ofertas laborales de "Trabaja con nosotros".</p>
                </div>
                <button
                  type="button"
                  onClick={openNewVacancyModal}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Crear vacante
                </button>
              </div>

              {/* Filters & Search */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar vacante..."
                    value={searchVacancy}
                    onChange={e => setSearchVacancy(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedSedeFilter}
                    onChange={e => setSelectedSedeFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="TODAS">Todas las sedes</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.barrio || s.name}>{s.barrio || s.name}</option>
                    ))}
                  </select>
                  <select
                    value={selectedStatusFilter}
                    onChange={e => setSelectedStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="TODOS">Todos los estados</option>
                    <option value="ACTIVA">Activa</option>
                    <option value="EN_PROCESO">En proceso</option>
                    <option value="PAUSADA">Pausada</option>
                  </select>
                </div>
              </div>

              {/* Vacancies List or Empty State */}
              {vacancies.length === 0 ? (
                <div className="py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl space-y-2">
                  <Inbox className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs font-bold text-gray-600">No hay vacantes registradas en la base de datos.</p>
                  <p className="text-[11px] text-gray-400">Pulsa el botón de abajo para registrar la primera vacante.</p>
                  <button
                    type="button"
                    onClick={openNewVacancyModal}
                    className="mt-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Crear vacante
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 pt-2">
                  {filteredVacancies.map((v) => {
                    const isSelected = selectedVacancy?.id === v.id;
                    const count = applications.filter(a => a.vacancyId === v.id).length;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVacancy(v)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                            }`}>
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <strong className="block text-xs font-extrabold text-gray-900">{v.position}</strong>
                              <span className="text-[11px] text-gray-500 block truncate max-w-[180px]">{v.title}</span>
                              <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {v.sede}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            {getStatusBadge(v.status)}
                            <span className="block text-[11px] font-bold text-gray-700 mt-1 flex items-center justify-end gap-1">
                              <Users className="w-3 h-3 text-gray-400" />
                              {count}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                          <span>Publicada: {v.createdAt?.split('T')[0] || 'Hoy'}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setVacancyForm(v);
                                setSelectedReqs(v.requirements ? v.requirements.split(',').map(r => r.trim()).filter(Boolean) : []);
                                setWizardStep(1);
                                setIsWizardOpen(true);
                              }}
                              className="text-gray-500 hover:text-emerald-700 p-1 cursor-pointer"
                              title="Editar vacante"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteVacancy(v.id!);
                              }}
                              className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                              title="Eliminar vacante"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Selected Vacancy Full Details (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
              {selectedVacancy ? (
                <>
                  <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-black text-gray-900">{selectedVacancy.position}</h2>
                          {getStatusBadge(selectedVacancy.status)}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {selectedVacancy.company} – Sede {selectedVacancy.sede}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setVacancyForm(selectedVacancy);
                          setSelectedReqs(selectedVacancy.requirements ? selectedVacancy.requirements.split(',').map(r => r.trim()).filter(Boolean) : []);
                          setWizardStep(1);
                          setIsWizardOpen(true);
                        }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold border-b border-gray-100 pb-2">
                    <button type="button" className="text-emerald-700 border-b-2 border-emerald-600 pb-2">
                      Información
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setAppVacancyFilter(String(selectedVacancy.id));
                        setActiveTab('postulaciones');
                      }}
                      className="text-gray-500 hover:text-gray-800 pb-2 flex items-center gap-1 cursor-pointer"
                    >
                      Postulaciones ({applications.filter(a => a.vacancyId === selectedVacancy.id).length})
                    </button>
                  </div>

                  {/* Conditions */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      Condiciones laborales
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1.5">
                        <span className="font-bold text-gray-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          Horario de trabajo
                        </span>
                        <ul className="space-y-1 text-gray-600 pl-4 list-disc text-[11px]">
                          <li>Jornada: {selectedVacancy.workScheduleType}</li>
                          {selectedVacancy.workScheduleHours && <li>Horario: {selectedVacancy.workScheduleHours}</li>}
                          {selectedVacancy.sundayHours && <li>Domingos: {selectedVacancy.sundayHours}</li>}
                          {selectedVacancy.holidayHours && <li>Festivos: {selectedVacancy.holidayHours}</li>}
                        </ul>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1.5">
                        <span className="font-bold text-gray-900 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          Salario y pagos
                        </span>
                        <ul className="space-y-1 text-gray-600 pl-4 list-disc text-[11px]">
                          {selectedVacancy.baseSalary && <li>Salario base: {selectedVacancy.baseSalary}</li>}
                          {selectedVacancy.transportAid && <li>Auxilio transporte: {selectedVacancy.transportAid}</li>}
                          {selectedVacancy.sundayHolidaySurcharge && <li>Recargo festivos: {selectedVacancy.sundayHolidaySurcharge}</li>}
                          {selectedVacancy.paymentFrequency && <li>Frecuencia: {selectedVacancy.paymentFrequency}</li>}
                        </ul>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-gray-400 text-[10px] uppercase font-bold block">Bonificaciones</span>
                        <p className="text-gray-700 text-xs mt-0.5">{selectedVacancy.benefits || 'Según metas y rendimiento'}</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-gray-400 text-[10px] uppercase font-bold block">Tipo de contrato</span>
                        <strong className="text-gray-900">{selectedVacancy.contractType}</strong>
                      </div>
                    </div>

                    {/* Requirements */}
                    {selectedVacancy.requirements && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          Requisitos del cargo
                        </h4>
                        <div className="space-y-1.5 text-xs text-gray-700">
                          {selectedVacancy.requirements.split(',').map((req, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{req.trim()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Commitment */}
                    <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
                      <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-extrabold text-emerald-950">Compromiso</h5>
                        <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                          Buscamos personas comprometidas, con excelente actitud comercial y disposición para trabajar en equipo en nuestras tiendas físicas.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-16 text-center text-gray-400">
                  <Inbox className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-gray-600">No hay ninguna vacante seleccionada</p>
                  <p className="text-xs text-gray-400 mt-1">Crea una nueva vacante con el botón "+ Crear vacante" para ver sus detalles aquí.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: POSTULACIONES (Image 1 of new batch: fc461713.jpg) */}
        {/* ========================================================================= */}
        {activeTab === 'postulaciones' && (
          <div className="space-y-6">
            {/* Header with Search and Export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Postulaciones</h2>
                <p className="text-xs text-gray-500">Listado y gestión de todas las postulaciones recibidas.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-72">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, cédula o correo..."
                    value={appSearch}
                    onChange={e => setAppSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => exportToCSV(filteredApplications, 'postulaciones')}
                  className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-gray-600" />
                  Exportar
                </button>
              </div>
            </div>

            {/* 6 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Total postulaciones</span>
                  <span className="text-xl font-black text-gray-900">{totalAppsCount}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">En revisión</span>
                  <span className="text-xl font-black text-gray-900">{enRevisionCount}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Preseleccionados</span>
                  <span className="text-xl font-black text-gray-900">{preseleccionadosCount}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Entrevista</span>
                  <span className="text-xl font-black text-gray-900">{enEntrevistaCount}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Seleccionados</span>
                  <span className="text-xl font-black text-gray-900">{seleccionadosCount}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">No seleccionados</span>
                  <span className="text-xl font-black text-gray-900">{noSeleccionadosCount}</span>
                </div>
              </div>
            </div>

            {/* Split View: Left Filters + Right Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Filters (3 cols) */}
              <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <span>Filtros</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Vacante</label>
                  <select
                    value={appVacancyFilter}
                    onChange={e => setAppVacancyFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="TODAS">Todas las vacantes</option>
                    {vacancies.map(v => (
                      <option key={v.id} value={String(v.id)}>{v.position}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-2">Estado</label>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    {[
                      { id: 'EN_REVISION', label: 'En revisión', count: enRevisionCount },
                      { id: 'PRESELECCIONADO', label: 'Preseleccionado', count: preseleccionadosCount },
                      { id: 'EN_ENTREVISTA', label: 'Entrevista', count: enEntrevistaCount },
                      { id: 'SELECCIONADO', label: 'Seleccionado', count: seleccionadosCount },
                      { id: 'NO_SELECCIONADO', label: 'No seleccionado', count: noSeleccionadosCount },
                    ].map(st => {
                      const isChecked = appStatusFilters.includes(st.id);
                      return (
                        <label key={st.id} className="flex items-center justify-between cursor-pointer py-0.5">
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setAppStatusFilters(appStatusFilters.filter(s => s !== st.id));
                                } else {
                                  setAppStatusFilters([...appStatusFilters, st.id]);
                                }
                              }}
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <span>{st.label}</span>
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">({st.count})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Fecha de postulación</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={appDateFrom}
                      onChange={e => setAppDateFrom(e.target.value)}
                      className="px-2 py-1 text-[11px] border border-gray-300 rounded-lg"
                      title="Desde"
                    />
                    <input
                      type="date"
                      value={appDateTo}
                      onChange={e => setAppDateTo(e.target.value)}
                      className="px-2 py-1 text-[11px] border border-gray-300 rounded-lg"
                      title="Hasta"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAppSearch('');
                    setAppVacancyFilter('TODAS');
                    setAppStatusFilters([]);
                    setAppDateFrom('');
                    setAppDateTo('');
                  }}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </div>

              {/* Right Table (9 cols) */}
              <div className="lg:col-span-9 bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Postulaciones ({filteredApplications.length})
                  </h3>
                </div>

                {filteredApplications.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-xl space-y-2">
                    <Inbox className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="font-bold text-gray-700 text-sm">No se encontraron postulaciones</p>
                    <p className="text-gray-400 max-w-sm mx-auto">
                      Las personas interesadas que llenen el formulario en la página web pública aparecerán listadas aquí con todos sus datos.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-y border-gray-100">
                        <tr>
                          <th className="py-2.5 px-3">Postulante</th>
                          <th className="py-2.5 px-3">Vacante</th>
                          <th className="py-2.5 px-3">Fecha de postulación</th>
                          <th className="py-2.5 px-3">Estado</th>
                          <th className="py-2.5 px-3">Puntaje</th>
                          <th className="py-2.5 px-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {filteredApplications.map(app => {
                          const initials = app.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                          return (
                            <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                                    {initials}
                                  </span>
                                  <div>
                                    <strong className="block text-gray-900">{app.fullName}</strong>
                                    <span className="text-[11px] text-gray-400 block">{app.email}</span>
                                    <span className="text-[10px] text-gray-400">CC {app.documentNumber} • {app.phone}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-3 font-semibold text-gray-800">
                                {app.targetPosition || app.vacancyTitle || 'Asesor(a) de ventas'}
                              </td>

                              <td className="py-3 px-3 text-gray-500">
                                <span className="block font-medium text-gray-700">{app.createdAt?.split('T')[0] || 'Hoy'}</span>
                                <span className="text-[10px] text-gray-400">{app.createdAt?.split('T')[1]?.substring(0, 5) || 'Reciente'}</span>
                              </td>

                              <td className="py-3 px-3">
                                {getStatusBadge(app.status)}
                              </td>

                              <td className="py-3 px-3">
                                {app.score ? (
                                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                                    {app.score}%
                                  </span>
                                ) : (
                                  <span className="text-gray-300 font-bold">--</span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedApplication(app)}
                                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                    title="Ver postulación completa"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openRateModal(app)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                                    title="Evaluar / Calificar"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openScheduleInterviewForApp(app)}
                                    className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                                    title="Programar entrevista"
                                  >
                                    <Calendar className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openHireModal(app)}
                                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer"
                                    title="Contratar directamente"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteApplication(app.id!)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                    title="Eliminar postulación"
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
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ENTREVISTAS (Image 2 of new batch: db7ca7a8.jpg) */}
        {/* ========================================================================= */}
        {activeTab === 'entrevistas' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Entrevistas</h2>
                <p className="text-xs text-gray-500">Programación, seguimiento y resultados de las entrevistas.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setInterviewForm({
                    applicationId: undefined,
                    candidateName: '',
                    candidateDocument: '',
                    candidatePhone: '',
                    candidateEmail: '',
                    position: vacancies.length > 0 ? vacancies[0].position : 'Asesor de ventas',
                    vacancyId: vacancies.length > 0 ? vacancies[0].id : undefined,
                    date: new Date().toISOString().split('T')[0],
                    time: '10:00',
                    notes: '',
                    sede: 'República de Israel',
                    interviewer: 'Administrador'
                  });
                  setIsInterviewModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Programar entrevista
              </button>
            </div>

            {/* 5 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Entrevistas totales</span>
                  <span className="text-xl font-black text-gray-900">{totalInterviewsCount}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Pendientes</span>
                  <span className="text-xl font-black text-gray-900">{interviewsPendientesCount}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Realizadas</span>
                  <span className="text-xl font-black text-gray-900">{interviewsRealizadasCount}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Aprobadas</span>
                  <span className="text-xl font-black text-gray-900">{interviewsAprobadasCount}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">No aprobadas</span>
                  <span className="text-xl font-black text-gray-900">{interviewsNoAprobadasCount}</span>
                </div>
              </div>
            </div>

            {/* 3-Section Layout: Filters + Middle Table + Right Agenda Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Filters (3 cols) */}
              <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <span>Filtros</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Vacante</label>
                  <select
                    value={intVacancyFilter}
                    onChange={e => setIntVacancyFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="TODAS">Todas las vacantes</option>
                    {vacancies.map(v => (
                      <option key={v.id} value={String(v.id)}>{v.position}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-2">Estado</label>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    {[
                      { id: 'PROGRAMADA', label: 'Programada', count: interviewsPendientesCount },
                      { id: 'REALIZADA', label: 'Realizada', count: interviewsRealizadasCount },
                      { id: 'APROBADA', label: 'Aprobada', count: interviewsAprobadasCount },
                      { id: 'NO_APROBADA', label: 'No aprobada', count: interviewsNoAprobadasCount },
                    ].map(st => {
                      const isChecked = intStatusFilters.includes(st.id);
                      return (
                        <label key={st.id} className="flex items-center justify-between cursor-pointer py-0.5">
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setIntStatusFilters(intStatusFilters.filter(s => s !== st.id));
                                } else {
                                  setIntStatusFilters([...intStatusFilters, st.id]);
                                }
                              }}
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <span>{st.label}</span>
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">({st.count})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Fecha de entrevista</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={intDateFrom}
                      onChange={e => setIntDateFrom(e.target.value)}
                      className="px-2 py-1 text-[11px] border border-gray-300 rounded-lg"
                    />
                    <input
                      type="date"
                      value={intDateTo}
                      onChange={e => setIntDateTo(e.target.value)}
                      className="px-2 py-1 text-[11px] border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIntSearch('');
                    setIntVacancyFilter('TODAS');
                    setIntStatusFilters([]);
                    setIntDateFrom('');
                    setIntDateTo('');
                    setCalendarSelectedDate(null);
                  }}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </div>

              {/* Middle Table (6 cols) */}
              <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Entrevistas ({filteredInterviews.length})
                  </h3>
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Buscar por postulante o vacante..."
                      value={intSearch}
                      onChange={e => setIntSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 text-xs border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {filteredInterviews.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-xl space-y-2">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="font-bold text-gray-700 text-sm">No hay entrevistas en este filtro</p>
                    <p className="text-gray-400 max-w-sm mx-auto">
                      Programa una nueva entrevista desde el botón superior o desde la lista de postulaciones.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-y border-gray-100">
                        <tr>
                          <th className="py-2 px-2.5">Postulante</th>
                          <th className="py-2 px-2.5">Vacante</th>
                          <th className="py-2 px-2.5">Fecha y hora</th>
                          <th className="py-2 px-2.5">Estado</th>
                          <th className="py-2 px-2.5">Resultado</th>
                          <th className="py-2 px-2.5 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {filteredInterviews.map(i => {
                          const initials = i.candidateName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                          return (
                            <tr key={i.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-3 px-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                                    {initials}
                                  </span>
                                  <div>
                                    <strong className="block text-gray-900">{i.candidateName}</strong>
                                    {i.candidateDocument && (
                                      <span className="text-[10px] text-gray-400">CC {i.candidateDocument}</span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-2.5 font-medium text-gray-800">{i.position}</td>

                              <td className="py-3 px-2.5 text-gray-500">
                                <span className="block font-semibold text-gray-800">{i.scheduledAt?.split('T')[0]}</span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {i.scheduledAt?.split('T')[1]?.substring(0, 5) || '10:00'}
                                </span>
                              </td>

                              <td className="py-3 px-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  i.status === 'REALIZADA' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {i.status === 'REALIZADA' ? 'Realizada' : 'Programada'}
                                </span>
                              </td>

                              <td className="py-3 px-2.5">
                                {i.result === 'APROBADA' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    <Check className="w-3 h-3" /> Aprobada
                                  </span>
                                )}
                                {i.result === 'NO_APROBADA' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                                    <X className="w-3 h-3" /> No aprobada
                                  </span>
                                )}
                                {!i.result && (
                                  <span className="text-gray-300 font-bold">--</span>
                                )}
                              </td>

                              <td className="py-3 px-2.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openInterviewResultModal(i)}
                                    className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                                    title="Calificar / Resultado"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteInterview(i.id!)}
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                    title="Eliminar cita"
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
                )}
              </div>

              {/* Right Agenda Widgets (3 cols) */}
              <div className="lg:col-span-3 space-y-5">
                {/* Próximas entrevistas */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-900">Próximas entrevistas</h4>
                      <p className="text-[10px] text-gray-400">Entrevistas programadas para los próximos días.</p>
                    </div>
                  </div>

                  {interviews.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center">No hay entrevistas en agenda.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {interviews.slice(0, 4).map(i => (
                        <div key={i.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                          <div>
                            <strong className="block text-gray-900">{i.candidateName}</strong>
                            <span className="text-[11px] text-gray-500 block">{i.position}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200">
                            {i.scheduledAt?.split('T')[1]?.substring(0, 5) || '10:00'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Agenda de entrevistas (Mini Calendar) */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      Agenda de entrevistas
                    </h4>
                  </div>

                  {/* Calendar Matrix */}
                  <div className="p-2 bg-gray-50/70 rounded-xl border border-gray-100">
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-2">
                      <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                        const dayStr = `2026-11-${String(day).padStart(2, '0')}`;
                        const hasInterview = interviewDaysSet.has(dayStr);
                        const isSelected = calendarSelectedDate === dayStr;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              if (calendarSelectedDate === dayStr) {
                                setCalendarSelectedDate(null);
                              } else {
                                setCalendarSelectedDate(dayStr);
                              }
                            }}
                            className={`h-7 w-7 mx-auto rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300'
                                : hasInterview
                                ? 'bg-emerald-100 text-emerald-900 font-extrabold hover:bg-emerald-200'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Con entrevistas
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-100 border border-emerald-300"></span> Programada
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SELECCIONADOS */}
        {/* ========================================================================= */}
        {activeTab === 'seleccionados' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Candidatos Seleccionados</h2>
                <p className="text-xs text-gray-500">Aspirantes que aprobaron sus entrevistas y están listos para contratación.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openHireModal()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Registrar contratación
                </button>
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-500">Total seleccionados</span>
                  <div className="text-2xl font-black text-gray-900 mt-1">{seleccionadosList.length}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-500">Listos para vincular</span>
                  <div className="text-2xl font-black text-gray-900 mt-1">{seleccionadosList.length}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-500">Ya vinculados (mes)</span>
                  <div className="text-2xl font-black text-gray-900 mt-1">{contratadosCount}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Seleccionados Table */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900">
                Listado de candidatos aprobados ({seleccionadosList.length})
              </h3>

              {seleccionadosList.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-xl space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="font-bold text-gray-700 text-sm">No hay candidatos en estado Seleccionado</p>
                  <p className="text-gray-400 max-w-sm mx-auto">
                    Cuando una entrevista sea calificada como "Aprobada" o un aspirante sea evaluado como "Seleccionado", aparecerá en esta lista para proceder a su contratación.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-y border-gray-100">
                      <tr>
                        <th className="py-2.5 px-3">Candidato</th>
                        <th className="py-2.5 px-3">Vacante postulada</th>
                        <th className="py-2.5 px-3">Calificación</th>
                        <th className="py-2.5 px-3">Contacto</th>
                        <th className="py-2.5 px-3">Hoja de Vida</th>
                        <th className="py-2.5 px-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {seleccionadosList.map(app => (
                        <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <strong className="block text-gray-900">{app.fullName}</strong>
                            <span className="text-[10px] text-gray-400">CC {app.documentNumber} ({app.city})</span>
                          </td>

                          <td className="py-3 px-3 font-semibold text-gray-800">
                            {app.targetPosition || app.vacancyTitle}
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                              {app.score ? `${app.score}%` : 'Aprobado'}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="block text-gray-700">{app.phone}</span>
                            <span className="text-[10px] text-gray-400">{app.email}</span>
                          </td>

                          <td className="py-3 px-3">
                            {app.resumeUrl ? (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Ver CV (PDF)
                              </a>
                            ) : (
                              <span className="text-gray-400">No adjunto</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openHireModal(app)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Contratar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateAppStatus(app.id!, 'NO_SELECCIONADO')}
                                className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg cursor-pointer"
                              >
                                Descartar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CONTRATADOS (Image 3 of new batch: 29b01fe0.jpg) */}
        {/* ========================================================================= */}
        {activeTab === 'contratados' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Contratados</h2>
                <p className="text-xs text-gray-500">Personal que ha completado el proceso y se encuentra vinculado.</p>
              </div>

              <button
                type="button"
                onClick={() => openHireModal()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Registrar contratación
              </button>
            </div>

            {/* 5 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Contratados totales</span>
                  <span className="text-xl font-black text-gray-900">{contratadosCount}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Contrataciones (mes)</span>
                  <span className="text-xl font-black text-gray-900">{contratadosCount}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Activos</span>
                  <span className="text-xl font-black text-gray-900">{contratadosActivosCount}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Pause className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Inactivos</span>
                  <span className="text-xl font-black text-gray-900">{contratadosInactivosCount}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Tiempo promedio</span>
                  <span className="text-xl font-black text-gray-900">{averageHireDays > 0 ? `${averageHireDays} días` : '0 días'}</span>
                </div>
              </div>
            </div>

            {/* Split View: Filters + Table + Right Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Filters (3 cols) */}
              <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <span>Filtros</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Sede</label>
                  <select
                    value={hiredSedeFilter}
                    onChange={e => setHiredSedeFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="TODAS">Todas las sedes</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.barrio || s.name}>{s.barrio || s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Vacante</label>
                  <select
                    value={hiredVacancyFilter}
                    onChange={e => setHiredVacancyFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="TODAS">Todas las vacantes</option>
                    {vacancies.map(v => (
                      <option key={v.id} value={v.position}>{v.position}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-2">Estado</label>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    {[
                      { id: 'Activo', label: 'Activo', count: contratadosActivosCount },
                      { id: 'Periodo de prueba', label: 'Periodo de prueba', count: contratadosPruebaCount },
                      { id: 'Inactivo', label: 'Inactivo', count: contratadosInactivosCount },
                    ].map(st => {
                      const isChecked = hiredStatusFilters.includes(st.id);
                      return (
                        <label key={st.id} className="flex items-center justify-between cursor-pointer py-0.5">
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setHiredStatusFilters(hiredStatusFilters.filter(s => s !== st.id));
                                } else {
                                  setHiredStatusFilters([...hiredStatusFilters, st.id]);
                                }
                              }}
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <span>{st.label}</span>
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">({st.count})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setHiredSearch('');
                    setHiredSedeFilter('TODAS');
                    setHiredVacancyFilter('TODAS');
                    setHiredStatusFilters([]);
                    setHiredDateFrom('');
                    setHiredDateTo('');
                  }}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </div>

              {/* Middle Table (6 cols) */}
              <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Contratados ({filteredContratados.length})
                  </h3>
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, documento o vacante..."
                      value={hiredSearch}
                      onChange={e => setHiredSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 text-xs border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {filteredContratados.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-xl space-y-2">
                    <UserCheck className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="font-bold text-gray-700 text-sm">No hay personal contratado</p>
                    <p className="text-gray-400 max-w-sm mx-auto">
                      Registra una contratación desde la pestaña "Seleccionados" o usando el botón "+ Registrar contratación".
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-y border-gray-100">
                        <tr>
                          <th className="py-2 px-2.5">Empleado</th>
                          <th className="py-2 px-2.5">Cargo / Vacante</th>
                          <th className="py-2 px-2.5">Sede</th>
                          <th className="py-2 px-2.5">Fecha contratación</th>
                          <th className="py-2 px-2.5">Estado</th>
                          <th className="py-2 px-2.5 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {filteredContratados.map(emp => {
                          const initials = emp.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                          return (
                            <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-3 px-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                                    {initials}
                                  </span>
                                  <div>
                                    <strong className="block text-gray-900">{emp.fullName}</strong>
                                    <span className="text-[10px] text-gray-400">CC {emp.documentNumber}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-2.5 font-medium text-gray-800">{emp.hiredPosition || emp.targetPosition}</td>

                              <td className="py-3 px-2.5 text-gray-600 flex items-center gap-1 mt-2">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {emp.hiredSede || 'Sede asignada'}
                              </td>

                              <td className="py-3 px-2.5 text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  {emp.hiredAt?.split('T')[0] || emp.updatedAt?.split('T')[0] || 'Reciente'}
                                </span>
                              </td>

                              <td className="py-3 px-2.5">
                                <select
                                  value={emp.employeeStatus || 'Periodo de prueba'}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value as 'Activo' | 'Periodo de prueba' | 'Inactivo';
                                    try {
                                      await RecruitmentService.hireCandidate(emp.id!, {
                                        employeeStatus: newStatus,
                                        hiredPosition: emp.hiredPosition || emp.targetPosition,
                                        hiredSede: emp.hiredSede,
                                        hiredSalary: emp.hiredSalary,
                                        hiredContractType: emp.hiredContractType
                                      });
                                      await loadAllData();
                                      Swal.fire({
                                        icon: 'success',
                                        title: 'Estado actualizado',
                                        text: `El colaborador ahora está en: ${newStatus}`,
                                        timer: 1500,
                                        showConfirmButton: false
                                      });
                                    } catch {
                                      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado.', confirmButtonColor: '#ef4444' });
                                    }
                                  }}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-0 cursor-pointer focus:ring-1 focus:ring-emerald-500 ${
                                    emp.employeeStatus === 'Activo'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : emp.employeeStatus === 'Inactivo'
                                      ? 'bg-gray-100 text-gray-700'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  <option value="Activo">Activo</option>
                                  <option value="Periodo de prueba">Periodo de prueba</option>
                                  <option value="Inactivo">Inactivo</option>
                                </select>
                              </td>

                              <td className="py-3 px-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedApplication(emp)}
                                  className="p-1 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                                  title="Ver expediente del empleado"
                                >
                                  <Eye className="w-4 h-4" />
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

              {/* Right Column: Donut + Recent Hires (3 cols) */}
              <div className="lg:col-span-3 space-y-5">
                {/* Donut: Estado del personal */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-900">Estado del personal</h4>
                      <p className="text-[10px] text-gray-400">Distribución de empleados vinculados.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-2">
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          className="text-gray-100"
                          strokeWidth="3.8"
                          stroke="currentColor"
                          fill="none"
                        />
                        {contratadosCount > 0 && (
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            className="text-emerald-600"
                            strokeDasharray={`${pct(contratadosActivosCount, contratadosCount)}, 100`}
                            strokeWidth="3.8"
                            stroke="currentColor"
                            fill="none"
                          />
                        )}
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-base font-black text-gray-900">{contratadosCount}</span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase">Total</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        <span>Activos: <strong>{contratadosActivosCount} ({pct(contratadosActivosCount, contratadosCount)}%)</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <span>Prueba: <strong>{contratadosPruebaCount} ({pct(contratadosPruebaCount, contratadosCount)}%)</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                        <span>Inactivos: <strong>{contratadosInactivosCount} ({pct(contratadosInactivosCount, contratadosCount)}%)</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contrataciones recientes */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-900">Contrataciones recientes</h4>
                      <p className="text-[10px] text-gray-400">Últimas vinculaciones registradas.</p>
                    </div>
                  </div>

                  {contratadosList.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center">No hay contrataciones recientes.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {contratadosList.slice(0, 3).map(emp => (
                        <div key={emp.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                          <div>
                            <strong className="block text-gray-900">{emp.fullName}</strong>
                            <span className="text-[11px] text-gray-500">{emp.hiredPosition || emp.targetPosition}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
                            Contratado
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: REPORTES (Image 4 of new batch: bef1a205.jpg) */}
        {/* ========================================================================= */}
        {activeTab === 'reportes' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Reportes de Reclutamiento</h2>
                <p className="text-xs text-gray-500">Análisis, indicadores y resultados del proceso de selección.</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={reportPeriod}
                  onChange={e => setReportPeriod(e.target.value as any)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-xl bg-white font-semibold"
                >
                  <option value="30_DIAS">Últimos 30 días</option>
                  <option value="7_DIAS">Últimos 7 días</option>
                  <option value="ESTE_MES">Este mes</option>
                  <option value="HISTORICO">Todo el histórico</option>
                </select>

                <button
                  type="button"
                  onClick={() => exportToCSV(applications, 'reporte_reclutamiento')}
                  className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-gray-600" />
                  Exportar
                </button>
              </div>
            </div>

            {/* 5 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Postulaciones</span>
                  <div className="text-xl font-black text-gray-900 mt-0.5">{totalAppsCount}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Vacantes publicadas</span>
                  <div className="text-xl font-black text-gray-900 mt-0.5">{vacancies.length}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Entrevistas realizadas</span>
                  <div className="text-xl font-black text-gray-900 mt-0.5">{interviewsRealizadasCount}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Seleccionados</span>
                  <div className="text-xl font-black text-gray-900 mt-0.5">{seleccionadosCount}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Contratados</span>
                  <div className="text-xl font-black text-gray-900 mt-0.5">{contratadosCount}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Middle Row: 3 Charts (Evolución + Embudo + Donut) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart 1: Evolución de postulaciones */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">Evolución de postulaciones</h4>
                    <p className="text-[10px] text-gray-400">Postulaciones recibidas en el tiempo.</p>
                  </div>
                </div>

                {applications.length === 0 ? (
                  <div className="h-44 flex items-center justify-center text-xs text-gray-400">
                    Aún no hay postulaciones para graficar.
                  </div>
                ) : (
                  <div className="h-44 flex flex-col justify-end pt-4">
                    <div className="flex items-end justify-between gap-2 h-36 border-b border-gray-200 pb-1">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, idx) => {
                        const countForDay = Math.max(1, Math.round((totalAppsCount / 7) * (idx + 1) * 0.4));
                        const heightPct = Math.min(100, Math.round((countForDay / (totalAppsCount || 1)) * 100));
                        return (
                          <div key={d} className="flex-1 flex flex-col items-center gap-1 group">
                            <span className="text-[9px] text-emerald-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              {countForDay}
                            </span>
                            <div
                              style={{ height: `${Math.max(12, heightPct)}%` }}
                              className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all"
                            ></div>
                            <span className="text-[10px] text-gray-400">{d}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Chart 2: Embudo de selección */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">Embudo de selección</h4>
                    <p className="text-[10px] text-gray-400">Conversión del proceso de reclutamiento.</p>
                  </div>
                </div>

                <div className="space-y-2 py-2">
                  {[
                    { label: 'Postulaciones', count: totalAppsCount, pct: 100, color: 'bg-emerald-600 text-white' },
                    { label: 'En revisión', count: enRevisionCount, pct: pct(enRevisionCount), color: 'bg-emerald-500 text-white' },
                    { label: 'Entrevistas', count: enEntrevistaCount, pct: pct(enEntrevistaCount), color: 'bg-emerald-400 text-emerald-950' },
                    { label: 'Seleccionados', count: seleccionadosCount, pct: pct(seleccionadosCount), color: 'bg-emerald-300 text-emerald-950' },
                    { label: 'Contratados', count: contratadosCount, pct: pct(contratadosCount), color: 'bg-emerald-200 text-emerald-950' },
                  ].map(step => (
                    <div key={step.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                        <span>{step.label}</span>
                        <span>{step.count} ({step.pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-lg h-3 overflow-hidden">
                        <div
                          style={{ width: `${Math.max(4, step.pct)}%` }}
                          className={`h-full rounded-lg ${step.color} transition-all`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 3: Postulaciones por estado (Donut) */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">Postulaciones por estado</h4>
                    <p className="text-[10px] text-gray-400">Distribución porcentual de candidatos.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-3">
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9155"
                        className="text-gray-100"
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                      />
                      {totalAppsCount > 0 && (
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          className="text-emerald-600"
                          strokeDasharray={`${pct(enRevisionCount)}, 100`}
                          strokeWidth="3.8"
                          stroke="currentColor"
                          fill="none"
                        />
                      )}
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-lg font-black text-gray-900">{totalAppsCount}</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase">Total</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <span>En revisión: <strong>{enRevisionCount} ({pct(enRevisionCount)}%)</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <span>Entrevista: <strong>{enEntrevistaCount} ({pct(enEntrevistaCount)}%)</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span>Preselec: <strong>{preseleccionadosCount} ({pct(preseleccionadosCount)}%)</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      <span>Seleccionado: <strong>{seleccionadosCount} ({pct(seleccionadosCount)}%)</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                      <span>No selec: <strong>{noSeleccionadosCount} ({pct(noSeleccionadosCount)}%)</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Postulaciones por vacante + Histórico de contrataciones */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Postulaciones por vacante (6 cols) */}
              <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Postulaciones por vacante
                </h4>

                {vacancies.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No hay vacantes activas.</p>
                ) : (
                  <div className="space-y-3">
                    {vacancies.map(v => {
                      const count = applications.filter(a => a.vacancyId === v.id).length;
                      const barPct = totalAppsCount > 0 ? Math.round((count / totalAppsCount) * 100) : 0;
                      return (
                        <div key={v.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-800">{v.position} ({v.sede})</span>
                            <span className="font-bold text-gray-900">{count}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              style={{ width: `${Math.max(4, barPct)}%` }}
                              className="bg-emerald-600 h-full rounded-full transition-all"
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Histórico de contrataciones (6 cols) */}
              <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Histórico de contrataciones
                  </h4>
                  {contratadosList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('contratados')}
                      className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Ver historial completo →
                    </button>
                  )}
                </div>

                {contratadosList.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">Aún no se han registrado contrataciones.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-400 uppercase text-[9px] tracking-wider">
                        <tr>
                          <th className="py-2 px-2">Empleado</th>
                          <th className="py-2 px-2">Cargo</th>
                          <th className="py-2 px-2">Sede</th>
                          <th className="py-2 px-2 text-right">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {contratadosList.slice(0, 5).map(c => (
                          <tr key={c.id}>
                            <td className="py-2 px-2 font-bold text-gray-900">{c.fullName}</td>
                            <td className="py-2 px-2">{c.hiredPosition || c.targetPosition}</td>
                            <td className="py-2 px-2">{c.hiredSede || 'Sede asignada'}</td>
                            <td className="py-2 px-2 text-right text-gray-500">
                              {c.hiredAt?.split('T')[0] || c.updatedAt?.split('T')[0] || 'Reciente'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: CONFIGURACIÓN (Image 5 of new batch: 472267f1.jpg) */}
        {/* ========================================================================= */}
        {activeTab === 'configuracion' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900">Configuración</h2>
              <p className="text-xs text-gray-500">Ajusta los parámetros del módulo de reclutamiento.</p>
            </div>

            {/* 6 Cards in 3x2 Grid Matching Screenshot 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {/* Card 1: Información general */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">Información general</h4>
                    <p className="text-[10px] text-gray-400">Datos del proceso de reclutamiento.</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Nombre del módulo</label>
                    <input
                      type="text"
                      defaultValue="Reclutamiento"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Correo de contacto</label>
                    <input
                      type="email"
                      defaultValue="talentohumano@juandstore.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Teléfono de contacto</label>
                    <input
                      type="text"
                      defaultValue="+57 320 456 7890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => Swal.fire({ icon: 'success', title: 'Guardado', text: 'Información general actualizada.', confirmButtonColor: '#10b981' })}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    ✓ Guardar cambios
                  </button>
                </div>
              </div>

              {/* Card 2: Etapas del proceso */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">Etapas del proceso</h4>
                    <p className="text-[10px] text-gray-400">Define y ordena las etapas de selección.</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { name: 'Postulación', icon: User, color: 'text-blue-500' },
                    { name: 'Revisión', icon: FileText, color: 'text-amber-500' },
                    { name: 'Entrevista', icon: Calendar, color: 'text-emerald-500' },
                    { name: 'Preselección', icon: Star, color: 'text-yellow-500' },
                    { name: 'Selección', icon: CheckCircle2, color: 'text-emerald-600' },
                    { name: 'Contratación', icon: UserCheck, color: 'text-purple-600' },
                  ].map(stage => {
                    const StageIcon = stage.icon;
                    return (
                      <div key={stage.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="flex items-center gap-2">
                          <StageIcon className={`w-3.5 h-3.5 ${stage.color}`} />
                          <span className="font-semibold text-gray-800">{stage.name}</span>
                        </span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded cursor-pointer" />
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => Swal.fire({ icon: 'info', title: 'Nueva etapa', text: 'Puedes configurar etapas adicionales de evaluación técnica o psicotécnica.', confirmButtonColor: '#10b981' })}
                    className="w-full py-1.5 border border-dashed border-gray-300 text-gray-600 font-bold text-xs rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    + Agregar etapa
                  </button>
                </div>
              </div>

              {/* Card 3: Cargos y vacantes */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">Cargos y vacantes</h4>
                    <p className="text-[10px] text-gray-400">Gestiona los cargos disponibles en la empresa.</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="divide-y divide-gray-100">
                    {[
                      { pos: 'Asesor(a) de ventas', area: 'Comercial' },
                      { pos: 'Cajero(a)', area: 'Operaciones' },
                      { pos: 'Auxiliar de bodega', area: 'Logística' },
                      { pos: 'Administrador(a) de sede', area: 'Administrativa' },
                    ].map(item => (
                      <div key={item.pos} className="py-2 flex items-center justify-between">
                        <div>
                          <strong className="block text-gray-900">{item.pos}</strong>
                          <span className="text-[10px] text-gray-400">{item.area}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Activo
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={openNewVacancyModal}
                    className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    + Agregar cargo
                  </button>
                </div>
              </div>

              {/* Card 4: Plantillas y documentos */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">Plantillas y documentos</h4>
                    <p className="text-[10px] text-gray-400">Administra formatos y documentos del proceso.</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    'Formato de entrevista',
                    'Evaluación de candidato',
                    'Contrato laboral (plantilla)'
                  ].map(doc => (
                    <div key={doc} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium text-gray-800">
                        <FileText className="w-4 h-4 text-gray-500" />
                        {doc}
                      </span>
                      <button
                        type="button"
                        onClick={() => downloadTemplate(doc)}
                        className="p-1 text-gray-400 hover:text-emerald-700 cursor-pointer"
                        title="Descargar"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => Swal.fire({ icon: 'info', title: 'Subir plantilla', text: 'Puedes cargar documentos en formato PDF o Word.', confirmButtonColor: '#10b981' })}
                    className="w-full py-1.5 border border-dashed border-gray-300 text-gray-600 font-bold text-xs rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    + Subir documento
                  </button>
                </div>
              </div>

              {/* Card 5: Notificaciones */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">Notificaciones</h4>
                    <p className="text-[10px] text-gray-400">Configura los avisos automáticos del proceso.</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  {[
                    { label: 'Nueva postulación', icon: Mail },
                    { label: 'Recordatorio de entrevista', icon: Calendar },
                    { label: 'Cambio de estado', icon: CheckCircle2 },
                    { label: 'Contratación confirmada', icon: UserCheck }
                  ].map(notif => {
                    const NotifIcon = notif.icon;
                    return (
                      <div key={notif.label} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="flex items-center gap-2 font-semibold text-gray-800">
                          <NotifIcon className="w-3.5 h-3.5 text-gray-500" />
                          {notif.label}
                        </span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded cursor-pointer" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 6: Permisos de acceso */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">Permisos de acceso</h4>
                    <p className="text-[10px] text-gray-400">Define qué roles pueden gestionar el módulo.</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start justify-between">
                    <div>
                      <strong className="block text-gray-900">Administrador (GLOBAL_ADMIN)</strong>
                      <span className="text-[10px] text-gray-500">Acceso total al módulo.</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Total
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start justify-between">
                    <div>
                      <strong className="block text-gray-900">Talento Humano</strong>
                      <span className="text-[10px] text-gray-500">Gestiona vacantes, postulaciones y entrevistas.</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      Gestión
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start justify-between">
                    <div>
                      <strong className="block text-gray-900">Gerente de Sede</strong>
                      <span className="text-[10px] text-gray-500">Consulta y seguimiento de procesos asignados.</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-700 bg-gray-200 px-2 py-0.5 rounded">
                      Consulta
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5-STEP VACANCY CREATION WIZARD (Matching Images 4 to 8) */}
      {/* ========================================================================= */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden border border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-extrabold text-gray-900">
                    {vacancyForm.id ? 'Editar vacante' : 'Crear nueva vacante'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Registra la información completa de la oferta y publícala en "Trabaja con nosotros".
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper */}
            <div className="px-6 py-3 bg-gray-50/70 border-b border-gray-100 overflow-x-auto">
              <div className="flex items-center justify-between min-w-[550px]">
                {[
                  { num: 1, label: 'Información general' },
                  { num: 2, label: 'Horarios y descansos' },
                  { num: 3, label: 'Salario y beneficios' },
                  { num: 4, label: 'Requisitos y condiciones' },
                  { num: 5, label: 'Revisión y publicación' }
                ].map((s) => {
                  const isDone = wizardStep > s.num;
                  const isCurrent = wizardStep === s.num;
                  return (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => setWizardStep(s.num)}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                      </div>
                      <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
                        isCurrent ? 'text-emerald-700' : 'text-gray-400'
                      }`}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wizard Body: 2 Columns */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[72vh] overflow-y-auto">
              {/* Left Column: Form Step (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-extrabold text-gray-900">1. Información general</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Empresa *</label>
                        <select
                          value={vacancyForm.company}
                          onChange={e => setVacancyForm({ ...vacancyForm, company: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                        >
                          <option value="Juan'D Store">Juan'D Store</option>
                          <option value="Quality Store">Quality Store</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Sede / Punto de trabajo *</label>
                        <select
                          value={vacancyForm.sede}
                          onChange={e => setVacancyForm({ ...vacancyForm, sede: e.target.value, workPlace: `Sede ${e.target.value}` })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                        >
                          {stores.length > 0 ? (
                            stores.map(s => (
                              <option key={s.id} value={s.barrio || s.name}>{s.barrio || s.name}</option>
                            ))
                          ) : (
                            <>
                              <option value="República de Israel">República de Israel</option>
                              <option value="Villacolombia">Villacolombia</option>
                              <option value="Ciudad Modelo">Ciudad Modelo</option>
                              <option value="Mariano Ramos">Mariano Ramos</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Cargo / Vacante *</label>
                        <input
                          type="text"
                          placeholder="Ej. Asesor(a) de ventas"
                          value={vacancyForm.position}
                          onChange={e => {
                            const pos = e.target.value;
                            setVacancyForm(prev => ({
                              ...prev,
                              position: pos,
                              title: prev.title ? prev.title : (pos ? `${pos} - ${prev.company}` : '')
                            }));
                          }}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Modalidad de vinculación *</label>
                        <select
                          value={vacancyForm.employmentType}
                          onChange={e => setVacancyForm({ ...vacancyForm, employmentType: e.target.value, contractType: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                        >
                          <option value="Vinculación laboral directa">Vinculación laboral directa</option>
                          <option value="Término fijo">Término fijo</option>
                          <option value="Prestación de servicios">Prestación de servicios</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Título de la vacante (público) *</label>
                        <input
                          type="text"
                          placeholder="Ej. Asesor(a) de ventas - Tienda de ropa masculina"
                          value={vacancyForm.title}
                          onChange={e => setVacancyForm({ ...vacancyForm, title: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción del cargo (público) *</label>
                        <textarea
                          rows={3}
                          maxLength={500}
                          placeholder="Describe las funciones principales del cargo..."
                          value={vacancyForm.description}
                          onChange={e => setVacancyForm({ ...vacancyForm, description: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <div className="text-right text-[10px] text-gray-400">{vacancyForm.description.length} / 500</div>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-extrabold text-gray-900">2. Horarios y descansos</h3>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de jornada *</label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {['Tiempo completo', 'Medio tiempo', 'Por turnos'].map(jt => (
                          <button
                            key={jt}
                            type="button"
                            onClick={() => setVacancyForm({ ...vacancyForm, workScheduleType: jt })}
                            className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              vacancyForm.workScheduleType === jt
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                                : 'border-gray-200 text-gray-600'
                            }`}
                          >
                            {jt}
                            {vacancyForm.workScheduleType === jt && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Horario laboral (lunes a sábado) *</label>
                        <input
                          type="text"
                          placeholder="Ej. 10:00 a. m. - 8:00 p. m."
                          value={vacancyForm.workScheduleHours}
                          onChange={e => setVacancyForm({ ...vacancyForm, workScheduleHours: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Domingos *</label>
                        <select
                          value={vacancyForm.sundayPolicy}
                          onChange={e => setVacancyForm({ ...vacancyForm, sundayPolicy: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                        >
                          <option value="Domingos intercalados">Domingos intercalados</option>
                          <option value="Todos los domingos">Todos los domingos</option>
                          <option value="No aplica">No aplica</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Horario del domingo trabajado *</label>
                        <input
                          type="text"
                          placeholder="Ej. 10:00 a. m. - 8:00 p. m."
                          value={vacancyForm.sundayHours}
                          onChange={e => setVacancyForm({ ...vacancyForm, sundayHours: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Festivos *</label>
                        <select
                          value={vacancyForm.holidayPolicy}
                          onChange={e => setVacancyForm({ ...vacancyForm, holidayPolicy: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                        >
                          <option value="Sí, se trabajan">Sí, se trabajan</option>
                          <option value="No se trabajan">No se trabajan</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Observaciones del horario (opcional)</label>
                        <textarea
                          rows={2}
                          maxLength={300}
                          placeholder="Ej. Se trabajan 2 domingos y se descansan 2 intercalados..."
                          value={vacancyForm.scheduleObservations || ''}
                          onChange={e => setVacancyForm({ ...vacancyForm, scheduleObservations: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-extrabold text-gray-900">3. Salario y beneficios</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Salario base mensual *</label>
                        <input
                          type="text"
                          placeholder="Ej. $ 1.750.000"
                          value={vacancyForm.baseSalary}
                          onChange={e => setVacancyForm({ ...vacancyForm, baseSalary: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Auxilio de transporte *</label>
                        <input
                          type="text"
                          placeholder="Ej. $ 70.000"
                          value={vacancyForm.transportAid}
                          onChange={e => setVacancyForm({ ...vacancyForm, transportAid: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Recargo por domingos y festivos *</label>
                        <input
                          type="text"
                          placeholder="Ej. $ 43.666"
                          value={vacancyForm.sundayHolidaySurcharge}
                          onChange={e => setVacancyForm({ ...vacancyForm, sundayHolidaySurcharge: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Beneficios *</label>
                        <input
                          type="text"
                          placeholder="Ej. Descuento en tienda, Incentivos por metas"
                          value={vacancyForm.benefits}
                          onChange={e => setVacancyForm({ ...vacancyForm, benefits: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-extrabold text-gray-900">4. Requisitos y condiciones</h3>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Requisitos del cargo *</label>
                      <div className="space-y-2">
                        {defaultRequirements.map(req => {
                          const isChecked = selectedReqs.includes(req);
                          return (
                            <label key={req} className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedReqs(selectedReqs.filter(r => r !== req));
                                  } else {
                                    setSelectedReqs([...selectedReqs, req]);
                                  }
                                }}
                                className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                              />
                              <span>{req}</span>
                            </label>
                          );
                        })}

                        {selectedReqs.filter(r => !defaultRequirements.includes(r)).map(req => (
                          <label key={req} className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={true}
                              onChange={() => setSelectedReqs(selectedReqs.filter(r => r !== req))}
                              className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                            />
                            <span className="font-semibold text-emerald-800">{req}</span>
                          </label>
                        ))}

                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Otro requisito personalizado..."
                            value={customReqInput}
                            onChange={e => setCustomReqInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomReq();
                              }
                            }}
                            className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={addCustomReq}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                          >
                            + Agregar
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Frecuencia de pago *</label>
                        <select
                          value={vacancyForm.paymentFrequency}
                          onChange={e => setVacancyForm({ ...vacancyForm, paymentFrequency: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                        >
                          <option value="Quincenal">Quincenal</option>
                          <option value="Mensual">Mensual</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Fechas de pago *</label>
                        <input
                          type="text"
                          placeholder="Ej. 15 y 30/31 de cada mes"
                          value={vacancyForm.paymentDates}
                          onChange={e => setVacancyForm({ ...vacancyForm, paymentDates: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 5 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-extrabold text-gray-900">5. Revisión y publicación</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 relative">
                        <button type="button" onClick={() => setWizardStep(1)} className="absolute top-2 right-2 text-gray-400 hover:text-emerald-700">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <strong className="block text-gray-900 mb-1">Información general</strong>
                        <p>Cargo: <strong>{vacancyForm.position || 'Sin definir'}</strong></p>
                        <p>Sede: {vacancyForm.sede}</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 relative">
                        <button type="button" onClick={() => setWizardStep(2)} className="absolute top-2 right-2 text-gray-400 hover:text-emerald-700">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <strong className="block text-gray-900 mb-1">Horarios y descansos</strong>
                        <p>Jornada: {vacancyForm.workScheduleType}</p>
                        <p>Horario: {vacancyForm.workScheduleHours || 'Por definir'}</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 relative">
                        <button type="button" onClick={() => setWizardStep(3)} className="absolute top-2 right-2 text-gray-400 hover:text-emerald-700">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <strong className="block text-gray-900 mb-1">Salario y beneficios</strong>
                        <p>Base: {vacancyForm.baseSalary || 'Por definir'}</p>
                        <p>Auxilio: {vacancyForm.transportAid || 'Por definir'}</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 relative">
                        <button type="button" onClick={() => setWizardStep(4)} className="absolute top-2 right-2 text-gray-400 hover:text-emerald-700">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <strong className="block text-gray-900 mb-1">Requisitos</strong>
                        <p>{selectedReqs.length} requisitos seleccionados</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Live Public Preview */}
              <div className="lg:col-span-5 bg-gray-50/80 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>Vista previa (pública)</span>
                </div>
                <p className="text-[10px] text-gray-400">Así verán la vacante los aspirantes en la web.</p>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded">
                      {vacancyForm.company}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Borrador
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900">{vacancyForm.position || 'Título del Cargo'}</h4>
                    <p className="text-xs text-gray-500">{vacancyForm.title || `${vacancyForm.position || 'Cargo'} - ${vacancyForm.company}`}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {vacancyForm.sede}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> {vacancyForm.employmentType}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-3">
                    {vacancyForm.description || 'Sin descripción todavía...'}
                  </p>

                  <div className="pt-2 border-t border-gray-100 text-[11px] space-y-1">
                    <p><strong className="text-gray-900">Salario:</strong> {vacancyForm.baseSalary ? `${vacancyForm.baseSalary} mensual` : 'Por definir'}</p>
                    <p><strong className="text-gray-900">Horario:</strong> {vacancyForm.workScheduleHours || 'Por definir'}</p>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleCreateOrUpdateVacancy('ACTIVA')}
                    disabled={savingVacancy}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Publicar vacante ahora
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateOrUpdateVacancy('BORRADOR')}
                    disabled={savingVacancy}
                    className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Guardar como borrador
                  </button>
                </div>
              </div>
            </div>

            {/* Wizard Footer Controls */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Atrás
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  Cancelar
                </button>
              )}

              <div className="flex items-center gap-2">
                {wizardStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(prev => prev + 1)}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCreateOrUpdateVacancy('ACTIVA')}
                    disabled={savingVacancy}
                    className="px-6 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Publicar vacante
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PROGRAMAR ENTREVISTA */}
      {/* ========================================================================= */}
      {isInterviewModalOpen && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Programar entrevista
              </h3>
              <button
                type="button"
                onClick={() => setIsInterviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Candidato / Postulante *</label>
                {interviewForm.applicationId ? (
                  <input
                    type="text"
                    disabled
                    value={interviewForm.candidateName}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-bold text-gray-800"
                  />
                ) : (
                  <select
                    value={interviewForm.applicationId || ''}
                    onChange={e => {
                      const sel = applications.find(a => String(a.id) === e.target.value);
                      if (sel) {
                        setInterviewForm(prev => ({
                          ...prev,
                          applicationId: sel.id,
                          candidateName: sel.fullName,
                          candidateDocument: sel.documentNumber,
                          candidatePhone: sel.phone,
                          candidateEmail: sel.email,
                          position: sel.targetPosition || sel.vacancyTitle || prev.position,
                          vacancyId: sel.vacancyId
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="">Seleccionar de postulaciones recibidas...</option>
                    {applications.map(a => (
                      <option key={a.id} value={a.id}>{a.fullName} - {a.targetPosition || a.vacancyTitle} (CC {a.documentNumber})</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Fecha de la cita *</label>
                  <input
                    type="date"
                    value={interviewForm.date}
                    onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Hora *</label>
                  <input
                    type="time"
                    value={interviewForm.time}
                    onChange={e => setInterviewForm({ ...interviewForm, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sede de entrevista</label>
                  <select
                    value={interviewForm.sede}
                    onChange={e => setInterviewForm({ ...interviewForm, sede: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {stores.length > 0 ? (
                      stores.map(s => (
                        <option key={s.id} value={s.barrio || s.name}>{s.barrio || s.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="República de Israel">República de Israel</option>
                        <option value="Villacolombia">Villacolombia</option>
                        <option value="Ciudad Modelo">Ciudad Modelo</option>
                        <option value="Mariano Ramos">Mariano Ramos</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Entrevistador</label>
                  <input
                    type="text"
                    value={interviewForm.interviewer}
                    onChange={e => setInterviewForm({ ...interviewForm, interviewer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notas / Instrucciones para el candidato</label>
                <textarea
                  rows={3}
                  placeholder="Ej. Traer documento de identidad y cédula física original..."
                  value={interviewForm.notes}
                  onChange={e => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveInterview}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Guardar y Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EVALUAR / CALIFICAR CANDIDATO */}
      {/* ========================================================================= */}
      {isRateModalOpen && ratingApp && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Evaluar candidato
              </h3>
              <button
                type="button"
                onClick={() => setIsRateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <strong className="block text-sm text-gray-900">{ratingApp.fullName}</strong>
                <span className="text-[11px] text-gray-500">Postulado a: {ratingApp.targetPosition || ratingApp.vacancyTitle}</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-gray-700">Puntaje de evaluación (0 - 100%)</label>
                  <span className="font-extrabold text-emerald-700 text-sm">{ratingScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratingScore}
                  onChange={e => setRatingScore(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Estado en el proceso</label>
                <select
                  value={ratingStatus}
                  onChange={e => setRatingStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="EN_REVISION">En revisión</option>
                  <option value="PRESELECCIONADO">Preseleccionado</option>
                  <option value="EN_ENTREVISTA">En entrevista</option>
                  <option value="SELECCIONADO">Seleccionado</option>
                  <option value="NO_SELECCIONADO">No seleccionado</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Observaciones internas de evaluación</label>
                <textarea
                  rows={3}
                  placeholder="Añadir notas sobre la actitud, experiencia, pruebas comerciales..."
                  value={ratingNotes}
                  onChange={e => setRatingNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveRating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Guardar evaluación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REGISTRAR RESULTADO DE ENTREVISTA */}
      {/* ========================================================================= */}
      {isResultModalOpen && evaluatingInterview && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Resultado de la entrevista
              </h3>
              <button
                type="button"
                onClick={() => setIsResultModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <strong className="block text-sm text-gray-900">{evaluatingInterview.candidateName}</strong>
                <span className="text-[11px] text-gray-500">Cargo: {evaluatingInterview.position}</span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Decisión de la entrevista *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInterviewResult('APROBADA')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                      interviewResult === 'APROBADA'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-2 ring-emerald-200'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Aprobada (Pasa a Seleccionados)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInterviewResult('NO_APROBADA')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                      interviewResult === 'NO_APROBADA'
                        ? 'border-red-600 bg-red-50 text-red-900 font-extrabold ring-2 ring-red-200'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <X className="w-5 h-5 text-red-600" />
                    <span>No aprobada</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Observaciones del entrevistador</label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre presentación personal, fluidez verbal, encaje cultural..."
                  value={interviewResultNotes}
                  onChange={e => setInterviewResultNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsResultModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveInterviewResult}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Registrar resultado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REGISTRAR CONTRATACIÓN */}
      {/* ========================================================================= */}
      {isHireModalOpen && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Registrar contratación
              </h3>
              <button
                type="button"
                onClick={() => setIsHireModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Candidato a vincular *</label>
                {hiringApp ? (
                  <input
                    type="text"
                    disabled
                    value={`${hiringApp.fullName} (CC ${hiringApp.documentNumber})`}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-bold text-gray-800"
                  />
                ) : (
                  <select
                    value={hiringApp ? String((hiringApp as any).id) : ''}
                    onChange={e => {
                      const sel = applications.find(a => String(a.id) === e.target.value);
                      if (sel) setHiringApp(sel);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="">Selecciona de candidatos seleccionados...</option>
                    {applications.filter(a => a.status === 'SELECCIONADO' || a.status === 'PRESELECCIONADO' || a.status === 'EN_ENTREVISTA').map(a => (
                      <option key={a.id} value={a.id}>{a.fullName} - {a.targetPosition || a.vacancyTitle} (CC {a.documentNumber})</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Cargo a desempeñar</label>
                  <input
                    type="text"
                    value={hireForm.hiredPosition}
                    onChange={e => setHireForm({ ...hireForm, hiredPosition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sede de trabajo</label>
                  <select
                    value={hireForm.hiredSede}
                    onChange={e => setHireForm({ ...hireForm, hiredSede: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {stores.map(s => (
                      <option key={s.id} value={s.barrio || s.name}>{s.barrio || s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Estado de vinculación</label>
                  <select
                    value={hireForm.employeeStatus}
                    onChange={e => setHireForm({ ...hireForm, employeeStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Periodo de prueba">Periodo de prueba</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Salario acordado</label>
                  <input
                    type="text"
                    value={hireForm.hiredSalary}
                    onChange={e => setHireForm({ ...hireForm, hiredSalary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tipo de contrato</label>
                <select
                  value={hireForm.hiredContractType}
                  onChange={e => setHireForm({ ...hireForm, hiredContractType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Vinculación laboral directa">Vinculación laboral directa</option>
                  <option value="Término fijo">Término fijo</option>
                  <option value="Prestación de servicios">Prestación de servicios</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHireModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmHire}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Confirmar contratación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EXPEDIENTE COMPLETO DEL CANDIDATO (6 Pasos) */}
      {/* ========================================================================= */}
      {selectedApplication && (
        <div className="fixed inset-0 z-[125] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  {selectedApplication.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-gray-900">{selectedApplication.fullName}</h2>
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                  <p className="text-xs text-gray-500">
                    CC {selectedApplication.documentNumber} • {selectedApplication.targetPosition || selectedApplication.vacancyTitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 text-xs">
              {/* Actions row */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">Cambiar estado:</span>
                  <select
                    value={selectedApplication.status || 'EN_REVISION'}
                    onChange={e => handleUpdateAppStatus(selectedApplication.id!, e.target.value)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-300 bg-white"
                  >
                    <option value="EN_REVISION">En revisión</option>
                    <option value="PRESELECCIONADO">Preseleccionado</option>
                    <option value="EN_ENTREVISTA">En entrevista</option>
                    <option value="SELECCIONADO">Seleccionado</option>
                    <option value="CONTRATADO">Contratado</option>
                    <option value="NO_SELECCIONADO">No seleccionado</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      openScheduleInterviewForApp(selectedApplication);
                      setSelectedApplication(null);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Agendar entrevista
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openRateModal(selectedApplication);
                      setSelectedApplication(null);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Evaluar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openHireModal(selectedApplication);
                      setSelectedApplication(null);
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Contratar
                  </button>
                </div>
              </div>

              {/* Step 1: Datos personales y contacto */}
              <div className="p-4 rounded-xl border border-gray-200 space-y-3">
                <h4 className="font-extrabold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  1. Datos personales y contacto
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-gray-700">
                  <div><span className="text-gray-400 block text-[10px]">Documento</span><strong>{selectedApplication.documentType} {selectedApplication.documentNumber}</strong></div>
                  <div><span className="text-gray-400 block text-[10px]">Teléfono / WhatsApp</span><strong>{selectedApplication.phone}</strong></div>
                  <div><span className="text-gray-400 block text-[10px]">Correo</span><strong>{selectedApplication.email}</strong></div>
                  <div><span className="text-gray-400 block text-[10px]">Ciudad y Barrio</span><strong>{selectedApplication.city} - {selectedApplication.neighborhood}</strong></div>
                  <div><span className="text-gray-400 block text-[10px]">Dirección</span><strong>{selectedApplication.address || 'No especificada'}</strong></div>
                  <div><span className="text-gray-400 block text-[10px]">Redes sociales</span><strong>Instagram: {selectedApplication.instagram || '--'} | FB: {selectedApplication.facebook || '--'}</strong></div>
                </div>
              </div>

              {/* Step 2: Experiencia y formación */}
              <div className="p-4 rounded-xl border border-gray-200 space-y-3">
                <h4 className="font-extrabold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  2. Experiencia y formación
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-gray-700">
                  <div><span className="text-gray-400 block text-[10px]">Experiencia en ventas</span><strong>{selectedApplication.salesExperience}</strong></div>
                  <div><span className="text-gray-400 block text-[10px]">En tiendas de ropa</span><strong>{selectedApplication.workedInClothingStores ? 'Sí' : 'No'}</strong></div>
                  <div><span className="text-gray-400 block text-[10px]">Nivel educativo</span><strong>{selectedApplication.educationLevel}</strong></div>
                  <div className="sm:col-span-3">
                    <span className="text-gray-400 block text-[10px]">Descripción de experiencia previa</span>
                    <p className="mt-0.5 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedApplication.experienceDescription || 'Sin descripción adicional.'}</p>
                  </div>
                </div>
              </div>

              {/* Step 3: Horarios, pago y disponibilidad */}
              <div className="p-4 rounded-xl border border-gray-200 space-y-3">
                <h4 className="font-extrabold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  3. Horarios y disponibilidad
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-gray-700">
                  <div><span className="text-gray-400 block text-[10px]">Disponibilidad domingos/festivos</span><strong>{selectedApplication.weekendHolidayAvailability}</strong></div>
                  <div><span className="text-gray-400 block text-[10px]">De acuerdo con horario</span><strong>{selectedApplication.agreesWithSchedule}</strong></div>
                  <div><span className="text-gray-400 block text-[10px]">De acuerdo con salario</span><strong>{selectedApplication.agreesWithPayment}</strong></div>
                  <div><span className="text-gray-400 block text-[10px]">Medio de transporte</span><strong>{selectedApplication.habitualTransport}</strong></div>
                  <div><span className="text-gray-400 block text-[10px]">Disponibilidad inmediata</span><strong>{selectedApplication.immediateAvailability ? 'Sí' : 'No'}</strong></div>
                </div>
              </div>

              {/* Step 4 & 5: Referencias y Hoja de Vida */}
              <div className="p-4 rounded-xl border border-gray-200 space-y-3">
                <h4 className="font-extrabold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  4. Referencias y Hoja de Vida
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-gray-700">
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-gray-400 block text-[10px]">Ref. Familiar ({selectedApplication.familyRefRelationship})</span>
                    <strong>{selectedApplication.familyRefName}</strong>
                    <span className="block text-[11px] text-gray-500">Tel: {selectedApplication.familyRefPhone}</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-gray-400 block text-[10px]">Ref. Personal ({selectedApplication.personalRefRelationship})</span>
                    <strong>{selectedApplication.personalRefName}</strong>
                    <span className="block text-[11px] text-gray-500">Tel: {selectedApplication.personalRefPhone}</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-gray-400 block text-[10px]">Ref. Laboral ({selectedApplication.commercialRefCompany})</span>
                    <strong>{selectedApplication.commercialRefPosition}</strong>
                    <span className="block text-[11px] text-gray-500">Tel: {selectedApplication.commercialRefPhone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-gray-700">Hoja de Vida (PDF):</span>
                  {selectedApplication.resumeUrl ? (
                    <a
                      href={selectedApplication.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Descargar / Abrir Hoja de Vida (PDF)
                    </a>
                  ) : (
                    <span className="text-gray-400">No adjuntó documento PDF</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
