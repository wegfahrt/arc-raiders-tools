# Arc Raiders Tools - Projektkontext für wissenschaftliche Arbeit

## Projektziel

Entwicklung einer webbasierten Companion-Anwendung für das Videospiel "Arc Raiders", die Spielern hilft, komplexe Spielmechaniken zu verstehen, Ressourcen zu planen und ihren Fortschritt zu verfolgen.

## Technologie-Stack

- **Framework**: Next.js 14 mit React 18 (T3 Stack)
- **Datenverwaltung**: Drizzle ORM mit PostgreSQL
- **State Management**: Zustand (game-store)
- **UI-Framework**: Radix UI mit Tailwind CSS
- **Visualisierung**: React Flow, Recharts, Dagre
- **Deployment**: Vercel-kompatibel

---

## Feature-Übersicht mit Ziel und Lösung

### 1. Quest-Management-System

**Ziel**: Spielern die komplexen Quest-Abhängigkeiten und -Fortschritte transparent darstellen

**Lösung**:
- Datenmodell mit `questChain`-Tabelle für Vor- und Nachfolger-Beziehungen
- Automatische Statusberechnung (active/locked/completed) basierend auf Voraussetzungen
- Drei Darstellungsformen:
  - Kartenansicht mit Filterung und Suche
  - Interaktives Flussdiagramm mit automatischem Layout (Dagre-Algorithmus)
  - Detailmodal mit vollständigen Quest-Informationen
- Persistierung des Quest-Fortschritts im lokalen Storage

### 2. Item-Datenbank mit mehrsprachiger Unterstützung

**Ziel**: Zentrale Verwaltung aller Spielgegenstände mit umfassenden Informationen

**Lösung**:
- Strukturiertes Schema mit `LocalizedText`-Typ für 15+ Sprachen
- Komplexe Datentypen (JSONB) für Rezepte, Effekte, Recycling-Informationen
- Filterfunktionen nach Typ, Seltenheit, Fundort
- Sortieroptionen (Name, Wert)
- Item-Tracking-System für wichtige Materialien
- Interaktive Tooltips mit vollständigen Item-Details

### 3. Recycling-Kalkulator

**Ziel**: Optimierung der Ressourcenverwaltung durch Berechnung von Recycling-Ketten

**Lösung**:

**Vier separate Tab-Ansichten**:
1. **Database View**: Tabellarische Übersicht aller recycelbaren Items mit Effizienzberechnung
2. **Find Material**: Reverse-Engineering - Finde alle Wege, um ein Zielmaterial zu erhalten
3. **Chain Viewer**: Visualisierung kompletter Recycling-Ketten als Baum oder Liste
4. **Combinations**: Analyse mehrerer Items gleichzeitig

**Algorithmen**:
- `findReverseRecyclingPaths()`: Rekursive Tiefensuche für alle möglichen Recycling-Pfade
- `calculateRecyclingEfficiency()`: Wertverlustberechnung beim Recycling
- `getTerminalMaterials()`: Identifikation nicht weiter zerlegbarer Basismaterialien
- Effizienz-Scoring nach Werterhalt, Schrittanzahl und Endmenge

**Visualisierung**:
- React Flow für interaktive Flussdiagramme
- Farbcodierung nach Seltenheit
- Quantitätsanzeige und Wertberechnung pro Pfad

### 4. Workstation-Upgrade-Tracker

**Ziel**: Verwaltung und Planung von Workstation-Upgrades im Hideout

**Lösung**:
- Hierarchisches Level-System (0 bis maxLevel)
- Anforderungsprüfung mit:
  - Material-Requirements (Items mit Mengenangabe)
  - Sonstige Voraussetzungen (z.B. andere Workstations)
- Visueller Fortschrittsbalken
- Automatische Freischaltung höherer Level nach Upgrade
- Icon-Mapping für verschiedene Workstation-Typen
- Dynamische Höhenberechnung zur Vermeidung von Layout-Shifts

### 5. Material-Kalkulator

**Ziel**: Aggregierte Berechnung aller benötigten Materialien für mehrere Ziele gleichzeitig

**Lösung**:

**Multi-Source-Aggregation**:
- Quests (Requirements)
- Workstation-Upgrades (alle Level)
- Projekt-Phasen
- Custom Materials (manuell hinzugefügt)

**Features**:
- Speichern/Laden von Berechnungen (localStorage)
- Inventar-Abgleich mit Markierung fehlender Items
- Gruppierung nach Item-Typ
- Exportfunktion
- Unsaved-Changes-Tracking

