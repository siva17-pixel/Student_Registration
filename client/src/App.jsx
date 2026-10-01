import { useEffect, useState } from 'react'
import './App.css'

const companies = [
  { name: 'TCS', mark: 'T', color: 'teal' },
  { name: 'Wipro', mark: 'W', color: 'blue' },
  { name: 'Infosys', mark: 'I', color: 'orange' },
  { name: 'Accenture', mark: 'A', color: 'violet' },
  { name: 'Cognizant', mark: 'C', color: 'green' },
  { name: 'HCLTech', mark: 'H', color: 'red' },
  { name: 'Capgemini', mark: 'C', color: 'blue' },
  { name: 'IBM', mark: 'IBM', color: 'navy' },
  { name: 'Deloitte', mark: 'D', color: 'green' },
  { name: 'Zoho', mark: 'Z', color: 'orange' },
]

const emptyProfile = {
  name: '',
  studentId: '',
  department: '',
  year: '',
  section: '',
  bloodGroup: '',
  fatherName: '',
  motherName: '',
  mobile: '',
  email: '',
  arrears: '0',
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function App() {
  const [activeView, setActiveView] = useState('student')
  const [stage, setStage] = useState('profile')
  const [profile, setProfile] = useState(emptyProfile)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [activeCompany, setActiveCompany] = useState('All companies')
  const [search, setSearch] = useState('')
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    let ignore = false
    fetch(`${apiUrl}/registrations`)
      .then((response) => {
        if (!response.ok) throw new Error('Could not load registrations.')
        return response.json()
      })
      .then((data) => {
        if (!ignore) setRegistrations(data)
      })
      .catch(() => {
        if (!ignore) setApiError('Could not connect to the registration server. Please try again later.')
      })
    return () => { ignore = true }
  }, [])

  const updateProfile = (event) => {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
  }

  const continueFromProfile = (event) => {
    event.preventDefault()
    if (Number(profile.arrears) > 0) {
      setStage('ineligible')
      return
    }
    setStage('companies')
  }

  const toggleCompany = (companyName) => {
    setSelectedCompanies((current) => {
      if (current.includes(companyName)) {
        return current.filter((name) => name !== companyName)
      }
      if (current.length === 4) return current
      return [...current, companyName]
    })
  }

  const finishRegistration = async () => {
    if (selectedCompanies.length !== 4) return
    setApiError('')
    try {
      const response = await fetch(`${apiUrl}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          arrears: Number(profile.arrears),
          companies: selectedCompanies,
        }),
      })
      const registration = await response.json()
      if (!response.ok) throw new Error(registration.message || 'Could not submit registration.')
      setRegistrations((current) => [registration, ...current])
      setStage('complete')
    } catch (error) {
      setApiError(error.message || 'Could not connect to the registration server. Please try again.')
    }
  }

  const startNewRegistration = () => {
    setProfile(emptyProfile)
    setSelectedCompanies([])
    setStage('profile')
    setActiveView('student')
  }

  const visibleRegistrations = registrations.filter((student) => {
    const belongsToCompany = activeCompany === 'All companies' || student.companies.includes(activeCompany)
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [student.name, student.studentId, student.department, student.email]
      .some((value) => value.toLowerCase().includes(query))
    return belongsToCompany && matchesSearch
  })

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" onClick={() => setActiveView('student')}>
          <span className="brand-mark">P</span>
          <span className="brand-name">pathway<span>CAREER PLACEMENT</span></span>
        </a>
        <div className="topbar-right">
          <span className="academic-year">PLACEMENT CELL <i /> 2025–26</span>
          <nav className="view-switch" aria-label="Choose view">
            <button className={activeView === 'student' ? 'active' : ''} onClick={() => setActiveView('student')}>Student</button>
            <button className={activeView === 'admin' ? 'active' : ''} onClick={() => setActiveView('admin')}>Admin</button>
          </nav>
        </div>
      </header>

      {activeView === 'student' ? (
        <main className="main-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">CAMPUS PLACEMENTS / STUDENT PORTAL</p>
              <h1>{stage === 'complete' ? 'You’re on your way.' : 'Your next chapter starts here.'}</h1>
              <p className="intro-copy">Share your details to get started with this year’s placement drive.</p>
            </div>
            <div className="welcome-stamp"><span>26</span><small>GRADUATING<br />CLASS</small></div>
          </section>

          {stage !== 'complete' && (
            <div className="progress-strip" aria-label={`Registration step ${stage === 'companies' ? 2 : 1} of 2`}>
              <div className={`progress-step ${stage !== 'companies' ? 'current' : 'done'}`}><span>01</span><div><b>Student profile</b><small>Your details</small></div></div>
              <div className={`progress-line ${stage === 'companies' ? 'filled' : ''}`} />
              <div className={`progress-step ${stage === 'companies' ? 'current' : ''}`}><span>02</span><div><b>Company choices</b><small>Choose four</small></div></div>
            </div>
          )}

          {stage === 'profile' && (
            <form className="form-panel" onSubmit={continueFromProfile}>
              <div className="section-heading">
                <div><span className="section-index">01 / PROFILE</span><h2>Student information</h2></div>
                <span className="required-note"><i /> Required fields</span>
              </div>
              <div className="form-grid">
                <label className="field field-wide">Student full name<input name="name" value={profile.name} onChange={updateProfile} placeholder="As it appears on your records" autoComplete="name" required /></label>
                <label className="field">Student ID<input name="studentId" value={profile.studentId} onChange={updateProfile} placeholder="e.g. 22CS104" required /></label>
                <label className="field">Department<input name="department" value={profile.department} onChange={updateProfile} placeholder="e.g. Computer Science" required /></label>
                <label className="field">Year<select name="year" value={profile.year} onChange={updateProfile} required><option value="" disabled>Select year</option><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option></select></label>
                <label className="field">Section<select name="section" value={profile.section} onChange={updateProfile} required><option value="" disabled>Select section</option>{['A', 'B', 'C', 'D', 'E'].map((section) => <option key={section}>{section}</option>)}</select></label>
                <label className="field">Blood group<select name="bloodGroup" value={profile.bloodGroup} onChange={updateProfile} required><option value="" disabled>Select blood group</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group}>{group}</option>)}</select></label>
              </div>

              <div className="form-divider" />
              <div className="subsection-title"><span className="subsection-symbol">02</span><div><h3>Family & contact</h3><p>So we can reach you and your family when it matters.</p></div></div>
              <div className="form-grid">
                <label className="field">Father’s name<input name="fatherName" value={profile.fatherName} onChange={updateProfile} placeholder="Full name" required /></label>
                <label className="field">Mother’s name<input name="motherName" value={profile.motherName} onChange={updateProfile} placeholder="Full name" required /></label>
                <label className="field">Mobile number<input name="mobile" type="tel" inputMode="numeric" value={profile.mobile} onChange={updateProfile} placeholder="10-digit mobile number" pattern="[0-9]{10}" maxLength="10" autoComplete="tel" required /></label>
                <label className="field">Email address<input name="email" type="email" value={profile.email} onChange={updateProfile} placeholder="you@college.edu" autoComplete="email" required /></label>
              </div>

              <div className="form-divider" />
              <div className="arrears-row">
                <div><span className="subsection-symbol">03</span><div><h3>Academic standing</h3><p>Enter the number of current standing arrears.</p></div></div>
                <label className="field arrears-field">Standing arrears<input name="arrears" type="number" min="0" step="1" value={profile.arrears} onChange={updateProfile} required /></label>
              </div>

              <div className="form-footer"><span><b>Placement eligibility</b> requires zero standing arrears.</span><button className="button button-primary" type="submit">Continue to companies <span aria-hidden="true">→</span></button></div>
            </form>
          )}

          {stage === 'companies' && (
            <section className="form-panel company-panel">
              <div className="section-heading">
                <div><span className="section-index">02 / YOUR SHORTLIST</span><h2>Choose your four companies</h2></div>
                <div className="choice-count"><strong>{selectedCompanies.length}</strong><span>of 4 selected</span></div>
              </div>
              <p className="company-intro">Pick the organizations you’d like to be considered for. Your choices can’t be changed after submitting.</p>
              <div className="company-grid">
                {companies.map((company) => {
                  const selected = selectedCompanies.includes(company.name)
                  const locked = selectedCompanies.length === 4 && !selected
                  return <button type="button" key={company.name} className={`company-option ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`} onClick={() => toggleCompany(company.name)} aria-pressed={selected} disabled={locked}>
                    <span className={`company-mark ${company.color}`}>{company.mark}</span>
                    <span className="company-name">{company.name}</span>
                    <span className="selection-check" aria-hidden="true">{selected ? '✓' : '+'}</span>
                  </button>
                })}
              </div>
              {apiError && <p role="alert">{apiError}</p>}
              <div className="form-footer company-footer"><button className="button button-quiet" type="button" onClick={() => setStage('profile')}><span aria-hidden="true">←</span> Back to details</button><button className="button button-primary" type="button" onClick={finishRegistration} disabled={selectedCompanies.length !== 4}>Submit registration <span aria-hidden="true">→</span></button></div>
            </section>
          )}

          {stage === 'ineligible' && (
            <section className="message-panel">
              <span className="message-mark">!</span><p className="section-index">PLACEMENT ELIGIBILITY</p><h2>Let’s review your academic standing.</h2><p>Students need zero standing arrears to continue to company selection. Your profile hasn’t been submitted. Update your details if the arrears count was entered by mistake.</p><button className="button button-primary" onClick={() => setStage('profile')}><span aria-hidden="true">←</span> Review my details</button>
            </section>
          )}

          {stage === 'complete' && (
            <section className="message-panel complete-panel">
              <span className="message-mark success-mark">✓</span><p className="section-index">REGISTRATION RECEIVED</p><h2>Thanks, {profile.name.split(' ')[0]}.</h2><p>Your student profile and company preferences have been saved. The placement cell can now review your registration.</p><div className="submitted-companies">{selectedCompanies.map((name) => <span key={name}>{name}</span>)}</div><button className="button button-primary" onClick={startNewRegistration}>Register another student <span aria-hidden="true">→</span></button></section>
          )}
          <footer className="page-foot"><span>PATHWAY PLACEMENT CELL</span><span>Questions? Contact your department coordinator</span></footer>
        </main>
      ) : (
        <main className="main-content admin-content">
          <section className="welcome-row admin-welcome"><div><p className="eyebrow">CAMPUS PLACEMENTS / ADMINISTRATION</p><h1>Student directory</h1><p className="intro-copy">Review registrations by company preference.</p></div><div className="admin-total"><strong>{registrations.length.toString().padStart(2, '0')}</strong><span>REGISTERED<br />STUDENTS</span></div></section>
          <section className="admin-panel">
            <div className="admin-panel-head"><div><span className="section-index">PLACEMENT DRIVE / 2025–26</span><h2>Company applicants</h2></div><label className="search-field"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students" aria-label="Search students" /></label></div>
            <div className="company-tabs" role="tablist" aria-label="Filter by company"><button role="tab" aria-selected={activeCompany === 'All companies'} className={activeCompany === 'All companies' ? 'active' : ''} onClick={() => setActiveCompany('All companies')}>All students <span>{registrations.length}</span></button>{companies.map((company) => {
              const count = registrations.filter((student) => student.companies.includes(company.name)).length
              return <button role="tab" aria-selected={activeCompany === company.name} className={activeCompany === company.name ? 'active' : ''} key={company.name} onClick={() => setActiveCompany(company.name)}>{company.name}<span>{count}</span></button>
            })}</div>
            <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>DEPARTMENT</th><th>YEAR / SECTION</th><th>EMAIL</th><th>MOBILE</th></tr></thead><tbody>{visibleRegistrations.map((student) => <tr key={`${student.studentId}-${student.registeredAt}`}><td><div className="student-cell"><span>{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><b>{student.name}</b></div></td><td className="id-cell">{student.studentId}</td><td>{student.department}</td><td>{student.year} / {student.section}</td><td>{student.email}</td><td>{student.mobile}</td></tr>)}</tbody></table>
              {visibleRegistrations.length === 0 && <div className="empty-state"><span className="empty-icon">—</span><h3>{search ? 'No matching students' : activeCompany === 'All companies' ? 'No registrations yet' : `No applicants for ${activeCompany}`}</h3><p>{search ? 'Try another name, student ID, department, or email.' : 'Student registrations will appear here when they are submitted.'}</p></div>}
            </div>
            <div className="table-foot"><span>Showing <b>{visibleRegistrations.length}</b> {visibleRegistrations.length === 1 ? 'student' : 'students'}</span><span>{activeCompany === 'All companies' ? 'All company preferences' : `Preference: ${activeCompany}`}</span></div>
          </section>
          <footer className="page-foot"><span>PATHWAY PLACEMENT CELL</span><span>Student information is stored in this browser</span></footer>
        </main>
      )}
    </div>
  )
}

export default App
