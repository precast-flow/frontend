import type { IfcClassName, IfcPredefinedType, SourceSystem } from '../types'

/** IFC dosyasından okunmuş gibi davranan mock giriş kaydı */
export type RawIfcRecord = {
  rawGuid: string
  ifcClass: IfcClassName
  ifcPredefinedType: IfcPredefinedType
  ifcObjectType?: string
  ifcName: string
  sourceSystem: SourceSystem
  dimensions: Record<string, number>
  propertySets?: Record<string, Record<string, string | number | boolean>>
}

export type MockIfcFile = {
  fileName: string
  sourceSystem: SourceSystem
  records: RawIfcRecord[]
}

/** Temiz Tekla import örneği — promt 14 Senaryo A'ya yakın */
export const MOCK_FILE_TEKLA: MockIfcFile = {
  fileName: 'proje-14-tekla.ifc',
  sourceSystem: 'TEKLA',
  records: [
    {
      rawGuid: '0LV8Qv4f1Ev8NR2WvGNLhA',
      ifcClass: 'IfcColumn',
      ifcPredefinedType: 'COLUMN',
      ifcName: 'C-01-400x400',
      sourceSystem: 'TEKLA',
      dimensions: { height: 5000, sectionWidth: 400, sectionDepth: 400 },
      propertySets: {
        Pset_PrecastConcreteElementGeneral: {
          TypeDesignator: 'C40',
          CornerChamfer: 20,
          ToleranceClass: 'A',
        },
      },
    },
    {
      rawGuid: '1MW9Rw5g2Fw9OS3WhHMIc',
      ifcClass: 'IfcColumn',
      ifcPredefinedType: 'COLUMN',
      ifcName: 'C-02-500x500',
      sourceSystem: 'TEKLA',
      dimensions: { height: 6000, sectionWidth: 500, sectionDepth: 500 },
    },
    {
      rawGuid: '2NX0Sx6h3Gx0PT4XiINJd',
      ifcClass: 'IfcBeam',
      ifcPredefinedType: 'T_BEAM',
      ifcName: 'TB-12M-30x60',
      sourceSystem: 'TEKLA',
      dimensions: {
        span: 12000,
        totalHeight: 600,
        flangeWidth: 600,
        webWidth: 200,
        flangeThickness: 150,
      },
    },
    {
      rawGuid: '3OY1Ty7i4Hy1QU5YjJOKe',
      ifcClass: 'IfcBeam',
      ifcPredefinedType: 'T_BEAM',
      ifcName: 'TB-15M-30x80',
      sourceSystem: 'TEKLA',
      dimensions: {
        span: 15000,
        totalHeight: 800,
        flangeWidth: 600,
        webWidth: 200,
        flangeThickness: 150,
      },
    },
    {
      rawGuid: '4PZ2Uz8j5Iz2RV6ZkKPLf',
      ifcClass: 'IfcSlab',
      ifcPredefinedType: 'USERDEFINED',
      ifcObjectType: 'HollowCore',
      ifcName: 'HC-800-20',
      sourceSystem: 'TEKLA',
      dimensions: {
        length: 8000,
        width: 1200,
        thickness: 200,
        coreCount: 6,
        coreDiameter: 140,
      },
    },
    {
      rawGuid: '5QA3Va9k6Ja3SW7almLQMg',
      ifcClass: 'IfcSlab',
      ifcPredefinedType: 'USERDEFINED',
      ifcObjectType: 'HollowCore',
      ifcName: 'HC-700-25',
      sourceSystem: 'TEKLA',
      dimensions: { length: 7000, width: 1200, thickness: 250, coreCount: 6, coreDiameter: 180 },
    },
    {
      rawGuid: '6RB4Wb0l7Kb4TX8bmMRNh',
      ifcClass: 'IfcWall',
      ifcPredefinedType: 'USERDEFINED',
      ifcObjectType: 'SandwichPanel',
      ifcName: 'SWP-6x3-24',
      sourceSystem: 'TEKLA',
      dimensions: {
        length: 6000,
        height: 3000,
        innerThickness: 60,
        coreThickness: 100,
        outerThickness: 80,
      },
    },
    {
      rawGuid: '7SC5Xc1m8Lc5UY9cnNSOi',
      ifcClass: 'IfcStairFlight',
      ifcPredefinedType: 'STRAIGHT',
      ifcName: 'ST-300-180',
      sourceSystem: 'TEKLA',
      dimensions: {
        totalRun: 3000,
        totalRise: 1800,
        width: 1200,
        stepCount: 10,
        treadDepth: 300,
        riserHeight: 180,
      },
    },
    {
      rawGuid: '8TD6Yd2n9Md6VZ0doOTPj',
      ifcClass: 'IfcFooting',
      ifcPredefinedType: 'PAD_FOOTING',
      ifcName: 'SK-12x12',
      sourceSystem: 'TEKLA',
      dimensions: {
        outerLength: 1200,
        outerWidth: 1200,
        totalHeight: 800,
        socketLength: 500,
        socketWidth: 500,
        socketDepth: 600,
      },
    },
  ],
}

