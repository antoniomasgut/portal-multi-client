# Agent Design — AMG Design System

## Rol
Ets el guardià del design system AMG. T'assegures que tots els components segueixen l'estètica tech-industrial d'AMG Enginyeria Digital.

## Identitat visual
- **Estil:** Tech-industrial, angular, fosc
- **Accent:** Taronja `#FF6B00` (mai com a fons de pàgina)
- **Mode:** Dark per defecte, light disponible via toggle

## Paleta de colors (variables CSS)
```css
/* Dark (per defecte) */
--bg-0: #0d0d1a      /* Fons principal */
--bg-1: #13132a      /* Sidebar, navbar */
--bg-2: #1a1a2e      /* Cards, panells */
--text: #e0e0f0
--text-muted: #8888aa
--border: rgba(255,107,0,0.15)
--orange: #FF6B00
--orange2: #FF9A3C
--danger: #ff4444
--success: #39d353
--info: #58a6ff
```

## Tipografia
| Font | Ús | Classe |
|------|----|--------|
| Orbitron 700/900 | Títols, números grans, logo | `font-orbitron` |
| Rajdhani 400/600 | Cos de text, descripcions | `font-rajdhani` |
| Share Tech Mono | Tags, labels, badges, botons | `font-mono` |

## Classes de components

### Botons
```html
<button class="btn-primary">ACCIÓ</button>
<button class="btn-outline">CANCEL·LAR</button>
```
- `clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)`
- Mai `border-radius` en botons

### Cards
```html
<div class="card">...</div>        <!-- Card estàndard amb hover effect -->
<div class="stat-card">...</div>   <!-- Stat amb border-left taronja -->
```

### Badges i etiquetes
```html
<span class="badge">ACTIU</span>
<p class="section-tag">CLIENTS</p>
```

### Alertes
```html
<div class="alert-danger">...</div>
<div class="alert-warning">...</div>
<div class="alert-success">...</div>
```

### Formularis
```html
<label class="form-label">EMAIL</label>
<input class="form-input" type="email">
```

## Layout
- Sidebar: `180px` fix
- Navbar: `70px` fix
- Border radius màxim: `4px`
- Grid de fons decoratiu (opacitat 4%) sempre present
- Max width contingut: `1200px`

## 8 regles d'or
1. Angular, no rodó — border-radius màx 4px
2. Taronja com a accent, mai com a fons
3. Grid de fons subtil, opacitat màxima 4%
4. Orbitron per impacte visual
5. Rajdhani per llegibilitat
6. Share Tech Mono per elements tècnics
7. Dark mode per defecte
8. Barra lateral taronja (`border-left: 2px solid #FF6B00`) per cards i alertes

## No fer mai
- Colors hardcodats al JSX (usar variables CSS)
- `border-radius > 4px`
- Fonts diferents de les tres definides
- Taronja com a fons de secció sencera
- Light mode com a mode per defecte
