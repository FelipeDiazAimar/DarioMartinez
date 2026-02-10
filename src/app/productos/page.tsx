'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Calculator,
  Cpu,
  Package,
  Printer,
  ScanLine,
  ShieldCheck,
  Wrench,
  Laptop,
  Briefcase,
  FileText,
  Zap,
  Hand,
  Activity,
  Sigma,
  Search,
  X,
  History,
  ChevronLeft,
  ChevronRight,
  Network,
  Waypoints,
  PlugZap,
  Wifi,
  Bluetooth,
  Usb,
  Square,
  MousePointer2,
  Gamepad2,
  Keyboard,
  Type,
  Rss,
  Mouse,
  MousePointerClick,
  Cable,
  Camera,
  Video,
  Monitor,
  Plus,
  Router as RouterIcon,
  Signal,
  Home,
  Backpack,
  Headphones,
  Mic,
  Landmark,
  Scan,
  RectangleHorizontal,
  Expand,
  Copy,
  Scale,
  Check,
  Armchair,
  UserCheck,
  Spline,
  Paperclip,
  Stamp,
  Paintbrush,
  Droplets,
  Replace,
  Lock,
  Key,
  HardDrive,
  Save,
  Plug,
  MemoryStick,
  Chip,
  FunctionSquare,
  FlaskConical,
  Book,
  PenLine,
  Clipboard,
  Shield,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const allProducts = [
  {
    imageId: 'stationery',
    title: 'Artículos de Librería',
    description: 'Resmas de papel, cuadernos, bolígrafos y más.',
    details: [
      {
        icon: <Book className="h-5 w-5 text-primary" />,
        text: 'Cuadernos, blocks de notas y agendas de distintos tamaños y formatos.',
      },
      {
        icon: <PenLine className="h-5 w-5 text-primary" />,
        text: 'Bolígrafos, lápices, marcadores y todo para la escritura.',
      },
      {
        icon: <Clipboard className="h-5 w-5 text-primary" />,
        text: 'Papelería comercial, resmas de papel y cartulinas.',
      },
    ],
  },
  {
    imageId: 'headphones',
    title: 'Auriculares y Micrófonos',
    description: 'Audio de alta calidad para música, gaming y llamadas.',
    details: [
      {
        icon: <Headphones className="h-5 w-5 text-primary" />,
        text: 'Auriculares con y sin cable, in-ear, on-ear y over-ear.',
      },
      {
        icon: <Gamepad2 className="h-5 w-5 text-primary" />,
        text: 'Headsets para gaming con sonido envolvente y micrófono integrado.',
      },
      {
        icon: <Mic className="h-5 w-5 text-primary" />,
        text: 'Micrófonos de escritorio y de solapa para streaming y conferencias.',
      },
    ],
  },
  {
    imageId: 'electronic-scales',
    title: 'Balanzas Electrónicas',
    description: 'Balanzas comerciales homologadas para pesar con precisión.',
    details: [
      {
        icon: <Scale className="h-5 w-5 text-primary" />,
        text: 'Balanzas para comercios con cálculo de precio e importe.',
      },
      {
        icon: <Printer className="h-5 w-5 text-primary" />,
        text: 'Modelos con impresor de etiquetas de código de barras y QR.',
      },
      {
        icon: <Check className="h-5 w-5 text-primary" />,
        text: 'Homologadas y certificadas para uso comercial.',
      },
    ],
  },
  {
    imageId: 'cables',
    title: 'Cables y Conectividad',
    description: 'HDMI, USB, VGA, red y todo tipo de cables que necesites.',
    details: [
      {
        icon: <Cable className="h-5 w-5 text-primary" />,
        text: 'Cables de video: HDMI, DisplayPort, VGA, DVI en todas las longitudes.',
      },
      {
        icon: <Usb className="h-5 w-5 text-primary" />,
        text: 'Cables USB de todo tipo: A, B, C, micro, mini, y extensiones.',
      },
      {
        icon: <Plug className="h-5 w-5 text-primary" />,
        text: 'Cables de alimentación, audio, y de red (patch cords).',
      },
    ],
  },
  {
    imageId: 'safes',
    title: 'Cajas Fuertes',
    description: 'Protege tu dinero y documentos importantes.',
    details: [
      {
        icon: <Lock className="h-5 w-5 text-primary" />,
        text: 'Cajas de seguridad con cerradura electrónica, a llave o combinadas.',
      },
      {
        icon: <ShieldCheck className="h-5 w-5 text-primary" />,
        text: 'Distintos tamaños y niveles de seguridad para hogar y comercio.',
      },
      {
        icon: <Key className="h-5 w-5 text-primary" />,
        text: 'Modelos para amurar, de sobreponer y con ranura buzón.',
      },
    ],
  },
  {
    imageId: 'cash-registers',
    title: 'Cajas Registradoras',
    description: 'Control fiscal y de ventas para tu comercio.',
    details: [
      {
        icon: <Landmark className="h-5 w-5 text-primary" />,
        text: 'Registradoras fiscales homologadas por AFIP.',
      },
      {
        icon: <Scan className="h-5 w-5 text-primary" />,
        text: 'Modelos alfanuméricos con control de stock y reportes Z.',
      },
      {
        icon: <Printer className="h-5 w-5 text-primary" />,
        text: 'Servicio de inicialización y programación.',
      },
    ],
  },
  {
    imageId: 'calculator',
    title: 'Calculadoras Comerciales',
    description: 'Calculadoras con impresor y funciones comerciales.',
    details: [
      {
        icon: <Calculator className="h-5 w-5 text-primary" />,
        text: 'Calculadoras comerciales y de escritorio para el día a día.',
      },
      {
        icon: <Printer className="h-5 w-5 text-primary" />,
        text: 'Modelos con rollo de papel para un registro físico de tus operaciones.',
      },
      {
        icon: <Sigma className="h-5 w-5 text-primary" />,
        text: 'Funciones de cálculo de impuestos, costo, venta y margen.',
      },
    ],
  },
  {
    imageId: 'scientific-calculator',
    title: 'Calculadoras Científicas',
    description: 'Funciones avanzadas para estudiantes y profesionales.',
    details: [
      {
        icon: <Sigma className="h-5 w-5 text-primary" />,
        text: 'Calculadoras con cientos de funciones científicas y estadísticas.',
      },
      {
        icon: <FunctionSquare className="h-5 w-5 text-primary" />,
        text: 'Modelos programables y graficadores para carreras técnicas.',
      },
      {
        icon: <FlaskConical className="h-5 w-5 text-primary" />,
        text: 'Las marcas líderes del mercado: Casio, HP y más.',
      },
    ],
  },
  {
    imageId: 'webcams',
    title: 'Cámaras Web',
    description: 'Video en alta definición para streaming y videollamadas.',
    details: [
      {
        icon: <Camera className="h-5 w-5 text-primary" />,
        text: 'Cámaras HD, Full HD y 4K para una imagen nítida.',
      },
      {
        icon: <Video className="h-5 w-5 text-primary" />,
        text: 'Ideales para teletrabajo, clases online, streaming y creación de contenido.',
      },
      {
        icon: <Mic className="h-5 w-5 text-primary" />,
        text: 'Modelos con micrófono incorporado y enfoque automático.',
      },
    ],
  },
  {
    imageId: 'printer-toner',
    title: 'Cartuchos y Toners',
    description: 'Consumibles originales y alternativos para todas las marcas.',
    details: [
      {
        icon: <Paintbrush className="h-5 w-5 text-primary" />,
        text: 'Amplio stock de cartuchos de tinta y toners para impresoras.',
      },
      {
        icon: <Droplets className="h-5 w-5 text-primary" />,
        text: 'Trabajamos con todas las marcas: HP, Epson, Brother, Canon, etc.',
      },
      {
        icon: <Replace className="h-5 w-5 text-primary" />,
        text: 'Opciones originales y alternativas de alta calidad y rendimiento.',
      },
    ],
  },
  {
    imageId: 'ticket-printer',
    title: 'Comanderas y Ticketeadoras',
    description:
      'Impresoras térmicas para comandas, recibos y tickets no fiscales.',
    details: [
      {
        icon: <Printer className="h-5 w-5 text-primary" />,
        text: 'Impresoras térmicas de alta velocidad para puntos de venta y cocinas.',
      },
      {
        icon: <FileText className="h-5 w-5 text-primary" />,
        text: 'Ideales para emitir comandas, tickets no fiscales, recibos y resúmenes.',
      },
      {
        icon: <Zap className="h-5 w-5 text-primary" />,
        text: 'Fáciles de instalar y compatibles con los principales sistemas de gestión.',
      },
    ],
  },
  {
    imageId: 'pc-components',
    title: 'Componentes de PC',
    description: 'Procesadores, motherboards, memorias, fuentes y más.',
    details: [
      {
        icon: <Cpu className="h-5 w-5 text-primary" />,
        text: 'Procesadores Intel y AMD, placas madre, memorias RAM.',
      },
      {
        icon: <HardDrive className="h-5 w-5 text-primary" />,
        text: 'Discos SSD y HDD, placas de video, fuentes de alimentación.',
      },
      {
        icon: <Package className="h-5 w-5 text-primary" />,
        text: 'Gabinetes, coolers y todo para armar o actualizar tu PC.',
      },
    ],
  },
  {
    imageId: 'fiscal-printer',
    title: 'Impresoras Fiscales',
    description:
      'Modelos homologados por AFIP para cumplir con todas las normativas vigentes.',
    details: [
      {
        icon: <Printer className="h-5 w-5 text-primary" />,
        text: 'Equipos fiscales de 1ra y 2da generación, para todo volumen de facturación.',
      },
      {
        icon: <ShieldCheck className="h-5 w-5 text-primary" />,
        text: 'Homologados por AFIP, garantizando cumplimiento y transacciones seguras.',
      },
      {
        icon: <Wrench className="h-5 w-5 text-primary" />,
        text: 'Servicio técnico integral: inicialización, mantenimiento y reparaciones.',
      },
    ],
  },
  {
    imageId: 'printers',
    title: 'Impresoras Multifunción',
    description: 'Imprime, escanea y copia con un solo equipo. Tinta y láser.',
    details: [
      {
        icon: <Printer className="h-5 w-5 text-primary" />,
        text: 'Equipos inkjet y láser, monocromáticos y a color.',
      },
      {
        icon: <Scan className="h-5 w-5 text-primary" />,
        text: 'Funciones de impresión, copiado y escaneo en un solo dispositivo.',
      },
      {
        icon: <Copy className="h-5 w-5 text-primary" />,
        text: 'Modelos con conectividad WiFi y sistemas de tinta continua.',
      },
    ],
  },
  {
    imageId: 'office-supplies',
    title: 'Insumos para Oficina',
    description: 'Todo lo que necesitás para el día a día de tu oficina.',
    details: [
      {
        icon: <Paperclip className="h-5 w-5 text-primary" />,
        text: 'Artículos de librería, resmas de papel, carpetas y archivos.',
      },
      {
        icon: <Stamp className="h-5 w-5 text-primary" />,
        text: 'Abrochadoras, perforadoras y todo para la organización de documentos.',
      },
      {
        icon: <FileText className="h-5 w-5 text-primary" />,
        text: 'Rollos de papel para ticketeadoras y calculadoras.',
      },
    ],
  },
  {
    imageId: 'keyboards',
    title: 'Teclados',
    description: 'Mecánicos, de membrana, ergonómicos e inalámbricos.',
    details: [
      {
        icon: <Keyboard className="h-5 w-5 text-primary" />,
        text: 'Teclados para oficina, gaming y uso general.',
      },
      {
        icon: <Type className="h-5 w-5 text-primary" />,
        text: 'Modelos mecánicos, de membrana, con y sin pad numérico.',
      },
      {
        icon: <Rss className="h-5 w-5 text-primary" />,
        text: 'Opciones con cable USB o inalámbricos por Bluetooth o radiofrecuencia.',
      },
    ],
  },
  {
    imageId: 'barcode-scanner',
    title: 'Lectores de Códigos de Barra',
    description: 'Agilizá tus ventas y control de stock con lectores láser y 2D.',
    details: [
      {
        icon: <ScanLine className="h-5 w-5 text-primary" />,
        text: 'Lectores 1D y 2D (QR) para agilizar el cobro y la gestión de inventario.',
      },
      {
        icon: <Hand className="h-5 w-5 text-primary" />,
        text: 'Modelos de mano con cable, inalámbricos y fijos de mostrador.',
      },
      {
        icon: <Activity className="h-5 w-5 text-primary" />,
        text: 'Lectura rápida y precisa, incluso en códigos dañados o de baja calidad.',
      },
    ],
  },
  {
    imageId: 'mice',
    title: 'Mouses',
    description: 'Ópticos, láser, gamers y ergonómicos para cada necesidad.',
    details: [
      {
        icon: <Mouse className="h-5 w-5 text-primary" />,
        text: 'Mouses ópticos y láser para todo tipo de superficies.',
      },
      {
        icon: <MousePointerClick className="h-5 w-5 text-primary" />,
        text: 'Diseños ergonómicos para prevenir lesiones y mejorar la comodidad.',
      },
      {
        icon: <Gamepad2 className="h-5 w-5 text-primary" />,
        text: 'Modelos para gaming con alta precisión (DPI) y botones programables.',
      },
    ],
  },
  {
    imageId: 'tech-backpacks',
    title: 'Mochilas para Notebooks',
    description: 'Transportá tus equipos de forma segura y con estilo.',
    details: [
      {
        icon: <Backpack className="h-5 w-5 text-primary" />,
        text: 'Mochilas y maletines con compartimento acolchado para notebooks.',
      },
      {
        icon: <Laptop className="h-5 w-5 text-primary" />,
        text: 'Disponibles en varios tamaños para distintos modelos de laptops.',
      },
      {
        icon: <Shield className="h-5 w-5 text-primary" />,
        text: 'Materiales resistentes y diseños ergonómicos para mayor comodidad.',
      },
    ],
  },
  {
    imageId: 'monitors',
    title: 'Monitores',
    description: 'Pantallas Full HD y 4K para trabajo, diseño y gaming.',
    details: [
      {
        icon: <Monitor className="h-5 w-5 text-primary" />,
        text: 'Monitores LED y IPS de diferentes tamaños y resoluciones (HD, FHD, 4K).',
      },
      {
        icon: <RectangleHorizontal className="h-5 w-5 text-primary" />,
        text: 'Modelos para gaming con alta tasa de refresco y bajo tiempo de respuesta.',
      },
      {
        icon: <Expand className="h-5 w-5 text-primary" />,
        text: 'Opciones con diferentes tipos de conexión: HDMI, DisplayPort, VGA.',
      },
    ],
  },
  {
    imageId: 'mousepads',
    title: 'Mousepads',
    description: 'Superficies optimizadas para precisión y comodidad.',
    details: [
      {
        icon: <Square className="h-5 w-5 text-primary" />,
        text: 'Mousepads de tela, rígidos y con reposamuñecas de gel.',
      },
      {
        icon: <MousePointer2 className="h-5 w-5 text-primary" />,
        text: 'Superficies diseñadas para un deslizamiento suave y preciso del mouse.',
      },
      {
        icon: <Gamepad2 className="h-5 w-5 text-primary" />,
        text: 'Modelos extendidos (XL y XXL) que cubren todo el escritorio.',
      },
    ],
  },
  {
    imageId: 'notebook',
    title: 'Notebooks',
    description:
      'Las mejores marcas y modelos para trabajar o estudiar desde donde quieras.',
    details: [
      {
        icon: <Laptop className="h-5 w-5 text-primary" />,
        text: 'Amplia variedad de las mejores marcas: HP, Dell, Lenovo, Asus y más.',
      },
      {
        icon: <Briefcase className="h-5 w-5 text-primary" />,
        text: 'Modelos para trabajo, estudio, diseño o gaming, adaptados a tu movilidad.',
      },
      {
        icon: <ShieldCheck className="h-5 w-5 text-primary" />,
        text: 'Garantía oficial y nuestro respaldo técnico especializado.',
      },
    ],
  },
  {
    imageId: 'usb-drives',
    title: 'Pendrives y Almacenamiento',
    description: 'Memorias USB y discos externos para tus archivos.',
    details: [
      {
        icon: <Usb className="h-5 w-5 text-primary" />,
        text: 'Pendrives de distintas capacidades y velocidades (USB 2.0, 3.0, 3.1).',
      },
      {
        icon: <HardDrive className="h-5 w-5 text-primary" />,
        text: 'Discos duros externos (HDD y SSD) para backups y almacenamiento masivo.',
      },
      {
        icon: <Save className="h-5 w-5 text-primary" />,
        text: 'Tarjetas de memoria (SD y microSD) para cámaras y celulares.',
      },
    ],
  },
  {
    imageId: 'network-cards',
    title: 'Placas de Red',
    description: 'Añade o mejora la conexión a internet de tu PC.',
    details: [
      {
        icon: <Network className="h-5 w-5 text-primary" />,
        text: 'Placas de red PCI Express para conexión por cable Ethernet.',
      },
      {
        icon: <Wifi className="h-5 w-5 text-primary" />,
        text: 'Placas de red WiFi para conectar tu PC de escritorio de forma inalámbrica.',
      },
      {
        icon: <Plus className="h-5 w-5 text-primary" />,
        text: 'Modelos con las últimas tecnologías para mayor velocidad y estabilidad.',
      },
    ],
  },
  {
    imageId: 'routers',
    title: 'Routers y Repetidores',
    description: 'Mejora la cobertura y velocidad de tu señal WiFi.',
    details: [
      {
        icon: <RouterIcon className="h-5 w-5 text-primary" />,
        text: 'Routers neutros para gestionar tu red y mejorar el rendimiento.',
      },
      {
        icon: <Signal className="h-5 w-5 text-primary" />,
        text: 'Repetidores y extensores de rango para eliminar zonas sin WiFi.',
      },
      {
        icon: <Home className="h-5 w-5 text-primary" />,
        text: 'Sistemas Mesh para una cobertura total y sin interrupciones en casas grandes.',
      },
    ],
  },
  {
    imageId: 'office-chairs',
    title: 'Sillas de Escritorio',
    description: 'Sillas ergonómicas para cuidar tu postura durante el trabajo.',
    details: [
      {
        icon: <Armchair className="h-5 w-5 text-primary" />,
        text: 'Sillas gerenciales y operativas con múltiples ajustes.',
      },
      {
        icon: <UserCheck className="h-5 w-5 text-primary" />,
        text: 'Diseños ergonómicos con soporte lumbar, apoyabrazos y apoyacabeza.',
      },
      {
        icon: <Spline className="h-5 w-5 text-primary" />,
        text: 'Sillas gamer para largas sesiones de juego con máximo confort.',
      },
    ],
  },
  {
    imageId: 'network-switch',
    title: 'Switches de Red',
    description: 'Expande tu red cableada de forma rápida y eficiente.',
    details: [
      {
        icon: <Network className="h-5 w-5 text-primary" />,
        text: 'Switches de 5, 8, 16 y 24 puertos para redes domésticas y de oficina.',
      },
      {
        icon: <Waypoints className="h-5 w-5 text-primary" />,
        text: 'Multiplica los puntos de conexión de tu red cableada fácilmente.',
      },
      {
        icon: <PlugZap className="h-5 w-5 text-primary" />,
        text: 'Modelos no administrables (plug and play) y administrables.',
      },
    ],
  },
  {
    imageId: 'usb-adapters',
    title: 'Adaptadores USB WiFi/Bluetooth',
    description: 'Conectividad inalámbrica para cualquier equipo.',
    details: [
      {
        icon: <Wifi className="h-5 w-5 text-primary" />,
        text: 'Adaptadores USB para agregar conectividad WiFi a PCs de escritorio.',
      },
      {
        icon: <Bluetooth className="h-5 w-5 text-primary" />,
        text: 'Dongles Bluetooth para conectar periféricos inalámbricos.',
      },
      {
        icon: <Usb className="h-5 w-5 text-primary" />,
        text: 'Fáciles de instalar y compatibles con todos los sistemas operativos.',
      },
    ],
  },
];

