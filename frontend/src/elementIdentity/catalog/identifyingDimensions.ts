import type { IdentifyingDimension } from '../types'

/**
 * Tüm tipolojilerde kullanılan tanımlayıcı boyut kataloğu.
 * İç veri HEP mm (integer); SizeFormat çıktıda mm→cm/m dönüşümünü yapar.
 */
export const IDENTIFYING_DIMENSIONS: IdentifyingDimension[] = [
  // Genel uzunluk / kesit
  { id: 'height', nameTr: 'Yükseklik', nameEn: 'Height', unit: 'mm', required: true, description: 'Genel yükseklik (kolon boyu, duvar yüksekliği).' },
  { id: 'length', nameTr: 'Uzunluk', nameEn: 'Length', unit: 'mm', required: true, description: 'Temel uzunluk (döşeme, duvar).' },
  { id: 'width', nameTr: 'Genişlik', nameEn: 'Width', unit: 'mm', required: false },
  { id: 'thickness', nameTr: 'Kalınlık', nameEn: 'Thickness', unit: 'mm', required: false },
  { id: 'span', nameTr: 'Açıklık', nameEn: 'Span', unit: 'mm', required: true, description: 'Kiriş açıklık uzunluğu.' },
  { id: 'diameter', nameTr: 'Çap', nameEn: 'Diameter', unit: 'mm', required: false, description: 'Dairesel kesit için.' },
  { id: 'sectionWidth', nameTr: 'Kesit Genişliği', nameEn: 'Section Width', unit: 'mm', required: false },
  { id: 'sectionDepth', nameTr: 'Kesit Derinliği', nameEn: 'Section Depth', unit: 'mm', required: false },
  { id: 'sectionSize', nameTr: 'Kesit Boyutu (Kare)', nameEn: 'Section Size (Square)', unit: 'mm', required: false },

  // Kolon varyantları
  { id: 'corbelWidth', nameTr: 'Guse Genişliği', nameEn: 'Corbel Width', unit: 'mm', required: false },
  { id: 'corbelHeight', nameTr: 'Guse Yüksekliği', nameEn: 'Corbel Height', unit: 'mm', required: false },
  { id: 'corbelProjection', nameTr: 'Guse Çıkıntısı', nameEn: 'Corbel Projection', unit: 'mm', required: false },
  { id: 'corbelLevel', nameTr: 'Guse Seviyesi', nameEn: 'Corbel Level Count', unit: 'mm', required: false, description: 'Kaç adet guse seviyesi var.' },
  { id: 'forkDepth', nameTr: 'Çatal Derinliği', nameEn: 'Fork Depth', unit: 'mm', required: false },
  { id: 'forkOpening', nameTr: 'Çatal Açıklığı', nameEn: 'Fork Opening', unit: 'mm', required: false },
  { id: 'baseWidth', nameTr: 'Taban Genişliği', nameEn: 'Base Width', unit: 'mm', required: false },
  { id: 'baseDepth', nameTr: 'Taban Derinliği', nameEn: 'Base Depth', unit: 'mm', required: false },
  { id: 'topWidth', nameTr: 'Üst Genişlik', nameEn: 'Top Width', unit: 'mm', required: false },
  { id: 'topDepth', nameTr: 'Üst Derinlik', nameEn: 'Top Depth', unit: 'mm', required: false },
  { id: 'outerWidth', nameTr: 'Dış Genişlik', nameEn: 'Outer Width', unit: 'mm', required: false },
  { id: 'outerDepth', nameTr: 'Dış Derinlik', nameEn: 'Outer Depth', unit: 'mm', required: false },
  { id: 'wallThickness', nameTr: 'Duvar Kalınlığı', nameEn: 'Wall Thickness', unit: 'mm', required: false },
  { id: 'coreShape', nameTr: 'Çekirdek Biçimi', nameEn: 'Core Shape', unit: 'mm', required: false },

  // Kiriş
  { id: 'totalHeight', nameTr: 'Toplam Yükseklik', nameEn: 'Total Height', unit: 'mm', required: false },
  { id: 'flangeWidth', nameTr: 'Başlık Genişliği', nameEn: 'Flange Width', unit: 'mm', required: false },
  { id: 'flangeThickness', nameTr: 'Başlık Kalınlığı', nameEn: 'Flange Thickness', unit: 'mm', required: false },
  { id: 'webWidth', nameTr: 'Gövde Genişliği', nameEn: 'Web Width', unit: 'mm', required: false },
  { id: 'webThickness', nameTr: 'Gövde Kalınlığı', nameEn: 'Web Thickness', unit: 'mm', required: false },
  { id: 'bottomFlangeWidth', nameTr: 'Alt Başlık Genişliği', nameEn: 'Bottom Flange Width', unit: 'mm', required: false },
  { id: 'startHeight', nameTr: 'Başlangıç Yüksekliği', nameEn: 'Start Height', unit: 'mm', required: false },
  { id: 'peakHeight', nameTr: 'Tepe Yüksekliği', nameEn: 'Peak Height', unit: 'mm', required: false },
  { id: 'endHeight', nameTr: 'Bitiş Yüksekliği', nameEn: 'End Height', unit: 'mm', required: false },
  { id: 'upstandHeight', nameTr: 'Söve Yüksekliği', nameEn: 'Upstand Height', unit: 'mm', required: false },
  { id: 'railHeight', nameTr: 'Ray Yüksekliği', nameEn: 'Rail Height', unit: 'mm', required: false },
  { id: 'railWidth', nameTr: 'Ray Genişliği', nameEn: 'Rail Width', unit: 'mm', required: false },
  { id: 'channelDepth', nameTr: 'Oluk Derinliği', nameEn: 'Channel Depth', unit: 'mm', required: false },
  { id: 'channelWidth', nameTr: 'Oluk Genişliği', nameEn: 'Channel Width', unit: 'mm', required: false },
  { id: 'outerHeight', nameTr: 'Dış Yükseklik', nameEn: 'Outer Height', unit: 'mm', required: false },

  // Döşeme
  { id: 'depth', nameTr: 'Derinlik', nameEn: 'Depth', unit: 'mm', required: false },
  { id: 'coreCount', nameTr: 'Çekirdek Sayısı', nameEn: 'Core Count', unit: 'mm', required: false },
  { id: 'coreDiameter', nameTr: 'Çekirdek Çapı', nameEn: 'Core Diameter', unit: 'mm', required: false },
  { id: 'stemWidth', nameTr: 'Ayak Genişliği', nameEn: 'Stem Width', unit: 'mm', required: false },
  { id: 'stemCount', nameTr: 'Ayak Sayısı', nameEn: 'Stem Count', unit: 'mm', required: false },
  { id: 'precastThickness', nameTr: 'Ön Döküm Kalınlığı', nameEn: 'Precast Thickness', unit: 'mm', required: false },
  { id: 'toppingThickness', nameTr: 'Tepe Kalınlığı', nameEn: 'Topping Thickness', unit: 'mm', required: false },
  { id: 'ribHeight', nameTr: 'Nervür Yüksekliği', nameEn: 'Rib Height', unit: 'mm', required: false },
  { id: 'ribSpacing', nameTr: 'Nervür Aralığı', nameEn: 'Rib Spacing', unit: 'mm', required: false },
  { id: 'ribCount', nameTr: 'Nervür Sayısı', nameEn: 'Rib Count', unit: 'mm', required: false },
  { id: 'slopeAngle', nameTr: 'Eğim Açısı', nameEn: 'Slope Angle', unit: 'mm', required: false, description: 'Derece cinsinden.' },

  // Duvar
  { id: 'innerThickness', nameTr: 'İç Katman Kalınlığı', nameEn: 'Inner Thickness', unit: 'mm', required: false },
  { id: 'coreThickness', nameTr: 'Çekirdek Kalınlığı', nameEn: 'Core Thickness', unit: 'mm', required: false },
  { id: 'outerThickness', nameTr: 'Dış Katman Kalınlığı', nameEn: 'Outer Thickness', unit: 'mm', required: false },
  { id: 'shellThickness', nameTr: 'Kabuk Kalınlığı', nameEn: 'Shell Thickness', unit: 'mm', required: false },
  { id: 'ribThickness', nameTr: 'Nervür Kalınlığı', nameEn: 'Rib Thickness', unit: 'mm', required: false },
  { id: 'heelWidth', nameTr: 'Topuk Genişliği', nameEn: 'Heel Width', unit: 'mm', required: false },
  { id: 'keyDepth', nameTr: 'Kilit Derinliği', nameEn: 'Key Depth', unit: 'mm', required: false },
  { id: 'legA', nameTr: 'A Bacak', nameEn: 'Leg A', unit: 'mm', required: false },
  { id: 'legB', nameTr: 'B Bacak', nameEn: 'Leg B', unit: 'mm', required: false },
  { id: 'legC', nameTr: 'C Bacak', nameEn: 'Leg C', unit: 'mm', required: false },
  { id: 'extrusionHeight', nameTr: 'Extrusion Yüksekliği', nameEn: 'Extrusion Height', unit: 'mm', required: false },
  { id: 'surfaceFinish', nameTr: 'Yüzey Dokusu', nameEn: 'Surface Finish', unit: 'mm', required: false },

  // Merdiven
  { id: 'totalRun', nameTr: 'Toplam Yatay Mesafe', nameEn: 'Total Run', unit: 'mm', required: false },
  { id: 'totalRise', nameTr: 'Toplam Dikey Mesafe', nameEn: 'Total Rise', unit: 'mm', required: false },
  { id: 'stepCount', nameTr: 'Basamak Sayısı', nameEn: 'Step Count', unit: 'mm', required: false },
  { id: 'treadDepth', nameTr: 'Basamak Derinliği', nameEn: 'Tread Depth', unit: 'mm', required: false },
  { id: 'riserHeight', nameTr: 'Rıht Yüksekliği', nameEn: 'Riser Height', unit: 'mm', required: false },
  { id: 'runA', nameTr: 'A Kolu Uzunluğu', nameEn: 'Run A', unit: 'mm', required: false },
  { id: 'runB', nameTr: 'B Kolu Uzunluğu', nameEn: 'Run B', unit: 'mm', required: false },
  { id: 'landingPosition', nameTr: 'Sahanlık Konumu', nameEn: 'Landing Position', unit: 'mm', required: false },
  { id: 'gapWidth', nameTr: 'Boşluk Genişliği', nameEn: 'Gap Width', unit: 'mm', required: false },
  { id: 'outerDiameter', nameTr: 'Dış Çap', nameEn: 'Outer Diameter', unit: 'mm', required: false },
  { id: 'innerDiameter', nameTr: 'İç Çap', nameEn: 'Inner Diameter', unit: 'mm', required: false },
  { id: 'totalAngle', nameTr: 'Toplam Açı', nameEn: 'Total Angle', unit: 'mm', required: false },

  // Konsol
  { id: 'projection', nameTr: 'Çıkıntı', nameEn: 'Projection', unit: 'mm', required: false },
  { id: 'rootHeight', nameTr: 'Kök Yüksekliği', nameEn: 'Root Height', unit: 'mm', required: false },
  { id: 'tipHeight', nameTr: 'Uç Yüksekliği', nameEn: 'Tip Height', unit: 'mm', required: false },

  // Soket
  { id: 'outerLength', nameTr: 'Dış Uzunluk', nameEn: 'Outer Length', unit: 'mm', required: false },
  { id: 'socketLength', nameTr: 'Soket Uzunluğu', nameEn: 'Socket Length', unit: 'mm', required: false },
  { id: 'socketWidth', nameTr: 'Soket Genişliği', nameEn: 'Socket Width', unit: 'mm', required: false },
  { id: 'socketDepth', nameTr: 'Soket Derinliği', nameEn: 'Socket Depth', unit: 'mm', required: false },

  // Makas
  { id: 'eaveHeight', nameTr: 'Saçak Yüksekliği', nameEn: 'Eave Height', unit: 'mm', required: false },

  // Mimari / serbest
  { id: 'profileDescriptor', nameTr: 'Profil Tanımı', nameEn: 'Profile Descriptor', unit: 'mm', required: false },
]

export const DIMENSIONS_BY_ID: Record<string, IdentifyingDimension> = Object.fromEntries(
  IDENTIFYING_DIMENSIONS.map((d) => [d.id, d]),
)
