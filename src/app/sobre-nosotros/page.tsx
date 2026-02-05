import Image from 'next/image';

export default function SobreNosotrosPage() {
    return (
        <section
        id="sobre-nosotros"
        className="w-full py-12 md:py-24 lg:py-32"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                Sobre Nosotros
              </h1>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Somos una empresa con más de 20 años de experiencia en el sector tecnológico, brindando soluciones integrales a nuestros clientes. Nuestro compromiso es ofrecer un servicio de calidad, con atención personalizada y los mejores productos del mercado.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <Image
              src="https://picsum.photos/seed/team-working/600/400"
              data-ai-hint="team working"
              alt="Sobre Nosotros"
              width="600"
              height="400"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
            />
            <div className="flex flex-col justify-center space-y-4">
              <ul className="grid gap-6">
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Misión</h3>
                    <p className="text-foreground/80">
                      Facilitar el acceso a la tecnología, ofreciendo productos y servicios de vanguardia que impulsen el desarrollo de nuestros clientes.
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Visión</h3>
                    <p className="text-foreground/80">
                      Ser la empresa líder en soluciones tecnológicas en la región, reconocida por nuestra innovación, confiabilidad y compromiso con el cliente.
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Valores</h3>
                    <p className="text-foreground/80">
                      Confianza, Experiencia, Innovación y Atención Personalizada.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
}
