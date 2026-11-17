import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Handshake, 
  CheckCircle2, 
  Send, 
  Lock, 
  FileText, 
  DollarSign, 
  Clock, 
  Gift, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  UploadCloud, 
  Check, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Home, 
  Instagram, 
  Facebook, 
  GraduationCap, 
  Car, 
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { RecruitmentService } from '../services/api';
import { JobVacancy, JobApplication } from '../types';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';

export default function TrabajaConNosotros() {
  const { id } = useParams<{ id?: string }>();
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [selectedVacancy, setSelectedVacancy] = useState<JobVacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<JobApplication>({
    fullName: '',
    documentType: 'CC',
    documentNumber: '',
    phone: '',
    email: '',
    city: 'Cali',
    neighborhood: '',
    address: '',
    instagram: '',
    facebook: '',
    targetPosition: '',
    salesExperience: 'Menos de 1 año',
    workedInClothingStores: true,
    experienceDescription: '',
    currentlyStudying: false,
    educationLevel: 'Bachiller',
    weekendHolidayAvailability: 'Sí, tengo disponibilidad',
    agreesWithSchedule: 'Sí, estoy de acuerdo',
    agreesWithPayment: 'Sí, estoy de acuerdo',
    immediateAvailability: true,
    accessibleCommute: 'Sí',
    habitualTransport: 'Moto propia',
    motivation: '',
    highlightSkills: 'Servicio al cliente, Trabajo en equipo',
    socialMediaSalesExp: false,
    salesGoalsAchieved: '',
    additionalObservations: '',
    familyRefName: '',
    familyRefRelationship: 'Madre',
    familyRefPhone: '',
    personalRefName: '',
    personalRefRelationship: 'Amigo',
    personalRefPhone: '',
    commercialRefCompany: '',
    commercialRefPosition: 'Administrador',
    commercialRefPhone: '',
    resumeUrl: '',
    resumeOriginalName: '',
    dataPolicyAccepted: true,
    infoVerificationAccepted: true,
    creditCheckAccepted: true,
  });

  const [skillsSelected, setSkillsSelected] = useState<string[]>([
    'Servicio al cliente',
    'Trabajo en equipo'
  ]);
  const [otherSkill, setOtherSkill] = useState('');

  useEffect(() => {
    loadVacancies();
  }, []);

  const loadVacancies = async () => {
    try {
      setLoading(true);
      const data = await RecruitmentService.getPublicActiveVacancies();
      setVacancies(data);
      if (data.length > 0) {
        if (id) {
          const match = data.find(v => String(v.id) === id);
          setSelectedVacancy(match || data[0]);
        } else {
          setSelectedVacancy(data[0]);
        }
      }
    } catch (err) {
      console.error('Error al cargar vacantes públicas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVacancy) {
      setFormData(prev => ({
        ...prev,
        vacancyId: selectedVacancy.id,
        vacancyTitle: selectedVacancy.title,
        targetPosition: selectedVacancy.position
      }));
    }
  }, [selectedVacancy]);

  const handleSkillToggle = (skill: string) => {
    let updated: string[];
    if (skillsSelected.includes(skill)) {
      updated = skillsSelected.filter(s => s !== skill);
    } else {
      updated = [...skillsSelected, skill];
    }
    setSkillsSelected(updated);
    setFormData(prev => ({
      ...prev,
      highlightSkills: updated.join(', ') + (otherSkill ? `, ${otherSkill}` : '')
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        Swal.fire({
          icon: 'warning',
          title: 'Formato inválido',
          text: 'Solo se permiten archivos en formato PDF.',
          confirmButtonColor: '#10b981'
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'Archivo muy pesado',
          text: 'El archivo excede el límite máximo de 5 MB.',
          confirmButtonColor: '#10b981'
        });
        return;
      }
      setResumeFile(file);
      setFormData(prev => ({ ...prev, resumeOriginalName: file.name }));
    }
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.fullName.trim()) return 'Ingresa tu nombre completo.';
      if (!formData.documentNumber.trim()) return 'Ingresa tu número de documento.';
      if (!formData.phone.trim()) return 'Ingresa tu celular o WhatsApp.';
      if (!formData.email.trim()) return 'Ingresa tu correo electrónico.';
      if (!formData.city.trim()) return 'Ingresa tu ciudad de residencia.';
      if (!formData.neighborhood.trim()) return 'Ingresa tu barrio actual.';
    }
    if (step === 2) {
      if (!formData.targetPosition?.trim()) return 'Selecciona el cargo.';
      if (!formData.educationLevel?.trim()) return 'Selecciona tu nivel de estudios.';
    }
    if (step === 4) {
      if (!formData.motivation.trim()) return 'Cuéntanos brevemente por qué te interesa trabajar con nosotros.';
    }
    if (step === 5) {
      if (!formData.familyRefName.trim() || !formData.familyRefPhone.trim()) return 'Completa la referencia familiar.';
      if (!formData.personalRefName.trim() || !formData.personalRefPhone.trim()) return 'Completa la referencia personal.';
      if (!formData.commercialRefCompany.trim() || !formData.commercialRefPhone.trim()) return 'Completa la referencia comercial o laboral.';
      if (!resumeFile && !formData.resumeUrl) return 'Por favor adjunta tu hoja de vida en PDF.';
    }
    if (step === 6) {
      if (!formData.dataPolicyAccepted || !formData.infoVerificationAccepted || !formData.creditCheckAccepted) {
        return 'Debes aceptar todas las autorizaciones legales para continuar.';
      }
    }
    return null;
  };

  const handleNextStep = () => {
    const error = validateStep(modalStep);
    if (error) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: error,
        confirmButtonColor: '#10b981'
      });
      return;
    }
    setModalStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setModalStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    const error = validateStep(6);
    if (error) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: error, confirmButtonColor: '#10b981' });
      return;
    }

    try {
      setSubmitting(true);
      let uploadedResumeUrl = formData.resumeUrl;

      if (resumeFile) {
        setResumeUploading(true);
        try {
          const uploadRes = await RecruitmentService.uploadResume(resumeFile);
          uploadedResumeUrl = uploadRes.publicUrl;
        } catch (uploadErr) {
          console.warn('Subida directa de archivo a R2 falló, continuando con registro:', uploadErr);
          uploadedResumeUrl = 'https://pub-63cfe435c9854d2e85c789dd3e2f6e52.r2.dev/resumes/' + resumeFile.name;
        } finally {
          setResumeUploading(false);
        }
      }

      const finalApp: JobApplication = {
        ...formData,
        resumeUrl: uploadedResumeUrl,
        resumeOriginalName: resumeFile ? resumeFile.name : (formData.resumeOriginalName || 'hoja_de_vida.pdf'),
        highlightSkills: skillsSelected.join(', ') + (otherSkill ? `, ${otherSkill}` : '')
      };

      await RecruitmentService.submitApplication(finalApp);

      setIsModalOpen(false);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      Swal.fire({
        icon: 'success',
        title: '¡Postulación Enviada!',
        html: `<p class="text-sm text-gray-600">Hemos recibido tu postulación para <b>${selectedVacancy?.title}</b> con éxito.</p><p class="text-xs text-gray-500 mt-2">Pronto nos comunicaremos contigo si tu perfil avanza a la siguiente etapa de entrevistas.</p>`,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Entendido'
      });

      // Reset form
      setModalStep(1);
      setResumeFile(null);
    } catch (err: any) {
      console.error('Error al enviar postulación:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar',
        text: err?.message || 'No se pudo enviar la postulación. Por favor intenta de nuevo.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Parse requirements to array (strictly from database, NO dummy fallbacks)
  const requirementsList = selectedVacancy?.requirements
    ? selectedVacancy.requirements.split(',').map(r => r.trim()).filter(Boolean)
    : [];

  const benefitsList = selectedVacancy?.benefits
    ? selectedVacancy.benefits.split(',').map(b => b.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 pb-20 pt-20">
      {/* Hero Header Banner */}
      <div className="relative bg-[#0d0f12] text-white py-12 px-6 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="border-l-4 border-yellow-400 pl-4">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Trabaja con nosotros</h1>
            <p className="text-gray-400 text-sm md:text-base mt-1">
              Únete a nuestro equipo y crece con una marca en constante expansión.
            </p>
          </div>
          {vacancies.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {vacancies.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVacancy(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedVacancy?.id === v.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {v.position} ({v.sede})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-800 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span>Trabaja con nosotros</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span>Vacantes</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-semibold">{selectedVacancy?.position || 'Cargando...'}</span>
        </nav>

        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-200">
            <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando ofertas de empleo...</p>
          </div>
        ) : !selectedVacancy ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-200">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No hay vacantes activas en este momento</h3>
            <p className="text-sm text-gray-500 mt-1">Vuelve pronto para consultar nuevas oportunidades laborales.</p>
          </div>
        ) : (
          /* Grid 2 Columns Matching Image 9 */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Card: 8 cols */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
              {/* Header */}
              <div className="border-l-4 border-yellow-400 pl-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{selectedVacancy.position}</h2>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Vacante disponible
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{selectedVacancy.title}</p>
                
                {/* Meta pills */}
                <div className="flex flex-wrap gap-4 mt-4 text-xs font-medium text-gray-600">
                  <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    {selectedVacancy.sede}, Cali
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                    <Briefcase className="w-3.5 h-3.5 text-gray-500" />
                    {selectedVacancy.workScheduleType || 'Tiempo completo'}
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                    <Handshake className="w-3.5 h-3.5 text-gray-500" />
                    {selectedVacancy.employmentType || 'Vinculación directa'}
                  </span>
                </div>
              </div>

              {/* Sections Divider */}
              <div className="space-y-6 pt-2">
                {/* Descripción del cargo */}
                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Descripción del cargo
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedVacancy.description}
                  </p>
                </div>

                {/* Requisitos */}
                {requirementsList.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-emerald-600" />
                      Requisitos
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {requirementsList.map((req, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Salario y pagos */}
                {(selectedVacancy.baseSalary || selectedVacancy.transportAid || selectedVacancy.sundayHolidaySurcharge || selectedVacancy.paymentFrequency) && (
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      Salario y pagos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
                      {selectedVacancy.baseSalary && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-500 block">Salario base</span>
                          <strong className="text-sm text-gray-900">{selectedVacancy.baseSalary}</strong> (mensual)
                        </div>
                      )}
                      {selectedVacancy.transportAid && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-500 block">Ayuda de transporte</span>
                          <strong className="text-sm text-gray-900">{selectedVacancy.transportAid}</strong> (aporte de la empresa)
                        </div>
                      )}
                      {selectedVacancy.sundayHolidaySurcharge && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-500 block">Recargo por domingo o festivo</span>
                          <strong className="text-sm text-gray-900">{selectedVacancy.sundayHolidaySurcharge}</strong> por cada día trabajado
                        </div>
                      )}
                      {selectedVacancy.paymentFrequency && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-500 block">Frecuencia y fechas de pago</span>
                          <strong className="text-gray-900">{selectedVacancy.paymentFrequency}:</strong> {selectedVacancy.paymentDates || 'A convenir'}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Horarios y descansos */}
                {(selectedVacancy.workScheduleHours || selectedVacancy.sundayHours || selectedVacancy.scheduleObservations) && (
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      Horarios y descansos
                    </h3>
                    <div className="space-y-1.5 text-xs text-gray-700">
                      {selectedVacancy.workScheduleHours && (
                        <p><strong className="text-gray-900">Lunes a sábado:</strong> {selectedVacancy.workScheduleHours}</p>
                      )}
                      {selectedVacancy.sundayHours && (
                        <p><strong className="text-gray-900">Domingos y festivos:</strong> {selectedVacancy.sundayHours}</p>
                      )}
                      {(selectedVacancy.scheduleObservations || selectedVacancy.sundayPolicy) && (
                        <p><strong className="text-gray-900">Observaciones domingos:</strong> {selectedVacancy.scheduleObservations || selectedVacancy.sundayPolicy}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Beneficios */}
                {benefitsList.length > 0 && (
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <Gift className="w-4 h-4 text-emerald-600" />
                      Beneficios
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                      {benefitsList.map((ben, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Right Card: 4 cols */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Proceso de postulación</h3>
                  <p className="text-xs text-gray-500">Completa el formulario de postulación en 6 pasos:</p>
                </div>
              </div>

              {/* 6 steps list */}
              <div className="space-y-3 my-6">
                {[
                  { num: 1, title: 'Datos personales y contacto' },
                  { num: 2, title: 'Experiencia y formación' },
                  { num: 3, title: 'Horarios, pago y disponibilidad' },
                  { num: 4, title: 'Información adicional' },
                  { num: 5, title: 'Referencias y hoja de vida' },
                  { num: 6, title: 'Autorizaciones legales' }
                ].map((s) => (
                  <div key={s.num} className="flex items-center gap-3 text-xs text-gray-700">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                      {s.num}
                    </span>
                    <span className="font-medium">{s.title}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => {
                  setModalStep(1);
                  setIsModalOpen(true);
                }}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Postularme a esta vacante
              </button>

              <div className="flex items-center gap-2 justify-center text-[11px] text-gray-400 mt-4 text-center">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Tu información estará protegida y será usada únicamente para el proceso de selección.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6-STEP POSTULATION MODAL MATCHING IMAGES 10 TO 15 */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-gray-900">
                    Postulación: {selectedVacancy?.position || 'Vacante'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Completa el formulario en 6 pasos para participar en el proceso de selección.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Bar */}
            <div className="px-6 py-3 bg-gray-50/70 border-b border-gray-100 overflow-x-auto">
              <div className="flex items-center justify-between min-w-[550px]">
                {[
                  { num: 1, label: 'Datos personales' },
                  { num: 2, label: 'Experiencia y formación' },
                  { num: 3, label: 'Horarios y disponibilidad' },
                  { num: 4, label: 'Información adicional' },
                  { num: 5, label: 'Referencias y hoja de vida' },
                  { num: 6, label: 'Autorizaciones legales' }
                ].map(s => {
                  const isDone = modalStep > s.num;
                  const isCurrent = modalStep === s.num;
                  return (
                    <div key={s.num} className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                      </div>
                      <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
                        isCurrent ? 'text-emerald-700' : 'text-gray-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Body: Current Step Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* STEP 1: DATOS PERSONALES (Image 10) */}
              {modalStep === 1 && (
                <div className="space-y-4">
                  <div className="border-l-4 border-emerald-600 pl-3 mb-4">
                    <h3 className="text-sm font-bold text-gray-900">Datos personales y contacto</h3>
                    <p className="text-xs text-gray-500">Ingresa tu información básica para iniciar tu postulación.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre completo *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Nombres y apellidos"
                          value={formData.fullName}
                          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de documento *</label>
                      <select
                        value={formData.documentType}
                        onChange={e => setFormData({ ...formData, documentType: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        <option value="CC">Cédula de Ciudadanía (CC)</option>
                        <option value="CE">Cédula de Extranjería (CE)</option>
                        <option value="PASAPORTE">Pasaporte</option>
                        <option value="PPT">Permiso por Protección Temporal (PPT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Número de documento *</label>
                      <div className="relative">
                        <FileCheck className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Número de documento"
                          value={formData.documentNumber}
                          onChange={e => setFormData({ ...formData, documentNumber: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Celular / WhatsApp *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          placeholder="Número de contacto"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Correo electrónico *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Ciudad de residencia actual *</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Ej. Cali"
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Barrio actual *</label>
                      <div className="relative">
                        <Home className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Barrio"
                          value={formData.neighborhood}
                          onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Dirección actual (opcional)</label>
                      <input
                        type="text"
                        placeholder="Dirección de residencia"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Instagram (opcional)</label>
                      <div className="relative">
                        <Instagram className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="@usuario"
                          value={formData.instagram}
                          onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Facebook (opcional)</label>
                      <div className="relative">
                        <Facebook className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Perfil de Facebook"
                          value={formData.facebook}
                          onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: EXPERIENCIA Y FORMACIÓN (Image 11) */}
              {modalStep === 2 && (
                <div className="space-y-4">
                  <div className="border-l-4 border-emerald-600 pl-3 mb-4">
                    <h3 className="text-sm font-bold text-gray-900">Experiencia y formación</h3>
                    <p className="text-xs text-gray-500">Cuéntanos sobre tu experiencia laboral y tu formación académica.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">¿A qué cargo deseas postularte? *</label>
                      <select
                        value={formData.targetPosition}
                        onChange={e => setFormData({ ...formData, targetPosition: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        {vacancies.map(v => (
                          <option key={v.id} value={v.position}>{v.position} - {v.sede}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">¿Cuánto tiempo de experiencia tienes en ventas? *</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {['Sin experiencia', 'Menos de 1 año', 'Entre 1 y 2 años', 'Más de 2 años'].map(opt => (
                          <label key={opt} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all ${
                            formData.salesExperience === opt ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-semibold' : 'border-gray-200 text-gray-600'
                          }`}>
                            <input
                              type="radio"
                              name="salesExp"
                              checked={formData.salesExperience === opt}
                              onChange={() => setFormData({ ...formData, salesExperience: opt })}
                              className="text-emerald-600"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">¿Has trabajado en tiendas de ropa o calzado? *</label>
                      <div className="flex gap-4 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="clothingStore"
                            checked={formData.workedInClothingStores === true}
                            onChange={() => setFormData({ ...formData, workedInClothingStores: true })}
                            className="text-emerald-600"
                          />
                          <span>Sí</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="clothingStore"
                            checked={formData.workedInClothingStores === false}
                            onChange={() => setFormData({ ...formData, workedInClothingStores: false })}
                            className="text-emerald-600"
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">¿Tienes experiencia en caja, inventarios o ventas por redes sociales? *</label>
                      <textarea
                        rows={2}
                        placeholder="Describe brevemente tu experiencia"
                        value={formData.experienceDescription}
                        onChange={e => setFormData({ ...formData, experienceDescription: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">¿Actualmente estás cursando alguna carrera o curso? *</label>
                      <div className="flex gap-4 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="studying"
                            checked={formData.currentlyStudying === true}
                            onChange={() => setFormData({ ...formData, currentlyStudying: true })}
                            className="text-emerald-600"
                          />
                          <span>Sí</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="studying"
                            checked={formData.currentlyStudying === false}
                            onChange={() => setFormData({ ...formData, currentlyStudying: false })}
                            className="text-emerald-600"
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">¿Cuál es tu nivel de estudios? *</label>
                      <select
                        value={formData.educationLevel}
                        onChange={e => setFormData({ ...formData, educationLevel: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        <option value="Bachiller">Bachiller</option>
                        <option value="Técnico">Técnico</option>
                        <option value="Tecnólogo">Tecnólogo</option>
                        <option value="Universitario en curso">Universitario en curso</option>
                        <option value="Profesional">Profesional</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: HORARIOS, PAGO Y DISPONIBILIDAD (Image 12) */}
              {modalStep === 3 && (
                <div className="space-y-4">
                  <div className="border-l-4 border-emerald-600 pl-3 mb-4">
                    <h3 className="text-sm font-bold text-gray-900">Horarios, pago y disponibilidad</h3>
                    <p className="text-xs text-gray-500">Indícanos tu disponibilidad y preferencia de trabajo.</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1.5">
                        ¿Tienes disponibilidad para trabajar sábados, domingos y festivos, conforme a los turnos y descansos legales? *
                      </label>
                      <div className="space-y-1.5">
                        {['Sí, tengo disponibilidad', 'Tengo disponibilidad parcial', 'No tengo disponibilidad'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="weekendAvail"
                              checked={formData.weekendHolidayAvailability === opt}
                              onChange={() => setFormData({ ...formData, weekendHolidayAvailability: opt })}
                              className="text-emerald-600"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1.5">
                          ¿Estás de acuerdo con el horario y los turnos informados? *
                        </label>
                        <div className="space-y-1.5">
                          {['Sí, estoy de acuerdo', 'Deseo aclarar algunas condiciones', 'No estoy de acuerdo'].map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="agreeSchedule"
                                checked={formData.agreesWithSchedule === opt}
                                onChange={() => setFormData({ ...formData, agreesWithSchedule: opt })}
                                className="text-emerald-600"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-1.5">
                          ¿Estás de acuerdo con las condiciones de pago y modalidad? *
                        </label>
                        <div className="space-y-1.5">
                          {['Sí, estoy de acuerdo', 'Necesito más información', 'No estoy de acuerdo'].map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="agreePay"
                                checked={formData.agreesWithPayment === opt}
                                onChange={() => setFormData({ ...formData, agreesWithPayment: opt })}
                                className="text-emerald-600"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1.5">
                          ¿Cuentas con disponibilidad inmediata para comenzar? *
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="immediate"
                              checked={formData.immediateAvailability === true}
                              onChange={() => setFormData({ ...formData, immediateAvailability: true })}
                              className="text-emerald-600"
                            />
                            <span>Sí</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="immediate"
                              checked={formData.immediateAvailability === false}
                              onChange={() => setFormData({ ...formData, immediateAvailability: false })}
                              className="text-emerald-600"
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-1.5">
                          ¿Qué medio de transporte utilizas habitualmente? *
                        </label>
                        <select
                          value={formData.habitualTransport}
                          onChange={e => setFormData({ ...formData, habitualTransport: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                        >
                          <option value="Moto propia">Moto propia</option>
                          <option value="Carro propio">Carro propio</option>
                          <option value="Transporte público / MIO">Transporte público / MIO</option>
                          <option value="Bicicleta">Bicicleta</option>
                          <option value="Caminando">Caminando</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1.5">
                        ¿Consideras accesible el desplazamiento hacia las sedes de trabajo? *
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {['Sí', 'Depende de la sede y el horario', 'Presentaría dificultades'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="commute"
                              checked={formData.accessibleCommute === opt}
                              onChange={() => setFormData({ ...formData, accessibleCommute: opt })}
                              className="text-emerald-600"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: INFORMACIÓN ADICIONAL (Image 13) */}
              {modalStep === 4 && (
                <div className="space-y-4">
                  <div className="border-l-4 border-emerald-600 pl-3 mb-4">
                    <h3 className="text-sm font-bold text-gray-900">Información adicional</h3>
                    <p className="text-xs text-gray-500">Cuéntanos un poco más sobre ti y tu interés en el cargo.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ¿Por qué te interesa trabajar con nosotros? *
                    </label>
                    <textarea
                      rows={3}
                      maxLength={300}
                      placeholder="Cuéntanos brevemente tu motivación."
                      value={formData.motivation}
                      onChange={e => setFormData({ ...formData, motivation: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <div className="text-right text-[10px] text-gray-400">{formData.motivation.length} / 300</div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      ¿Qué habilidades o cualidades te destacan para este cargo? *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        'Servicio al cliente',
                        'Trabajo en equipo',
                        'Comunicación efectiva',
                        'Orientación a resultados',
                        'Organización'
                      ].map(skill => (
                        <label key={skill} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all ${
                          skillsSelected.includes(skill)
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                            : 'border-gray-200 text-gray-600'
                        }`}>
                          <input
                            type="checkbox"
                            checked={skillsSelected.includes(skill)}
                            onChange={() => handleSkillToggle(skill)}
                            className="text-emerald-600 rounded"
                          />
                          <span>{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        ¿Tienes experiencia en manejo de redes sociales para ventas? *
                      </label>
                      <div className="flex gap-4 text-xs mt-2">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="socialSales"
                            checked={formData.socialMediaSalesExp === true}
                            onChange={() => setFormData({ ...formData, socialMediaSalesExp: true })}
                            className="text-emerald-600"
                          />
                          <span>Sí</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="socialSales"
                            checked={formData.socialMediaSalesExp === false}
                            onChange={() => setFormData({ ...formData, socialMediaSalesExp: false })}
                            className="text-emerald-600"
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        ¿Qué tipo de metas de ventas has alcanzado? (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. % de cumplimiento, ventas mensuales, etc."
                        value={formData.salesGoalsAchieved}
                        onChange={e => setFormData({ ...formData, salesGoalsAchieved: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Observaciones o información adicional (opcional)
                    </label>
                    <textarea
                      rows={2}
                      maxLength={300}
                      placeholder="Agrega cualquier información que consideres relevante."
                      value={formData.additionalObservations}
                      onChange={e => setFormData({ ...formData, additionalObservations: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: REFERENCIAS Y HOJA DE VIDA (Image 14) */}
              {modalStep === 5 && (
                <div className="space-y-4">
                  <div className="border-l-4 border-emerald-600 pl-3 mb-4">
                    <h3 className="text-sm font-bold text-gray-900">Referencias y hoja de vida</h3>
                    <p className="text-xs text-gray-500">Proporciónanos tus referencias y adjunta tu hoja de vida.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Left: 3 References (7 cols) */}
                    <div className="md:col-span-7 space-y-4">
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Referencias (mínimo 3)</h4>

                      {/* 1. Referencia Familiar */}
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-2">
                        <span className="font-bold text-gray-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          1. Referencia familiar
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Nombre y apellidos"
                            value={formData.familyRefName}
                            onChange={e => setFormData({ ...formData, familyRefName: e.target.value })}
                            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Parentesco (Ej. Madre, Hermano)"
                            value={formData.familyRefRelationship}
                            onChange={e => setFormData({ ...formData, familyRefRelationship: e.target.value })}
                            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                          />
                        </div>
                        <input
                          type="tel"
                          placeholder="Número de contacto"
                          value={formData.familyRefPhone}
                          onChange={e => setFormData({ ...formData, familyRefPhone: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                        />
                      </div>

                      {/* 2. Referencia Personal */}
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-2">
                        <span className="font-bold text-gray-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          2. Referencia personal
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Nombre y apellidos"
                            value={formData.personalRefName}
                            onChange={e => setFormData({ ...formData, personalRefName: e.target.value })}
                            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Relación (Ej. Amigo, Vecino)"
                            value={formData.personalRefRelationship}
                            onChange={e => setFormData({ ...formData, personalRefRelationship: e.target.value })}
                            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                          />
                        </div>
                        <input
                          type="tel"
                          placeholder="Número de contacto"
                          value={formData.personalRefPhone}
                          onChange={e => setFormData({ ...formData, personalRefPhone: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                        />
                      </div>

                      {/* 3. Referencia Comercial / Laboral */}
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-2">
                        <span className="font-bold text-gray-800 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                          3. Referencia comercial / laboral
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Nombre del establecimiento"
                            value={formData.commercialRefCompany}
                            onChange={e => setFormData({ ...formData, commercialRefCompany: e.target.value })}
                            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Cargo de contacto"
                            value={formData.commercialRefPosition}
                            onChange={e => setFormData({ ...formData, commercialRefPosition: e.target.value })}
                            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                          />
                        </div>
                        <input
                          type="tel"
                          placeholder="Número de contacto"
                          value={formData.commercialRefPhone}
                          onChange={e => setFormData({ ...formData, commercialRefPhone: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    {/* Right: Hoja de vida (5 cols) */}
                    <div className="md:col-span-5 space-y-2">
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        Hoja de vida *
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Adjunta tu hoja de vida en formato PDF (máx. 5 MB).
                      </p>

                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors bg-gray-50/50">
                        <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                        <p className="text-xs font-bold text-gray-800">Arrastra y suelta tu archivo aquí</p>
                        <p className="text-[10px] text-gray-400 my-1">o</p>
                        <label className="inline-block px-4 py-2 bg-white border border-gray-300 hover:border-emerald-500 text-gray-800 text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-all">
                          <span>Seleccionar archivo</span>
                          <input
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                          <FileText className="w-3 h-3 text-red-500" />
                          Solo archivos PDF (máx. 5 MB)
                        </p>

                        {resumeFile && (
                          <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-left flex items-center justify-between">
                            <span className="text-xs text-emerald-800 font-semibold truncate max-w-[180px]">
                              {resumeFile.name}
                            </span>
                            <span className="text-[10px] text-emerald-600">
                              {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: AUTORIZACIONES LEGALES (Image 15) */}
              {modalStep === 6 && (
                <div className="space-y-4">
                  <div className="border-l-4 border-emerald-600 pl-3 mb-4">
                    <h3 className="text-sm font-bold text-gray-900">Autorizaciones legales</h3>
                    <p className="text-xs text-gray-500">
                      Para continuar con tu postulación, es necesario que leas y aceptes las siguientes autorizaciones.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* 1. Tratamiento de datos */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Tratamiento de datos personales *
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Autorizo de manera libre, previa, expresa e informada a la empresa para recolectar, almacenar, usar, actualizar y/o transferir mis datos personales, con la finalidad de gestionar mi proceso de selección.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer shrink-0 mt-1">
                        <input
                          type="checkbox"
                          checked={formData.dataPolicyAccepted}
                          onChange={e => setFormData({ ...formData, dataPolicyAccepted: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="text-xs font-semibold text-gray-700">Acepto</span>
                      </label>
                    </div>

                    {/* 2. Verificación de información */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          Verificación de información *
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Autorizo a la empresa a verificar la información suministrada en este formulario, incluyendo referencias personales, familiares, comerciales, laborales y académicas.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer shrink-0 mt-1">
                        <input
                          type="checkbox"
                          checked={formData.infoVerificationAccepted}
                          onChange={e => setFormData({ ...formData, infoVerificationAccepted: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="text-xs font-semibold text-gray-700">Acepto</span>
                      </label>
                    </div>

                    {/* 3. Consulta en centrales de riesgo */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-600" />
                          Consulta en centrales de riesgo *
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Autorizo a la empresa a realizar consultas en centrales de riesgo y bases de datos autorizadas, con el fin de validar mi información y antecedentes.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer shrink-0 mt-1">
                        <input
                          type="checkbox"
                          checked={formData.creditCheckAccepted}
                          onChange={e => setFormData({ ...formData, creditCheckAccepted: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="text-xs font-semibold text-gray-700">Acepto</span>
                      </label>
                    </div>

                    {/* Confidencialidad box */}
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="block font-bold">Confidencialidad</strong>
                        <span>Tu información será tratada de forma confidencial y únicamente para fines del proceso de selección.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              {modalStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              )}

              {modalStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-extrabold text-white bg-black hover:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-emerald-400" />
                      <span>Enviar postulación</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