/** Karışık import örneği — manuel düzeltme gerekir */
export const MOCK_FILE_REVIT: MockIfcFile = {
  fileName: 'karisik-proje-revit.ifc',
  sourceSystem: 'REVIT',
  records: [
    {
      rawGuid: 'R1AaBbCcDdEeFfGgHhIiJ',
      ifcClass: 'IfcBeam',
      ifcPredefinedType: 'BEAM',
      ifcName: 'Beam-rect-40x60',
      sourceSystem: 'REVIT',
      dimensions: { span: 8000, width: 400, height: 600 },
    },
    {
      rawGuid: 'R2KkLlMmNnOoPpQqRrSsT',
      ifcClass: 'IfcBeam',
      ifcPredefinedType: 'HOLLOWCORE',
      ifcName: 'HC-As-Beam-10000',
      sourceSystem: 'REVIT',
      dimensions: { length: 10000, width: 1200, thickness: 320, coreCount: 6, coreDiameter: 200 },
    },
    {
      rawGuid: 'R3UuVvWwXxYyZz00112233',
      ifcClass: 'IfcWall',
      ifcPredefinedType: 'SOLIDWALL',
      ifcName: 'Wall-Solid-400x300',
      sourceSystem: 'REVIT',
      dimensions: { length: 4000, height: 3000, thickness: 200 },
    },
    {
      rawGuid: 'R4ZzYyXxWwVvUu445566',
      ifcClass: 'IfcColumn',
      ifcPredefinedType: 'USERDEFINED',
      ifcObjectType: 'CorbelColumn',
      ifcName: 'ColGuseli-6m',
      sourceSystem: 'REVIT',
      dimensions: {
        height: 6000,
        sectionWidth: 500,
        sectionDepth: 500,
        corbelWidth: 400,
        corbelHeight: 400,
        corbelProjection: 300,
        corbelLevel: 2,
      },
    },
    {
      rawGuid: 'R5QqWwEeRrTtYy778899',
      ifcClass: 'IfcMember',
      ifcPredefinedType: 'USERDEFINED',
      ifcObjectType: 'TaperedCorbel',
      ifcName: 'Corbel-Tapered-60-30',
      sourceSystem: 'REVIT',
      dimensions: { projection: 600, width: 300, rootHeight: 400, tipHeight: 200 },
    },
    {
      rawGuid: 'R6UuIiOoPpAaSsDd001122',
      ifcClass: 'IfcBeam',
      ifcPredefinedType: 'NOTDEFINED',
      ifcName: 'Unmapped-Custom-Beam',
      sourceSystem: 'REVIT',
      dimensions: { span: 9000, width: 350, height: 500 },
    },
  ],
}

export const MOCK_IFC_FILES: MockIfcFile[] = [MOCK_FILE_TEKLA, MOCK_FILE_REVIT]
