# Tasks clarapi

- Setup projet
- Main layout (topbar + sidebar + mainLayout)
- Authentication (signup / login / logout) + user profile
- AI and keys user (Indexdb)
- Import + validation + normalisation + sidebar
- Chat et reception des intents
- Intent markdown
- Intent Endpoint selector 
- Intent NeedMoreinfo
- Intent endpoint execution + result display

## Setup projet
- Create next + Tauri app
```markdown
### Prompt
Role : Developpeur front nextjs + tauri
Action : voici un projet nextjs vide, je veux qu'il soit compatible aussi avec Tauri



### Plan
☐ Install Tauri CLI dependency                                                                                                                                                                                                   
☐ Initialize Tauri in the project                                                                                                                                                                                                
☐ Configure Next.js for static export                                                                                                                                                                                            
☐ Update package.json scripts                                                                                                                                                                                                    
☐ Configure Tauri settings                                                                                                                                                                                                       
☐ Update .gitignore for Tauri


### Modifications effectuées:

1. Tauri CLI installé                                                                                                                                                                                                            
   - Ajouté @tauri-apps/cli@^2.9.6 dans devDependencies
2. Next.js configuré pour Tauri (next.config.ts:4-7)                                                                                                                                                                             
   - output: 'export' pour génération statique                                                                                                                                                                                    
   - images.unoptimized: true pour compatibilité Tauri
3. Tauri initialisé                                                                                                                                                                                                              
   - Structure /src-tauri créée avec:
    - Cargo.toml (config Rust)
    - tauri.conf.json (config Tauri)
    - src/main.rs (code Rust)
    - icons/ (icônes multi-plateformes)
4. Scripts npm ajoutés (package.json:10-12)                                                                                                                                                                                      
   - npm run tauri - CLI Tauri                                                                                                                                                                                                    
   - npm run tauri:dev - Mode développement (ouvre l'app desktop)                                                                                                                                                                 
   - npm run tauri:build - Build production
5. Configuration Tauri (src-tauri/tauri.conf.json:5)                                                                                                                                                                             
   - identifier: com.clarapi.v2                                                                                                                                                                                                   
   - Window: 800x600, resizable                                                                                                                                                                                                   
   - devUrl: http://localhost:3000                                                                                                                                                                                                
   - frontendDist: ../out
6. Gitignore mis à jour (.gitignore:44)                                                                                                                                                                                          
   - Ajouté /src-tauri/target (build artifacts Rust)

Pour tester:
- npm run tauri:dev - Lance Next.js + ouvre l'app Tauri
- npm run tauri:build - Crée l'exécutable natif

Le projet est maintenant compatible Tauri! 
```

