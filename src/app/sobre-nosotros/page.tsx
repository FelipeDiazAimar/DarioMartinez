
import Image from 'next/image';
import {
  Award,
  BrainCircuit,
  Handshake,
  Shield,
  Search,
  Wrench,
  Eye,
  Heart,
  Calendar,
  ArrowRight,
} from 'lucide-react';


export default function SobreNosotrosPage() {
    return (
        <section
            id="sobre-nosotros"
            className="w-full py-12 md:py-24 lg:py-32 bg-white"
        >
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-3">
                        <div className="inline-block rounded-full bg-muted px-3 py-1 text-sm">Nuestra Historia</div>
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                            Casi 50 Años de Confianza y Tecnología
                        </h1>
                        <p className="mx-auto max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Darío Martínez Computación nace en San Francisco con un objetivo claro: brindar soluciones reales y confiables. Hemos acompañado la evolución tecnológica desde sus inicios, consolidándonos como un referente de seriedad y conocimiento técnico en la región.
                        </p>
                    </div>
                </div>

                <div className="mx-auto grid max-w-7xl items-start gap-12 py-12 lg:grid-cols-2">
                    <div className="grid gap-16">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 flex items-center">
                                <Calendar className="mr-3 h-7 w-7 text-primary" />
                                Nuestra Forma de Trabajar
                            </h3>
                            <p className="text-foreground/80 mb-6">
                                Cada cliente y cada equipo es único. Por eso, nuestro proceso se basa en la escucha, el análisis detallado y la búsqueda de la solución más eficiente y duradera. No aplicamos recetas, resolvemos problemas.
                            </p>
                            <ul className="grid gap-4">
                                <li className="flex items-start gap-4">
                                    <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                                        <Search className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold">Diagnóstico Preciso</h4>
                                        <p className="text-sm text-foreground/80">
                                            Nos tomamos el tiempo para entender el problema a fondo, realizando todas las pruebas necesarias para dar con la causa raíz de la falla.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                                        <Wrench className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold">Soluciones a Medida</h4>
                                        <p className="text-sm text-foreground/80">
                                            Te explicamos las opciones disponibles y te recomendamos la mejor alternativa en función de tu necesidad y presupuesto, ya sea una reparación, actualización o un equipo nuevo.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                                        <Eye className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold">Transparencia Total</h4>
                                        <p className="text-sm text-foreground/80">
                                            Hablamos en un lenguaje claro, sin tecnicismos innecesarios. Siempre sabrás qué se va a hacer, por qué y cuál es el costo, sin sorpresas.
                                        </p>
                                    </div>
                                </li>
                                 <li className="flex items-start gap-4">
                                    <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                                        <Heart className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold">Compromiso Post-Venta</h4>
                                        <p className="text-sm text-foreground/80">
                                            Nuestro trabajo no termina con la entrega. Ofrecemos garantía y estamos a tu disposición para resolver cualquier duda o inconveniente posterior.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                                Nuestra Evolución
                            </h2>
                            <p className="mx-auto mt-4 max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed lg:mx-0">
                                Adaptándonos a los nuevos tiempos, sin perder la esencia.
                            </p>
                            <div className="mt-8 flex flex-row items-center justify-center gap-x-2 sm:gap-x-4">
                                <Image
                                    src="/LOGO3.png"
                                    alt="Logo Antiguo"
                                    width={150}
                                    height={150}
                                    className="h-auto w-28 sm:w-36"
                                />
                                <ArrowRight className="h-8 w-8 flex-shrink-0 text-primary sm:h-12 sm:w-12" />
                                <Image
                                    src="/LOGO1.png"
                                    alt="Logo Nuevo"
                                    width={180}
                                    height={180}
                                    className="h-auto w-32 sm:w-44"
                                />
                            </div>
                        </div>
                    </div>
                     <div className="sticky top-24 grid gap-8">
                         <Image
                            src="/FOTOFRENTE.jpeg"
                            alt="Taller de Darío Martínez Computación"
                            width="600"
                            height="700"
                            className="w-full mx-auto aspect-[4/5] overflow-hidden rounded-xl object-cover object-center"
                        />
                        <div>
                             <h3 className="text-2xl font-bold mb-4">Nuestros Pilares</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 text-center">
                                    <Award className="h-8 w-8 text-primary" />
                                    <p className="font-semibold">Experiencia</p>
                                </div>
                                <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 text-center">
                                    <BrainCircuit className="h-8 w-8 text-primary" />
                                    <p className="font-semibold">Conocimiento</p>
                                </div>
                                <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 text-center">
                                    <Handshake className="h-8 w-8 text-primary" />
                                    <p className="font-semibold">Atención Cercana</p>
                                </div>
                                <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 text-center">
                                    <Shield className="h-8 w-8 text-primary" />
                                    <p className="font-semibold">Confianza</p>
                                </div>
                             </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
