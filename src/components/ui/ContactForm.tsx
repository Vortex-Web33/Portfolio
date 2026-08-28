import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contact } from "@/lib/config/site";
import StickerTrail from "@/components/ui/StickerTrail";

gsap.registerPlugin(ScrollTrigger);

const services = [
  "Web a medida",
  "E-commerce",
  "Posicionamiento SEO",
  "Estrategia digital",
  "Otro",
];

const fieldStyles =
  "peer w-full rounded-2xl border border-white/10 bg-ink-soft/20 px-5 pt-8 pb-3 text-sm text-cream outline-none transition-all duration-300 hover:border-white/20 focus:border-vortex/70 focus:bg-ink-soft/40 focus:shadow-[0_0_24px_rgba(188,128,187,0.15)]";

const labelStyles =
  "pointer-events-none absolute left-5 top-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/40 transition-all duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:tracking-[0.15em] peer-focus:top-3.5 peer-focus:-translate-y-0 peer-focus:text-[10px] peer-focus:text-vortex peer-placeholder-shown:mb-0 mb-1.5";

export default function ContactForm() {
  const rootRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-form-field",
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: { trigger: rootRef.current, start: "top 85%" },
        },
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (!sent) return;
    const tween = gsap.fromTo(
      successRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.6)" },
    );
    return () => tween.kill();
  }, [sent]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch(contact.formspreeEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (response.ok) {
        setSent(true);
        e.currentTarget.reset();
      } else {
        const data = await response.json();
        setError(data.error || "Error al enviar el mensaje. Inténtalo de nuevo.");
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative grid gap-10 md:grid-cols-[1fr_1.5fr] md:gap-0 md:rounded-3xl md:shadow-[30px_30px_90px_-20px_rgba(188,128,187,0.55)]"
    >
      <StickerTrail size="w-12 md:w-14" />
      <aside className="contact-form-field relative h-64 overflow-clip rounded-3xl border border-white/5 bg-ink-soft/30 md:h-auto md:rounded-r-none md:border-r-0">
        <img
          src="/imagenes/fondito.webp"
          alt=""
          draggable={false}
          className="absolute inset-0 size-full object-cover"
        />
      </aside>

      <form
        onSubmit={handleSubmit}
        action={contact.formspreeEndpoint}
        method="POST"
        className="relative rounded-3xl border border-white/5 bg-ink-soft/30 p-8 md:rounded-l-none md:border-l-0 md:p-10"
      >
        <div className="mb-8">
          <p className="kicker mb-3 text-cream/40">Contacto directo</p>
          <a
            href={contact.emailHref}
            className="group text-xl font-bold text-white transition-colors duration-300 hover:text-vortex md:text-2xl"
          >
            {contact.email}
            <span className="block h-px w-0 bg-vortex transition-all duration-300 group-hover:w-full" />
          </a>
          <p className="mt-2 font-mono text-xs text-cream/40">
            Respuesta en menos de 24 horas, te lo prometemos.
          </p>
        </div>
        {sent ? (
          <div
            ref={successRef}
            className="flex h-full min-h-64 flex-col items-center justify-center gap-4 text-center"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-vortex to-vortex-green text-2xl text-white">
              ✓
            </span>
            <p className="text-2xl font-bold text-white">¡Mensaje enviado!</p>
            <p className="font-mono text-sm text-cream/60">
              Te respondemos en menos de 24 horas. Mientras, mira nuestros proyectos.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-mono">
                {error}
              </div>
            )}
            <div className="contact-form-field grid gap-5 sm:grid-cols-2">
              <div className="relative">
                <input
                  id="cf-name"
                  name="name"
                  type="text"
                  required
                  placeholder=" "
                  className={fieldStyles}
                />
                <label htmlFor="cf-name" className={labelStyles}>
                  Nombre
                </label>
              </div>
              <div className="relative">
                <input
                  id="cf-email"
                  name="email"
                  type="email"
                  required
                  placeholder=" "
                  className={fieldStyles}
                />
                <label htmlFor="cf-email" className={labelStyles}>
                  Email
                </label>
              </div>
            </div>

            <div className="contact-form-field relative mt-5">
              <select
                id="cf-service"
                name="service"
                required
                className={`${fieldStyles} appearance-none pr-10`}
                defaultValue=""
              >
                <option value="" disabled />
                {services.map((s) => (
                  <option key={s} value={s} className="bg-ink text-cream">
                    {s}
                  </option>
                ))}
              </select>
              <label htmlFor="cf-service" className={labelStyles}>
                ¿Qué servicio te interesa?
              </label>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xs text-cream/40"
              >
                ▾
              </span>
            </div>

            <div className="contact-form-field relative mt-5">
              <textarea
                id="cf-message"
                name="message"
                rows={5}
                required
                placeholder=" "
                className={`${fieldStyles} resize-none`}
              />
              <label htmlFor="cf-message" className={labelStyles}>
                Cuéntanos tu proyecto
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="contact-form-field btn mt-8 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Enviando..." : "Enviar mensaje"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}