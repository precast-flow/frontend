import type { IfcMappingRule } from '../types'

/**
 * IFC entity + predefinedType + objectType → sistem ElementType/Typology eşlemesi.
 * 47 kural; promt paketi 13-ifc-import-mapping.md içinden derlendi.
 * Priority: yüksek kazanır; çakışmada firm-level custom rule her zaman öncelikli.
 */
export const IFC_MAPPING_RULES: IfcMappingRule[] = [
  // Column
  { id: 'r01', ifcClass: 'IfcColumn', ifcPredefinedType: 'COLUMN', systemElementTypeId: 'col', systemTypologyId: 'col-rect', priority: 10, heuristic: 'H5' },
  { id: 'r02', ifcClass: 'IfcColumn', ifcPredefinedType: 'PILASTER', systemElementTypeId: 'col', systemTypologyId: 'col-pil', priority: 20 },
  { id: 'r03', ifcClass: 'IfcColumn', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'CircularColumn', systemElementTypeId: 'col', systemTypologyId: 'col-circ', priority: 20 },
  { id: 'r04', ifcClass: 'IfcColumn', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'CorbelColumn', systemElementTypeId: 'col', systemTypologyId: 'col-crb', priority: 20 },
  { id: 'r05', ifcClass: 'IfcColumn', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'ForkColumn', systemElementTypeId: 'col', systemTypologyId: 'col-frk', priority: 20 },
  { id: 'r06', ifcClass: 'IfcColumn', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'TaperedColumn', systemElementTypeId: 'col', systemTypologyId: 'col-tpr', priority: 20 },

  // Beam
  { id: 'r07', ifcClass: 'IfcBeam', ifcPredefinedType: 'BEAM', systemElementTypeId: 'beam', systemTypologyId: 'beam-rect', priority: 10, heuristic: 'H2' },
  { id: 'r08', ifcClass: 'IfcBeam', ifcPredefinedType: 'T_BEAM', systemElementTypeId: 'beam', systemTypologyId: 'beam-t', priority: 20 },
  { id: 'r09', ifcClass: 'IfcBeam', ifcPredefinedType: 'EDGEBEAM', systemElementTypeId: 'beam', systemTypologyId: 'beam-l', priority: 20 },
  { id: 'r10', ifcClass: 'IfcBeam', ifcPredefinedType: 'SPANDREL', systemElementTypeId: 'beam', systemTypologyId: 'beam-spd', priority: 20 },
  { id: 'r11', ifcClass: 'IfcBeam', ifcPredefinedType: 'PIERCAP', systemElementTypeId: 'beam', systemTypologyId: 'beam-cap', priority: 20 },
  { id: 'r12', ifcClass: 'IfcBeam', ifcPredefinedType: 'LINTEL', systemElementTypeId: 'beam', systemTypologyId: 'beam-lnt', priority: 20 },
  { id: 'r13', ifcClass: 'IfcBeam', ifcPredefinedType: 'GIRDER_SEGMENT', systemElementTypeId: 'beam', systemTypologyId: 'beam-ig', priority: 20 },
  { id: 'r14', ifcClass: 'IfcBeam', ifcPredefinedType: 'HOLLOWCORE', systemElementTypeId: 'slab', systemTypologyId: 'slab-hc', priority: 30, notes: 'Cross-mapping: beam→slab' },
  { id: 'r15', ifcClass: 'IfcBeam', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'InvertedTBeam', systemElementTypeId: 'beam', systemTypologyId: 'beam-it', priority: 25 },
  { id: 'r16', ifcClass: 'IfcBeam', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'UBeam', systemElementTypeId: 'beam', systemTypologyId: 'beam-u', priority: 25 },
  { id: 'r17', ifcClass: 'IfcBeam', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'BoxBeam', systemElementTypeId: 'beam', systemTypologyId: 'beam-box', priority: 25 },
  { id: 'r18', ifcClass: 'IfcBeam', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'GutterBeam', systemElementTypeId: 'beam', systemTypologyId: 'beam-gtr', priority: 25 },
  { id: 'r19', ifcClass: 'IfcBeam', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'YGirder', systemElementTypeId: 'beam', systemTypologyId: 'beam-y', priority: 25 },
  { id: 'r20', ifcClass: 'IfcBeam', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'Purlin', systemElementTypeId: 'beam', systemTypologyId: 'beam-prl', priority: 25 },
  { id: 'r21', ifcClass: 'IfcBeam', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'CraneBeam', systemElementTypeId: 'beam', systemTypologyId: 'beam-crn', priority: 25 },

  // Slab
  { id: 'r22', ifcClass: 'IfcSlab', ifcPredefinedType: 'FLOOR', systemElementTypeId: 'slab', systemTypologyId: 'slab-sol', priority: 5, heuristic: 'H1' },
  { id: 'r23', ifcClass: 'IfcSlab', ifcPredefinedType: 'ROOF', systemElementTypeId: 'slab', systemTypologyId: 'slab-rf', priority: 20 },
  { id: 'r24', ifcClass: 'IfcSlab', ifcPredefinedType: 'LANDING', systemElementTypeId: 'landing', systemTypologyId: 'landing-rect', priority: 30 },
  { id: 'r25', ifcClass: 'IfcSlab', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'HollowCore', systemElementTypeId: 'slab', systemTypologyId: 'slab-hc', priority: 30 },
  { id: 'r26', ifcClass: 'IfcSlab', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'DoubleTee', systemElementTypeId: 'slab', systemTypologyId: 'slab-dt', priority: 30 },
  { id: 'r27', ifcClass: 'IfcSlab', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'SingleTee', systemElementTypeId: 'slab', systemTypologyId: 'slab-st', priority: 30 },
  { id: 'r28', ifcClass: 'IfcSlab', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'Filigree', systemElementTypeId: 'slab', systemTypologyId: 'slab-fil', priority: 30 },
  { id: 'r29', ifcClass: 'IfcSlab', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'RibbedSlab', systemElementTypeId: 'slab', systemTypologyId: 'slab-rib', priority: 30 },

  // Wall
  { id: 'r30', ifcClass: 'IfcWall', ifcPredefinedType: 'SOLIDWALL', systemElementTypeId: 'wall', systemTypologyId: 'wall-sol', priority: 10, heuristic: 'H3' },
  { id: 'r31', ifcClass: 'IfcWall', ifcPredefinedType: 'SHEAR', systemElementTypeId: 'wall', systemTypologyId: 'wall-shr', priority: 20 },
  { id: 'r32', ifcClass: 'IfcWall', ifcPredefinedType: 'PARTITIONING', systemElementTypeId: 'wall', systemTypologyId: 'wall-prt', priority: 20 },
  { id: 'r33', ifcClass: 'IfcWall', ifcPredefinedType: 'PARAPET', systemElementTypeId: 'wall', systemTypologyId: 'wall-prp', priority: 20 },
  { id: 'r34', ifcClass: 'IfcWall', ifcPredefinedType: 'RETAININGWALL', systemElementTypeId: 'wall', systemTypologyId: 'wall-rtn', priority: 20 },
  { id: 'r35', ifcClass: 'IfcWall', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'SandwichPanel', systemElementTypeId: 'wall', systemTypologyId: 'wall-swp', priority: 25 },
  { id: 'r36', ifcClass: 'IfcWall', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'FacadePanel', systemElementTypeId: 'wall', systemTypologyId: 'wall-fac', priority: 25 },
  { id: 'r37', ifcClass: 'IfcWall', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'GFRC', systemElementTypeId: 'wall', systemTypologyId: 'wall-gfr', priority: 25 },
  { id: 'r38', ifcClass: 'IfcWall', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'LProfileWall', systemElementTypeId: 'wall', systemTypologyId: 'wall-l', priority: 25 },
  { id: 'r39', ifcClass: 'IfcWall', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'UProfileWall', systemElementTypeId: 'wall', systemTypologyId: 'wall-u', priority: 25 },

  // Stair
  { id: 'r40', ifcClass: 'IfcStairFlight', ifcPredefinedType: 'STRAIGHT', systemElementTypeId: 'stair', systemTypologyId: 'stair-str', priority: 20 },
  { id: 'r41', ifcClass: 'IfcStairFlight', ifcPredefinedType: 'WINDER', systemElementTypeId: 'stair', systemTypologyId: 'stair-l', priority: 20 },
  { id: 'r42', ifcClass: 'IfcStairFlight', ifcPredefinedType: 'HALF_TURN_STAIR', systemElementTypeId: 'stair', systemTypologyId: 'stair-u', priority: 20 },
  { id: 'r43', ifcClass: 'IfcStairFlight', ifcPredefinedType: 'SPIRAL_STAIR', systemElementTypeId: 'stair', systemTypologyId: 'stair-spr', priority: 20 },

  // Member → Corbel/Truss
  { id: 'r44', ifcClass: 'IfcMember', ifcPredefinedType: 'BRACE', systemElementTypeId: 'corbel', systemTypologyId: 'corbel-rect', priority: 10 },
  { id: 'r45', ifcClass: 'IfcMember', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'TaperedCorbel', systemElementTypeId: 'corbel', systemTypologyId: 'corbel-tpr', priority: 20 },
  { id: 'r46', ifcClass: 'IfcMember', ifcPredefinedType: 'USERDEFINED', ifcObjectType: 'RoofTruss', systemElementTypeId: 'truss', systemTypologyId: 'truss-flt', priority: 20 },

  // Footing → Socket
  { id: 'r47', ifcClass: 'IfcFooting', ifcPredefinedType: 'PAD_FOOTING', systemElementTypeId: 'socket', systemTypologyId: 'socket-cup', priority: 20 },
]