## Main layout (topbar + sidebar + mainLayout)
- Create main panel
```markdown
### Prompt
Role : Developpeur et designer front nextjs + tauri
Action : Crée le layout principal de l'application avec
- topbar : contenant a gauche le logo @public/logo_clarapi.png et a droite un theme switch (entre dark et light) et une icone profil utilisateur (icone avatar)
- Sidebar : compatible mobile (drawer) avec les sections vide : Import (bouton); APIs et Chat
- MainLayout : zone principale de chat vide avec un input + bouton envoyer pour envoyer un message, il faut que ca fonctionne aussi dans le cas de entrée et ctrl+enter pour envoyer le message.

Pour le design, tu fait un design professionelle, épuré, classe, moderne (comme celui de google et de apple). Utilise l'orange, c'est la couleur de notre logo

### Plan
☐ Check logo and install dependencies                                                                                                                                                                                         
☐ Configure Tailwind theme with orange colors                                                                                                                                                                                 
☐ Setup ThemeProvider                                                                                                                                                                                                         
☐ Create TopBar component                                                                                                                                                                                                     
☐ Create Sidebar with mobile drawer                                                                                                                                                                                           
☐ Create ResizablePanel component                                                                                                                                                                                             
☐ Create ChatArea component                                                                                                                                                                                                   
☐ Create MainLayout wrapper                                                                                                                                                                                                   
☐ Update app layout and page

## Modification effectuées

1. ThemeProvider (components/providers/theme-provider.tsx)                                                                                                                                                                       
   - Wrapper pour next-themes                                                                                                                                                                                                     
   - Gestion du mode dark/light
2. ThemeToggle (components/ui/theme-toggle.tsx)                                                                                                                                                                                  
   - Bouton switch entre dark et light                                                                                                                                                                                            
   - Icônes Sun/Moon de lucide-react                                                                                                                                                                                              
   - Gestion du state mounted pour éviter hydration mismatch
3. TopBar (components/layout/top-bar.tsx)                                                                                                                                                                                        
   - Logo Clarapi à gauche (32x32px)                                                                                                                                                                                              
   - Nom "Clarapi" masqué sur mobile                                                                                                                                                                                              
   - Hamburger menu pour mobile (bouton Menu)                                                                                                                                                                                     
   - Theme toggle + icône User à droite                                                                                                                                                                                           
   - Sticky top avec backdrop blur
4. Sidebar (components/layout/sidebar.tsx)                                                                                                                                                                                       
   - Drawer mobile avec overlay noir semi-transparent                                                                                                                                                                             
   - Largeur fixe 288px (w-72)                                                                                                                                                                                                    
   - 3 sections:
    - Import: bouton orange avec icône Upload
    - APIs: titre + état vide
    - Chat: titre + état vide                                                                                                                                                                                                    
      - Animation slide pour mobile
5. ResizablePanel (components/layout/resizable-panel.tsx)                                                                                                                                                                        
   - Gestion largeur sidebar desktop (200-500px, défaut 280px)                                                                                                                                                                    
   - Handle de resize vertical avec feedback hover orange                                                                                                                                                                         
   - Sauvegarde dans localStorage                                                                                                                                                                                                 
   - Smooth dragging experience                                                                                                                                                                                                   
   - Responsive: drawer mobile, resizable desktop
6. ChatArea (components/chat/chat-area.tsx)                                                                                                                                                                                      
   - Zone messages vide centrée avec placeholder                                                                                                                                                                                  
   - Input textarea auto-resize (48px à 200px)                                                                                                                                                                                    
   - Bouton Send orange avec icône                                                                                                                                                                                                
   - Keyboard shortcuts:
    - Enter → envoyer
    - Ctrl+Enter → nouvelle ligne                                                                                                                                                                                                
      - States: loading, disabled                                                                                                                                                                                                    
      - Helper text pour les raccourcis
7. MainLayout (components/layout/main-layout.tsx)                                                                                                                                                                                
   - Wrapper principal                                                                                                                                                                                                            
   - Gestion état mobile menu                                                                                                                                                                                                     
   - Structure: TopBar + ResizablePanel

Fichiers modifiés:

- app/globals.css : Thème orange (#ff6b35), variables dark/light
- app/layout.tsx : Intégration ThemeProvider, metadata Clarapi
- app/page.tsx : Utilisation MainLayout + ChatArea

Design:
- Orange primary (#ff6b35)
- Police système (SF Pro / Roboto style)
- Spacing généreux, transitions fluides
- Borders subtiles, backdrop blur
- Dark mode élégant (gris foncés #0a0a0a, #171717)

Fonctionnalités:                                                                                                                                                                                                                 
✅ TopBar sticky avec logo, theme switch, avatar                                                                                                                                                                                 
✅ Sidebar responsive (drawer mobile)                                                                                                                                                                                            
✅ Resize sidebar desktop (200-500px, persisté)                                                                                                                                                                                  
✅ Chat input avec Enter/Ctrl+Enter                                                                                                                                                                                              
✅ Dark/Light mode complet                                                                                                                                                                                                       
✅ Design moderne et épuré

L'application est prête à être testée avec npm run dev ou npm run tauri:dev ! 
```

