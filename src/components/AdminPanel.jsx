import { useControls, button } from 'leva'
import { useEffect } from 'react'
import { testConnectionBackend } from '../services/assistant'

export function AdminPanel({ onChange }) {
const controls = useControls({
  playAudio: false,
  script: {
    value: 'audion1',
    options: ['audion1', 'presentation'],
  },
  animation: {
    value: 'Idle',
    options: ['Idle', 'Angry', 'Thankful'],
  },
  test_backend: button(() => {
    testConnectionBackend().then(data => {
        if(data.success) {
            console.log(data.message)
        } else {
            console.log('Erreur de connexion au backend : ' + data.message);
        }
    }).catch(error => {
        console.error('Error connecting to backend:', error);
    });
  }),
})

  // Appelle onChange à chaque changement
  useEffect(() => {
    onChange(controls)
  }, [controls, onChange])

  return null // L’UI Leva s’affiche automatiquement
}