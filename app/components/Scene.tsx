"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useMemo, useSyncExternalStore } from "react";
import { WebGPURenderer } from "three/webgpu";
import { pass } from "three/addons/tsl/display/PassNode.js";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { uniform, Fn, uv, vec2, float, vec4, length, hash } from "three/tsl";
import { RenderPipeline } from "three/webgpu";
import ParticleField from "./ParticleField";

// Responsive detection with live resize updates
function subscribeDesktop(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getDesktopSnapshot() {
  return typeof window !== "undefined" && window.innerWidth > 768;
}

function getDesktopServerSnapshot() {
  return true;
}

// Vignette effect as TSL function
const vignetteEffect = Fn(([color]: [any]) => {
  const center = uv().sub(vec2(0.5, 0.5));
  const dist = length(center);
  const vignette = float(1.0).sub(dist.mul(1.4).pow(2.0).mul(0.7));
  return color.mul(vec4(vignette, vignette, vignette, 1.0));
});

// Film grain as TSL function
const grainEffect = Fn(([color, time]: [any, any]) => {
  const noiseUV = uv().mul(vec2(1920.0, 1080.0)).add(time.mul(100.0));
  const noise = hash(noiseUV.x.add(noiseUV.y.mul(314.159)));
  const grain = noise.sub(0.5).mul(0.15);
  return color.add(vec4(grain, grain, grain, 0.0));
});

// Postprocessing setup component — runs inside the Canvas
function PostProcessing({ isDesktop }: { isDesktop: boolean }) {
  const { scene, camera, gl } = useThree();
  const pipelineRef = useRef<any>(null);
  const timeUniform = useMemo(() => uniform(0.0), []);

  useEffect(() => {
    const scenePass = pass(scene, camera);
    const sceneColor = scenePass.getTextureNode("output");

    // Bloom
    const bloomPass = bloom(sceneColor, isDesktop ? 1.5 : 0.8, 0.5, 0.3);

    // Chain: scene + bloom → vignette → grain
    let output = sceneColor.add(bloomPass);
    output = vignetteEffect(output);
    output = grainEffect(output, timeUniform);

    const pipeline = new RenderPipeline(gl, output);
    pipeline.outputColorTransform = true;
    pipelineRef.current = pipeline;

    return () => {
      pipeline.dispose();
    };
  }, [scene, camera, gl, isDesktop, timeUniform]);

  // Override R3F's default render with our pipeline
  useFrame((_, delta) => {
    timeUniform.value += delta;
    if (pipelineRef.current) {
      pipelineRef.current.render();
    }
  }, 1); // priority 1 = runs after default (which we skip)

  return null;
}

export default function Scene({
  onReady,
  onContextLost,
  isReturning,
}: {
  onReady?: () => void;
  onContextLost?: () => void;
  isReturning: boolean;
}) {
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktopSnapshot,
    getDesktopServerSnapshot
  );

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const particleCount = isDesktop ? 2000 : 800;

  return (
    <Canvas
      dpr={[1, 2]}
      gl={async (props) => {
        const renderer = new WebGPURenderer({
          canvas: props.canvas,
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        } as any);
        await renderer.init();
        return renderer as any;
      }}
      camera={{ position: [0, 0, 5], fov: 60 }}
      frameloop="always"
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
      role="presentation"
      aria-hidden="true"
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <ParticleField count={particleCount} isReturning={isReturning} />
      <PostProcessing isDesktop={isDesktop} />
    </Canvas>
  );
}