## Authentication (signup / login / logout) + user profile
- Setup auth pages + user context
```markdown
Role : Developpeur front nextjs + tauri et expert aws amplify GEN2
Existant : Nous avons déja créer le backend amplify avec l'authentification cognito + user pool + identity pool
Action : A partir de l'icone user, s'il n'est pas connecté, on doit avoir un bouton pour signin et un autre pour signup, 
chaque bouton ouvre une modal avec le formulaire correspondant. 
Une fois connecté, pour le moment jsute l'email et un bouton logout.
Utilise aws amplify GEN2 pour toute la partie authentification et affichage automatiquement des formulaires de signin et signup.

## Plan
☐ Install Amplify dependencies                                                                                                                                                                                                
☐ Configure Amplify with outputs file                                                                                                                                                                                         
☐ Create AuthModal component                                                                                                                                                                                                  
☐ Create UserMenu component                                                                                                                                                                                                   
☐ Update TopBar with UserMenu                                                                                                                                                                                                 
☐ Style Amplify UI components
```


## AI and keys user (Indexdb)
```markdown
Role : Developpeur front nextjs + tauri et expert en gestion indexdb 
Action : Dans l'icone d'en a droite de l'utilisateur, ajoute un lien vers une page de settings, dans cette page, nous aurons les sections suivants :
- Section information générale : email, changement mot de passe (via amplify)
- Section AI Keys : liste des clés AI (provider, nom, clé api masqué)

Chaque les valeurs de clé apis, il seront sauvegarder dans une base distante et synchroniser toujours entre le local et le distant. 
Peux tu utiliser amplify appsync pour le faire, on définit un modèle config avec pour le moment les clés d'apis. 
Et pour le changement de mot de passe, passe par les utilitaires de aws amplify

### Plan
☒ Backend Amplify AppSync
☐ IndexedDB Setup - schema and utilities
☐ Create encryption utilities for API keys
☐ Generate GraphQL client code
☐ Create sync service (IndexedDB ↔ AppSync)
☐ Create Settings page structure
☐ Add Settings link to UserMenu
☐ Implement General Info section (email + password)
☐ Implement AI Keys section with providers list
☐ Wire up auto-sync logic
```


