/**
 * Script para generar UPDATEs SQL de limpieza de artículos.
 * Genera descripcion, descripcionAdicional, imagen y anotaciones
 * con contenido único y personalizado para cada producto.
 * 
 * Uso: node generar_updates.js
 * Salida: archivos update_lote_XX.sql en la misma carpeta
 */

const fs = require('fs');
const path = require('path');

// ===================== DICCIONARIOS DE DATOS =====================

// Correcciones de encoding UTF-8 roto (ordenadas de más largas a más cortas)
const encodingFixes = [
  // Triple-encoding patterns
  ['ÃƒÂ¡', 'á'], ['ÃƒÂ©', 'é'], ['ÃƒÂ­', 'í'], ['ÃƒÂ³', 'ó'],
  ['ÃƒÂº', 'ú'], ['ÃƒÂ±', 'ñ'], ['ÃƒÂ', 'Á'],
  // Double-encoding patterns
  ['Ã¡', 'á'], ['Ã©', 'é'], ['Ã­', 'í'], ['Ã³', 'ó'],
  ['Ãº', 'ú'], ['Ã±', 'ñ'], ['Ã"', 'Ó'], ['Ã‰', 'É'],
  ['Ãš', 'Ú'], ['Ã¼', 'ü'], ['Ãœ', 'Ü'], ['Ã¢', 'â'],
  // Single byte C2 prefix (latin1 of C2 XX UTF-8)
  ['Â°', '°'], ['Âº', 'º'], ['Â´', '´'], ['Â¡', '¡'],
  ['Â¿', '¿'], ['Â®', '®'],
  // Lone Ã before vowel (í stored as Ã + soft-hyphen that got stripped)
  ['Ãa', 'ía'], ['Ão', 'ío'], ['Ãe', 'íe'], ['Ãu', 'íu'],
];

function fixEncoding(str) {
  let result = str;
  for (const [bad, good] of encodingFixes) {
    result = result.split(bad).join(good);
  }
  // Fix remaining Ã followed by common chars (Garantia pattern)
  result = result.replace(/Ã([a-z])/g, (_, c) => {
    const map = {'a':'á','e':'é','i':'í','o':'ó','u':'ú','n':'ñ'};
    return map[c] ? map[c] : 'Ã' + c;
  });
  return result;
}

