import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './story.css'

type Metric = 'Travel time' | 'Miles to location' | 'Hazards'
type DayType = 'weekday' | 'weekend'
type RouteOption = 'fastest' | 'scenic'
type TeamRole = 'admin' | 'collaborator' | 'guest'

const metrics: Metric[] = ['Travel time', 'Miles to location', 'Hazards']
const chapters = [
  {
    id: 'first-wave',
    number: '01',
    time: '07:30',
    title: 'Leave home with a little room to breathe.',
    copy: 'A calm departure gives the rest of the day some useful margin. Check traffic before leaving and keep the first transfer unhurried.',
    duration: '20 min to get ready',
    travel: '30 min to cafe',
    stop: 'HOME',
  },
  {
    id: 'midday-pause',
    number: '02',
    time: '08:00',
    title: 'Juniper Cafe makes an easy first stop.',
    copy: 'Dummy review: “Warm service, generous pastries, and a quiet corner for planning the day. It is small, but the coffee arrives quickly and the room feels welcoming.”',
    duration: '45 min stop',
    travel: '30 min from home',
    stop: 'JUNIPER CAFE',
  },
  {
    id: 'after-hours',
    number: '03',
    time: '09:15',
    title: 'Take the long way through Alder Park.',
    copy: 'Dummy review: “A spacious green pause with shady paths, clean benches, and just enough activity to feel lively. Best enjoyed without rushing the next departure.”',
    duration: '90 min stop',
    travel: '15 min from cafe',
    stop: 'ALDER PARK',
  },
  {
    id: 'dinner-stop',
    number: '04',
    time: '12:00',
    title: 'Cedar Table keeps lunch close and unhurried.',
    copy: 'Dummy review: “Thoughtful seasonal plates, a bright dining room, and staff who know when to check in. A reliable choice when the group needs a proper reset.”',
    duration: '75 min stop',
    travel: '20 min from park',
    stop: 'CEDAR TABLE',
  },
  {
    id: 'hotel-stop',
    number: '05',
    time: '14:00',
    title: 'Check in at The Lantern Hotel.',
    copy: 'Dummy review: “Simple rooms, a generous lobby, and a front desk that makes late arrivals feel easy. A practical finish for a day built around moving well.”',
    duration: 'Overnight stay',
    travel: '15 min from dinner',
    stop: 'THE LANTERN HOTEL',
  },
]

const baseData = [
  { stop: 'Start', 'Travel time': 0, 'Miles to location': 0, Hazards: 0 },
  { stop: 'Stop 1', 'Travel time': 9, 'Miles to location': 0.8, Hazards: 1 },
  { stop: 'Stop 2', 'Travel time': 24, 'Miles to location': 2.6, Hazards: 1 },
  { stop: 'Stop 3', 'Travel time': 38, 'Miles to location': 4.1, Hazards: 4 },
  { stop: 'Stop 4', 'Travel time': 54, 'Miles to location': 6.8, Hazards: 4 },
  { stop: 'Stop 5', 'Travel time': 71, 'Miles to location': 8.1, Hazards: 7 },
  { stop: 'Stop 6', 'Travel time': 95, 'Miles to location': 11.7, Hazards: 8 },
  { stop: 'Stop 7', 'Travel time': 121, 'Miles to location': 15.3, Hazards: 12 },
]

const colors: Record<Metric, string> = {
  'Travel time': '#ed5838',
  'Miles to location': '#21786b',
  Hazards: '#bb9416',
}

const routeStops = [
  { id: 'north-station', label: 'North Station', detail: 'Start point', wait: 0, x: 12, y: 27 },
  { id: 'market', label: 'Market', detail: 'Coffee + supplies', wait: 6, x: 39, y: 42 },
  { id: 'parkside', label: 'Parkside', detail: 'Main event', wait: 18, x: 68, y: 27 },
  { id: 'old-quay', label: 'Old Quay', detail: 'Dinner stop', wait: 35, x: 84, y: 70 },
]