**Smart Filtering**:
- Integration mit Game Store zur Filterung bereits abgeschlossener Items
- Nur unvollständige Quests/Upgrades anzeigen

### 6. Game Store (Zustand)

**Ziel**: Zentrale State-Verwaltung für Spielfortschritt über alle Features hinweg

**Lösung**:
- Persistente Speicherung im localStorage
- Getrackte Daten:
  - Abgeschlossene Quests
  - Workstation-Level
  - Tracked Items
  - Projekt-Fortschritte
  - Inventar

**Hilfsmethoden**:
- `getIncompleteQuests()`: Filtert bereits abgeschlossene Quests
- `getIncompleteUpgrades()`: Berechnet fehlende Upgrade-Level
- `toggleQuest()`, `upgradeWorkstation()`: State-Mutationen

### 7. Dashboard mit Live-Statistiken

**Ziel**: Übersichtsseite mit wichtigen Informationen und schnellem Zugriff

**Lösung**:
- Hero-Section mit Game-Branding
- Aktive Missionen (aus Game Store)
- Material-Shortage-Anzeige
- Responsive Grid-Layout (lg:grid-cols-3)

### 8. Datenbank-Schema mit Relationen

**Ziel**: Strukturierte Datenhaltung mit Beziehungen und Mehrsprachigkeit

**Lösung**:

**Haupttabellen**:
- `items`: Alle Spielgegenstände
- `quests`: Quest-Daten
- `questChain`: M:N-Beziehung für Quest-Abhängigkeiten
- `hideoutModules`: Workstation-Definitionen
- `hideoutModuleLevels`: Level-Details mit Requirements
- `projects`: Große Projekte mit Phasen
- `skillNodes`: Skill-Tree-System

**Technische Features**:
- JSONB für komplexe Datentypen (`LocalizedText`, `MaterialRecipe`, `Effect`)
- Foreign Keys mit Cascade Delete
- Indizes für Performance (trader, type, rarity, craftBench)
- `syncMetadata` für Datenbank-Versioning

---

## Wissenschaftlich relevante Aspekte

1. **Graph-Algorithmen**: Implementierung von Tiefensuche für Quest-Chains und Recycling-Pfade
2. **Automatisches Layout**: Dagre-Algorithmus für hierarchische Visualisierung
3. **Performance-Optimierung**: React Query Caching, useMemo für komplexe Berechnungen
4. **Lokalisierung**: Mehrsprachiges System mit fallback zu Englisch
5. **State Management**: Lokale Persistenz mit Synchronisation über Komponenten
6. **Responsive Design**: Mobile-first Approach mit adaptivem Layout
7. **Type Safety**: Vollständige TypeScript-Typisierung mit shared Types

---

## Architektur-Highlights

- **Separation of Concerns**: Klare Trennung von UI (`/app`), Business Logic (`/lib/utils`), und Daten (`/server/db`)
- **Component Reusability**: Shared UI-Komponenten (Radix UI)
- **Query Management**: Server/Client-Trennung mit React Query
- **Code Organization**: Feature-basierte Ordnerstruktur

---

## Projekstruktur

```
arc_raiders_tools/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Dashboard
│   │   ├── quests/              # Quest-Management
│   │   ├── items/               # Item-Datenbank
│   │   ├── recycling/           # Recycling-Kalkulator
│   │   ├── workstations/        # Workstation-Tracker
│   │   ├── calculator/          # Material-Kalkulator
│   │   └── _layout/             # Layout-Komponenten
│   ├── components/
│   │   └── ui/                  # Wiederverwendbare UI-Komponenten
│   ├── lib/
│   │   ├── types.ts             # Zentrale TypeScript-Definitionen
│   │   ├── utils/               # Business Logic
│   │   └── stores/              # Zustand State Management
│   └── server/
│       └── db/                  # Datenbank-Schema und Queries
├── supabase/
│   └── migrations/              # Datenbank-Migrationen
└── public/                      # Statische Assets
```

---

## Zusammenfassung

Diese Companion-Anwendung demonstriert die praktische Anwendung moderner Webentwicklungstechnologien zur Lösung komplexer Datenvisualisierungs- und Berechnungsprobleme. Die Implementierung von Graph-Algorithmen, automatischen Layouts und mehrschichtiger Datenaggregation zeigt, wie spielbezogene Tools als vollwertige Software-Engineering-Projekte konzipiert werden können.

Das Projekt vereint Frontend-Entwicklung, Datenbankdesign, Algorithmenimplementierung und UX-Design zu einer kohärenten Anwendung, die Spielern echten Mehrwert bietet und gleichzeitig als Referenzimplementierung für ähnliche Gaming-Tools dienen kann.
