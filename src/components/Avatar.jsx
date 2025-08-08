import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame, useGraph, useLoader } from '@react-three/fiber'
import { useAnimations, useFBX, useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { useControls } from 'leva'
import * as THREE from 'three'

const correspondingMorphTargets = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  I: "viseme_PP",
}

export function Avatar(props) {
  // UI via Leva
  const { playAudio, script } = useControls({
    playAudio: false,
    script: {
      value: 'audion1',
      options: ['audion1', 'presentation'],
    },
  })

  // Audio & JSON
  const audio = useMemo(() => new Audio('/audio/' + script + '.ogg'), [script])
  const jsonFile = useLoader(THREE.FileLoader, '/audio/' + script + '.json')
  const lipsync = JSON.parse(jsonFile)

  // GLTF clone & animations
  const group = useRef()
  const { scene } = useGLTF('/models/perso.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes } = useGraph(clone)

  // FBX animations
  const { animations: angryAnim } = useFBX('/animations/Angry.fbx')
  const { animations: idleAnim } = useFBX('/animations/Idle.fbx')
  const { animations: thankfulAnim } = useFBX('/animations/Thankful.fbx')

  angryAnim[0].name = 'Angry'
  idleAnim[0].name = 'Idle'
  thankfulAnim[0].name = 'Thankful'
  const animations = [angryAnim[0], idleAnim[0], thankfulAnim[0]]

  // Animation state
  const [animation, setAnimation] = React.useState('Idle')
  const [prevAnimation, setPrevAnimation] = React.useState(null)
  const { actions } = useAnimations(animations, clone)

  useEffect(() => {
    // Toujours jouer Idle en boucle
    if (actions.Idle && animation === 'Idle') {
      actions.Idle.reset().play()
      actions.Idle.setLoop(THREE.LoopRepeat)
    }
    // Crossfade vers Angry ou Thankful
    if (actions[animation] && animation !== 'Idle') {
      actions[animation].reset().play()
      actions[animation].crossFadeFrom(actions.Idle, 0.5, false)
      actions[animation].setLoop(THREE.LoopOnce)
    }
    setPrevAnimation(animation)
  }, [animation, actions])

  // Audio control
  useEffect(() => {
    if (playAudio) {
      audio.play()
      if(script === 'audion1') {
        setAnimation('Angry')
        setTimeout(() => {
          setAnimation('Idle')
          console.log('Animation ended')
        }, angryAnim[0].duration * 1000) 
      } else if(script === 'presentation') {
        setAnimation('Thankful')
        setTimeout(() => {
          setAnimation('Idle')
          console.log('Animation ended')
        }, thankfulAnim[0].duration * 1000)
      }
    } else {
      audio.pause()
      setAnimation('Idle')
      console.log('Audio paused')
    }
  }, [playAudio, script])

  // Lipsync
  useFrame((_, delta) => {
    const currentTime = audio.currentTime

    // Morph target actif
    let activeTarget = null
    for (let i = 0; i < lipsync.mouthCues.length; i++) {
      const cue = lipsync.mouthCues[i]
      if (currentTime >= cue.start && currentTime <= cue.end) {
        activeTarget = correspondingMorphTargets[cue.value]
        break
      }
    }

    // Interpolation douce des morphs
    Object.values(correspondingMorphTargets).forEach((morph) => {
      const headIndex = nodes.Wolf3D_Head.morphTargetDictionary[morph]
      const teethIndex = nodes.Wolf3D_Teeth.morphTargetDictionary[morph]
      const target = morph === activeTarget ? 1 : 0

      if (headIndex !== undefined) {
        nodes.Wolf3D_Head.morphTargetInfluences[headIndex] = THREE.MathUtils.lerp(
          nodes.Wolf3D_Head.morphTargetInfluences[headIndex],
          target,
          10 * delta
        )
      }

      if (teethIndex !== undefined) {
        nodes.Wolf3D_Teeth.morphTargetInfluences[teethIndex] = THREE.MathUtils.lerp(
          nodes.Wolf3D_Teeth.morphTargetInfluences[teethIndex],
          target,
          10 * delta
        )
      }
    })
  })

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={clone} />
    </group>
  )
}

useGLTF.preload('/models/perso.glb')