const routeSegments = [
  { from: routeStops[0], to: routeStops[1], status: 'clear', duration: 12, scenicDuration: 16, trafficDelay: 2 },
  { from: routeStops[1], to: routeStops[2], status: 'slow', duration: 19, scenicDuration: 23, trafficDelay: 7 },
  { from: routeStops[2], to: routeStops[3], status: 'busy', duration: 27, scenicDuration: 30, trafficDelay: 11 },
]

const weatherForecast = [
  { time: 'NOW', icon: '☀', temperature: '68°', rain: '8%', wind: '6 mph' },
  { time: '12 PM', icon: '☀', temperature: '71°', rain: '4%', wind: '8 mph' },
  { time: '3 PM', icon: '⛅', temperature: '69°', rain: '16%', wind: '11 mph' },
  { time: '6 PM', icon: '🌤', temperature: '64°', rain: '22%', wind: '9 mph' },
  { time: '9 PM', icon: '☾', temperature: '59°', rain: '12%', wind: '5 mph' },
]

const sharedPeople = [
  { initials: 'MC', name: 'Maya Chen', role: 'Collaborator', status: 'Editing now', color: '#3478c5' },
  { initials: 'JL', name: 'Jordan Lee', role: 'Collaborator', status: 'Added a stop', color: '#bb9416' },
  { initials: 'RP', name: 'Riley Park', role: 'Guest', status: 'Viewing plan', color: '#21786b' },
]