## Import + validation + normalisation + sidebar
```markdown
Role : Developpeur front nextjs + tauri et expert en spécification apis
Action : Dans la sidebar, le bouton import doit ouvrir une modal qui permet d'importer un fichier de spécification d'api (swagger /openapi, json yaml ou yml). Il doit aussi le valider:
- Si valide : on ferme la modale et on le normalise dans un format interne et on l'ajoute avec appsync et dans le cache indexdb, on doit gérer la synchro entre les deux
- Si invalide : on affiche les erreurs de validation dans la modale

### Plan
☐ Add ApiSpec model to AppSync backend
☐ Create IndexedDB schema for API specs
☐ Install OpenAPI validation library
☐ Create validation service
☐ Create sync service for API specs
☐ Create import modal component
☐ Create API list component for àààsidebar
☐ Wire up import button in sidebar

### Modifications effectuées

Changements implémentés

1. User-scoped IndexedDB (lib/db/schema.ts)

- Chaque utilisateur a maintenant sa propre base de données: clarapi-db-{userId}
- Les utilisateurs anonymes utilisent: clarapi-db-anonymous
- Fonction clearUserData(userId) pour nettoyer les données d'un utilisateur

2. Utilitaires d'authentification (lib/auth/user-utils.ts)

- getCurrentUserId(): Retourne l'ID de l'utilisateur connecté ou 'anonymous'
- isAuthenticated(): Vérifie si l'utilisateur est authentifié

3. Mise à jour des opérations DB

- lib/db/api-keys.ts: Toutes les opérations utilisent maintenant getCurrentUserId()
- lib/db/api-specs.ts: Toutes les opérations utilisent maintenant getCurrentUserId()

4. Mise à jour des services de sync

- lib/sync/api-specs-sync.ts: Utilise les nouveaux utilitaires d'auth
- lib/sync/api-keys-sync.ts: Utilise les nouveaux utilitaires d'auth

5. Écoute des événements d'authentification

- contexts/api-specs-context.tsx: Écoute les événements signedIn/signedOut et recharge les données
- hooks/use-api-keys.ts: Écoute les événements signedIn/signedOut et recharge les données

Comment ça fonctionne

Scénario 1: Utilisateur anonyme
- Données stockées dans clarapi-db-anonymous
- Pas de sync avec le cloud

Scénario 2: Utilisateur se connecte
- Événement signedIn détecté
- Les données sont rechargées depuis clarapi-db-{userId}
- Sync automatique avec AppSync

Scénario 3: Utilisateur se déconnecte
- Événement signedOut détecté
- Les specs/keys sont effacées de l'état React
- Les données sont rechargées depuis clarapi-db-anonymous
- L'ancienne base clarapi-db-{oldUserId} reste sur le disque mais n'est plus accessible

Résultat

✅ Quand vous vous déconnectez, vous ne voyez plus les specs de l'utilisateur connecté
✅ Chaque utilisateur a ses propres données isolées
✅ Le passage entre utilisateurs est automatique
✅ Les données restent persistantes pour chaque utilisateur

Vous pouvez tester maintenant:
1. Connectez-vous et importez des specs
2. Déconnectez-vous → les specs disparaissent
3. Re-connectez-vous → les specs réapparaissent
```
- Tree sidebar
```markdown
perfect, maintenant, le sidebar, je veux voir l'arboressence de chaque api en te basant sur le path, je veux comment une aroberescence de fichier/dossier (tree)

### modifications effectuées
Nouveaux fichiers

1. lib/parser/openapi-tree.ts

Utilitaire qui parse les specs OpenAPI et construit une structure d'arbre:
- Parse les paths et leurs méthodes HTTP (GET, POST, PUT, DELETE, etc.)
- Construit une arborescence hiérarchique basée sur les segments de path
- Exemple: /users/{id}/posts devient:
  📁 users
  📁 {id}
    - GET /users/{id}/posts
    - POST /users/{id}/posts

2. components/api/api-tree-view.tsx

Composant React qui affiche l'arborescence:
- Dossiers collapsibles/expandables
- Icônes de dossiers (ouvert/fermé)
- Méthodes HTTP colorées (GET=bleu, POST=vert, DELETE=rouge, etc.)
- Affiche le summary ou operationId de chaque endpoint
- Navigation avec indentation pour montrer la hiérarchie

3. Mise à jour de components/api/api-list.tsx

- Ajout d'un chevron pour expand/collapse chaque API
- Affichage de l'arborescence quand l'API est expandée
- Parsing automatique de toutes les specs au chargement (useMemo pour performance)

Fonctionnalités

✅ Arborescence hiérarchique: Les endpoints sont groupés par leur path
✅ Méthodes HTTP colorées:
- 🔵 GET - bleu
- 🟢 POST - vert
- 🟡 PUT - jaune
- 🔴 DELETE - rouge
- 🟠 PATCH - orange

✅ Collapsible: Chaque niveau de l'arborescence peut être ouvert/fermé
✅ Auto-expand: Le premier niveau s'ouvre automatiquement
✅ Tooltips: Affiche le summary de l'endpoint au survol

Exemple de rendu

Pour une spec avec ces paths:
GET    /users
POST   /users
GET    /users/{id}
DELETE /users/{id}
GET    /posts
GET    /posts/{id}/comments

L'arborescence affichée sera:
📂 MyAPI
📁 users
🔵 GET    List all users
🟢 POST   Create user
📁 {id}
🔵 GET    Get user
🔴 DELETE Delete user
📁 posts
🔵 GET Get all posts
📁 {id}
📁 comments
🔵 GET Get comments

Modifications apportées

1. Structure d'arborescence corrigée (lib/parser/openapi-tree.ts)

- Avant: Les méthodes étaient groupées sous le dernier segment de path
- Maintenant: Chaque combinaison METHOD + PATH est une feuille distincte
- Les segments intermédiaires sont des dossiers
- Exemple:
  📁 users
  📁 {id}
  GET /users/{id}
  POST /users/{id}
  DELETE /users/{id}

2. Icônes et état par défaut

- ✅ Icône de dossier (📁) sur tous les nœuds non-feuilles
- ✅ Dossier ouvert (📂) quand expandé
- ✅ Tous les dossiers sont collapsed par défaut quand on ouvre une API
- ✅ Chevrons pour expand/collapse uniquement sur les dossiers

3. Design amélioré des endpoints (feuilles)

- Badge de méthode HTTP avec couleur de fond:
    - 🔵 GET - bleu
    - 🟢 POST - vert
    - 🟡 PUT - jaune
    - 🔴 DELETE - rouge
    - 🟠 PATCH - orange
    - 🟣 HEAD - violet
    - ⚪ OPTIONS - gris
- Format des feuilles: METHOD /path/complet
- Police monospace pour les paths
- Tooltip avec le summary de l'endpoint au survol

4. Style général

- Espacement amélioré (16px par niveau)
- Transitions smooth sur hover
- Bordures arrondies
- Badge de méthode avec largeur fixe (14 caractères) pour l'alignement
- Taille de police optimisée (text-xs)
- Couleurs cohérentes avec le thème

Résultat visuel

Pour une API avec ces endpoints:
GET    /pets
POST   /pets
GET    /pets/{petId}
DELETE /pets/{petId}

L'arborescence affichera (collapsed par défaut):
📁 pets (collapsed)

Quand on clique pour expand:
📂 pets
GET     /pets
POST    /pets
📁 {petId}

Puis en expandant {petId}:
📂 pets
GET     /pets
POST    /pets
📂 {petId}
GET    /pets/{petId}
DELETE /pets/{petId}


Corrections et ajouts

1. Correction du positionnement du menu

- Problème: Le menu était positionné par rapport au conteneur parent entier, donc quand l'arborescence était expandée, le menu apparaissait tout en bas
- Solution: J'ai enveloppé le bouton trois points dans un <div className="relative"> et positionné le menu par rapport à ce conteneur
- Résultat: Le menu apparaît maintenant directement sous les trois points, peu importe si l'arborescence est expandée ou non

2. Ajout de l'option "View" (components/api/view-spec-modal.tsx)

Nouvelle modale qui affiche le contenu de la spec avec:
- ✅ Header avec le nom de l'API et le format (JSON/YAML)
- ✅ Bouton Copy pour copier tout le contenu dans le presse-papiers
- ✅ Feedback visuel ("Copied!") pendant 2 secondes après la copie
- ✅ Affichage formaté avec <pre> et police monospace
- ✅ Scroll pour les specs longues
- ✅ Syntax highlighting via le background gris pour la lisibilité

3. Menu mis à jour (components/api/api-list.tsx)

Le menu contextuel contient maintenant:
👁️ View
🗑️ Delete

Utilisation

1. Survole une API dans la sidebar
2. Clique sur les trois points (⋮)
3. Le menu apparaît juste en dessous avec deux options:
   - View: Ouvre une modale avec le code de la spec
   - Delete: Supprime l'API (avec confirmation)
4. Dans la modale View:
   - Copie facilement tout le contenu avec le bouton "Copy"
   - Scroll pour voir tout le contenu
   - Ferme avec le X ou en cliquant à l'extérieur

```

