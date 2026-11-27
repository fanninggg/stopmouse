import { arrayRemove, arrayUnion } from 'firebase/firestore'
import { signOut } from './firebase'
import { useApp, Icon, I, Bib, Week, fmtDate, initials } from './ui'
import { Match, byDate, useFixtureSheet } from './Fixtures'

const Row = ({ title, detail, onClick, children }) => (
  <button className="item" onClick={onClick}>
    {children}
    <span className="grow stack">
      <span className="name">{title}</span>
      {detail && <span className="muted small">{detail}</span>}
    </span>
    <span className="faint"><Icon d={I.chevron} w={2.2} /></span>
  </button>
)

export default function Admin() {
  const { game, teams, users, fixtures, me, isAdmin, open, saveGame } = useApp()
  const editFixture = useFixtureSheet()
  const isUserAdmin = u => game.admins.includes(u.id)
  const rename = t => open({
    title: 'Team name', values: t, fields: [{ key: 'name', label: 'Name' }],
    onSave: v => saveGame({ [`teams.${t.id}`]: v.name }),
  })

  return (
    <>
      <nav className="row">
        <a href="#/" className="back"><Icon d={I.back} size={20} w={2.2} />This week</a>
      </nav>
      <h1>{isAdmin ? 'Admin' : 'Settings'}</h1>

      {isAdmin && (
      <>
      <section>
        <h2>Fixtures</h2>
        <button className="ghost" onClick={() => editFixture()}>Add fixture</button>
        {byDate(fixtures, true).map(([date, list]) => (
          <Week key={date} title={fmtDate(date)}>{list.map(f => <Match key={f.id} f={f} onClick={() => editFixture(f)} />)}</Week>
        ))}
      </section>

      <section>
        <h2>Teams</h2>
        <div className="card">{teams.map(t => <Row key={t.id} title={t.name} onClick={() => rename(t)}><Bib t={t} size="lg" /></Row>)}</div>
      </section>

      <section>
        <h2>Admins</h2>
        <div className="card">
          {users.map(u => (
            <div className="item player" key={u.id}>
              <span className="face">{initials(u.name)}</span>
              <span className="grow stack">
                <span className="name">{u.name}</span>
                <span className="muted small">{isUserAdmin(u) ? 'Admin' : 'Player'}</span>
              </span>
              {u.id !== me.id && (
                <button className="pill" onClick={() => saveGame({ admins: (isUserAdmin(u) ? arrayRemove : arrayUnion)(u.id) })}>
                  {isUserAdmin(u) ? 'Remove admin' : 'Make admin'}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
      </>
      )}

      <section>
        <h2>Account</h2>
        <button className="ghost" onClick={signOut}>Sign out</button>
        <p className="muted small center">Signed in as {me.name}.</p>
      </section>
    </>
  )
}
