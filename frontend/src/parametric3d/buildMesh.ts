import { BoxGeometry, Color, Group, Mesh, MeshStandardMaterial } from 'three'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'
import type { ParametricPayload } from './types'

const concrete = new MeshStandardMaterial({
  color: new Color(0xb8b5b0),
  roughness: 0.85,
  metalness: 0.05,
})

const evaluator = new Evaluator()

export function disposeGroup(g: Group) {
  g.traverse((o) => {
    if (o instanceof Mesh) {
      o.geometry?.dispose()
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose())
      else o.material?.dispose()
    }
  })
}

/** Geometri hatası — boş grup veya istisna */
export function buildMeshFromPayload(payload: ParametricPayload): Group {
  const root = new Group()
  root.name = 'parametric-root'

  try {
    switch (payload.elementFamily) {
      case 'COLUMN': {
        const { sectionWidth, sectionDepth, height } = payload.parameters as {
          sectionWidth: number
          sectionDepth: number
          height: number
        }
        const g = new BoxGeometry(sectionWidth, height, sectionDepth)
        const m = new Mesh(g, concrete.clone())
        root.add(m)
        break
      }
      case 'BEAM': {
        const { span, width, height } = payload.parameters as {
          span: number
          width: number
          height: number
        }
        const g = new BoxGeometry(span, height, width)
        const mesh = new Mesh(g, concrete.clone())
        root.add(mesh)
        break
      }
      case 'CULVERT': {
        const p = payload.parameters as {
          outerLength: number
          outerWidth: number
          outerHeight: number
          innerLength: number
          innerWidth: number
          innerHeight: number
        }
        const outerGeom = new BoxGeometry(p.outerLength, p.outerHeight, p.outerWidth)
        const innerGeom = new BoxGeometry(p.innerLength, p.innerHeight, p.innerWidth)
        const outerBrush = new Brush(outerGeom)
        const innerBrush = new Brush(innerGeom)
        const result = evaluator.evaluate(outerBrush, innerBrush, SUBTRACTION)
        result.material = concrete.clone()
        root.add(result)
        outerGeom.dispose()
        innerGeom.dispose()
        break
      }
      case 'PANEL': {
        const p = payload.parameters as {
          length: number
          height: number
          thickness: number
          openings?: { x: number; y: number; width: number; height: number }[]
        }
        let brush = new Brush(new BoxGeometry(p.length, p.height, p.thickness))
        brush.material = concrete.clone()
        brush.updateMatrixWorld()
        const ops = p.openings ?? []
        for (const op of ops) {
          const hole = new BoxGeometry(op.width, op.height, p.thickness * 1.25)
          const holeBrush = new Brush(hole)
          const cx = op.x + op.width / 2 - p.length / 2
          const cy = op.y + op.height / 2 - p.height / 2
          holeBrush.position.set(cx, cy, 0)
          holeBrush.updateMatrixWorld()
          const next = evaluator.evaluate(brush, holeBrush, SUBTRACTION)
          next.material = concrete.clone()
          disposeBrushMesh(brush)
          hole.dispose()
          brush = next
        }
        root.add(brush)
        break
      }
      case 'PROFILE_WALL': {
        const p = payload.parameters as {
          profileType: 'L' | 'U'
          legLengthA: number
          legLengthB: number
          legLengthC?: number
          wallThickness: number
          extrusionHeight: number
        }
        const t = p.wallThickness
        const eh = p.extrusionHeight
        const mat = concrete.clone()

        if (p.profileType === 'L') {
          const a = p.legLengthA
          const b = p.legLengthB
          const g1 = new BoxGeometry(a, eh, t)
          const m1 = new Mesh(g1, mat.clone())
          m1.position.set(a / 2, eh / 2, t / 2)
          const g2 = new BoxGeometry(t, eh, b)
          const m2 = new Mesh(g2, mat.clone())
          m2.position.set(t / 2, eh / 2, b / 2)
          root.add(m1, m2)
        } else {
          const B = p.legLengthB
          const A = p.legLengthA
          const gBase = new BoxGeometry(B, eh, t)
          const base = new Mesh(gBase, mat.clone())
          base.position.set(0, eh / 2, t / 2)
          const gL = new BoxGeometry(t, eh, A)
          const left = new Mesh(gL, mat.clone())
          left.position.set(-B / 2 + t / 2, eh / 2, A / 2)
          const right = new Mesh(gL.clone(), mat.clone())
          right.position.set(B / 2 - t / 2, eh / 2, A / 2)
          root.add(base, left, right)
        }
        break
      }
      default:
        break
    }
  } catch {
    const fallback = new Mesh(new BoxGeometry(100, 100, 100), concrete.clone())
    root.add(fallback)
    fallback.name = 'geometry-error-fallback'
  }

  return root
}

function disposeBrushMesh(brush: Brush) {
  brush.geometry?.dispose()
  if (Array.isArray(brush.material)) brush.material.forEach((m) => m.dispose())
  else brush.material?.dispose()
}
