'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { games, categories } from './data/games'
import styles from './page.module.css'

export default function Home() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedGame, setSelectedGame] = useState(null)
  const [step, setStep] = useState('info') // 'info' | 'payment' | 'success'
  const [form, setForm] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Suggest modal state
  const [showSuggest, setShowSuggest] = useState(false)
  const [suggestForm, setSuggestForm] = useState({ name: '', email: '', gameTitle: '', notes: '' })
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestError, setSuggestError] = useState('')
  const [suggestDone, setSuggestDone] = useState(false)

  const filtered = useMemo(() => {
    return games.filter(g => {
      const matchCat = activeCategory === 'All' || g.category === activeCategory
      const matchSearch = g.title.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [search, activeCategory])

  const openModal = (game) => {
    setSelectedGame(game)
    setStep('info')
    setForm({ name: '', email: '' })
    setError('')
  }

  const closeModal = () => {
    setSelectedGame(null)
    setStep('info')
    setError('')
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please fill in all fields.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/request-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          gameId: selectedGame.id,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setStep('payment')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const openSuggest = () => {
    setShowSuggest(true)
    setSuggestForm({ name: '', email: '', gameTitle: '', notes: '' })
    setSuggestError('')
    setSuggestDone(false)
  }

  const closeSuggest = () => {
    setShowSuggest(false)
    setSuggestError('')
    setSuggestDone(false)
  }

  const handleSuggestSubmit = async () => {
    if (!suggestForm.name.trim() || !suggestForm.email.trim() || !suggestForm.gameTitle.trim()) {
      setSuggestError('Please fill in your name, email, and the game title.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(suggestForm.email)) {
      setSuggestError('Please enter a valid email address.')
      return
    }

    setSuggestLoading(true)
    setSuggestError('')

    try {
      const res = await fetch('/api/suggest-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestForm),
      })

      const data = await res.json()

      if (data.success) {
        setSuggestDone(true)
      } else {
        setSuggestError('Something went wrong. Please try again.')
      }
    } catch {
      setSuggestError('Network error. Please try again.')
    } finally {
      setSuggestLoading(false)
    }
  }

  const categoryList = ['All', ...categories]

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⬡</span>
            <div>
              <div className={styles.logoTitle}>GAMEVAULT</div>
              <div className={styles.logoSub}>PH · PC GAMES STORE</div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.headerBadge}>
              <span className={styles.dot}></span>
              {games.length} TITLES AVAILABLE
            </div>
            <button className={styles.suggestBtn} onClick={openSuggest}>
              + REQUEST A GAME
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>PREMIUM PC GAMES</h1>
          <p className={styles.heroSub}>Pay via GCash · Get download link via email · ₱200 per game</p>
          <button className={styles.heroSuggestBtn} onClick={openSuggest}>
            <span>🔍</span> Can't find your game? Request it here
          </button>
        </div>
      </section>

      {/* Controls */}
      <div className={styles.controls}>
        <input
          className={styles.search}
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.categories}>
          {categoryList.map(cat => (
            <button
              key={cat}
              className={`${styles.catBtn} ${activeCategory === cat ? styles.catActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Game Count */}
      <div className={styles.resultCount}>
        <span className={styles.countNum}>{filtered.length}</span> games found
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {filtered.map((game, i) => (
          <div
            key={game.id}
            className={styles.card}
            onClick={() => openModal(game)}
            style={{ animationDelay: `${(i % 20) * 0.03}s` }}
          >
            <div className={styles.cardTop}>
              <span className={styles.cardCat}>{game.category}</span>
              <span className={styles.cardPrice}>₱{game.price}</span>
            </div>
            <h3 className={styles.cardTitle}>{game.title}</h3>
            <p className={styles.cardDesc}>{game.description}</p>
            <button className={styles.cardBtn}>
              REQUEST DOWNLOAD
              <span className={styles.cardBtnArrow}>→</span>
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎮</div>
            <p>No games found for "{search}"</p>
            <button className={styles.emptySuggestBtn} onClick={openSuggest}>
              Request "{search}" to be added →
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2025 GameVault PH · GCash: 09296729143 · kaipancho98@gmail.com</p>
      </footer>

      {/* Buy Modal */}
      {selectedGame && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={closeModal}>✕</button>

            {step === 'info' && (
              <>
                <div className={styles.modalHeader}>
                  <span className={styles.modalCat}>{selectedGame.category}</span>
                  <h2 className={styles.modalTitle}>{selectedGame.title}</h2>
                  <p className={styles.modalDesc}>{selectedGame.description}</p>
                  <div className={styles.modalPrice}>₱{selectedGame.price}</div>
                </div>

                <div className={styles.modalBody}>
                  <p className={styles.modalInstruction}>
                    Fill in your details. After submitting, you'll see GCash payment instructions with QR code. We'll email your download link once payment is confirmed.
                  </p>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Your Name</label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Juan dela Cruz"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Your Email</label>
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="juan@email.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  {error && <p className={styles.errorMsg}>{error}</p>}

                  <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'SENDING REQUEST...' : 'CONFIRM REQUEST →'}
                  </button>
                </div>
              </>
            )}

            {step === 'payment' && (
              <div className={styles.paymentStep}>
                <div className={styles.successIcon}>✓</div>
                <h2 className={styles.paymentTitle}>REQUEST RECEIVED!</h2>
                <p className={styles.paymentSub}>Hi {form.name}! Complete your GCash payment below.</p>

                <div className={styles.paymentCard}>
                  <div className={styles.paymentRow}>
                    <span>Game</span>
                    <span className={styles.paymentGame}>{selectedGame.title}</span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span>Amount</span>
                    <span className={styles.paymentAmount}>₱{selectedGame.price}</span>
                  </div>
                </div>

                {/* GCash QR Section */}
                <div className={styles.gcashCard}>
                  <div className={styles.gcashLabel}>SCAN TO PAY VIA GCASH / INSTAPAY</div>
                  <div className={styles.qrWrapper}>
                    <Image
                      src="/gcash-qr.png"
                      alt="GCash QR Code"
                      width={200}
                      height={200}
                      className={styles.qrImage}
                    />
                  </div>
                  <div className={styles.gcashOrDivider}>— or send manually —</div>
                  <div className={styles.gcashNumber}>09296729143</div>
                  <div className={styles.gcashTip}>Include your name in the GCash note</div>
                </div>

                <div className={styles.nextSteps}>
                  <p>📧 Check <strong>{form.email}</strong> for confirmation</p>
                  <p>⏳ Download link will be emailed once payment is verified</p>
                </div>

                <button className={styles.doneBtn} onClick={closeModal}>
                  DONE
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggest Game Modal */}
      {showSuggest && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeSuggest()}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={closeSuggest}>✕</button>

            {!suggestDone ? (
              <>
                <div className={styles.modalHeader}>
                  <span className={styles.suggestTag}>GAME REQUEST</span>
                  <h2 className={styles.modalTitle}>Request a Game</h2>
                  <p className={styles.modalDesc}>
                    Don't see a game in our store? Let us know and we'll try to add it!
                  </p>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Your Name</label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Juan dela Cruz"
                      value={suggestForm.name}
                      onChange={e => setSuggestForm({ ...suggestForm, name: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Your Email</label>
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="juan@email.com"
                      value={suggestForm.email}
                      onChange={e => setSuggestForm({ ...suggestForm, email: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Game Title <span className={styles.required}>*</span></label>
                    <input
                      className={`${styles.input} ${styles.inputHighlight}`}
                      type="text"
                      placeholder="e.g. Elden Ring, Baldur's Gate 3..."
                      value={suggestForm.gameTitle}
                      onChange={e => setSuggestForm({ ...suggestForm, gameTitle: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Additional Notes <span className={styles.optional}>(optional)</span></label>
                    <textarea
                      className={styles.textarea}
                      placeholder="Any details about the game, version, DLCs, etc."
                      value={suggestForm.notes}
                      onChange={e => setSuggestForm({ ...suggestForm, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {suggestError && <p className={styles.errorMsg}>{suggestError}</p>}

                  <button
                    className={styles.submitBtn}
                    onClick={handleSuggestSubmit}
                    disabled={suggestLoading}
                  >
                    {suggestLoading ? 'SENDING REQUEST...' : 'SUBMIT REQUEST →'}
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.paymentStep}>
                <div className={styles.successIcon}>✓</div>
                <h2 className={styles.paymentTitle}>REQUEST SENT!</h2>
                <p className={styles.paymentSub}>
                  Thanks {suggestForm.name}! We've received your request for{' '}
                  <strong className={styles.suggestGameName}>{suggestForm.gameTitle}</strong>.
                </p>
                <div className={styles.nextSteps}>
                  <p>📧 We'll notify <strong>{suggestForm.email}</strong> when it's available</p>
                  <p>⏳ We review requests regularly and add games as soon as possible</p>
                </div>
                <button className={styles.doneBtn} onClick={closeSuggest}>
                  CLOSE
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
