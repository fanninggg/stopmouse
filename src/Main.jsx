import { useApp, Icon, I, Bib, fmtDate, fmtTime, initials } from './ui'

const addWeek = date => new Date(Date.parse(date) + 7 * 864e5).toISOString().slice(0, 10)

function TeamRow({ t }) {
  const { users, game } = useApp()
  const players = users.filter(u => u.team === t.id)
  const playing = players.filter(u => u.status === 'in')
  const waiting = players.filter(u => !u.status).length
  return (
    <a className="item" href={`#/team/${t.id}`}>
      <Bib t={t} size="lg" />
      <span className="grow stack">
        <span className="name">{t.name}</span>
        <span className="faces">
          {playing.map(u => <span key={u.id} className="face">{initials(u.name)}</span>)}
          <span className="muted small">{waiting ? `${waiting} yet to reply` : 'All replied'}</span>
        </span>
      </span>
      <span className="score">
        <span className="num">{playing.length}/{game.perTeam}</span>
        <span className="bar"><span style={{ width: `${Math.min(100, playing.length / game.perTeam * 100)}%` }} /></span>
      </span>
      <span className="faint"><Icon d={I.chevron} w={2.2} /></span>
    </a>
  )
}

export function Join() {
  const { teams, users, join } = useApp()
  return (
    <>
      <p className="wordmark">StopMouse</p>
      <section>
        <h2>Pick your team</h2>
        <div className="card">
          {teams.map(t => {
            const count = users.filter(u => u.team === t.id).length
            return (
              <button key={t.id} className="item" onClick={() => join(t.id)}>
                <Bib t={t} size="lg" />
                <span className="grow name">{t.name}</span>
                <span className="muted small">{count} {count === 1 ? 'player' : 'players'}</span>
              </button>
            )
          })}
        </div>
      </section>
    </>
  )
}

export default function Main() {
  const { game, teams, users, isAdmin, open, saveGame } = useApp()
  const editGame = () => open({
    title: 'Game details', values: game, onSave: saveGame,
    note: "Changing the date starts a fresh week. Who's in and drinks reset.",
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'date', label: 'Date', type: 'date', half: true },
      { key: 'time', label: 'Kick-off', type: 'time', half: true },
      { key: 'venue', label: 'Where' },
      { key: 'perTeam', label: 'Players per team', type: 'stepper', min: 1, max: 11 },
    ],
  })
  const editDrinks = () => open({
    title: 'Drinks after', values: game, onSave: saveGame,
    fields: [{ key: 'pub', label: 'Pub' }, { key: 'pubNote', label: 'Details', optional: true }],
  })

  return (
    <>
      <p className="wordmark">StopMouse</p>

      <section className="hero">
        <div className="row top">
          <div className="stack">
            <p className="eyebrow">{fmtDate(game.date)}</p>
            <h1>{fmtTime(game.time)}</h1>
            {game.venue && <p className="venue"><Icon d={I.pin} size={16} />{game.venue}</p>}
          </div>
          {isAdmin && <button className="round dark" aria-label="Edit game details" onClick={editGame}><Icon d={I.pencil} /></button>}
        </div>
        <hr />
        <div className="row">
          <p><span className="big">{users.filter(u => u.status === 'in').length}</span> of {game.perTeam * teams.length} playing</p>
          <p>{game.name}</p>
        </div>
      </section>

      <section>
        <h2>Teams</h2>
        <div className="card">{teams.map(t => <TeamRow key={t.id} t={t} />)}</div>
      </section>

      <section>
        <h2>Drinks after</h2>
        <div className="card">
          <div className="item">
            <span className="tile"><Icon d={I.drink} size={20} /></span>
            <span className="grow stack">
              <span className="name">{game.pub || 'Not booked yet'}</span>
              {game.pubNote && <span className="muted small">{game.pubNote}</span>}
            </span>
            {isAdmin && <button className="pill" onClick={editDrinks}>Change</button>}
            {game.pub && (
              <a className="round" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(game.pub)}`} aria-label={`Open ${game.pub} in Maps`}>
                <Icon d={I.arrow} />
              </a>
            )}
          </div>
        </div>
      </section>

      {isAdmin && (
        <section>
          <button className="ghost" onClick={() => saveGame({ date: addWeek(game.date) })}>Start next week</button>
          <p className="muted small center">Moves the date on 7 days and clears who's in and drinks.</p>
        </section>
      )}
    </>
  )
}
