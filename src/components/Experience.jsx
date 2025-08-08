import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { useState } from 'react'
import { Avatar } from "./Avatar";
import { AdminPanel } from './AdminPanel'
import { useThree } from '@react-three/fiber';

export const Experience = () => {
  const [adminVars, setAdminVars] = useState({ playAudio: false, script: 'audion1', animation: 'Idle' });

  const texture = useTexture('/textures/background.png');
  const viewport = useThree((state) => state.viewport);

  const backgroundSize = 1.5; // Adjust this value to change the size of the background image

  // set camera position
  const { camera } = useThree();
  camera.position.set(0, 0, 6);

  return (
    <>
      <AdminPanel onChange={setAdminVars} />
      <OrbitControls />
      <Avatar {...adminVars} scale={1} position={[0, -1.4, 3.7]} />
      <Environment preset="sunset" />
      <mesh position={[0, 0, -1]} scale={[viewport.width * backgroundSize, viewport.height * backgroundSize, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={texture} />
      </mesh>
  
    </>
  );
};
