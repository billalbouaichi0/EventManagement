# Plateforme de Gestion des Invités & Émargement Événementiel (NVOTI)

Une application web complète, professionnelle et temps réel pour la gestion des invités, l'émargement rapide (check-in en moins de 15s), la détection des doublons CSV, l'impression de badges personnalisés (4.5cm × 6cm) et le suivi statistique lors d'événements à fort afflux.

---

## 🚀 Fonctionnalités Principales

- **Multi-Postes & Multi-Agents** : Attribution de postes de travail (Guichet A, B, C...) et d'imprimantes dédiées pour chaque agent d'accueil.
- **Importation CSV & Détection Intelligente des Doublons** :
  - Détection automatique du séparateur (`;`, `,`, `\t`) et encodage UTF-8.
  - Détection et blocage des doublons (NIN, RC ou Nom + Prénom) dans le même événement et dans le fichier.
- **Recherche & Émargement Ultra-Rapide** :
  - Recherche instantanée normalisée sans accent (Nom, Prénom, NIN, RC, Banque, Réf).
  - Émargement en 1 clic avec son de validation, confettis et synchronisation temps réel (Socket.IO).
  - Prévention stricte des doubles émargements (blocage HTTP 409).
- **Impression Automatique de Badges** :
  - Format exact **4.5cm × 6cm** avec Code QR de vérification.
  - Règles CSS `@page { size: 4.5cm 6cm; margin: 0; }` pour impression thermique sans marges.
- **Tableau de Bord & Statistiques en Temps Réel** :
  - Taux de présence en direct, répartition des actions / pouvoirs, flux d'arrivées par heure.
  - Export complet au format Excel (.xlsx).
- **Journal d'Audit & Sécurité** :
  - Traçabilité complète de toutes les actions (imports, émargements, impressions, ajouts).

---

## 🛠️ Stack Technique

- **Backend** : Node.js, Express, Sequelize ORM, MySQL, Socket.IO, JWT Auth, Multer, ExcelJS.
- **Frontend** : Next.js (React), Material UI, `@tanstack/react-query`, Lucide Icons, Recharts, Canvas-Confetti, QRCode.React.

---

## ⚙️ Installation & Démarrage

### 1. Prérequis
- Node.js 18+
- MySQL Server (ex: XAMPP, WAMP ou MySQL natif)

### 2. Configuration Backend
```bash
cd backend
cp .env.example .env
npm install
node seed.js    # Initialise la base et insère les comptes / données de test
npm run dev     # Démarre l'API sur le port 5000
```

### 3. Configuration Frontend
```bash
cd frontend
npm install
npm run dev     # Démarre l'interface sur http://localhost:3000
```

---

## 🔑 Identifiants par Défaut (Mode Test)

| Rôle | Nom d'utilisateur | Mot de passe |
| :--- | :--- | :--- |
| **Administrateur** | `admin` | `admin123` |
| **Agent d'Accueil 1** | `agent1` | `agent123` |
| **Agent d'Accueil 2** | `agent2` | `agent123` |