// Capitalizar correctamente (Title Case)
function titleCase(str) {
  const minusculas = ['de', 'del', 'la', 'el', 'los', 'las', 'en', 'con', 'para', 'por', 'y', 'o', 'a', 'x', 'c'];
  // Siglas técnicas que deben mantenerse en mayúsculas
  const preserveUpper = ['USB', 'SSD', 'DDR', 'DDR2', 'DDR3', 'DDR4', 'DDR5', 'HDMI', 'VGA', 'DVI', 'LED', 'LCD', 'SATA', 'IDE', 'PCI', 'RGB', 'UTP', 'RJ45', 'POE', 'POS', 'UPS', 'IVA', 'HP', 'BIC', 'TRV', 'HSM', 'FAX', 'PVC', 'DVD', 'CD', 'LAN', 'WAN', 'RAM', 'ROM', 'PDF', 'DPI', 'NFC', 'GPS', 'OTG', 'AUX', 'A4', 'A3'];
  return str.split(' ').map((w, i) => {
    if (!w) return '';
    const upper = w.toUpperCase();
    if (preserveUpper.includes(upper)) return upper;
    const lower = w.toLowerCase();
    if (i > 0 && minusculas.includes(lower)) return lower;
    // Patrones de modelo/sigla: mayúsculas+dígitos con al menos un dígito o guión (ej: NX-7000SE, TN2420)
    if (w.match(/^[A-Z][A-Z0-9\-\.]*[\d\-][A-Z0-9\-\.]*$/) && w.length <= 10) return w;
    // Números con letras: 4GB, 128GB, 65W, etc
    if (w.match(/^\d+[A-Z]+$/i)) return w.replace(/[a-z]+$/i, m => m.toUpperCase());
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
}

// Base de conocimiento de productos
const productDB = {
  // ---- MICE ----
  mouse: {
    tipos: ['Mouse'],
    conectividades: { 'inalambrico': 'Inalámbrico', 'inalámbrico': 'Inalámbrico', 'optico': 'Óptico', 'óptico': 'Óptico', 'usb': 'USB', 'bluetooth': 'Bluetooth' },
    descTemplates: [
      (m, mod) => `Mouse ${m} ${mod} con diseño ergonómico pensado para largas jornadas de trabajo. Precisión óptica y respuesta inmediata para todo tipo de tareas.`,
      (m, mod) => `${m} ${mod}, un mouse que combina confort y rendimiento. Ideal para el uso diario en oficina, hogar o estudio.`,
      (m, mod) => `Mouse ${m} ${mod} de excelente relación calidad-precio. Agarre cómodo y funcionamiento confiable para el día a día.`,
      (m, mod) => `Diseñado para quienes valoran la comodidad: mouse ${m} ${mod} con sensor óptico de alta precisión y uso plug and play.`,
      (m, mod) => `Mouse ${m} ${mod} que ofrece control fluido y desplazamiento suave. Compatible con los principales sistemas operativos.`,
    ],
    anotTemplates: [
      (m, mod, con) => `Mouse ${m} ${mod} con conexión ${con}, listo para usar sin complicaciones. Su sensor óptico garantiza un seguimiento preciso sobre distintas superficies, y su diseño liviano lo convierte en compañero ideal tanto en el escritorio como en movimiento.`,
      (m, mod, con) => `${m} ${mod} pensado para el usuario que busca funcionalidad sin rodeos. Conexión ${con} estable, navegación fluida y compatibilidad amplia con equipos Windows, Mac y Linux.`,
      (m, mod, con) => `Un mouse confiable para cada día: ${m} ${mod} ofrece conexión ${con}, tracking óptico de precisión y un formato compacto que se adapta a cualquier espacio de trabajo.`,
    ],
    specs: [
      (con) => [`Conexión: ${con}`, 'Sensor: Óptico', 'Diseño ergonómico', 'Compatible con Windows, Mac y Linux', 'Plug and play'],
      (con) => [`Interfaz: ${con}`, 'Resolución: 1000/1200 DPI', 'Diseño ambidiestro', 'Tamaño compacto y portátil', 'Sin necesidad de drivers'],
      (con) => [`Tipo de conexión: ${con}`, 'Sensor óptico de precisión', 'Uso: oficina, hogar, estudio', 'Bajo consumo energético', 'Compatible con múltiples sistemas operativos'],
    ]
  },

  // ---- TECLADOS ----
  teclado: {
    descTemplates: [
      (m, mod) => `Teclado ${m} ${mod} con teclas de perfil bajo y escritura silenciosa. Ideal para jornadas prolongadas de tipeo en oficina o en casa.`,
      (m, mod) => `${m} ${mod}: teclado resistente y cómodo, pensado para quienes escriben a diario. Layout en español latinoamericano.`,
      (m, mod) => `Teclado ${m} ${mod} con distribución completa y teclas de respuesta suave. Conectividad sencilla y uso inmediato.`,
    ],
    anotTemplates: [
      (m, mod, con) => `Teclado ${m} ${mod} con layout en español latinoamericano completo, teclas de perfil bajo y base antideslizante. Su conexión ${con} lo hace ideal para cualquier estación de trabajo.`,
      (m, mod, con) => `${m} ${mod} diseñado para escribir con fluidez durante horas. Conexión ${con}, teclas silenciosas y durabilidad probada para el ámbito profesional y educativo.`,
    ],
    specs: [
      (con) => [`Conexión: ${con}`, 'Layout: Español Latinoamericano', 'Teclas de perfil bajo', 'Base antideslizante', 'Compatible con Windows'],
      (con) => [`Interfaz: ${con}`, 'Distribución completa con teclado numérico', 'Teclas silenciosas', 'Resistente a salpicaduras', 'Plug and play'],
    ]
  },

  // ---- AURICULARES ----
  auriculares: {
    descTemplates: [
      (m, mod) => `Auriculares ${m} ${mod} con sonido envolvente y micrófono incorporado. Cómodos para llamadas, reuniones y multimedia.`,
      (m, mod) => `${m} ${mod}: auriculares con diadema ajustable y almohadillas acolchadas para uso prolongado sin fatiga.`,
      (m, mod) => `Auriculares ${m} ${mod} que ofrecen audio claro y graves definidos. Perfectos para trabajo, gaming y entretenimiento.`,
    ],
    anotTemplates: [
      (m, mod) => `Auriculares ${m} ${mod} con micrófono integrado para videollamadas, clases online y uso multimedia. Almohadillas suaves que se adaptan a la forma de la oreja y diadema regulable para un ajuste personalizado.`,
      (m, mod) => `${m} ${mod} pensados para largas sesiones de uso: sonido nítido, micrófono omnidireccional y construcción ligera que no genera presión. Compatibles con PC, notebook y dispositivos móviles.`,
    ],
    specs: [
      () => ['Micrófono incorporado', 'Almohadillas acolchadas', 'Diadema ajustable', 'Cable con conector 3.5mm', 'Compatible con PC, notebook y celular'],
      () => ['Audio estéreo envolvente', 'Micrófono con cancelación de ruido', 'Diseño liviano y plegable', 'Conexión universal 3.5mm', 'Ideal para home office y gaming'],
    ]
  },

  // ---- TONER ----
  toner: {
    descTemplates: [
      (m, mod) => `Tóner ${m} ${mod} de alto rendimiento para impresiones nítidas en texto y gráficos. Compatible y listo para instalar.`,
      (m, mod) => `Cartucho de tóner ${m} ${mod} que garantiza páginas claras y definidas. Excelente opción para reducir costos de impresión.`,
      (m, mod) => `Tóner compatible ${m} ${mod}: calidad profesional de impresión a una fracción del costo del original.`,
      (m, mod) => `${m} ${mod}: tóner que entrega impresiones consistentes página tras página. Instalación sencilla sin herramientas.`,
      (m, mod) => `Tóner ${m} ${mod} formulado para proteger el tambor y los componentes internos de tu impresora mientras ofrece resultados nítidos.`,
    ],
    anotTemplates: [
      (m, mod, equipo) => `Tóner ${m} ${mod} diseñado para ofrecer un rendimiento confiable y constante. Su formulación garantiza negros profundos y textos legibles incluso en impresiones a alta velocidad.${equipo ? ' Compatible con equipos ' + equipo + '.' : ''}`,
      (m, mod, equipo) => `Cartucho ${m} ${mod} que combina economía y calidad. Fácil de instalar, comienza a imprimir de inmediato sin ajustes adicionales.${equipo ? ' Funciona con impresoras ' + equipo + '.' : ''}`,
      (m, mod, equipo) => `${m} ${mod}: insumo de impresión que cuida tu equipo mientras entrega resultados profesionales. Menor costo por página sin sacrificar definición.${equipo ? ' Para uso en ' + equipo + '.' : ''}`,
    ],
    specs: [
      (mod, rend, color) => [`Modelo compatible: ${mod}`, `Color: ${color || 'Negro'}`, `Rendimiento aproximado: ${rend || 'estándar'}`, 'Instalación sin herramientas', 'Impresión nítida en texto y gráficos'],
      (mod, rend, color) => [`Cartucho: ${mod}`, `Color: ${color || 'Negro'}`, `Páginas estimadas: ${rend || 'según modelo'}`, 'Fórmula que protege el tambor', 'Fácil instalación plug-in'],
    ]
  },

  // ---- TINTA ----
  tinta: {
    descTemplates: [
      (m, mod) => `Tinta ${m} ${mod} de secado rápido y colores vibrantes. Formulada para proteger los cabezales y obtener impresiones duraderas.`,
      (m, mod) => `Botella de tinta ${m} ${mod} con sistema antiderrame. Recarga sencilla y rendimiento extendido.`,
      (m, mod) => `${m} ${mod}: tinta que se destaca por su cobertura uniforme y tonalidades fieles. Ideal para documentos y fotos.`,
      (m, mod) => `Tinta ${m} ${mod} compatible y económica, diseñada para maximizar cada recarga sin comprometer la calidad de impresión.`,
      (m, mod) => `${m} ${mod}: recarga tu impresora con tinta de alto rendimiento que mantiene la nitidez de cada página impresa.`,
    ],
    anotTemplates: [
      (m, mod, color) => `Tinta ${m} ${mod} en color ${color} con fórmula de alta densidad que garantiza colores vivos y textos definidos. Protege los cabezales de impresión y evita obstrucciones, prolongando la vida útil de tu equipo.`,
      (m, mod, color) => `Botella de tinta ${m} ${mod} ${color}: sistema de recarga pensado para ser limpio y rápido. Su formulación asegura secado instantáneo y resistencia a la decoloración.`,
      (m, mod, color) => `${m} ${mod} en tono ${color}, diseñada para impresiones que necesitan durabilidad y fidelidad cromática. Rinde más páginas por mililitro que alternativas económicas comunes.`,
    ],
    specs: [
      (mod, color, ml) => [`Modelo: ${mod}`, `Color: ${color}`, `Contenido: ${ml || '70ml'}`, 'Secado rápido', 'Compatible con sistema de tanque continuo'],
      (mod, color, ml) => [`Referencia: ${mod}`, `Tono: ${color}`, `Capacidad: ${ml || '70ml'}`, 'Fórmula antiderrame', 'Protege cabezales de impresión'],
    ]
  },

  // ---- IMPRESORAS ----
  impresora: {
    descTemplates: [
      (m, mod) => `Impresora ${m} ${mod} con velocidad y calidad de impresión profesional. Compacta y fácil de instalar en cualquier entorno.`,
      (m, mod) => `${m} ${mod}: impresora confiable para el uso diario en oficinas, comercios y hogares. Bajo costo operativo por página.`,
      (m, mod) => `Impresora ${m} ${mod} que combina rendimiento, durabilidad y facilidad de uso. Lista para conectar y empezar a imprimir.`,
    ],
    anotTemplates: [
      (m, mod) => `Impresora ${m} ${mod} diseñada para entornos que demandan impresiones rápidas y económicas. Su diseño compacto se adapta a escritorios pequeños y su bandeja de papel permite ciclos de trabajo sin interrupciones frecuentes.`,
      (m, mod) => `${m} ${mod} preparada para el volumen de trabajo diario de una oficina o comercio. Calidad de impresión consistente, gestión de insumos eficiente y mantenimiento mínimo.`,
    ]
  },

  // ---- CALCULADORAS ----
  calculadora: {
    descTemplates: [
      (m, mod) => `Calculadora ${m} ${mod} con pantalla amplia y teclas de respuesta rápida. Herramienta confiable para cálculos diarios.`,
      (m, mod) => `${m} ${mod}: calculadora de escritorio robusta y precisa, ideal para oficinas, comercios y profesionales contables.`,
      (m, mod) => `Calculadora ${m} ${mod} que simplifica operaciones numéricas con funciones prácticas y diseño compacto para cualquier escritorio.`,
    ],
    anotTemplates: [
      (m, mod) => `Calculadora ${m} ${mod} con teclas de plástico resistente y mecanismo de pulsación suave para un tipeo ágil. Pantalla de amplia visibilidad, alimentación dual solar y a pila para no quedarse sin carga.`,
      (m, mod) => `${m} ${mod}: diseñada para el uso profesional continuo. Funciones de porcentaje, gran total, corrección de dígitos y conversión impositiva, todo en un formato de escritorio práctico y elegante.`,
    ]
  },

  // ---- DISCOS ----
  disco: {
    descTemplates: [
      (tipo, cap) => `Disco ${tipo} de ${cap}: almacenamiento veloz y confiable para tu equipo. Mayor rendimiento y tiempos de carga reducidos.`,
      (tipo, cap) => `Unidad de almacenamiento ${tipo} ${cap} ideal para mejorar la velocidad de arranque y la respuesta general de tu PC o notebook.`,
      (tipo, cap) => `${tipo} de ${cap} que transforma la experiencia de uso de tu computadora con acceso instantáneo a archivos y programas.`,
    ],
    anotTemplates: [
      (tipo, cap) => `Disco ${tipo} de ${cap} que mejora notablemente los tiempos de lectura y escritura respecto a unidades mecánicas tradicionales. Ideal para instalar el sistema operativo, aplicaciones de oficina y guardar documentos de acceso frecuente.`,
      (tipo, cap) => `Unidad ${tipo} ${cap} con rendimiento optimizado para uso profesional. Sin partes móviles, lo que garantiza silencio total, menor consumo y mayor resistencia a golpes y vibraciones.`,
    ]
  },

  // ---- ROLLOS TÉRMICOS ----
  rollo: {
    descTemplates: [
      (med) => `Rollo térmico ${med} para impresoras de punto de venta y comanderas. Impresión nítida y papel de buena calidad.`,
      (med) => `Pack de rollos térmicos ${med}: papel blanco de alto contraste, ideal para tickets, recibos y comprobantes.`,
      (med) => `Rollos de papel térmico ${med} compatibles con la mayoría de impresoras térmicas del mercado. Larga duración de imagen.`,
    ],
    anotTemplates: [
      (med) => `Rollos térmicos ${med} fabricados con papel de buena opacidad y blancura que garantiza la legibilidad de tickets y recibos durante un tiempo prolongado. Compatibles con comanderas, balanzas e impresoras de punto de venta.`,
      (med) => `Pack de rollos ${med} pensado para comercios con alta rotación de tickets. El papel térmico asegura impresión sin tinta ni ribbon, reduciendo costos de operación y mantenimiento.`,
    ]
  },

  // ---- CABLES Y ENERGÍA ----
  cable: {
    descTemplates: [
      (nombre) => `${nombre}: conectividad segura y estable para tu equipo. Construcción resistente y conexiones firmes.`,
      (nombre) => `${nombre} de calidad certificada. Transmisión confiable y durabilidad probada en uso profesional continuo.`,
      (nombre) => `${nombre} que garantiza una conexión sólida entre tus dispositivos. Materiales de primera para un rendimiento óptimo.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} fabricado con materiales de alta calidad que aseguran una conexión estable y duradera. Ideal para entornos de oficina y comercio donde la confiabilidad es prioritaria.`,
      (nombre) => `${nombre} diseñado para el uso diario intensivo. Sus conectores reforzados y cable flexible resisten plegados frecuentes sin perder rendimiento.`,
    ]
  },

  // ---- CARPETAS Y ARCHIVOS ----
  carpeta: {
    descTemplates: [
      (nombre) => `${nombre} para organizar documentos de forma práctica y profesional. Material resistente de larga duración.`,
      (nombre) => `${nombre}: la solución ideal para mantener tu documentación en orden. Apta para uso escolar y de oficina.`,
      (nombre) => `${nombre} de calidad premium que protege tus papeles y facilita el archivo prolijo de información.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} fabricada con materiales resistentes que protegen tus documentos del deterioro cotidiano. Formato estándar que se adapta a cualquier estantería o archivero.`,
      (nombre) => `Organizá tu espacio de trabajo con ${nombre}. Diseño funcional, fácil identificación del contenido y capacidad adecuada para el volumen de papeles habitual.`,
    ]
  },

  // ---- PAPEL Y RESMAS ----
  papel: {
    descTemplates: [
      (nombre) => `${nombre} de alta blancura y suavidad. Rendimiento óptimo en impresoras láser e inkjet.`,
      (nombre) => `${nombre}: papel multiuso ideal para impresiones, fotocopias y presentaciones. Gramaje estándar 75g/m².`,
      (nombre) => `${nombre} que asegura una impresión limpia y sin atascos. Compatible con todo tipo de equipos de oficina.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} seleccionado para brindar resultados uniformes en cada impresión. Alta opacidad que evita la transparencia, ideal para impresión doble faz y documentos formales.`,
      (nombre) => `${nombre} certificado para uso en impresoras láser, inkjet y fotocopiadoras. Gramaje y corte precisos que minimizan los atascos y extienden la vida útil de tu equipo.`,
    ]
  },

  // ---- ETIQUETAS ----
  etiqueta: {
    descTemplates: [
      (nombre) => `${nombre} autoadhesiva de alta adherencia. Impresión nítida y corte preciso para un etiquetado profesional.`,
      (nombre) => `${nombre}: etiquetado rápido y prolijo para productos, envíos y archivos. Adhesivo permanente.`,
      (nombre) => `${nombre} compatible con impresoras y rotuladoras. Versatilidad para marcar, clasificar y organizar.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} con adhesivo de alta calidad que se fija firmemente sobre distintas superficies. Apta para impresión láser e inkjet, con bordes definidos y separación fácil.`,
      (nombre) => `${nombre} pensada para el etiquetado profesional en comercios, depósitos y oficinas. Resiste la manipulación diaria sin despegarse ni deteriorar la impresión.`,
    ]
  },

  // ---- BROCHES Y ABROCHADO ----
  broche: {
    descTemplates: [
      (nombre) => `${nombre}: insumo esencial de oficina de la mejor calidad. Resistencia y durabilidad en cada uso.`,
      (nombre) => `${nombre} fabricado con materiales de primera. Funcionamiento suave y resultados prolijos.`,
      (nombre) => `${nombre} ideal para el orden documental diario. Calidad profesional a precio accesible.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} de fabricación robusta para el uso intensivo que exige una oficina o un comercio. Cada unidad está diseñada para un rendimiento parejo y sin complicaciones.`,
      (nombre) => `${nombre} que simplifica el trabajo administrativo. Materiales que no se oxidan ni deterioran con el tiempo, manteniendo los documentos firmemente sujetos.`,
    ]
  },

  // ---- PUNTO DE VENTA (POS) ----
  pos: {
    descTemplates: [
      (nombre) => `${nombre} para punto de venta: rendimiento confiable en el mostrador de tu negocio. Instalación rápida.`,
      (nombre) => `${nombre}: solución profesional para el comercio minorista. Conectividad versátil y operación continua.`,
      (nombre) => `${nombre} robusto y funcional, diseñado para soportar el ritmo de atención diario en comercios y supermercados.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} optimizado para el entorno comercial donde la velocidad y la fiabilidad son clave. Compatible con los principales sistemas de facturación y punto de venta del mercado argentino.`,
      (nombre) => `${nombre} pensado para el despacho ágil en comercios. Construcción resistente al uso intensivo y mantenimiento sencillo para minimizar tiempos fuera de servicio.`,
    ]
  },

  // ---- CAJAS FUERTES ----
  caja_fuerte: {
    descTemplates: [
      (nombre) => `${nombre} con cerradura de seguridad y estructura de acero reforzado. Protección real para tus valores.`,
      (nombre) => `${nombre}: resguardá documentos, dinero y objetos importantes con total tranquilidad y acceso controlado.`,
      (nombre) => `${nombre} de alta seguridad para oficinas y comercios. Resistente al fuego y con anclaje a pared o piso.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} construida en acero de alto espesor con cerradura de combinación mecánica o digital. Ideal para resguardar efectivo, documentación sensible y objetos de valor en comercios y oficinas.`,
      (nombre) => `${nombre} diseñada para brindar máxima seguridad. Su peso y sistema de anclaje dificultan la remoción no autorizada, y su interior acolchado protege el contenido.`,
    ]
  },

  // ---- ESCRITURA ----
  escritura: {
    descTemplates: [
      (nombre) => `${nombre} de trazo suave y colores intensos. Instrumento de escritura pensado para uso escolar y profesional.`,
      (nombre) => `${nombre}: herramienta indispensable en cualquier escritorio. Punta precisa y tinta de larga duración.`,
      (nombre) => `${nombre} que destaca por su ergonomía y calidad de trazo. Ideal para escribir, señalar y resaltar.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} con tinta de secado rápido que no mancha y punta diseñada para un trazo uniforme. Cuerpo ergonómico que reduce la fatiga en sesiones largas de escritura.`,
      (nombre) => `${nombre} seleccionado por su rendimiento y durabilidad. Colores vivos que se mantienen en el tiempo, apto para papel, cartulina y distintas superficies de escritura.`,
    ]
  },

  // ---- MULTIMEDIA ----
  multimedia: {
    descTemplates: [
      (nombre) => `${nombre} con audio/video de calidad para videoconferencias, streaming y entretenimiento multimedia.`,
      (nombre) => `${nombre}: mejorá tu experiencia digital con sonido nítido e imagen definida. Plug and play.`,
      (nombre) => `${nombre} compatible con las principales plataformas. Instalación sencilla y rendimiento profesional.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} diseñado para cubrir las necesidades de comunicación y entretenimiento digital actuales. Compatible con Zoom, Meet, Teams y las principales aplicaciones de videoconferencia.`,
      (nombre) => `${nombre} que eleva la calidad de tus videollamadas y contenido multimedia. Conexión plug and play sin necesidad de drivers adicionales, compatible con Windows, Mac y Linux.`,
    ]
  },

  // ---- EQUIPOS (PC, Notebook, Tablet) ----
  equipo: {
    descTemplates: [
      (nombre) => `${nombre}: equipo informático listo para el trabajo y el estudio. Rendimiento y confiabilidad asegurados.`,
      (nombre) => `${nombre} preparado para las tareas cotidianas de oficina, navegación y productividad general.`,
      (nombre) => `${nombre} que ofrece la potencia necesaria para trabajar, estudiar y entretenerse sin límites.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} con las prestaciones necesarias para el uso profesional y educativo. Procesador eficiente, almacenamiento amplio y conectividad moderna para adaptarse a cualquier entorno.`,
      (nombre) => `${nombre} ideal para quienes necesitan un equipo confiable para el día a día. Diseño compacto, bajo consumo energético y compatibilidad con el software más utilizado.`,
    ]
  },

  // ---- RED (Router, AP, Switch) ----
  red: {
    descTemplates: [
      (nombre) => `${nombre}: conectividad WiFi/LAN estable y de alta velocidad para tu oficina o comercio.`,
      (nombre) => `${nombre} que potencia tu red local con cobertura amplia y gestión inteligente del tráfico.`,
      (nombre) => `${nombre} para una red confiable y segura. Configuración simple y rendimiento profesional.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} que garantiza una conexión estable para múltiples dispositivos simultáneos. Ideal para oficinas y comercios que dependen de internet para facturación, comunicación y operación diaria.`,
      (nombre) => `${nombre} con tecnología actualizada para entregar velocidad y cobertura en cada rincón de tu espacio de trabajo. Seguridad WPA3 y administración simplificada vía app o navegador.`,
    ]
  },

  // ---- PILAS Y BATERÍAS ----
  pila: {
    descTemplates: [
      (nombre) => `${nombre} de larga duración y rendimiento constante. Energía confiable para tus dispositivos.`,
      (nombre) => `${nombre}: la energía que necesitás, cuando la necesitás. Mayor duración por unidad.`,
      (nombre) => `${nombre} de alta performance para controles, teclados, linternas y dispositivos electrónicos.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} con tecnología de descarga progresiva que maximiza la vida útil en cada uso. Libre de mercurio y cadmio, segura para el medio ambiente y para almacenar sin riesgo.`,
      (nombre) => `${nombre} diseñada para ofrecer energía consistente desde la primera hasta la última hora de uso. Ideal tanto para dispositivos de alto consumo como para electrónicos de bajo drenaje.`,
    ]
  },

  // ---- DESTRUCTORA ----
  destructor: {
    descTemplates: [
      (nombre) => `${nombre} de corte cruzado que garantiza la destrucción segura de documentos confidenciales.`,
      (nombre) => `${nombre}: protección de datos e información sensible. Capacidad profesional para oficinas.`,
      (nombre) => `${nombre} silenciosa y eficiente, ideal para destruir papeles, tarjetas y CDs de forma irreversible.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} con motor potente y sistema de corte que convierte hojas enteras en partículas irrecuperables. Papelera de gran capacidad y sistema anti-atascos para uso continuo en oficinas.`,
      (nombre) => `${nombre} que cumple con los estándares de seguridad para la destrucción documental en entornos corporativos. Bajo nivel de ruido, fácil vaciado y protección contra sobrecalentamiento.`,
    ]
  },

  // ---- GENÉRICO ----
  generico: {
    descTemplates: [
      (nombre) => `${nombre}: producto de calidad para uso profesional y comercial. Diseñado para cubrir las necesidades del día a día.`,
      (nombre) => `${nombre} seleccionado por su confiabilidad y desempeño. Solución práctica para el entorno de trabajo.`,
      (nombre) => `${nombre} que combina funcionalidad y durabilidad. Opción inteligente para equipar tu oficina o comercio.`,
    ],
    anotTemplates: [
      (nombre) => `${nombre} es un producto pensado para el uso cotidiano en oficinas, comercios y espacios de trabajo. Ofrece desempeño estable y cumple con las expectativas de calidad que exige un entorno profesional.`,
      (nombre) => `Elegí ${nombre} para simplificar las tareas habituales de tu negocio u oficina. Probado en condiciones de uso real, entrega resultados consistentes y confiables a lo largo del tiempo.`,
    ]
  }
};

// ===================== FUNCIONES DE CLASIFICACIÓN =====================

function classifyProduct(desc) {
  const d = desc.toLowerCase().trim();
  
  if (d.match(/^mouse\b/i)) return 'mouse';
  if (d.match(/^teclado\b/i) || d.match(/^combo teclado/i)) return 'teclado';
  if (d.match(/^auric/i) || d.match(/^headset/i)) return 'auriculares';
  if (d.match(/^t[oó]ner\b/i) || d.match(/^drum\b/i) || d.match(/^polvo de t[oó]ner/i) || d.match(/^kit de mantenimiento/i) || d.match(/^unidad de imagen/i) || d.match(/^fotoconductor/i)) return 'toner';
  if (d.match(/^tinta\b/i) || d.match(/^cartucho\b/i) || d.match(/^botella de tinta/i)) return 'tinta';
  if (d.match(/^impresora\b/i) || d.match(/^comand/i) || d.match(/^kyocera\b/i) || d.match(/^multifunci[oó]n/i)) return 'impresora';
  if (d.match(/^casio\b/i) || d.match(/^cifra\b/i) || d.match(/^exaktus\b/i) || d.match(/^calculad/i) || d.match(/^orator/i) || d.match(/^keenly/i) || d.match(/^olivetti/i)) return 'calculadora';
  if (d.match(/^disco\b/i) || d.match(/^memoria\b/i) || d.match(/^microsd/i) || d.match(/^pendrive/i) || d.match(/^ssd\b/i)) return 'disco';
  if (d.match(/^rollo\b/i)) return 'rollo';
  if (d.match(/^cable\b/i) || d.match(/^adaptador\b/i) || d.match(/^cargador\b/i) || d.match(/^fuente\b/i) || d.match(/^zapatilla\b/i) || d.match(/^estabilizador\b/i) || d.match(/^ups\b/i)) return 'cable';
  if (d.match(/^carpeta\b/i) || d.match(/^sobre\b/i) || d.match(/^bibliorato\b/i) || d.match(/^folio\b/i)) return 'carpeta';
  if (d.match(/^resma\b/i) || d.match(/^papel\b/i) || d.match(/^hoja\b/i)) return 'papel';
  if (d.match(/^etiqueta\b/i) || d.match(/^cinta rotul/i)) return 'etiqueta';
  if (d.match(/^broche\b/i) || d.match(/^clip\b/i) || d.match(/^gramp/i) || d.match(/^abrochad/i) || d.match(/^perf[oó]rad/i)) return 'broche';
  if (d.match(/^lector\b/i) || d.match(/^caj[oó]n\b/i) || d.match(/^gaveta\b/i) || d.match(/^registradora\b/i)) return 'pos';
  if (d.match(/^caja fuerte/i) || d.match(/^tesoro\b/i) || d.match(/^cofre\b/i)) return 'caja_fuerte';
  if (d.match(/^l[aá]piz\b/i) || d.match(/^resaltador\b/i) || d.match(/^marcador\b/i) || d.match(/^corrector\b/i) || d.match(/^fibr[oó]n\b/i) || d.match(/^bol[ií]grafo\b/i)) return 'escritura';
  if (d.match(/^parlante\b/i) || d.match(/^webcam\b/i) || d.match(/^c[aá]mara\b/i)) return 'multimedia';
  if (d.match(/^notebook\b/i) || d.match(/^computadora\b/i) || d.match(/^tablet\b/i) || d.match(/^pc\b/i) || d.match(/^monitor\b/i)) return 'equipo';
  if (d.match(/^router\b/i) || d.match(/^access point/i) || d.match(/^switch\b/i) || d.match(/^placa de red/i)) return 'red';
  if (d.match(/^pila\b/i) || d.match(/^bater[ií]a\b/i)) return 'pila';
  if (d.match(/^destructor/i) || d.match(/^trituradora/i)) return 'destructor';
  
  return 'generico';
}

function extractBrand(desc) {
  const d = desc.trim();
  // Marcas ordenadas de más larga a más corta para evitar falsos positivos
  const brands = ['Faber Castell', 'TP-Link', 'Mercusys', 'Logitech', 'Genius', 'Energizer', 'Duracell', 'Panasonic', 'Hikvision', 'Verbatim', 'Exaktus', 'Needtek', 'Nataraj', 'Brother', 'Samsung', 'Kyocera', 'Olivetti', 'Stabilo', 'Pelikan', 'Sharpie', 'Dynapos', 'Daihatsu', 'Elicode', 'Pizzini', 'College', 'Bextra', 'Magnum', 'Husares', 'Ledesma', 'Philco', '3NSTAR', 'SAM4S', 'Zebra', 'Casio', 'Cifra', 'Epson', 'Xerox', 'Ricoh', 'Hasar', 'Maped', 'Kanex', 'Kretz', 'Alpha', 'Motex', 'Vapex', 'Kross', 'SIFAP', 'AMANO', 'Pantum', 'Keenly', 'Tesoro', 'Global', 'Report', 'Edding', 'Maruzen', 'BKT', 'NKT', 'HSM', 'TRV', 'BIC', 'HUS', 'HP', 'DASA', 'EZCO'];
  
  for (const b of brands) {
    // Usar word boundary para marcas de 2-3 caracteres
    if (b.length <= 3) {
      const re = new RegExp('\\b' + b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      if (re.test(d)) return b;
    } else {
      if (d.toUpperCase().includes(b.toUpperCase())) return b;
    }
  }
  return '';
}

function extractModel(desc, brand) {
  const d = desc.trim();
  // Intentar extraer modelo después de la marca
  if (brand) {
    const idx = d.toUpperCase().indexOf(brand.toUpperCase());
    if (idx >= 0) {
      const after = d.substring(idx + brand.length).trim();
      const modelMatch = after.match(/^[\-\s]*([A-Z0-9][\w\-\.\/]*)/i);
      if (modelMatch) return modelMatch[1].replace(/^[\-\s]+/, '');
    }
  }
  return '';
}

function extractColor(desc) {
  const d = desc.toLowerCase();
  if (d.includes('negr')) return 'Negro';
  if (d.includes('cyan') || d.includes('cian')) return 'Cyan';
  if (d.includes('magenta')) return 'Magenta';
  if (d.includes('amarill') || d.includes('yellow')) return 'Amarillo';
  if (d.includes('azul')) return 'Azul';
  if (d.includes('rojo') || d.includes('red')) return 'Rojo';
  if (d.includes('verde') || d.includes('green')) return 'Verde';
  if (d.includes('blanco') || d.includes('white')) return 'Blanco';
  if (d.includes('color')) return 'Color';
  return 'Negro';
}

// Limpiar nombre según reglas
function cleanName(desc) {
  let name = fixEncoding(desc.trim());
  
  // Remover espacios extras
  name = name.replace(/\s{2,}/g, ' ').trim();
  
  // Remover caracteres de control y espacios iniciales
  name = name.replace(/^\s+/, '');
  
  // Corregir duplicaciones como "NX-7000SEGENIUS NX-7000SE"
  name = name.replace(/(\w+GENIUS)\s+/i, ' ');
  if (name.match(/NX-7000SEGENIUS/i)) name = name.replace(/NX-7000SEGENIUS\s*NX-7000SE/i, 'NX-7000SE');
  if (name.match(/NX-7007GENIUS/i)) name = name.replace(/NX-7007GENIUS\s*NX-7007/i, 'NX-7007');
  
  // Quitar marcas de proveedor como "LEON", "BJ", "COPRINT", "GTC", etc del final/medio
  // Solo para toners y tintas
  const cat = classifyProduct(desc);
  if (cat === 'toner' || cat === 'tinta') {
    name = name.replace(/\b(LEON|BJ|COPRINT|GNEISS|GTC|GLOBAL|OFFICE|PREMIUM|BLOW INK|EVERTEC|AB|EVT?)\b/gi, '').trim();
    name = name.replace(/\bs\/GARANTIA\b/gi, '').trim();
    name = name.replace(/\bcon chip\b/gi, 'con Chip').trim();
    name = name.replace(/\bsin chip\b/gi, 'sin Chip').trim();
    name = name.replace(/\bnew chip\b/gi, 'Nuevo Chip').trim();
    name = name.replace(/\bNEW\s+CHIP\b/gi, 'Nuevo Chip').trim();
    name = name.replace(/\bNUEVO-EV\b/gi, 'Nuevo Chip').trim();
    name = name.replace(/\bCHIP NUEVO\b/gi, 'Nuevo Chip').trim();
    name = name.replace(/\bNEW\s*CHIP\b/gi, 'Nuevo Chip').trim();
  }
  
  // Remover guiones y espacios extra al final
  name = name.replace(/[\-\s]+$/, '').replace(/\s{2,}/g, ' ').trim();
  
  // Correcciones específicas de abreviaturas (ANTES de titleCase)
  name = name.replace(/\bNOT\.\s*/g, 'Notebook ');
  name = name.replace(/\bDDRR\b/gi, 'DDR');
  name = name.replace(/\bLEDES\b/gi, 'Ledesma');
  name = name.replace(/\bPUNAX\b/gi, 'Punax');
  name = name.replace(/\bAUTOR\b/gi, 'Autor');
  name = name.replace(/\bImpresos LASER\b/gi, 'Impresora Láser');
  name = name.replace(/\bMEM\.\s*/gi, 'Memoria ');
  name = name.replace(/\bDIV\./gi, 'Divisiones');
  name = name.replace(/\bDIV\b/gi, 'Divisiones');
  name = name.replace(/\bELABOR-VENACI/gi, 'Elaboración-Vencimiento');
  name = name.replace(/\bElab\/vencimie\b/gi, 'Elaboración/Vencimiento');
  name = name.replace(/\bMONEDERA\b/gi, 'Monedera');
  name = name.replace(/\b46 B\b/gi, '4GB');
  name = name.replace(/\bINOX\b/gi, 'Inoxidable');
  name = name.replace(/\bTERM\b/gi, 'Térmico');
  name = name.replace(/\bETIQ\b/gi, 'Etiqueta');
  name = name.replace(/\bBAL\./gi, 'Balanza ');
  name = name.replace(/\bROTUL\b/gi, 'Rotuladora');
  name = name.replace(/\s{2,}/g, ' ').trim();
  
  // Title Case si la mayoría de letras están en MAYUSCULAS (>60%)
  const alphaChars = name.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ]/g, '');
  const upperCount = (alphaChars.match(/[A-ZÁÉÍÓÚÑ]/g) || []).length;
  if (alphaChars.length > 3 && upperCount / alphaChars.length > 0.5) {
    name = titleCase(name);
  }
  
  return name;
}

// Generar placeholder image URL
function generatePlaceholder(cleanedName) {
  // Tomar las primeras palabras significativas
  const words = cleanedName.split(/[\s\-]+/).filter(w => w.length > 1).slice(0, 4);
  const text = words.join('+');
  return `https://placehold.co/1200x1200/png?text=${encodeURIComponent(words.join(' '))}`;
}

// Escapar para SQL (preserva \n como secuencia de escape MySQL para newline)
function sqlEscape(str) {
  // Primero escapar comillas simples
  let result = str.replace(/'/g, "''");
  // NO escapar backslashes de \n - MySQL los interpreta como newlines
  return result;
}

// Contador global para variar templates
let templateCounter = 0;

function pickTemplate(templates) {
  const idx = templateCounter % templates.length;
  templateCounter++;
  return templates[idx];
}

// ===================== GENERADOR PRINCIPAL =====================

function generateUpdate(linea, rubro, codigo, descOriginal, imgLen) {
  const cleanedName = cleanName(descOriginal);
  const category = classifyProduct(cleanedName);
  const brand = extractBrand(cleanedName);
  const model = extractModel(cleanedName, brand);
  
  // Imagen
  let imagenSQL;
  if (parseInt(imgLen) > 10) {
    imagenSQL = null; // Ya tiene imagen, no cambiar
  } else {
    imagenSQL = generatePlaceholder(cleanedName);
  }
  
  // Generar descripcion adicional y anotaciones según categoría
  let descAdicional, anotaciones;
  const m = brand || 'Genérica';
  const mod = model || cleanedName.split(' ').slice(1).join(' ');
  
  const db = productDB[category] || productDB.generico;
  
  switch (category) {
    case 'mouse': {
      const con = descOriginal.toLowerCase().includes('inal') ? 'Inalámbrica 2.4GHz' : 'USB';
      descAdicional = pickTemplate(db.descTemplates)(m, mod);
      const anotT = pickTemplate(db.anotTemplates);
      const specT = pickTemplate(db.specs);
      anotaciones = anotT(m, mod, con) + '\\n\\n' + specT(con).join('\\n');
      break;
    }
    case 'teclado': {
      const con = descOriginal.toLowerCase().includes('inal') ? 'Inalámbrica 2.4GHz' : 'USB';
      descAdicional = pickTemplate(db.descTemplates)(m, mod);
      const anotT = pickTemplate(db.anotTemplates);
      const specT = pickTemplate(db.specs);
      anotaciones = anotT(m, mod, con) + '\\n\\n' + specT(con).join('\\n');
      break;
    }
    case 'auriculares': {
      descAdicional = pickTemplate(db.descTemplates)(m, mod);
      const anotT = pickTemplate(db.anotTemplates);
      const specT = pickTemplate(db.specs);
      anotaciones = anotT(m, mod) + '\\n\\n' + specT().join('\\n');
      break;
    }
    case 'toner': {
      const color = extractColor(descOriginal);
      descAdicional = pickTemplate(db.descTemplates)(m, mod);
      const anotT = pickTemplate(db.anotTemplates);
      const specT = pickTemplate(db.specs);
      anotaciones = anotT(m, mod, '') + '\\n\\n' + specT(mod, 'estándar', color).join('\\n');
      break;
    }
    case 'tinta': {
      const color = extractColor(descOriginal);
      descAdicional = pickTemplate(db.descTemplates)(m, mod);
      const anotT = pickTemplate(db.anotTemplates);
      const specT = pickTemplate(db.specs);
      anotaciones = anotT(m, mod, color) + '\\n\\n' + specT(mod, color, '70ml').join('\\n');
      break;
    }
    case 'impresora': {
      descAdicional = pickTemplate(db.descTemplates)(m, mod);
      const anotT = pickTemplate(db.anotTemplates);
      anotaciones = anotT(m, mod) + '\\n\\n' + [
        `Marca: ${m}`, `Modelo: ${mod || cleanedName}`,
        'Conexión: USB', 'Ideal para oficinas y comercios',
        'Bajo costo operativo por página'
      ].join('\\n');
      break;
    }
    case 'calculadora': {
      descAdicional = pickTemplate(db.descTemplates)(m, mod);
      const anotT = pickTemplate(db.anotTemplates);
      anotaciones = anotT(m, mod) + '\\n\\n' + [
        `Marca: ${m}`, `Modelo: ${mod || 'escritorio'}`,
        'Alimentación: Solar + pila', 'Pantalla de amplia visibilidad',
        'Funciones: porcentaje, raíz, gran total'
      ].join('\\n');
      break;
    }
    case 'disco': {
      const tipo = cleanedName.toUpperCase().includes('SSD') ? 'SSD' : 
                   cleanedName.toUpperCase().includes('MECANICO') ? 'Mecánico' :
                   cleanedName.toUpperCase().includes('MICRO') ? 'MicroSD' :
                   cleanedName.toUpperCase().includes('PENDRIVE') ? 'Pendrive' : 'Almacenamiento';
      const capMatch = cleanedName.match(/(\d+)\s*(GB|TB|gb|tb)/i);
      const cap = capMatch ? capMatch[1] + capMatch[2].toUpperCase() : '';
      descAdicional = pickTemplate(db.descTemplates)(tipo, cap || 'capacidad estándar');
      const anotT = pickTemplate(db.anotTemplates);
      anotaciones = anotT(tipo, cap || 'capacidad estándar') + '\\n\\n' + [
        `Tipo: ${tipo}`, `Capacidad: ${cap || 'según modelo'}`,
        'Instalación sencilla', 'Compatible con PC y Notebook',
        'Mejora tiempos de respuesta del sistema'
      ].join('\\n');
      break;
    }
    case 'rollo': {
      const medMatch = cleanedName.match(/(\d+)\s*[xX]\s*(\d+)/);
      const med = medMatch ? `${medMatch[1]}x${medMatch[2]}mm` : 'estándar';
      descAdicional = pickTemplate(db.descTemplates)(med);
      const anotT = pickTemplate(db.anotTemplates);
      anotaciones = anotT(med) + '\\n\\n' + [
        `Medida: ${med}`, 'Tipo: Papel térmico',
        'Compatible con comanderas e impresoras POS',
        'Alta blancura y contraste', 'Larga conservación de imagen'
      ].join('\\n');
      break;
    }
    // Nuevas categorías: todas usan templates de nombre simple
    case 'cable':
    case 'carpeta':
    case 'papel':
    case 'etiqueta':
    case 'broche':
    case 'pos':
    case 'caja_fuerte':
    case 'escritura':
    case 'multimedia':
    case 'equipo':
    case 'red':
    case 'pila':
    case 'destructor': {
      descAdicional = pickTemplate(db.descTemplates)(cleanedName);
      const anotT = pickTemplate(db.anotTemplates);
      anotaciones = anotT(cleanedName) + '\\n\\n' + [
        `Producto: ${cleanedName}`,
        brand ? `Marca: ${brand}` : 'Calidad verificada',
        'Uso profesional y comercial'
      ].join('\\n');
      break;
    }
    default: {
      descAdicional = pickTemplate(db.descTemplates)(cleanedName);
      const anotT = pickTemplate(db.anotTemplates);
      anotaciones = anotT(cleanedName) + '\\n\\n' + [
        `Producto: ${cleanedName}`,
        'Uso profesional y comercial',
        'Calidad verificada'
      ].join('\\n');
      break;
    }
  }
  
  // Truncar a límites de campo
  if (descAdicional.length > 4096) descAdicional = descAdicional.substring(0, 4090) + '...';
  if (anotaciones.length > 2000) anotaciones = anotaciones.substring(0, 1994) + '...';
  if (cleanedName.length > 60) {
    // Truncar nombre inteligentemente
    const truncated = cleanedName.substring(0, 57) + '...';
    // O mejor: acortar quitando palabras del final
  }
  
  const finalName = cleanedName.length > 60 ? cleanedName.substring(0, 60) : cleanedName;
  
  // Construir SQL
  let sql = `UPDATE articulos SET\n`;
  sql += `  descripcion = '${sqlEscape(finalName)}',\n`;
  sql += `  descripcionAdicional = '${sqlEscape(descAdicional)}',\n`;
  if (imagenSQL !== null) {
    sql += `  imagen = '${sqlEscape(imagenSQL)}',\n`;
  }
  sql += `  anotaciones = '${sqlEscape(anotaciones)}'\n`;
  sql += `WHERE linea = '${sqlEscape(linea)}' AND rubro = '${sqlEscape(rubro)}' AND codigo = '${sqlEscape(codigo)}';\n`;
  
  return sql;
}

// ===================== EJECUCIÓN PRINCIPAL =====================

const tsvPath = path.join(__dirname, 'productos_full.tsv');
const lines = fs.readFileSync(tsvPath, 'utf8').split('\n').filter(l => l.trim() && l.includes('\t'));

console.log(`Leyendo ${lines.length} productos...`);

const BATCH_SIZE = 50;
let batchNum = 1;
let batchSQL = [];
let totalProcessed = 0;

// Header para cada archivo
const BOM = '\uFEFF'; // UTF-8 BOM marker
const header = BOM + '-- ============================================================\n'
  + '-- SCRIPT DE LIMPIEZA DE ARTICULOS - GENERADO AUTOMATICAMENTE\n'
  + '-- Fecha: ' + new Date().toISOString().split('T')[0] + '\n'
  + '-- NO EJECUTAR SIN REVISAR PRIMERO\n'
  + '-- ============================================================\n\n'
  + 'SET NAMES utf8mb4;\n\n';

for (let i = 0; i < lines.length; i++) {
  const parts = lines[i].split('\t');
  if (parts.length < 6) continue;
  
  const [linea, rubro, codigo, desc, imgLen, vis] = parts;
  
  try {
    const sql = generateUpdate(linea.trim(), rubro.trim(), codigo.trim(), desc.trim(), imgLen.trim());
    batchSQL.push(`-- [${totalProcessed + 1}] Original: ${desc.trim().substring(0, 50)}\n${sql}`);
    totalProcessed++;
  } catch (e) {
    console.error(`Error en COD ${codigo}: ${e.message}`);
    batchSQL.push(`-- ERROR en COD ${codigo}: ${desc}\n`);
    totalProcessed++;
  }
  
  // Escribir lote
  if (batchSQL.length >= BATCH_SIZE || i === lines.length - 1) {
    const filename = `update_lote_${String(batchNum).padStart(2, '0')}.sql`;
    const filepath = path.join(__dirname, filename);
    const content = header + 
      `-- LOTE ${batchNum} (productos ${totalProcessed - batchSQL.length + 1} a ${totalProcessed})\n\n` +
      batchSQL.join('\n');
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`  ${filename} -> ${batchSQL.length} updates`);
    batchSQL = [];
    batchNum++;
  }
}

console.log(`\nFinalizado: ${totalProcessed} productos procesados en ${batchNum - 1} archivos.`);
