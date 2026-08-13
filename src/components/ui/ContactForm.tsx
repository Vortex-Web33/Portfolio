import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contact, socials } from "@/lib/config/site";

gsap.registerPlugin(ScrollTrigger);

const services = [
  "Web a medida",
  "E-commerce",
  "Posicionamiento SEO",
  "Estrategia digital",
  "Otro",
];

const fieldStyles =
  "peer w-full rounded-2xl border border-white/10 bg-ink-soft/20 px-5 pt-6 pb-2 text-sm text-cream outline-none transition-all duration-300 hover:border-white/20 focus:border-vortex/70 focus:bg-ink-soft/40 focus:shadow-[0_0_24px_rgba(188,128,187,0.15)]";

const labelStyles =
  "pointer-events-none absolute left-5 top-4 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/40 transition-all duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:tracking-[0.15em] peer-focus:top-4 peer-focus:-translate-y-0 peer-focus:text-[10px] peer-focus:text-vortex";

export default function ContactForm() {
  const rootRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div ref={rootRef} className="grid gap-10 md:grid-cols-[1fr_1.5fr]">
      <aside className="contact-form-field flex flex-col justify-between gap-10 rounded-3xl border border-white/5 bg-ink-soft/30 p-8 md:p-10">
        <div>
          <p className="kicker mb-4 text-cream/40">Contacto directo</p>
          <a
            href={contact.emailHref}
            class="group text-2xl font-bold text-white transition-colors duration-300 hover:text-vortex md:text-3xl"
          >
            {contact.email}
            <span class="block h-px w-0 bg-vortex transition-all duration-300 group-hover:w-full" />
          </a>
          <p class="mt-2 font-mono text-xs text-cream/40">
            Respuesta en menos de 24 horas, te lo prometemos.
          </p>
        </div>

        <div class="space-y-4 font-mono text-sm text-cream/60">
          <p>
            Agencia VORTEX · {contact.address.city}, {contact.address.country}
          </p>
          <div class="flex flex-wrap gap-x-6 gap-y-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                class="text-cream/50 transition-colors duration-300 hover:text-vortex"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </aside>

      <form
        onSubmit={handleSubmit}
        class="relative rounded-3xl border border-white/5 bg-ink-soft/30 p-8 md:p-10"
      >
        {sent ? (
          <div
            ref={successRef}
            class="flex h-full min-h-64 flex-col items-center justify-center gap-4 text-center"
          >
            <span class="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-vortex to-vortex-green text-2xl text-white">
              ✓
            </span>
            <p class="text-2xl font-bold text-white">¡Mensaje enviado!</p>
            <p class="font-mono text-sm text-cream/60">
              Te respondemos en menos de 24 horas. Mientras, mira tu bandeja.
            </p>
          </div>
        ) : (
          <>
            <div class="contact-form-field grid gap-5 sm:grid-cols-2">
              <div class="relative">
                <input
                  id="cf-name"
                  name="name"
                  type="text"
                  required
                  placeholder=" "
                  class={fieldStyles}
                />
                <label htmlFor="cf-name" class={labelStyles}>
                  Nombre
                </label>
              </div>
              <div class="relative">
                <input
                  id="cf-email"
                  name="email"
                  type="email"
                  required
                  placeholder=" "
                  class={fieldStyles}
                />
                <label htmlFor="cf-email" class={labelStyles}>
                  Email
                </label>
              </div>
            </div>

            <div class="contact-form-field relative mt-5">
              <select
                id="cf-service"
                name="service"
                required
                class={`${fieldStyles} appearance-none pr-10`}
                defaultValue=""
              >
                <option value="" disabled />
                {services.map((s) => (
                  <option key={s} value={s} class="bg-ink text-cream">
                    {s}
                  </option>
                ))}
              </select>
              <label htmlFor="cf-service" class={labelStyles}>
                ¿Qué servicio te interesa?
              </label>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xs text-cream/40"
              >
                ▾
              </span>
            </div>

            <div class="contact-form-field relative mt-5">
              <textarea
                id="cf-message"
                name="message"
                rows={5}
                required
                placeholder=" "
                class={`${fieldStyles} resize-none`}
              />
              <label htmlFor="cf-message" class={labelStyles}>
                Cuéntanos tu proyecto
              </label>
            </div>

            <button
              type="submit"
              class="contact-form-field btn mt-8 w-full sm:w-auto"
            >
              Enviar mensaje
            </button>
          </>
        )}
      </form>
    </div>
  );
}