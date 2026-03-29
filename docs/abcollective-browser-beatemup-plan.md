# A.B. Collective Browser Game Plan

## Working Title

**A.B. Collective: Neon Nocturne**

## One-Line Pitch

A side-scrolling browser beat 'em up set in a grimy 1980s city where a punk collective fights block by block to shut down corrupt nightlife bosses, reclaim venues, and keep the scene alive.

## Why This Fits `abcollective.punkcity.ai`

- The setting matches a punk-city identity without feeling like a generic retro throwback.
- Beat 'em up controls are easy to learn in a browser: move, jump, attack, grab, special.
- Missions can be short enough for drop-in web sessions while still supporting score chasing and replay.
- The format is friendly to a static site deployment with no backend required for the first version.

## Player Fantasy

You are the muscle and spirit of the A.B. Collective: a crew of artists, punks, organizers, and brawlers protecting neighborhood culture from private security, corrupt promoters, and street crews hired to clean out independent venues.

The player should feel:

- outnumbered but dangerous
- stylish without being clean or polished
- protective of the neighborhood, not just violent inside it
- stronger as the crowd, music, and district push back with them

## Core Pillars

1. **Street-level momentum**
   - Forward movement matters. Every encounter should feel like pushing through a hostile block.
2. **Crowd control over technical complexity**
   - Combat depth comes from spacing, knockdown control, juggling weak enemies, and timing specials.
3. **Neighborhood stakes**
   - Each level is tied to a venue, block, or local landmark worth reclaiming.
4. **Short-session replayability**
   - Runs should feel complete in 12 to 18 minutes, with strong ranking and unlock hooks.

## Tone And Visual Direction

- **Era**: 1982 to 1987 urban nightlife, VHS grit, flyers, alley murals, club marquees, busted neon
- **Palette**: dirty reds, sodium orange, nicotine yellow, faded teal, asphalt blue
- **Texture**: photocopied flyers, spray paint, brick, puddles, chrome, cigarette haze
- **Animation tone**: hard impact, brief hit-stop, shoulder-heavy idle poses, aggressive forward lean
- **Music direction**: punk, post-punk, synth-punk, drum-machine interludes between stages

## Core Player Verbs

- `move`
- `jump`
- `light attack`
- `heavy attack`
- `grab`
- `throw`
- `special`
- `dodge/backstep`
- `pick up weapon`
- `call crowd surge` (screen-clear support move after meter fill)

## Core Loop

### Moment-To-Moment Loop

1. Enter a scrolling combat space.
2. Read enemy composition and terrain hazards.
3. Use movement, lane positioning, and combos to isolate threats.
4. Build `Hype` by landing hits, avoiding damage, and using environmental objects.
5. Spend `Hype` on a special move or save for a stronger crowd-surge finisher.
6. Clear the wave, collect temporary resources, and push to the next block segment.

### Mission Loop

1. Choose a district mission.
2. Fight through 3 to 5 scrolling encounters.
3. Reach a set-piece finale or boss.
4. Earn score, reputation, and unlock currency.
5. Spend upgrades between missions on moves, stamina, or collective perks.
6. Start the next district with new enemy mixes and hazards.

### Meta Loop

1. Reclaim districts across the city map.
2. Unlock new crew members with different stats or specials.
3. Improve your hideout for passive bonuses and cosmetic changes.
4. Replay prior districts for higher ranks, hidden cassettes, and faster clears.

## Browser-Friendly Session Structure

- **Single run target**: 12 to 18 minutes
- **Single stage target**: 3 to 5 minutes
- **Tutorial target**: under 90 seconds, playable without modal-heavy interruption
- **Failure penalty**: lose current mission progress but keep a small percentage of earned reputation
- **Quick retry**: immediate restart from stage intro or last checkpoint

## Combat Design

### Lane Model

Use a classic belt-scroll format:

- left-to-right progression
- free movement on a shallow vertical lane
- enemies attempt flanks, front pressure, and recovery punishes

This keeps the game readable on keyboard and controller while preserving beat 'em up identity.

### Default Move Set

- `light x3`: quick combo, best for meter building
- `heavy`: knockback, armor break on tougher enemies
- `jump attack`: anti-crowd entry tool
- `grab`: opens throw or knee strike
- `backstep`: short invulnerability window, low execution burden
- `special`: costs Hype, hits multiple enemies, brief safety tool
- `crowd surge`: full Hype finisher, brings in off-screen allies for a dramatic lane sweep

### Resource Model

### Health

- Recovers only between stages through pickups or upgrades

### Stamina

- Optional light limiter on dodge and heavy spam
- Regenerates quickly to keep flow moving

### Hype Meter

Built by:

- uninterrupted combos
- environmental hits
- perfect dodge timing
- saving civilians or protecting band gear in special objectives

Spent on:

- special attacks
- emergency crowd control
- stage-end bonus conversion if unspent

### Enemy Design

Ship the first slice with five readable archetypes:

1. **Bouncer**
   - Slow, armored, high knockback resistance
2. **Runner**
   - Fast jabber that punishes tunnel vision
3. **Chain Kid**
   - Mid-range swing arc that controls space
4. **Shield Cop**
   - Forces grabs, flanks, or heavy attacks
