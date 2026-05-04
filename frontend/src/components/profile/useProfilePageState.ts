import { useMemo, useState } from 'react'
import { useFactoryContext } from '../../context/FactoryContext'

export type ProfileSectionId = 'overview' | 'factories' | 'personal' | 'work' | 'security'

export function useProfilePageState() {
  const { factories } = useFactoryContext()
  const profileFactories = useMemo(() => factories.slice(0, 2), [factories])

  const [section, setSection] = useState<ProfileSectionId>('overview')
  const [firstName, setFirstName] = useState('Ayşe')
  const [lastName, setLastName] = useState('Kaya')
  const [email, setEmail] = useState('ayse@acme.com')
  const [phone, setPhone] = useState('+90 532 111 22 33')
  const [title, setTitle] = useState('Operasyon koordinatörü')
  const [department, setDepartment] = useState('Fabrika · İstanbul Hadımköy')

  return {
    section,
    setSection,
    profileFactories,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    title,
    setTitle,
    department,
    setDepartment,
  }
}

export type ProfilePageState = ReturnType<typeof useProfilePageState>