function App() {
  const [dayType, setDayType] = useState<DayType>('weekday')
  const [visibleMetrics, setVisibleMetrics] = useState<Metric[]>(metrics)
  const [activeChapter, setActiveChapter] = useState(chapters[0].id)
  const [routeOption, setRouteOption] = useState<RouteOption>('fastest')
  const [trafficLayer, setTrafficLayer] = useState(true)
  const [selectedStop, setSelectedStop] = useState(routeStops[1].id)
  const [teamRole, setTeamRole] = useState<TeamRole>('admin')
  const [selectedForecast, setSelectedForecast] = useState(0)
  const [routeEditing, setRouteEditing] = useState(false)
  const [invitePeople, setInvitePeople] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveChapter(visible.target.id)
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.2, 0.5] },
    )

    document.querySelectorAll('.story-chapter').forEach((chapter) => observer.observe(chapter))
    return () => observer.disconnect()
  }, [])

  const chartData = baseData.map((point) => ({
    ...point,
    ...(dayType === 'weekend'
      ? {
          'Travel time': Math.round(point['Travel time'] * 0.86),
          'Miles to location': point['Miles to location'],
          Hazards: Math.max(0, Math.round(point.Hazards * 0.6)),
        }
      : {}),
  }))

  const currentChapter = chapters.find((chapter) => chapter.id === activeChapter) ?? chapters[0]
  const selectedStopData = routeStops.find((stop) => stop.id === selectedStop) ?? routeStops[0]
  const selectedWeather = weatherForecast[selectedForecast]
  const selectedStopIndex = routeStops.findIndex((stop) => stop.id === selectedStop)
  const calculateRouteTime = (option: RouteOption) => routeSegments.slice(0, Math.max(selectedStopIndex, 0)).reduce(
    (total, segment) => total + (option === 'fastest' ? segment.duration : segment.scenicDuration) + (trafficLayer ? segment.trafficDelay : 0) + (segment.to.wait ?? 0),
    0,
  )
  const fastestTotal = calculateRouteTime('fastest')
  const scenicTotal = calculateRouteTime('scenic')
  const routeMetrics = routeSegments.slice(0, Math.max(selectedStopIndex, 0)).reduce(
    (totals, segment) => ({
      travel: totals.travel + (routeOption === 'fastest' ? segment.duration : segment.scenicDuration),
      traffic: totals.traffic + (trafficLayer ? segment.trafficDelay : 0),
      wait: totals.wait + (segment.to.wait ?? 0),
    }),
    { travel: 0, traffic: 0, wait: 0 },
  )
  const totalMinutes = routeMetrics.travel + routeMetrics.traffic + routeMetrics.wait
  const arrivalMinutes = 8 * 60 + 10 + totalMinutes
  const arrivalTime = `${String(Math.floor(arrivalMinutes / 60)).padStart(2, '0')}:${String(arrivalMinutes % 60).padStart(2, '0')}`

  function toggleMetric(metric: Metric) {
    setVisibleMetrics((current) =>
      current.includes(metric)
        ? current.length === 1 ? current : current.filter((item) => item !== metric)
        : [...current, metric],
    )
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Common Ground route planner home">
          <span className="wordmark-symbol" aria-hidden="true">cg</span>
          <span>COMMON<br />GROUND</span>
        </a>
        <span className="header-note">Route planning + data visualization <span>·</span> No. 01</span>
        <a className="header-link" href="#route-planner">Open the route planner <span aria-hidden="true">↓</span></a>
      </header>

      <main id="top">
        <section className="opening" aria-labelledby="story-title">
          <p className="eyebrow"><span className="eyebrow-dot" /> TRIP + EVENT PLANNING TOOL <span> / </span> COMMON GROUND</p>
          <div className="opening-grid">
            <h1 id="story-title">Plan the route.<br />Read the <em>journey.</em></h1>
            <div className="opening-aside">
              <p>Build a trip or event plan from stops, travel times, traffic, and time on site. See the whole day before you set out.</p>
              <a href="#route-planner" className="text-link">Open the route planner <span aria-hidden="true">↘</span></a>
            </div>
          </div>
        </section>

        <section className="explorer" id="explorer" aria-labelledby="chart-title">
          <div className="explorer-heading">
            <div>
              <p className="eyebrow">ROUTE LOGISTICS OVERVIEW</p>
              <h2 id="chart-title">Know what the journey will take</h2>
            </div>
            <div className="day-switch" role="group" aria-label="Choose day type">
              <button type="button" aria-pressed={dayType === 'weekday'} onClick={() => setDayType('weekday')}>Weekday</button>
              <button type="button" aria-pressed={dayType === 'weekend'} onClick={() => setDayType('weekend')}>Weekend</button>
            </div>
          </div>

          <div className="chart-layout">
            <aside className="chapter-aside" aria-live="polite">
              <span className="chapter-index">{currentChapter.number} <i>/ 05</i></span>
              <p className="chapter-time">START {currentChapter.time}</p>
              <h3>{currentChapter.title}</h3>
              <p className="chapter-copy">{currentChapter.copy}</p>
              <a className="text-link" href={`#${currentChapter.id}`}>View stop context <span aria-hidden="true">↘</span></a>
            </aside>

            <figure className="chart-figure">
              <div className="chart-legend" role="group" aria-label="Toggle route logistics metrics">
                {metrics.map((metric) => (
                  <button
                    className="legend-item"
                    type="button"
                    aria-pressed={visibleMetrics.includes(metric)}
                    key={metric}
                    onClick={() => toggleMetric(metric)}
                  >
                    <span className="legend-dot" style={{ '--legend-color': colors[metric] } as React.CSSProperties} />
                    {metric}
                  </button>
                ))}
              </div>
              <div className="chart-frame" role="img" aria-label={`Dummy route logistics data for a ${dayType} plan`}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 18, right: 12, left: -20, bottom: 2 }}>
                    <defs>
                      {metrics.map((metric) => (
                        <linearGradient id={`fill-${metric.replaceAll(' ', '-')}`} key={metric} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colors[metric]} stopOpacity={0.19} />
                          <stop offset="100%" stopColor={colors[metric]} stopOpacity={0.015} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid vertical={false} stroke="#dcded8" strokeDasharray="2 6" />
                    <XAxis dataKey="stop" tickLine={false} axisLine={false} tick={{ fill: '#777a73', fontSize: 11 }} dy={12} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#777a73', fontSize: 11 }} tickFormatter={(value: number) => `${value}`} />
                    <Tooltip
                      cursor={{ stroke: '#242a25', strokeDasharray: '3 4' }}
                      contentStyle={{ border: '1px solid #dcded8', borderRadius: 2, fontSize: 12 }}
                      labelStyle={{ color: '#242a25', fontWeight: 700, marginBottom: 4 }}
                      formatter={(value, name) => [`${value} ${name === 'Travel time' ? 'min' : name === 'Miles to location' ? 'mi' : 'hazards'}`, name]}
                    />
                    {metrics.filter((metric) => visibleMetrics.includes(metric)).map((metric) => (
                      <Area
                        key={metric}
                        type="monotone"
                        dataKey={metric}
                        stroke={colors[metric]}
                        strokeWidth={2.5}
                        fill={`url(#fill-${metric.replaceAll(' ', '-')})`}
                        dot={{ r: 3, strokeWidth: 1, stroke: colors[metric], fill: '#f4f5ef' }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#f4f5ef' }}
                        animationDuration={650}
                        animationEasing="ease-in-out"
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <figcaption>
                <span>Dummy route logistics <i>·</i> cumulative values by stop</span>
                <span>Replace with connected trip data</span>
              </figcaption>
            </figure>
          </div>
          <p className="data-note"><span aria-hidden="true">✳</span> Demo dataset: use your connected traffic, venue, weather, or event data here.</p>
        </section>

        <section className="route-planner" id="route-planner" aria-labelledby="planner-title">
          <div className="planner-heading">
            <div>
              <p className="eyebrow">ROUTE PLANNER + TRAFFIC VIEW</p>
              <h2 id="planner-title">Turn stops into a plan.</h2>
            </div>
            <span className="live-pill"><span /> Live traffic · 08:12</span>
          </div>

          <div className="planner-grid">
            <div className="map-panel">
              <div className="map-toolbar">
                <div className="map-search"><span aria-hidden="true">⌕</span> Search places or add a stop</div>
                <button className={`map-toggle ${trafficLayer ? 'is-active' : ''}`} type="button" aria-pressed={trafficLayer} onClick={() => setTrafficLayer((current) => !current)}>
                  <span className="traffic-icon" aria-hidden="true" /> Traffic
                </button>
              </div>
              <div className={`route-map ${trafficLayer ? 'traffic-visible' : ''}`} role="img" aria-label="Schematic map showing a route from North Station through Market and Parkside to Old Quay">
                <div className="map-water" />
                <div className="map-street street-one" />
                <div className="map-street street-two" />
                <div className="map-street street-three" />
                <div className="route-line route-line-one" />
                <div className="route-line route-line-two" />
                <div className="route-line route-line-three" />
                {routeSegments.map((segment) => (
                  <span className={`traffic-segment ${segment.status}`} key={`${segment.from.id}-${segment.to.id}`} aria-hidden="true" />
                ))}
                {routeStops.map((stop, index) => (
                  <button
                    className={`map-stop ${selectedStop === stop.id ? 'is-selected' : ''}`}
                    style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
                    key={stop.id}
                    type="button"
                    onClick={() => setSelectedStop(stop.id)}
                    aria-label={`Select ${stop.label}, ${stop.detail}`}
                  >
                    <span>{index + 1}</span>
                  </button>
                ))}
                <span className="map-label label-market">MARKET</span>
                <span className="map-label label-parkside">PARKSIDE</span>
                <span className="map-label label-quay">OLD QUAY</span>
                <div className="map-zoom" aria-label="Map controls"><button type="button" aria-label="Zoom in">+</button><button type="button" aria-label="Zoom out">−</button></div>
              </div>
              <div className="map-legend"><span><i className="legend-clear" /> Clear</span><span><i className="legend-slow" /> Slowing</span><span><i className="legend-busy" /> Busy</span></div>
            </div>

            <aside className="route-details" aria-live="polite">
              <div className="route-summary"><span className="summary-label">TIME TO {selectedStopData.label.toUpperCase()}</span><strong>{totalMinutes} min</strong><span>· {routeMetrics.travel} travel · {routeMetrics.traffic} traffic · {routeMetrics.wait} wait</span></div>
              <div className="route-options" role="group" aria-label="Choose route">
                <button type="button" aria-pressed={routeOption === 'fastest'} onClick={() => setRouteOption('fastest')}><span className="option-line fastest-line" /><span><b>Fastest</b><small>{fastestTotal} min · traffic-aware</small></span></button>
                <button type="button" aria-pressed={routeOption === 'scenic'} onClick={() => setRouteOption('scenic')}><span className="option-line scenic-line" /><span><b>Scenic</b><small>{scenicTotal} min · waterfront route</small></span></button>
              </div>
              <div className="stop-detail"><span className="summary-label">SELECTED STOP</span><h3>{selectedStopData.label}</h3><p>{selectedStopData.detail} · {selectedStopData.wait} min wait on arrival</p><button className="text-link" type="button">Add a note <span aria-hidden="true">↗</span></button></div>
              <div className="eta-card"><span>ARRIVE BY</span><strong>{arrivalTime}</strong><small>Leave North Station at 08:10 · {trafficLayer ? 'traffic included' : 'traffic hidden'}</small></div>
            </aside>
          </div>

          <div className="collab-panel" id="collaboration" aria-labelledby="collab-title">
            <div className="collab-copy"><p className="eyebrow">SHARED TRIP + EVENT MODE</p><h2 id="collab-title">Plan together, on the same map.</h2></div>
            <div className="role-control"><span className="summary-label">VIEW AS</span><div className="role-switch" role="group" aria-label="Choose collaboration role">{(['admin', 'collaborator', 'guest'] as TeamRole[]).map((role) => <button key={role} type="button" aria-pressed={teamRole === role} onClick={() => setTeamRole(role)}>{role}</button>)}</div><p className="role-note">{teamRole === 'admin' ? 'Full control · edit route and invite people' : teamRole === 'collaborator' ? 'Can suggest stops and add notes' : 'View-only access to route and timing'}</p><div className="role-actions"><button type="button" className={`role-toggle role-primary ${routeEditing ? 'is-on' : ''}`} aria-pressed={routeEditing} onClick={() => setRouteEditing((current) => !current)}><span className="toggle-track"><span /></span>{teamRole === 'admin' ? 'Edit route' : teamRole === 'collaborator' ? 'Suggest a stop' : 'Request access'}</button><button type="button" className={`role-toggle role-secondary ${invitePeople ? 'is-on' : ''}`} aria-pressed={invitePeople} onClick={() => setInvitePeople((current) => !current)}><span className="toggle-track"><span /></span>{teamRole === 'admin' ? 'Invite people' : teamRole === 'collaborator' ? 'Add a note' : 'Copy shared link'}</button></div></div>
            <div className="avatar-stack" aria-hidden="true"><span>MC</span><span>JL</span><span>RP</span></div>
          </div>
          <div className="profile-list" aria-label="People sharing this trip plan">
            {sharedPeople.map((person) => <div className="profile-row" key={person.name}><span className="profile-avatar" style={{ '--profile-color': person.color } as React.CSSProperties}>{person.initials}</span><span className="profile-info"><strong>{person.name}</strong><small>{person.role}</small></span><span className="profile-status"><i />{person.status}</span></div>)}
          </div>

          <section className="weather-panel" aria-labelledby="weather-title">
            <div className="weather-heading"><div><p className="eyebrow">LOCAL CONDITIONS · DUMMY DATA</p><h2 id="weather-title">Weather along the plan.</h2></div><span className="weather-location">SAN FRANCISCO, CA · TODAY</span></div>
            <div className="weather-grid">
              <div className="current-weather"><span className="weather-icon" aria-hidden="true">☀</span><div><strong>68°</strong><span>Clear and comfortable</span></div><div className="weather-stats"><span><b>Feels like</b> 67°</span><span><b>Humidity</b> 54%</span><span><b>Visibility</b> 10 mi</span></div></div>
              <div className="forecast-strip" aria-label="Hourly weather forecast">{weatherForecast.map((forecast, index) => <button className={`forecast-item ${selectedForecast === index ? 'is-selected' : ''}`} type="button" aria-pressed={selectedForecast === index} onClick={() => setSelectedForecast(index)} key={forecast.time}><span className="forecast-time">{forecast.time}</span><span className="forecast-icon" aria-hidden="true">{forecast.icon}</span><strong>{forecast.temperature}</strong><small>{forecast.rain} rain</small><small>{forecast.wind}</small></button>)}</div>
            </div>
            <div className="weather-detail"><span className="summary-label">SELECTED WEATHER WINDOW · {selectedWeather.time}</span><strong>{selectedWeather.temperature} · {selectedWeather.rain} chance of rain · wind {selectedWeather.wind}</strong><span>{selectedForecast > 2 ? 'Plan a lighter pace after sunset and keep the hotel transfer covered.' : 'Clear conditions support the park stop and an easy walking transfer.'}</span></div>
            <p className="weather-note"><span aria-hidden="true">✳</span> Route note: the weather layer updates the plan window as you move through the day.</p>
          </section>
        </section>

        <section className="story-section" id="chapters" aria-labelledby="chapters-title">
          <div className="story-heading">
            <p className="eyebrow">ONE DAY ITINERARY</p>
            <h2 id="chapters-title">The <em>Master Plan</em></h2>
          </div>
          <div className="story-chapters">
            {chapters.map((chapter) => (
              <article className="story-chapter" id={chapter.id} key={chapter.id}>
                <div className="story-marker"><span>{chapter.number}</span><span className="marker-line" /></div>
                <div className="story-body">
                  <p className="chapter-time">START {chapter.time}</p>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.copy}</p>
                  <div className="itinerary-meta" aria-label={`${chapter.stop} itinerary details`}>
                    <span><b>STOP</b>{chapter.stop}</span>
                    <span><b>DURATION</b>{chapter.duration}</span>
                    <span><b>TRAVEL</b>{chapter.travel}</span>
                  </div>
                  <button className="text-link chapter-link" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Use this time window <span aria-hidden="true">↑</span>
                  </button>
                </div>
                <div className="story-stamp" aria-hidden="true">{chapter.number}<span>DAY<br />STOP</span></div>
              </article>
            ))}
          </div>
        </section>

        <section className="closing-note">
          <span className="closing-mark" aria-hidden="true">↗</span>
          <p>A route gets you there.<br /><em>Data helps you plan the day.</em></p>
          <div className="route-overview" aria-label="Zoomed-out real map preview of the route from start to finish">
            <div className="route-overview-heading"><span>OVERALL ROUTE</span><span>START → FINISH</span></div>
            <div className="route-map-frame">
              <iframe title="Real map preview of San Francisco route area" src="https://www.openstreetmap.org/export/embed.html?bbox=-122.455%2C37.755%2C-122.395%2C37.795&layer=mapnik&marker=37.7749%2C-122.4194" loading="lazy" />
              <div className="map-route-overlay" aria-hidden="true"><span className="overview-start">START</span><span className="overview-finish">FINISH</span><span className="overview-route route-leg-one" /><span className="overview-route route-leg-two" /><span className="overview-route route-leg-three" /><span className="overview-route route-leg-four" /></div>
            </div>
            <div className="route-overview-caption"><span>San Francisco map preview · route context</span><span>OpenStreetMap</span></div>
          </div>
          <span className="closing-caption">END OF PLANNING VIEW 001</span>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark" href="#top"><span className="wordmark-symbol" aria-hidden="true">cg</span><span>COMMON<br />GROUND</span></a>
        <p>A shared workspace for routes, timing, and event logistics.</p>
        <a href="#top" className="back-top">Back to top ↑</a>
      </footer>
    </div>
  )
}

export default App
