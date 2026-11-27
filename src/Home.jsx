import { useApp, Icon, I, Bib, answer, fmtDate, fmtTime, initials } from './ui'

function TeamRow({ t }) {
  const { users, game, nextMatch } = useApp()
  const match = nextMatch(t.id)
  const players = users.filter(u => u.team === t.id)
  const playing = players.filter(u => answer(match, u) === 'in')
  const waiting = players.filter(u => !answer(match, u)).length
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
  const { game, teams, users, nextMatch } = useApp()
  // The next game is the earliest upcoming fixture, not the game slot.
  // Before any fixture exists there is no game to show.
  const match = teams.map(t => nextMatch(t.id)).filter(Boolean)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]

  return (
    <>
      <p className="wordmark">StopMouse</p>

      {match ? (
      <section className="hero">
        <div className="stack">
          <p className="eyebrow">{fmtDate(match.date)}</p>
          <h1>{fmtTime(match.time)}</h1>
          {match.venue && <p className="venue"><Icon d={I.pin} size={16} />{match.venue}</p>}
        </div>
        <hr />
        <div className="row">
          <p><span className="big">{users.filter(u => answer(nextMatch(u.team), u) === 'in').length}</span> of {game.perTeam * teams.length} playing</p>
          <p>{game.name}</p>
        </div>
      </section>
      ) : (
      <section className="hero">
        <div className="stack">
          <p className="eyebrow">This week</p>
          <h1>No game yet</h1>
        </div>
        <hr />
        <div className="row">
          <p>No fixtures yet</p>
          <p>{game.name}</p>
        </div>
      </section>
      )}

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
              <span className="name">{match?.pub || 'Not booked yet'}</span>
              {match?.pubNote && <span className="muted small">{match.pubNote}</span>}
            </span>
            {match?.pub && (
              <a className="round" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.pub)}`} aria-label={`Open ${match.pub} in Maps`}>
                <Icon d={I.arrow} />
              </a>
            )}
          </div>
        </div>
      </section>

      <a className="fab" href="#/admin" aria-label="Settings"><Icon d={I.cog} size={22} /></a>
    </>
  )
}