5. **Hype Leech**
   - Support enemy that steals meter pressure if ignored

### Boss Philosophy

Bosses should feel like local power structures, not monsters:

- club owner with bodyguards
- corrupt precinct captain
- promoter with stun baton security
- final media mogul or developer figure trying to sanitize the district

Each boss should test one learned skill:

- spacing
- target prioritization
- dodge timing
- wave management under pressure

## Progression And Rewards

### Between-Mission Upgrades

Offer small, legible upgrades after every mission:

- +1 combo extension hit
- faster Hype gain
- improved throw damage
- extra special charge
- more health from food pickups
- stronger weapon durability

### Character Roster

Start with three playable crew members:

1. **Riot**
   - Balanced all-rounder
2. **Echo**
   - Fast striker, weaker health, higher combo ceiling
3. **Brick**
   - Heavy hitter, slower, strong grabs and knockdowns

This creates replay value without forcing a huge initial content burden.

## Level Structure

### District Flow

Recommended first campaign:

1. **The Strip**
   - neon bars, flyers, hecklers, bouncer-heavy tutorial zone
2. **Rail Yard**
   - industrial lane hazards, thrown pipes, ambushes
3. **Mercy Block**
   - police pressure, shields, barricades
4. **The Venue Mile**
   - backstage corridors, sound gear hazards, promoter miniboss
5. **City Hall After Dark**
   - final push, mixed enemy gauntlet, final boss

### Set-Piece Objectives

Use one optional twist per stage to vary pacing:

- protect the sound system
- rescue a bandmate
- chase a fleeing booker before a gate closes
- survive during a power outage
- hold a block while a mural is finished or gear is loaded out

## HUD And UI Surface

Follow a low-chrome browser-game HUD:

- top left: player health and portrait
- top right: Hype meter and score
- bottom corner: contextual prompt for pickup or special input
- center screen: only transient combo callouts, objective updates, and boss intros

UI should live in the DOM over the canvas:

- better text clarity
- easier responsiveness
- cleaner accessibility options
- faster iteration for pause, settings, and stage-select menus

## Menu Plan

- landing page with animated marquee and `Start Run`
- character select with short stat bars
- district map between stages
- pause menu with controls, audio, and retry
- game-over screen with rank, score, unlock progress, and retry

## Technical Recommendation

### Runtime Stack

- **Engine**: Phaser 3
- **Language**: TypeScript
- **Build**: Vite
- **Rendering**: canvas/WebGL through Phaser
- **UI**: DOM overlays with CSS variables
- **Audio**: Web Audio through Phaser audio management
- **Persistence**: localStorage for unlocks, options, and best ranks

### Architecture Boundaries

Keep these systems separate:

- `simulation`
  - combat rules, enemy state, scoring, progression, mission rules
- `rendering`
  - sprites, animations, camera, particles, shake
- `input`
  - keyboard and controller mapping to actions
- `ui`
  - HUD, menus, settings, map, onboarding text
- `content`
  - enemy data, mission definitions, upgrade tables, dialogue stubs

### Input Map

- keyboard:
  - `A/D` move
  - `W/S` lane up/down
  - `J` light
  - `K` heavy
  - `L` special
  - `Space` jump
  - `Shift` dodge
  - `E` interact or pickup
- controller:
  - left stick move
  - face buttons for light, heavy, jump, special
  - shoulder button for dodge

### Content Scope For A Vertical Slice

Build the first playable slice with:

- 1 playable character
- 1 district
- 3 enemy types
- 1 miniboss
- 1 environmental pickup weapon
- 1 special move
- 1 full mission with 3 encounter rooms
- 1 score/rank screen

That is enough to prove feel, pacing, and browser performance.

## Hosting Fit For `abcollective.punkcity.ai`

The game should ship as a static web app:

- output a production build to `dist/`
- host on the `abcollective.punkcity.ai` subdomain through static file hosting or CDN-backed origin
- keep save data client-side for v1
- avoid mandatory login, matchmaking, or server authority in the first release

## Performance Targets

- 60 FPS target on modern desktop browsers
- graceful fallback to 30 FPS feel without breaking combat timing
- first playable load under 5 seconds on broadband
- initial bundle and first-stage assets kept small through staged loading

## Accessibility And Usability

- fully remappable keyboard controls
- gamepad support
- reduced screen shake toggle
- flash intensity toggle
- subtitle and dialogue text sizing
- high-contrast HUD option

## Production Roadmap

### Phase 1: Paper Design

- lock fantasy, verbs, and enemy set
- approve one district and one hero
- define animation list and asset style

### Phase 2: Vertical Slice

- implement movement, attacks, enemy AI, HUD, scoring
- ship one complete district
- tune hit-stop, knockback, and spawn pacing

### Phase 3: Content Expansion

- add roster characters
- add districts, bosses, and objectives
- introduce hideout progression and replay rewards

### Phase 4: Launch Prep

- optimize load time
- add polish FX and audio mix
- playtest for browser compatibility and difficulty spikes

## Recommended Next Build Step

Start with a Phaser vertical slice centered on **The Strip** district. If that slice feels good, the rest of the campaign can scale by recombining enemy archetypes, hazards, and boss rules without rewriting the core loop.