const ITEMS_PER_PAGE = 12;

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= half + 1) {
        for (let i = 1; i <= maxPagesToShow - 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - half) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - (maxPagesToShow - 2); i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-12">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {getPageNumbers().map((page, index) =>
        typeof page === 'number' ? (
          <Button
            key={index}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPageChange(page)}
            className="rounded-full"
          >
            {page}
          </Button>
        ) : (
          <span key={index} className="px-1 text-muted-foreground">
            ...
          </span>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function ProductosPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  const [openItemId, setOpenItemId] = React.useState<string | null>(null);

  const searchTerm = searchParams.get('q') || '';
  const sortOrder = searchParams.get('sort') || 'a-z';
  const currentPage = Number(searchParams.get('page') || '1');

  const [inputValue, setInputValue] = React.useState(searchTerm);
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('productSearchHistory');
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to parse search history from localStorage', error);
    }
  }, []);

  const updateSearchHistory = React.useCallback((term: string) => {
    if (!term.trim()) return;
    try {
      const storedHistory = localStorage.getItem('productSearchHistory');
      let history: string[] = storedHistory ? JSON.parse(storedHistory) : [];
      history = [
        term,
        ...history.filter((item) => item.toLowerCase() !== term.toLowerCase()),
      ].slice(0, 5);
      localStorage.setItem('productSearchHistory', JSON.stringify(history));
      setSearchHistory(history);
    } catch (error) {
      console.error(
        'Failed to update search history in localStorage',
        error
      );
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchTerm) {
        setOpenItemId(null);
        const params = new URLSearchParams(searchParams.toString());
        if (inputValue) {
          params.set('q', inputValue);
        } else {
          params.delete('q');
        }
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
        if (inputValue) {
          updateSearchHistory(inputValue);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    inputValue,
    searchTerm,
    pathname,
    router,
    searchParams,
    updateSearchHistory,
  ]);

  React.useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsHistoryVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchContainerRef]);

  const handleSortChange = (order: string) => {
    setOpenItemId(null);
    const params = new URLSearchParams(searchParams);
    params.set('sort', order);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleHistoryClick = (term: string) => {
    setInputValue(term);
    setIsHistoryVisible(false);
  };
  
  const handleCategoryClick = (category: string) => {
    setInputValue(category);
    window.scrollTo(0, 0);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (totalPages > 0 && page > totalPages)) return;

    setOpenItemId(null);
    const params = new URLSearchParams(searchParams.toString());

    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }

    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo(0, 0);
  };

  const filteredAndSortedProducts = React.useMemo(() => {
    return allProducts
      .filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOrder === 'a-z') {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      });
  }, [searchTerm, sortOrder]);

  const sortedCategories = React.useMemo(() => [...allProducts].sort((a,b) => a.title.localeCompare(b.title)), []);


  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / ITEMS_PER_PAGE
  );

  const currentProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedProducts, currentPage]);

  const mobileProducts = React.useMemo(() => {
    if (!openItemId) {
      return currentProducts;
    }
    const openItem = currentProducts.find((p) => p.imageId === openItemId);
    if (!openItem) {
      return currentProducts;
    }
    return [
      openItem,
      ...currentProducts.filter((p) => p.imageId !== openItemId),
    ];
  }, [openItemId, currentProducts]);

  return (
    <section id="productos" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
              Nuestros Productos
            </h1>
            <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Equipamiento tecnológico para potenciar tu hogar o empresa.
            </p>
          </div>
        </div>

        <div className="mt-12 relative">
            <aside className="hidden lg:block absolute top-0 left-0 w-56">
                <div className="sticky top-24">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Categorías</h3>
                    <ScrollArea className="h-[calc(100vh-12rem)]">
                        <ul className="space-y-1 pr-4 pt-2">
                             {sortedCategories.map((product) => (
                              <li key={product.imageId}>
                                <button
                                  onClick={() => handleCategoryClick(product.title)}
                                  className={cn(
                                    "w-full rounded-md p-2 text-left text-sm transition-colors",
                                    searchTerm.toLowerCase() === product.title.toLowerCase()
                                      ? "bg-primary/10 font-semibold text-primary"
                                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                  )}
                                >
                                  {product.title}
                                </button>
                              </li>
                            ))}
                        </ul>
                    </ScrollArea>
                </div>
            </aside>
            <div className="lg:max-w-5xl lg:mx-auto">
                <div className="mb-8 flex justify-center">
                    <div ref={searchContainerRef} className="relative w-full max-w-md">
                        <div className="flex w-full items-center overflow-hidden rounded-full border bg-card shadow-sm">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                            type="text"
                            placeholder="Buscar productos..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onFocus={() => setIsHistoryVisible(true)}
                            className="h-12 w-full border-0 bg-transparent pl-12 pr-12 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            {inputValue && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full text-muted-foreground hover:bg-muted"
                                onClick={() => setInputValue('')}
                            >
                                <X className="h-5 w-5" />
                                <span className="sr-only">Limpiar búsqueda</span>
                            </Button>
                            )}
                        </div>
                        <Separator orientation="vertical" className="h-6" />
                        <Select value={sortOrder} onValueChange={handleSortChange}>
                            <SelectTrigger className="h-12 w-auto flex-shrink-0 border-0 bg-transparent pr-4 text-muted-foreground focus:ring-0 focus:ring-offset-0 data-[state=open]:bg-accent/50">
                            <SelectValue placeholder="Ordenar" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="a-z">Ordenar: A-Z</SelectItem>
                            <SelectItem value="z-a">Ordenar: Z-A</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                        {isHistoryVisible && searchHistory.length > 0 && (
                        <div className="absolute top-full z-10 mt-2 w-full rounded-lg border bg-popover text-popover-foreground shadow-md">
                            <p className="p-3 text-sm font-semibold text-muted-foreground">
                            Búsquedas recientes
                            </p>
                            <ul className="py-1">
                            {searchHistory.map((term, index) => (
                                <li key={index}>
                                <button
                                    onMouseDown={() => handleHistoryClick(term)}
                                    className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
                                >
                                    <History className="h-4 w-4 text-muted-foreground" />
                                    <span>{term}</span>
                                </button>
                                </li>
                            ))}
                            </ul>
                        </div>
                        )}
                    </div>
                </div>

                {/* Desktop grid */}
                <Accordion
                type="single"
                collapsible
                className="mx-auto hidden sm:grid sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
                value={openItemId || ''}
                onValueChange={(value) => setOpenItemId(value || null)}
                >
                {currentProducts.map((product) => {
                    const isExpanded = openItemId === product.imageId;
                    const productImage = PlaceHolderImages.find((img) => img.id === product.imageId);
                    return (
                    <AccordionItem
                        value={product.imageId}
                        key={product.imageId + '-desktop'}
                        className={cn(
                        'group/item mb-8 rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-out hover:shadow-xl',
                        isExpanded && 'shadow-xl'
                        )}
                    >
                        <AccordionTrigger className="group/trigger w-full p-0 text-left hover:no-underline [&>svg]:hidden">
                        <div className="flex w-full flex-col">
                            <div
                            className={cn(
                                'overflow-hidden rounded-t-lg',
                                isExpanded && 'rounded-b-none'
                            )}
                            >
                            <Image
                                src={productImage?.imageUrl || `https://picsum.photos/seed/${product.imageId}/600/400`}
                                data-ai-hint={productImage?.imageHint || product.imageId.replace('-', ' ')}
                                alt={product.title}
                                width={600}
                                height={400}
                                className="aspect-video w-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                            />
                            </div>
                            <div className="flex-grow p-6">
                            <h3 className="text-xl font-semibold leading-none tracking-tight">
                                {product.title}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {product.description}
                            </p>
                            </div>
                        </div>
                        </AccordionTrigger>
                        <AccordionContent>
                        <div className="border-t p-6">
                            <ul className="mb-6 space-y-4 text-foreground/80">
                            {product.details.map((detail, i) => (
                                <li key={i} className="flex items-start gap-3">
                                <div className="flex-shrink-0">{detail.icon}</div>
                                <span>{detail.text}</span>
                                </li>
                            ))}
                            </ul>
                            <Button asChild className="w-full rounded-full">
                            <Link
                                href="https://wa.me/5493564504977"
                                target="_blank"
                            >
                                Consultar
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            </Button>
                        </div>
                        </AccordionContent>
                    </AccordionItem>
                    );
                })}
                </Accordion>

                {/* Mobile Accordion Grid */}
                <div className="mx-auto block sm:hidden">
                <Accordion
                    type="single"
                    collapsible
                    className="grid grid-cols-2 gap-x-4 gap-y-8"
                    value={openItemId || ''}
                    onValueChange={(value) => setOpenItemId(value || null)}
                >
                    {mobileProducts.map((product) => {
                    const isExpanded = openItemId === product.imageId;
                    const productImage = PlaceHolderImages.find((img) => img.id === product.imageId);
                    return (
                        <AccordionItem
                        value={product.imageId}
                        key={product.imageId}
                        className={cn('group border-none', isExpanded && 'col-span-2')}
                        >
                        <div
                            className={cn(
                            'relative block aspect-[9/16] w-full overflow-hidden rounded-lg',
                            isExpanded && 'rounded-b-none'
                            )}
                        >
                            <AccordionTrigger className="absolute inset-0 z-10 h-full w-full p-0 text-left hover:no-underline [&>svg]:hidden">
                            <Image
                                src={productImage?.imageUrl || `https://picsum.photos/seed/${product.imageId}/600/400`}
                                data-ai-hint={productImage?.imageHint || product.imageId.replace('-', ' ')}
                                alt={product.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, 100vw"
                            />
                            </AccordionTrigger>
                        </div>

                        <AccordionTrigger
                            className={cn(
                            'w-full pt-3 text-left text-base font-semibold text-foreground hover:no-underline [&>svg]:hidden',
                            isExpanded && 'hidden'
                            )}
                        >
                            <h3>{product.title}</h3>
                        </AccordionTrigger>

                        <AccordionContent>
                            <div className="-mt-2 rounded-b-lg border border-t-0 bg-card p-4 shadow-sm">
                            <h3 className="mb-4 text-left text-2xl font-bold">
                                {product.title}
                            </h3>
                            <ul className="mb-6 space-y-4 text-foreground/80">
                                {product.details.map((detail, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="flex-shrink-0">{detail.icon}</div>
                                    <span>{detail.text}</span>
                                </li>
                                ))}
                            </ul>
                            <Button asChild className="w-full rounded-full">
                                <Link
                                href="https://wa.me/5493564504977"
                                target="_blank"
                                >
                                Consultar
                                <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            </div>
                        </AccordionContent>
                        </AccordionItem>
                    );
                    })}
                </Accordion>
                </div>
                {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
                )}
            </div>

        </div>
      </div>
    </section>
  );
}
