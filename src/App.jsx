import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, doc, onSnapshot, runTransaction, setDoc, writeBatch } from 'firebase/firestore'
import { auth, db, signIn } from './firebase'
import { AppContext, Sheet, TabBar } from './ui'
import Main, { Join } from './Main'
import Team from './Team'
import Fixtures, { Results } from './Fixtures'

const TEAMS = [
  { id: 'scrumdog', name: 'Scrumdog Millionaires', color: '#FF8A3D' },
  { id: 'tryhards', name: 'The Tryhards', color: '#4D8DFF' },
  { id: 'wootag', name: 'Woo Tag Clan', color: '#FFD23F' },
  { id: 'ruck', name: 'Ruck and Roll', color: '#3DDC97' },
]
const PAGES = { team: Team, fixtures: Fixtures, results: Results }
const gameRef = doc(db, 'config', 'game')
const usersRef = collection(db, 'users')
const fixturesRef = collection(db, 'fixtures')

// A document gives its data, a collection gives a list of docs with ids
function useLive(ref) {
  const [value, setValue] = useState()
  useEffect(() => onSnapshot(ref, s => setValue(s.docs ? s.docs.map(d => ({ id: d.id, ...d.data() })) : s.data())), [ref])
  return value
}

function useHash() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const update = () => setHash(location.hash)
    addEventListener('hashchange', update)
    return () => removeEventListener('hashchange', update)
  }, [])
  return hash.split('/')
}

export default function App() {
  const [user, setUser] = useState()
  useEffect(() => onAuthStateChanged(auth, setUser), [])
  if (user === undefined) return null
  if (user) return <Live user={user} />
  return (
    <main className="page signin">
      <p className="wordmark">StopMouse</p>
      <button className="primary" onClick={signIn}>Sign in with Google</button>
    </main>
  )
}

function Live({ user }) {
  const game = useLive(gameRef)
  const users = useLive(usersRef)
  const fixtures = useLive(fixturesRef)
  const [sheet, open] = useState(null)
  const [, page = '', id] = useHash()

  // The first person to sign in creates the game and becomes admin
  useEffect(() => {
    runTransaction(db, async tx => {
      if (!(await tx.get(gameRef)).exists()) {
        tx.set(gameRef, { name: 'Weekly game', date: new Date().toISOString().slice(0, 10), time: '19:00', venue: '', perTeam: 5, pub: '', pubNote: '', admins: [user.uid] })
      }
    })
  }, [user.uid])

  if (!game || !users || !fixtures) return null

  const me = users.find(u => u.id === user.uid)
  const saveGame = changes => {
    const batch = writeBatch(db)
    const newWeek = changes.date && changes.date !== game.date
    batch.update(gameRef, newWeek ? { ...changes, pub: '', pubNote: '' } : changes)
    if (newWeek) users.forEach(u => batch.update(doc(db, 'users', u.id), { status: '' }))
    return batch.commit()
  }
  const app = {
    game, users, fixtures, me, open, saveGame,
    teams: TEAMS.map(t => ({ ...t, name: game.teams?.[t.id] || t.name })),
    isAdmin: game.admins.includes(user.uid),
    join: team => setDoc(doc(db, 'users', user.uid), { name: user.displayName || user.email, team }, { merge: true }),
  }
  const Page = PAGES[page] || Main

  return (
    <AppContext.Provider value={app}>
      {me && <TabBar page={page} />}
      <main className="page">{me ? <Page id={id} /> : <Join />}</main>
      {sheet && <Sheet {...sheet} close={() => open(null)} />}
    </AppContext.Provider>
  )
}
