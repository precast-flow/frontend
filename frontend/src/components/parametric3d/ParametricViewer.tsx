import { Canvas } from '@react-three/fiber'
import { Center, Grid, OrbitControls } from '@react-three/drei'
import { Suspense, useEffect, useMemo } from 'react'
import { buildMeshFromPayload, disposeGroup } from '../../parametric3d/buildMesh'
import type { ParametricPayload } from '../../parametric3d/types'

function Model({ payloadKey }: { payloadKey: string }) {
  const group = useMemo(() => {
    const p = JSON.parse(payloadKey) as ParametricPayload
    return buildMeshFromPayload(p)
  }, [payloadKey])

  useEffect(() => {
    return () => disposeGroup(group)
  }, [group])

  return <primitive object={group} />
}

function Scene({ payloadKey }: { payloadKey: string }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[6000, 10_000, 5000]} intensity={1.05} />
      <Center top>
        <Model payloadKey={payloadKey} />
      </Center>
      <Grid
        args={[50_000, 50_000]}
        cellSize={500}
        cellThickness={0.5}
        sectionSize={5000}
        sectionThickness={1}
        fadeDistance={100_000}
        position={[0, -1, 0]}
      />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={400} maxDistance={250_000} />
    </>
  )
}

export function ParametricViewer({ payload }: { payload: ParametricPayload }) {
  const payloadKey = JSON.stringify(payload)
  return (
    <div className="h-full min-h-[320px] w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-b from-gray-100/90 to-gray-200/50 shadow-inner dark:border-gray-700/80 dark:from-gray-950/90 dark:to-gray-900/50">
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [6500, 4800, 6500], fov: 42, near: 5, far: 600_000 }}
        className="h-full w-full"
      >
        <Suspense fallback={null}>
          <Scene payloadKey={payloadKey} />
        </Suspense>
      </Canvas>
    </div>
  )
}
