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
```


- Chat et reception des intents
- Intent markdown
- Intent Endpoint selector
- Intent NeedMoreinfo
- Intent endpoint execution + result display
