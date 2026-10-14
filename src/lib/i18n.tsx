import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "es";

const STORAGE_KEY = "bookmark-locale";

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.history": "History",
    "nav.analytics": "Analytics",
    "nav.recommendations": "For You",
    "nav.settings": "Settings",
    "reminder.description": "Your daily reading reminder",
    "settings.header.eyebrow": "Make it yours",
    "settings.header.title": "Goals & reminders",
    "settings.language": "Language",
    "settings.language.en": "English",
    "settings.language.es": "Español",
    "settings.dailyGoal": "Daily goal",
    "settings.pages": "Pages",
    "settings.minutes": "Minutes",
    "settings.goalValue": "Goal value",
    "settings.readingReminder": "Reading reminder",
    "settings.readingReminderDesc": "Shown in the app at your chosen time",
    "settings.time": "Time",
    "settings.message": "Message",
    "settings.preview": "Preview reminder",
    "settings.reset": "Reset to sample data",
    "settings.toast.preview": "Preview of your reminder",
    "settings.toast.reset": "Sample data restored",
    "home.greeting": "Good to see you",
    "home.title": "Your reading nook",
    "home.currentlyReading": "Currently reading",
    "home.currentPage": "Current page",
    "home.updatePage": "Update page",
    "home.markFinished": "Mark as finished",
    "home.noBook": "No book in progress. Start one from your Next Up list below.",
    "home.dailyGoal": "Daily goal",
    "home.readToday": "Read {{goal}} {{unit}} today",
    "home.goalComplete": "Goal complete!",
    "home.checkInToday": "Check in for today",
    "home.checkedInToday": "Checked in today",
    "home.nextUp": "Next up",
    "home.listEmpty": "Your list is empty.",
    "home.bookTitle": "Book title",
    "home.authorOptional": "Author (optional)",
    "home.startReading": "Start reading",
    "home.remove": "Remove",
    "home.started": "Started “{{title}}”",
    "home.pageLogged": "Page {{page}} logged",
    "home.progressNice": "Nice progress ✨",
    "home.addedToNextUp": "Added to Next Up",
    "home.addBook": "Add",
    "home.pagesOf": "p. {{current}} / {{total}}",
    "history.eyebrow": "{{count}} books finished",
    "history.title": "Your shelf",
    "analytics.eyebrow": "Your habits",
    "analytics.title": "Analytics",
    "analytics.booksRead": "Books read",
    "analytics.pagesRead": "Pages read",
    "analytics.avgHours": "Avg hrs / book",
    "analytics.currentStreak": "Current streak",
    "analytics.pagesPerDay": "Pages per day",
    "analytics.last14Days": "Last 14 days",
    "analytics.weeklyConsistency": "Weekly consistency",
    "analytics.pagesPerWeek": "Pages per week · last 8 weeks",
    "analytics.insights": "Insights",
    "analytics.more": "more",
    "analytics.less": "less",
    "analytics.enjoyed": "enjoyed",
    "analytics.of": "of",
    "analytics.books": "books",
    "analytics.progressSummary": "You read {{percent}}% {{direction}} in the last 4 weeks than the 4 before.",
    "analytics.favoriteSummary": "You enjoyed {{liked}} of {{total}} books you finished.",
    "analytics.ratingSummary": "Recent ratings average {{recent}} vs {{older}} earlier — {{status}}",
    "analytics.picksBetter": "your picks are getting better!",
    "analytics.tryGenres": "try leaning into genres you loved.",
    "recs.eyebrow": "Curated from your ratings",
    "recs.title": "Recommended for you",
    "recs.steering": "Steering away from books like {{titles}}.",
    "recs.addToNextUp": "Add to Next Up",
    "recs.becauseYouEnjoyed": "Because you enjoyed {{title}}",
    "recs.rateMore": "Rate a few more books to get suggestions.",
    "recs.notFound": "No recommendations yet.",
    "general.days": "d",
    "general.day": "day",
    "general.daysPlural": "days",
    "general.of": "of",
    "notFound.title": "Page not found",
    "notFound.description": "The page you're looking for doesn't exist or has been moved.",
    "notFound.home": "Go home",
    "error.title": "This page didn't load",
    "error.description": "Something went wrong on our end. You can try refreshing or head back home.",
    "error.retry": "Try again",
    "error.home": "Go home",
  },
  es: {
    "nav.home": "Inicio",
    "nav.history": "Historial",
    "nav.analytics": "Estadísticas",
    "nav.recommendations": "Para ti",
    "nav.settings": "Ajustes",
    "reminder.description": "Tu recordatorio diario de lectura",
    "settings.header.eyebrow": "Hazlo tuyo",
    "settings.header.title": "Objetivos y recordatorios",
    "settings.language": "Idioma",
    "settings.language.en": "English",
    "settings.language.es": "Español",
    "settings.dailyGoal": "Meta diaria",
    "settings.pages": "Páginas",
    "settings.minutes": "Minutos",
    "settings.goalValue": "Valor de la meta",
    "settings.readingReminder": "Recordatorio de lectura",
    "settings.readingReminderDesc": "Se muestra en la app a la hora que elijas",
    "settings.time": "Hora",
    "settings.message": "Mensaje",
    "settings.preview": "Previsualizar recordatorio",
    "settings.reset": "Restaurar datos de ejemplo",
    "settings.toast.preview": "Vista previa de tu recordatorio",
    "settings.toast.reset": "Se restauraron los datos de ejemplo",
    "home.greeting": "Qué bueno verte",
    "home.title": "Tu rincón de lectura",
    "home.currentlyReading": "Leyendo ahora",
    "home.currentPage": "Página actual",
    "home.updatePage": "Actualizar página",
    "home.markFinished": "Marcar como terminado",
    "home.noBook": "No hay ningún libro en progreso. Empieza uno desde tu lista de Siguiente.",
    "home.dailyGoal": "Meta diaria",
    "home.readToday": "Lee {{goal}} {{unit}} hoy",
    "home.goalComplete": "¡Meta completada!",
    "home.checkInToday": "Registrar hoy",
    "home.checkedInToday": "Registrado hoy",
    "home.nextUp": "Siguiente",
    "home.listEmpty": "Tu lista está vacía.",
    "home.bookTitle": "Título del libro",
    "home.authorOptional": "Autor (opcional)",
    "home.startReading": "Empezar a leer",
    "home.remove": "Eliminar",
    "home.started": "Empezaste “{{title}}”",
    "home.pageLogged": "Página {{page}} registrada",
    "home.progressNice": "¡Buen progreso ✨",
    "home.addedToNextUp": "Añadido a Siguiente",
    "home.addBook": "Añadir",
    "home.pagesOf": "p. {{current}} / {{total}}",
    "history.eyebrow": "{{count}} libros terminados",
    "history.title": "Tu estantería",
    "analytics.eyebrow": "Tus hábitos",
    "analytics.title": "Estadísticas",
    "analytics.booksRead": "Libros leídos",
    "analytics.pagesRead": "Páginas leídas",
    "analytics.avgHours": "Horas / libro",
    "analytics.currentStreak": "Racha actual",
    "analytics.pagesPerDay": "Páginas por día",
    "analytics.last14Days": "Últimos 14 días",
    "analytics.weeklyConsistency": "Consistencia semanal",
    "analytics.pagesPerWeek": "Páginas por semana · últimas 8 semanas",
    "analytics.insights": "Datos",
    "analytics.more": "más",
    "analytics.less": "menos",
    "analytics.enjoyed": "disfrutaste",
    "analytics.of": "de",
    "analytics.books": "libros",
    "analytics.progressSummary": "Leíste {{percent}}% {{direction}} en las últimas 4 semanas que en las 4 anteriores.",
    "analytics.favoriteSummary": "Disfrutaste {{liked}} de {{total}} libros que terminaste.",
    "analytics.ratingSummary": "Las valoraciones recientes promedian {{recent}} frente a {{older}} antes — {{status}}",
    "analytics.picksBetter": "¡tus elecciones mejoran!",
    "analytics.tryGenres": "prueba a seguir con los géneros que más te gustaron.",
    "recs.eyebrow": "Curado a partir de tus valoraciones",
    "recs.title": "Recomendaciones para ti",
    "recs.steering": "Alejándote de libros como {{titles}}.",
    "recs.addToNextUp": "Añadir a Siguiente",
    "recs.becauseYouEnjoyed": "Porque te gustó {{title}}",
    "recs.rateMore": "Valora más libros para recibir sugerencias.",
    "recs.notFound": "Todavía no hay recomendaciones.",
    "general.days": "d",
    "general.day": "día",
    "general.daysPlural": "días",
    "general.of": "de",
    "notFound.title": "Página no encontrada",
    "notFound.description": "La página que buscas no existe o se ha movido.",
    "notFound.home": "Ir al inicio",
    "error.title": "Esta página no se cargó",
    "error.description": "Algo salió mal por nuestra parte. Puedes intentar recargar la página o volver al inicio.",
    "error.retry": "Intentar de nuevo",
    "error.home": "Ir al inicio",
  },
};

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
} | null>(null);

export function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const savedLocale = window.localStorage.getItem(STORAGE_KEY);
  if (savedLocale === "en" || savedLocale === "es") return savedLocale;

  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith("es") ? "es" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, values: Record<string, string | number> = {}) => {
      const translation = translations[locale][key] ?? translations.en[key] ?? key;

      return Object.entries(values).reduce((result, [placeholder, value]) => {
        const pattern = new RegExp(`\\{\\{\\s*${placeholder}\\s*\\}\\}`, "g");
        return result.replace(pattern, String(value));
      }, translation);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }

  return context;
}