## Chat et reception des intents
- Model selector + chat input
```markdown
Role : Developpeur front nextjs + tauri et expert en spécification apis
Action : Nous allons nous concentrer sur le panel de chat maintenant, je veux rajouter a l'input, un combobox petite pour le choix du modèle (GPT5, gemini3...) groupé par entreprise (Anthropic...) 

### Modifications effectuées
Nouveaux fichiers

1. lib/ai/models.ts

Configuration des modèles AI disponibles avec:
- Interface AIModel: id, nom, provider, context window
- Interface ModelGroup: Groupement par provider
- Liste AI_MODELS avec 3 groupes:
    - Anthropic: Claude Opus 4.5, Sonnet 4.5, Sonnet 4, Haiku 4
    - OpenAI: GPT-5, GPT-4o, GPT-4 Turbo, GPT-4
    - Google AI: Gemini 3 Ultra, Gemini 2 Pro, Gemini 2 Flash, Gemini 1.5 Pro
- Fonctions utilitaires: getDefaultModel(), findModelById()

2. components/chat/model-selector.tsx

Combobox pour sélectionner le modèle avec:
- ✅ Bouton compact affichant le modèle sélectionné
- ✅ Dropdown qui s'ouvre vers le haut (au-dessus de l'input)
- ✅ Groupement par provider avec headers (Anthropic, OpenAI, Google AI)
- ✅ Affichage des détails: nom du modèle + context window
- ✅ Indicateur visuel (✓) pour le modèle sélectionné
- ✅ Auto-fermeture quand on clique à l'extérieur
- ✅ Animation du chevron à l'ouverture/fermeture

3. Mise à jour de components/chat/chat-area.tsx

- Ajout du ModelSelector à gauche de l'input
- État selectedModel pour tracker le modèle choisi
- Le modèle est inclus dans handleSend (console.log pour l'instant)
- Layout avec flex items-end pour aligner correctement tous les éléments

Design et UX

Position: À gauche de l'input de chat
Taille: Compact (max-width 120px pour le label)
Dropdown:
- Largeur: 264px
- Hauteur max: 400px (scrollable)
- S'ouvre vers le haut pour ne pas masquer l'input

Structure du dropdown:
┌─ Anthropic ──────────────┐
│ Claude Opus 4.5          │✓
│ 200,000 tokens           │
│ Claude Sonnet 4.5        │
│ 200,000 tokens           │
├─ OpenAI ─────────────────┤
│ GPT-5                    │
│ 128,000 tokens           │
│ GPT-4o                   │
│ 128,000 tokens           │
├─ Google AI ──────────────┤
│ Gemini 3 Ultra           │
│ 1,000,000 tokens         │
└──────────────────────────┘

Par défaut: Claude Opus 4.5 est sélectionné

Nouveaux fichiers

hooks/use-chat-config.ts

Hook personnalisé pour gérer la configuration du chat avec:

Fonctionnalités:
- ✅ Sauvegarde automatique dans localStorage quand le modèle change
- ✅ Chargement automatique au montage du composant
- ✅ Fallback sur le modèle par défaut (Claude Opus 4.5) si aucune config
- ✅ État isLoaded pour éviter les sauvegardes prématurées

Clé localStorage: clarapi-chat-config

Structure sauvegardée:
{
"selectedModelId": "claude-opus-4-5"
}

Mise à jour de components/chat/chat-area.tsx

- Remplacement de useState par useChatConfig()
- Le modèle est maintenant persisté automatiquement

Fonctionnement

1. Premier lancement:
   - Pas de config → utilise Claude Opus 4.5 par défaut
   - Dès que tu sélectionnes un modèle → sauvegardé dans localStorage
2. Lancements suivants:
   - Charge le modèle depuis localStorage
   - Tu retrouves toujours ton dernier choix
3. Changement de modèle:
   - Sélectionne un nouveau modèle
   - Automatiquement sauvegardé
   - Persiste même après fermeture/réouverture de l'app

Note: La config est stockée dans le navigateur (localStorage), donc:
- Indépendante de l'authentification
- Spécifique à chaque navigateur/appareil
- Ne se synchronise pas entre appareils (pour l'instant)

```



- Intent markdown
- Intent Endpoint selector
- Intent NeedMoreinfo
- Intent endpoint execution + result display
